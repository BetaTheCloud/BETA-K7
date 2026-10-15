/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, Check, BookOpen } from 'lucide-react';
import { CourseItem, DayOfWeek } from '../../types/schedule';
import { upsertCourse } from '../../lib/scheduleStorage';
import toast from 'react-hot-toast';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: CourseItem | null;
  onSaved: () => void;
}

const DAYS: DayOfWeek[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export default function CourseFormModal({
  isOpen,
  onClose,
  initialCourse,
  onSaved,
}: CourseFormModalProps) {
  const [grade, setGrade] = useState<number>(initialCourse?.grade ?? 2);
  const [day, setDay] = useState<DayOfWeek>(initialCourse?.day ?? 'Pazartesi');
  const [department, setDepartment] = useState<string>(initialCourse?.department ?? '');
  const [category, setCategory] = useState<string>(initialCourse?.category ?? 'Zorunlu');
  const [startTime, setStartTime] = useState<string>(initialCourse?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState<string>(initialCourse?.endTime ?? '10:45');
  const [courseCode, setCourseCode] = useState<string>(initialCourse?.courseCode ?? '');
  const [courseName, setCourseName] = useState<string>(initialCourse?.courseName ?? '');
  const [classroom, setClassroom] = useState<string>(initialCourse?.classroom ?? '');
  const [instructor, setInstructor] = useState<string>(initialCourse?.instructor ?? '');
  const [color, setColor] = useState<string>(initialCourse?.color ?? '#0284c7');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      toast.error('Lütfen ders adını girin.');
      return;
    }

    const course: CourseItem = {
      id: initialCourse?.id || `course-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      grade,
      gradeLabel: grade === 0 ? 'Ortak / Seçmeli' : `${grade}. Sınıf`,
      department: department.trim(),
      category: category.trim(),
      day,
      startTime,
      endTime,
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      classroom: classroom.trim() || 'Derslik',
      instructor: instructor.trim() || 'Ders Sorumlusu',
      color,
      isEnrolled: initialCourse ? initialCourse.isEnrolled : true,
    };

    upsertCourse(course);
    toast.success(initialCourse ? 'Ders güncellendi' : 'Yeni ders eklendi');
    onSaved();
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-[#1d3540] rounded-2xl shadow-2xl border border-stone-200 dark:border-white/10 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-stone-200 dark:border-white/10 flex items-center justify-between bg-stone-50/80 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
              {initialCourse ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Sınıf</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              >
                <option value={1}>1. Sınıf</option>
                <option value={2}>2. Sınıf</option>
                <option value={3}>3. Sınıf</option>
                <option value={4}>4. Sınıf</option>
                <option value={0}>Ortak / Seçmeli</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Gün</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Başlangıç Saati</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Bitiş Saati</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Ders Kodu</label>
              <input
                type="text"
                placeholder="BLG201"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white uppercase font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Ders Adı *</label>
              <input
                type="text"
                placeholder="Veri Yapıları"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Derslik / Salon</label>
              <input
                type="text"
                placeholder="D-203 veya Lab 1"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Öğretim Elemanı</label>
              <input
                type="text"
                placeholder="Doç. Dr. Emre Bulut"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Bölüm / Program</label>
              <input
                type="text"
                placeholder="Örn: Bilgisayar Müh."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Ders Kategorisi</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              >
                <option value="Zorunlu">Zorunlu</option>
                <option value="Seçmeli">Seçmeli</option>
                <option value="Laboratuvar">Laboratuvar</option>
                <option value="Uygulama">Uygulama</option>
                <option value="Ortak">Ortak / Üniversite</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
