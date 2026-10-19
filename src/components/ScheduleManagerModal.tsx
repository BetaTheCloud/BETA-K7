/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  RotateCcw,
  ClipboardPaste,
  FileText
} from 'lucide-react';
import {
  CourseScheduleItem,
  ExamScheduleItem,
  DayOfWeek,
  ExamType,
  DAYS_OF_WEEK,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getSortedExams,
  addExam,
  updateExam,
  deleteExam,
  clearAllScheduleData,
  SCHEDULE_CHANGED_EVENT,
  SCHEDULE_UPDATED_EVENT
} from '../lib/scheduleStorage';
import ScheduleImportModal from './schedule/ScheduleImportModal';
import toast from 'react-hot-toast';

interface ScheduleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'courses' | 'exams';
}

const COMMON_CATEGORIES = ['Zorunlu', 'Seçmeli', 'Laboratuvar', 'Uygulama', 'Ortak'];

export default function ScheduleManagerModal({
  isOpen,
  onClose,
  initialTab = 'courses'
}: ScheduleManagerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'exams'>(initialTab);
  const [courses, setCourses] = useState<CourseScheduleItem[]>([]);
  const [exams, setExams] = useState<ExamScheduleItem[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Selected Day & Grade Filters for Courses tab
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayOfWeek | 'all'>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');

  // Inline Delete confirmation state (avoids blocked window.confirm)
  const [confirmDeleteCourseId, setConfirmDeleteCourseId] = useState<string | null>(null);
  const [confirmDeleteExamId, setConfirmDeleteExamId] = useState<string | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  // Course Add/Edit Form State
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseFormData, setCourseFormData] = useState({
    courseName: '',
    courseCode: '',
    department: '',
    grade: 1,
    gradeLabel: '1. Sınıf',
    category: 'Zorunlu',
    day: 'Pazartesi' as DayOfWeek,
    startTime: '09:00',
    endTime: '10:30',
    classroom: '',
    instructor: '',
    color: 'emerald' as 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'teal',
    notes: ''
  });

  // Exam Add/Edit Form State
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examFormData, setExamFormData] = useState({
    courseName: '',
    courseCode: '',
    department: '',
    grade: 1,
    gradeLabel: '1. Sınıf',
    category: 'Zorunlu',
    examType: 'Vize' as ExamType,
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    classroom: '',
    instructor: '',
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = () => {
    setCourses(getCourses());
    setExams(getSortedExams());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (initialTab) setActiveTab(initialTab);
      setConfirmDeleteCourseId(null);
      setConfirmDeleteExamId(null);
      setIsConfirmingClearAll(false);
      document.body.style.overflow = 'hidden';

      const handleHeaderBack = (e: Event) => {
        e.preventDefault();
        onClose();
      };
      const handleScheduleUpdate = () => loadData();

      window.addEventListener('k7_header_back', handleHeaderBack);
      window.addEventListener(SCHEDULE_CHANGED_EVENT, handleScheduleUpdate);
      window.addEventListener(SCHEDULE_UPDATED_EVENT, handleScheduleUpdate);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('k7_header_back', handleHeaderBack);
        window.removeEventListener(SCHEDULE_CHANGED_EVENT, handleScheduleUpdate);
        window.removeEventListener(SCHEDULE_UPDATED_EVENT, handleScheduleUpdate);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, initialTab, onClose]);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  // --- Course Actions ---
  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    const initialGrade = selectedGradeFilter !== 'all' ? selectedGradeFilter : 1;
    setCourseFormData({
      courseName: '',
      courseCode: '',
      department: '',
      grade: initialGrade,
      gradeLabel: initialGrade === 0 ? 'Genel / Ortak' : `${initialGrade}. Sınıf`,
      category: 'Zorunlu',
      day: selectedDayFilter !== 'all' ? selectedDayFilter : 'Pazartesi',
      startTime: '09:00',
      endTime: '10:30',
      classroom: '',
      instructor: '',
      color: 'emerald',
      notes: ''
    });
    setIsCourseFormOpen(true);
  };

  const handleOpenEditCourse = (item: CourseScheduleItem) => {
    setEditingCourseId(item.id);
    setCourseFormData({
      courseName: item.courseName,
      courseCode: item.courseCode || '',
      department: item.department || '',
      grade: typeof item.grade === 'number' ? item.grade : 1,
      gradeLabel: item.gradeLabel || (item.grade === 0 ? 'Genel / Ortak' : `${item.grade || 1}. Sınıf`),
      category: item.category || 'Zorunlu',
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      classroom: item.classroom,
      instructor: item.instructor,
      color: (item.color as any) || 'emerald',
      notes: item.notes || ''
    });
    setIsCourseFormOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.courseName.trim()) {
      toast.error('Lütfen ders adını girin!');
      return;
    }
    if (!courseFormData.classroom.trim()) {
      toast.error('Lütfen dersliği (amfi/sınıf) girin!');
      return;
    }
    if (!courseFormData.instructor.trim()) {
      toast.error('Lütfen ders hocasını girin!');
      return;
    }

    const payload = {
      ...courseFormData,
      gradeLabel: courseFormData.grade === 0 ? 'Genel / Ortak' : `${courseFormData.grade}. Sınıf`
    };

    if (editingCourseId) {
      updateCourse(editingCourseId, payload);
      toast.success('Ders başarıyla güncellendi');
    } else {
      addCourse(payload);
      toast.success('Yeni ders programa eklendi');
    }

    setIsCourseFormOpen(false);
    loadData();
  };

  // Safe delete without window.confirm
  const executeDeleteCourse = (id: string, name: string) => {
    deleteCourse(id);
    setConfirmDeleteCourseId(null);
    loadData();
    toast.success(`"${name}" dersi programdan silindi`);
  };

  // --- Exam Actions ---
  const handleOpenAddExam = () => {
    setEditingExamId(null);
    const initialGrade = selectedGradeFilter !== 'all' ? selectedGradeFilter : 1;
    setExamFormData({
      courseName: '',
      courseCode: '',
      department: '',
      grade: initialGrade,
      gradeLabel: initialGrade === 0 ? 'Genel / Ortak' : `${initialGrade}. Sınıf`,
      category: 'Zorunlu',
      examType: 'Vize',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      classroom: '',
      instructor: '',
      notes: ''
    });
    setIsExamFormOpen(true);
  };

  const handleOpenEditExam = (item: ExamScheduleItem) => {
    setEditingExamId(item.id);
    setExamFormData({
      courseName: item.courseName,
      courseCode: item.courseCode || '',
      department: item.department || '',
      grade: typeof item.grade === 'number' ? item.grade : 1,
      gradeLabel: item.gradeLabel || (item.grade === 0 ? 'Genel / Ortak' : `${item.grade || 1}. Sınıf`),
      category: item.category || 'Zorunlu',
      examType: item.examType,
      date: item.date,
      time: item.time || item.startTime || '10:00',
      classroom: item.classroom,
      instructor: item.instructor || '',
      notes: item.notes || ''
    });
    setIsExamFormOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.courseName.trim()) {
      toast.error('Lütfen sınav ders adını girin!');
      return;
    }
    if (!examFormData.classroom.trim()) {
      toast.error('Lütfen sınav yerini (derslik/amfi) girin!');
      return;
    }

    const payload = {
      ...examFormData,
      gradeLabel: examFormData.grade === 0 ? 'Genel / Ortak' : `${examFormData.grade}. Sınıf`
    };

    if (editingExamId) {
      updateExam(editingExamId, payload);
      toast.success('Sınav bilgisi güncellendi');
    } else {
      addExam(payload);
      toast.success('Yeni sınav takvime eklendi');
    }

    setIsExamFormOpen(false);
    loadData();
  };

  // Safe delete without window.confirm
  const executeDeleteExam = (id: string, name: string) => {
    deleteExam(id);
    setConfirmDeleteExamId(null);
    loadData();
    toast.success(`"${name}" sınavı takvimden silindi`);
  };

  // Handle Clear All Data
  const handleExecuteClearAll = () => {
    clearAllScheduleData();
    setIsConfirmingClearAll(false);
    loadData();
    toast.success('Tüm ders ve sınav programı temizlendi.');
  };

  // Filtered Courses (Day & Grade, c.grade === 0 means Ortak/Seçmeli, visible across all grades)
  const filteredCourses = courses
    .filter((c) => {
      if (selectedDayFilter !== 'all' && c.day !== selectedDayFilter) return false;
      if (selectedGradeFilter !== 'all' && c.grade !== selectedGradeFilter && c.grade !== 0) return false;
      return true;
    })
    .sort((a, b) => {
      const timeComp = a.startTime.localeCompare(b.startTime);
      if (timeComp !== 0) return timeComp;
      return a.courseName.localeCompare(b.courseName);
    });

  // Filtered Exams (Grade)
  const filteredExams = exams.filter((e) => {
    if (selectedGradeFilter !== 'all' && e.grade !== selectedGradeFilter && e.grade !== 0) return false;
    return true;
  });

  // Helper for color classes
  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'amber':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200';
      case 'blue':
        return 'border-blue-500/40 bg-blue-500/10 text-blue-800 dark:text-blue-200';
      case 'purple':
        return 'border-purple-500/40 bg-purple-500/10 text-purple-800 dark:text-purple-200';
      case 'rose':
        return 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200';
      case 'teal':
        return 'border-teal-500/40 bg-teal-500/10 text-teal-800 dark:text-teal-200';
      default:
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200';
    }
  };

  const getDaysRemaining = (targetDate: string, timeStr?: string) => {
    const now = new Date();
    const examDate = new Date(`${targetDate}T${timeStr || '09:00'}:00`);
    const diffMs = examDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs <= 0) {
      return { label: 'Tamamlandı', badgeClass: 'bg-stone-100 dark:bg-white/5 text-stone-400' };
    }

    if (diffHours <= 24) {
      return {
        label: diffHours <= 1 ? '1 saatten az!' : `${diffHours}s kaldı (24s İçinde!)`,
        badgeClass: 'bg-rose-600 text-white font-bold shadow-xs animate-pulse border border-rose-500'
      };
    }

    if (diffDays <= 3) {
      return {
        label: `${diffDays} gün kaldı`,
        badgeClass: 'bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/35'
      };
    }

    return {
      label: `${diffDays} gün kaldı`,
      badgeClass: 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 font-medium'
    };
  };

  const modalMarkup = (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] sm:pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] sm:pb-3 px-3 sm:px-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-[#fcfbf9] dark:bg-[#1f3741] rounded-3xl shadow-2xl border border-stone-200 dark:border-white/10 overflow-hidden z-10 my-auto flex flex-col max-h-[96vh] h-[92vh] sm:h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between py-3.5 sm:py-4 px-4 sm:px-6 border-b border-stone-200 dark:border-white/10 bg-stone-100/70 dark:bg-black/20 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center shadow-xs shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-tight truncate">
                Ders & Sınav Programı Ajandası
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-white/60 hidden sm:block">
                Metinden içe aktarabilir veya el ile ders ekleyebilirsiniz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span className="hidden sm:inline">Metinden İçe Aktar</span>
              <span className="sm:hidden">Metinden Aktar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Kapat"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1.5 bg-stone-200/50 dark:bg-black/30 border-b border-stone-200 dark:border-white/10 shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Haftalık Ders Programı</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              {courses.length} Ders
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-rose-500" />
            <span>Sınav Takvimi</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300">
              {exams.length} Sınav
            </span>
          </button>
        </div>

        {/* ================= TAB 1: COURSES ================= */}
        {activeTab === 'courses' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Action Bar & Minimalist Filters */}
            <div className="p-3 sm:p-4 border-b border-stone-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Day filter pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedDayFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                      selectedDayFilter === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/20'
                    }`}
                  >
                    Tümü ({courses.length})
                  </button>
                  {DAYS_OF_WEEK.map((d) => {
                    const count = courses.filter((c) => c.day === d).length;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDayFilter(d)}
                        className={`px-2 py-1 rounded-lg font-medium shrink-0 transition-colors cursor-pointer ${
                          selectedDayFilter === d
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/20'
                        }`}
                      >
                        {d.slice(0, 3)} {count > 0 && <span className="text-[10px] opacity-80">({count})</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Add Course Button */}
                <button
                  type="button"
                  onClick={handleOpenAddCourse}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0 ml-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Ders Ekle</span>
                </button>
              </div>

              {/* 1.-2.-3.-4. Sınıf Minimalist Ayrımı */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs pt-1 border-t border-stone-200/50 dark:border-white/5">
                <span className="text-[11px] text-stone-400 font-semibold shrink-0 mr-1">Sınıf:</span>
                <button
                  type="button"
                  onClick={() => setSelectedGradeFilter('all')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                    selectedGradeFilter === 'all'
                      ? 'bg-stone-800 dark:bg-white text-white dark:text-stone-900 font-bold'
                      : 'bg-stone-200/70 dark:bg-white/10 text-stone-600 dark:text-white/70 hover:bg-stone-300 dark:hover:bg-white/20'
                  }`}
                >
                  Tümü
                </button>
                {[1, 2, 3, 4].map((g) => {
                  const count = courses.filter((c) => c.grade === g).length;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGradeFilter(g)}
                      className={`px-2.5 py-0.5 rounded-lg font-medium shrink-0 transition-colors cursor-pointer ${
                        selectedGradeFilter === g
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                          : 'bg-stone-200/70 dark:bg-white/10 text-stone-600 dark:text-white/70 hover:bg-stone-300 dark:hover:bg-white/20'
                      }`}
                    >
                      {g}. Sınıf {count > 0 && <span className="text-[10px] opacity-75">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Courses List */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#264653] border border-stone-200/80 dark:border-white/10 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getColorClasses(course.color)}`}>
                          {course.day}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3" />
                          {course.startTime} - {course.endTime}
                        </span>

                        {/* Sınıf & Bölüm Rozetleri */}
                        {course.gradeLabel && course.grade !== 0 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20">
                            {course.gradeLabel}
                          </span>
                        )}
                        {course.department && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10">
                            {course.department}
                          </span>
                        )}
                        {course.category && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-white/60">
                            {course.category}
                          </span>
                        )}
                        {courses.some((o) => o.id !== course.id && o.day === course.day && o.startTime === course.startTime) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                            ⚡ Aynı Saatte Paralel Ders
                          </span>
                        )}
                        {course.courseCode && (
                          <span className="text-[10px] font-mono text-stone-400 dark:text-white/40 ml-auto tabular-nums">
                            {course.courseCode}
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug">
                        {course.courseName}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-600 dark:text-white/70 pt-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">{course.classroom}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span className="truncate">{course.instructor}</span>
                        </div>
                      </div>

                      {course.notes && (
                        <p className="text-[11px] text-stone-400 dark:text-white/40 italic line-clamp-1">
                          Not: {course.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions with working inline delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCourse(course)}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/80 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteCourseId === course.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => executeDeleteCourse(course.id, course.courseName)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            Sil
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteCourseId(null)}
                            className="px-2 py-1.5 rounded-xl bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-300 dark:hover:bg-white/20 transition-all cursor-pointer"
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteCourseId(course.id)}
                          className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-200 dark:border-white/10 space-y-3">
                  <BookOpen className="w-9 h-9 text-stone-300 dark:text-white/20 mx-auto" />
                  <p className="text-sm font-semibold text-stone-700 dark:text-white">
                    {selectedDayFilter === 'all' && selectedGradeFilter === 'all'
                      ? 'Henüz kayıtlı bir ders bulunmuyor.'
                      : 'Seçili kriterlere uygun ders bulunamadı.'}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-white/40 max-w-sm mx-auto">
                    Yukarıdaki "Metinden İçe Aktar" özelliğini kullanarak veya el ile ders ekleyebilirsiniz.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleOpenAddCourse}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ders Ekle</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: EXAMS ================= */}
        {activeTab === 'exams' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Action Bar & Sınıf Filter */}
            <div className="p-3 sm:p-4 border-b border-stone-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-stone-500 dark:text-white/60">
                  Toplam <strong>{exams.length}</strong> sınav takvimde kayıtlı
                </span>

                <button
                  type="button"
                  onClick={handleOpenAddExam}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Sınav Ekle</span>
                </button>
              </div>

              {/* Sınıf Filter for exams */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs pt-1 border-t border-stone-200/50 dark:border-white/5">
                <span className="text-[11px] text-stone-400 font-semibold shrink-0 mr-1">Sınıf:</span>
                <button
                  type="button"
                  onClick={() => setSelectedGradeFilter('all')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                    selectedGradeFilter === 'all'
                      ? 'bg-stone-800 dark:bg-white text-white dark:text-stone-900 font-bold'
                      : 'bg-stone-200/70 dark:bg-white/10 text-stone-600 dark:text-white/70 hover:bg-stone-300 dark:hover:bg-white/20'
                  }`}
                >
                  Tümü
                </button>
                {[1, 2, 3, 4].map((g) => {
                  const count = exams.filter((e) => e.grade === g).length;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGradeFilter(g)}
                      className={`px-2.5 py-0.5 rounded-lg font-medium shrink-0 transition-colors cursor-pointer ${
                        selectedGradeFilter === g
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                          : 'bg-stone-200/70 dark:bg-white/10 text-stone-600 dark:text-white/70 hover:bg-stone-300 dark:hover:bg-white/20'
                      }`}
                    >
                      {g}. Sınıf {count > 0 && <span className="text-[10px] opacity-75">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exams List */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => {
                  const rem = getDaysRemaining(exam.date, exam.time || exam.startTime);
                  return (
                    <div
                      key={exam.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#264653] border border-stone-200/80 dark:border-white/10 shadow-xs hover:border-rose-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25">
                            {exam.examType}
                          </span>
                          <span className="text-xs font-bold text-stone-800 dark:text-white flex items-center gap-1 tabular-nums">
                            <Calendar className="w-3.5 h-3.5 text-rose-500" />
                            {exam.date} • {exam.time || exam.startTime}
                          </span>

                          {exam.gradeLabel && exam.grade !== 0 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20">
                              {exam.gradeLabel}
                            </span>
                          )}
                          {exam.department && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10">
                              {exam.department}
                            </span>
                          )}

                          <span className={`text-[10px] px-2 py-0.5 rounded-md tabular-nums ${rem.badgeClass}`}>
                            {rem.label}
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug">
                          {exam.courseName}
                          {exam.courseCode && (
                            <span className="text-xs font-mono font-normal text-stone-400 dark:text-white/40 ml-1.5">
                              ({exam.courseCode})
                            </span>
                          )}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-600 dark:text-white/70 pt-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">{exam.classroom}</span>
                          </div>
                          {exam.instructor && (
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span className="truncate">{exam.instructor}</span>
                            </div>
                          )}
                        </div>

                        {exam.notes && (
                          <p className="text-[11px] text-stone-400 dark:text-white/40 italic line-clamp-1">
                            Not: {exam.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions with working inline delete */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditExam(exam)}
                          className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/80 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteExamId === exam.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => executeDeleteExam(exam.id, exam.courseName)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              Sil
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteExamId(null)}
                              className="px-2 py-1.5 rounded-xl bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-300 dark:hover:bg-white/20 transition-all cursor-pointer"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteExamId(exam.id)}
                            className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-200 dark:border-white/10 space-y-3">
                  <GraduationCap className="w-9 h-9 text-stone-300 dark:text-white/20 mx-auto" />
                  <p className="text-sm font-semibold text-stone-700 dark:text-white">
                    Henüz kayıtlı bir sınav bulunmuyor.
                  </p>
                  <p className="text-xs text-stone-400 dark:text-white/40 max-w-sm mx-auto">
                    Yaklaşan vize, final veya mazeret sınavlarınızı takvime ekleyebilirsiniz.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={handleOpenAddExam}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>İlk Sınavı Ekle</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-black/20 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {isConfirmingClearAll ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Tümünü sil?</span>
                <button
                  type="button"
                  onClick={handleExecuteClearAll}
                  className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 cursor-pointer"
                >
                  Evet, Temizle
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingClearAll(false)}
                  className="px-2 py-1 bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 text-xs rounded-lg cursor-pointer"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              (courses.length > 0 || exams.length > 0) && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClearAll(true)}
                  className="text-xs text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Tüm programı sıfırla"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Programı Sıfırla</span>
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer ml-auto"
          >
            Kapat
          </button>
        </div>

        {/* ================= MODAL: COURSE ADD/EDIT FORM ================= */}
        {isCourseFormOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[#fcfbf9] dark:bg-[#1f3741] border border-stone-200 dark:border-white/15 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-3">
                <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                  {editingCourseId ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCourseFormOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Ders Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Algoritmalar ve Programlama"
                    value={courseFormData.courseName}
                    onChange={(e) => setCourseFormData({ ...courseFormData, courseName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                {/* Sınıf Düzeyi (1.-2.-3.-4. Sınıf Minimalist Butonlar) */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Sınıf Düzeyi *
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { val: 1, label: '1. Sınıf' },
                      { val: 2, label: '2. Sınıf' },
                      { val: 3, label: '3. Sınıf' },
                      { val: 4, label: '4. Sınıf' },
                      { val: 0, label: 'Ortak' }
                    ].map((g) => (
                      <button
                        key={g.val}
                        type="button"
                        onClick={() =>
                          setCourseFormData({
                            ...courseFormData,
                            grade: g.val,
                            gradeLabel: g.val === 0 ? 'Genel / Ortak' : `${g.val}. Sınıf`
                          })
                        }
                        className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          courseFormData.grade === g.val
                            ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/20'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bölüm / Program (Temiz, sade metin alanı - öneri çipleri kaldırıldı) */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Bölüm / Program (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Bilgisayar Mühendisliği"
                    value={courseFormData.department}
                    onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Ders Kodu
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: BLM201"
                      value={courseFormData.courseCode}
                      onChange={(e) => setCourseFormData({ ...courseFormData, courseCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Gün *
                    </label>
                    <select
                      value={courseFormData.day}
                      onChange={(e) => setCourseFormData({ ...courseFormData, day: e.target.value as DayOfWeek })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Başlangıç Saati *
                    </label>
                    <input
                      type="time"
                      required
                      value={courseFormData.startTime}
                      onChange={(e) => setCourseFormData({ ...courseFormData, startTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Bitiş Saati *
                    </label>
                    <input
                      type="time"
                      required
                      value={courseFormData.endTime}
                      onChange={(e) => setCourseFormData({ ...courseFormData, endTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Derslik / Amfi / Sınıf *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mühendislik Fakültesi D-204"
                    value={courseFormData.classroom}
                    onChange={(e) => setCourseFormData({ ...courseFormData, classroom: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Ders Hocası *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Dr. Öğr. Üyesi Ahmet Kaya"
                    value={courseFormData.instructor}
                    onChange={(e) => setCourseFormData({ ...courseFormData, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Kategori
                    </label>
                    <select
                      value={courseFormData.category}
                      onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                    >
                      {COMMON_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Renk
                    </label>
                    <div className="flex gap-1.5 pt-1">
                      {(['emerald', 'blue', 'amber', 'purple', 'rose', 'teal'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCourseFormData({ ...courseFormData, color: c })}
                          className={`w-6 h-6 rounded-lg border transition-transform cursor-pointer ${
                            c === 'emerald'
                              ? 'bg-emerald-500'
                              : c === 'blue'
                              ? 'bg-blue-500'
                              : c === 'amber'
                              ? 'bg-amber-500'
                              : c === 'purple'
                              ? 'bg-purple-500'
                              : c === 'rose'
                              ? 'bg-rose-500'
                              : 'bg-teal-500'
                          } ${courseFormData.color === c ? 'scale-115 border-white shadow-md ring-2 ring-white/50' : 'border-transparent opacity-70'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Ek Not (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Lab dersi, ödev teslimi vb."
                    value={courseFormData.notes}
                    onChange={(e) => setCourseFormData({ ...courseFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCourseFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 font-semibold cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    {editingCourseId ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: EXAM ADD/EDIT FORM ================= */}
        {isExamFormOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[#fcfbf9] dark:bg-[#1f3741] border border-stone-200 dark:border-white/15 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-3">
                <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                  {editingExamId ? 'Sınavı Düzenle' : 'Yeni Sınav Ekle'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsExamFormOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveExam} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Ders Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Algoritmalar ve Programlama"
                    value={examFormData.courseName}
                    onChange={(e) => setExamFormData({ ...examFormData, courseName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                {/* Sınıf Düzeyi (1.-2.-3.-4. Sınıf Minimalist Butonlar) */}
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Sınıf Düzeyi *
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { val: 1, label: '1. Sınıf' },
                      { val: 2, label: '2. Sınıf' },
                      { val: 3, label: '3. Sınıf' },
                      { val: 4, label: '4. Sınıf' },
                      { val: 0, label: 'Ortak' }
                    ].map((g) => (
                      <button
                        key={g.val}
                        type="button"
                        onClick={() =>
                          setExamFormData({
                            ...examFormData,
                            grade: g.val,
                            gradeLabel: g.val === 0 ? 'Genel / Ortak' : `${g.val}. Sınıf`
                          })
                        }
                        className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          examFormData.grade === g.val
                            ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/20'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Bölüm / Program (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Bilgisayar Mühendisliği"
                    value={examFormData.department}
                    onChange={(e) => setExamFormData({ ...examFormData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Sınav Türü *
                    </label>
                    <select
                      value={examFormData.examType}
                      onChange={(e) => setExamFormData({ ...examFormData, examType: e.target.value as ExamType })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                    >
                      <option value="Vize">Vize</option>
                      <option value="Final">Final</option>
                      <option value="Bütünleme">Bütünleme</option>
                      <option value="Mazeret">Mazeret Sınavı</option>
                      <option value="Quiz">Quiz / Ara Değerlendirme</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Ders Kodu
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: BLM201"
                      value={examFormData.courseCode}
                      onChange={(e) => setExamFormData({ ...examFormData, courseCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Sınav Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={examFormData.date}
                      onChange={(e) => setExamFormData({ ...examFormData, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Sınav Saati *
                    </label>
                    <input
                      type="time"
                      required
                      value={examFormData.time}
                      onChange={(e) => setExamFormData({ ...examFormData, time: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Sınav Yeri / Derslik / Amfi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Merkezi Derslik Amfi 2"
                    value={examFormData.classroom}
                    onChange={(e) => setExamFormData({ ...examFormData, classroom: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Ders Hocası / Sorumlu
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Dr. Öğr. Üyesi Ahmet Kaya"
                    value={examFormData.instructor}
                    onChange={(e) => setExamFormData({ ...examFormData, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Sınav Notu / Kurallar (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Hesap makinesi serbest, kimlik zorunlu"
                    value={examFormData.notes}
                    onChange={(e) => setExamFormData({ ...examFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/20 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsExamFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 font-semibold cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    {editingExamId ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  return (
    <>
      {createPortal(modalMarkup, document.body)}
      <ScheduleImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          loadData();
        }}
        onSuccess={() => {
          loadData();
        }}
      />
    </>
  );
}
