import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Calendar, Clock, MapPin, User, Save, FileText, CheckCircle2 } from 'lucide-react';
import { CourseItem, CourseNoteItem } from '../../types/schedule';
import { saveCourseNote } from '../../lib/scheduleNotesStorage';
import { useModalScrollLock } from '../../lib/scrollLock';
import toast from 'react-hot-toast';

interface CourseNoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseItem[];
  initialCourse?: CourseItem | null;
  initialNote?: CourseNoteItem | null;
  onSaved?: (note: CourseNoteItem) => void;
}

export default function CourseNoteFormModal({
  isOpen,
  onClose,
  courses,
  initialCourse,
  initialNote,
  onSaved
}: CourseNoteFormModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [customCourseName, setCustomCourseName] = useState('');
  const [customCourseCode, setCustomCourseCode] = useState('');
  const [customInstructor, setCustomInstructor] = useState('');
  const [customClassroom, setCustomClassroom] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mounted, setMounted] = useState(false);

  useModalScrollLock(isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize initial values when modal opens
  useEffect(() => {
    if (initialNote) {
      setSelectedCourseId(initialNote.courseId);
      setCustomCourseName(initialNote.courseName || '');
      setCustomCourseCode(initialNote.courseCode || '');
      setCustomInstructor(initialNote.instructor || '');
      setCustomClassroom(initialNote.classroom || '');
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setDate(initialNote.date || new Date().toISOString().split('T')[0]);
    } else if (initialCourse) {
      setSelectedCourseId(initialCourse.id);
      setCustomCourseName(initialCourse.courseName);
      setCustomCourseCode(initialCourse.courseCode || '');
      setCustomInstructor(initialCourse.instructor || '');
      setCustomClassroom(initialCourse.classroom || '');
      setTitle('');
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
    } else if (courses.length > 0) {
      setSelectedCourseId(courses[0].id);
      setCustomCourseName('');
      setCustomCourseCode('');
      setCustomInstructor('');
      setCustomClassroom('');
      setTitle('');
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
    } else {
      setSelectedCourseId('custom');
      setCustomCourseName('');
      setCustomCourseCode('');
      setCustomInstructor('');
      setCustomClassroom('');
      setTitle('');
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialNote, initialCourse, courses, isOpen]);

  const isCustomCourse = selectedCourseId === 'custom' || courses.length === 0;
  const activeCourse = !isCustomCourse ? courses.find((c) => c.id === selectedCourseId) || initialCourse : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let courseId = '';
    let courseName = '';
    let courseCode = '';
    let instructor = '';
    let classroom = '';
    let day = 'Pazartesi' as any;
    let startTime = '';
    let endTime = '';

    if (activeCourse) {
      courseId = activeCourse.id;
      courseName = activeCourse.courseName;
      courseCode = activeCourse.courseCode || '';
      instructor = activeCourse.instructor || '';
      classroom = activeCourse.classroom || '';
      day = activeCourse.day;
      startTime = activeCourse.startTime;
      endTime = activeCourse.endTime;
    } else {
      if (!customCourseName.trim()) {
        toast.error('Lütfen ders adını girin!');
        return;
      }
      courseId = initialNote?.courseId || `custom-${Date.now()}`;
      courseName = customCourseName.trim();
      courseCode = customCourseCode.trim();
      instructor = customInstructor.trim();
      classroom = customClassroom.trim();
    }

    if (!content.trim()) {
      toast.error('Lütfen ders notu içeriğini yazın!');
      return;
    }

    const saved = saveCourseNote({
      id: initialNote?.id,
      courseId,
      courseName,
      courseCode,
      grade: activeCourse?.grade ?? initialNote?.grade,
      gradeLabel: activeCourse?.gradeLabel ?? initialNote?.gradeLabel,
      instructor,
      classroom,
      day,
      startTime,
      endTime,
      title: title.trim() || `${courseName} Notu`,
      content: content.trim(),
      date
    });

    toast.success(initialNote ? 'Ders notu güncellendi' : 'Yeni ders notu başarıyla kaydedildi!');
    onSaved?.(saved);
    onClose();
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-[2px] overflow-y-auto">
          {/* Backdrop click to close */}
          <div className="fixed inset-0 -z-10" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="modal-gpu-layer relative w-full max-w-lg bg-[#fcfbf9] dark:bg-[#1d3540] border border-[#e6e2d6] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#e6e2d6] dark:border-white/10 bg-[#f4f1ea] dark:bg-[#264653]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#8a2a43]/15 text-[#8a2a43] dark:text-[#f4a261] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                  {initialNote ? 'Ders Notunu Düzenle' : 'Ders Notu Ekle'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-300">
                  İşlenen veya tamamlanan derse ait not ve özet bilgileri
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
            {/* Course Select */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1.5 uppercase tracking-wider">
                İlgili Ders
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={!!initialNote}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/15 text-stone-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8a2a43]"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseName} ({course.courseCode || course.day}) - {course.day} {course.startTime}
                  </option>
                ))}
                <option value="custom">+ Farklı / Özel Bir Ders Gir</option>
              </select>
            </div>

            {/* If Custom Course Selected: Show Manual Course Inputs */}
            {isCustomCourse && (
              <div className="p-3.5 rounded-xl bg-stone-100/90 dark:bg-white/5 border border-stone-200 dark:border-white/10 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Ders Adı *
                  </label>
                  <input
                    type="text"
                    value={customCourseName}
                    onChange={(e) => setCustomCourseName(e.target.value)}
                    placeholder="Örn: Bilgisayar Ağları"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#264653] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#8a2a43]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Ders Kodu (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={customCourseCode}
                      onChange={(e) => setCustomCourseCode(e.target.value)}
                      placeholder="BLG301"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#264653] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#8a2a43]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Öğretim Elemanı (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={customInstructor}
                      onChange={(e) => setCustomInstructor(e.target.value)}
                      placeholder="Örn: Doç. Dr. Ahmet Yılmaz"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#264653] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#8a2a43]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Selected Course Quick Info Box */}
            {activeCourse && (
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-xs space-y-1">
                <div className="font-bold text-stone-900 dark:text-white">
                  {activeCourse.courseName}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-600 dark:text-stone-300">
                  {activeCourse.instructor && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#8a2a43] dark:text-[#f4a261]" />
                      {activeCourse.instructor}
                    </span>
                  )}
                  {activeCourse.classroom && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {activeCourse.classroom}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    {activeCourse.day} {activeCourse.startTime} - {activeCourse.endTime}
                  </span>
                </div>
              </div>
            )}

            {/* Note Title & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1.5 uppercase tracking-wider">
                  Konu / Başlık
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 4. Hafta - Fonksiyonlar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/15 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8a2a43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1.5 uppercase tracking-wider">
                  İşlenme / Not Tarihi
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/15 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8a2a43]"
                />
              </div>
            </div>

            {/* Note Content */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-200 mb-1.5 uppercase tracking-wider">
                Ders Notu ve Özeti *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Bu derste işlenen önemli başlıkları, hocanın vurguladığı sınav sorularını, formülleri veya ödevleri buraya yazabilirsiniz..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/15 text-stone-900 dark:text-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#8a2a43] resize-y"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e6e2d6] dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-stone-600 dark:text-stone-300 text-sm font-semibold hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#722237] text-white text-sm font-bold shadow-md shadow-[#8a2a43]/20 active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{initialNote ? 'Güncelle' : 'Notu Kaydet'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
