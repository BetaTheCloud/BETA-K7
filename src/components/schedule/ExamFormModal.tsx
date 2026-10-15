/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, Check, Calendar } from 'lucide-react';
import { ExamItem, ExamType } from '../../types/schedule';
import { upsertExam } from '../../lib/scheduleStorage';
import toast from 'react-hot-toast';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExam?: ExamItem | null;
  onSaved: () => void;
}

export default function ExamFormModal({
  isOpen,
  onClose,
  initialExam,
  onSaved,
}: ExamFormModalProps) {
  const [grade, setGrade] = useState<number>(initialExam?.grade ?? 2);
  const [department, setDepartment] = useState<string>(initialExam?.department ?? '');
  const [category, setCategory] = useState<string>(initialExam?.category ?? 'Zorunlu');
  const [examType, setExamType] = useState<ExamType>(initialExam?.examType ?? 'vize');
  const [date, setDate] = useState<string>(initialExam?.date ?? new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>(initialExam?.startTime ?? '10:00');
  const [endTime, setEndTime] = useState<string>(initialExam?.endTime ?? '11:30');
  const [courseCode, setCourseCode] = useState<string>(initialExam?.courseCode ?? '');
  const [courseName, setCourseName] = useState<string>(initialExam?.courseName ?? '');
  const [classroom, setClassroom] = useState<string>(initialExam?.classroom ?? '');
  const [instructor, setInstructor] = useState<string>(initialExam?.instructor ?? '');
  const [supervisor, setSupervisor] = useState<string>(initialExam?.supervisor ?? '');
  const [notes, setNotes] = useState<string>(initialExam?.notes ?? '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      toast.error('Lütfen ders adını girin.');
      return;
    }

    const exam: ExamItem = {
      id: initialExam?.id || `exam-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      grade,
      gradeLabel: grade === 0 ? 'Genel' : `${grade}. Sınıf`,
      department: department.trim(),
      category: category.trim(),
      examType,
      date,
      startTime,
      endTime,
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      classroom: classroom.trim() || 'Sınav Salonu',
      instructor: instructor.trim() || 'Ders Sorumlusu',
      supervisor: supervisor.trim(),
      notes: notes.trim(),
      isEnrolled: initialExam ? initialExam.isEnrolled : true,
    };

    upsertExam(exam);
    toast.success(initialExam ? 'Sınav güncellendi' : 'Yeni sınav eklendi');
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
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
              {initialExam ? 'Sınavı Düzenle' : 'Yeni Sınav Ekle'}
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
                <option value={0}>Ortak / Genel</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Sınav Türü</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white uppercase font-semibold"
              >
                <option value="vize">Vize (Ara Sınav)</option>
                <option value="final">Final (Yarıyıl Sonu)</option>
                <option value="butunleme">Bütünleme</option>
                <option value="mazeret">Mazeret Sınavı</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Tarih</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Saat</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Bitiş</label>
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
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Sınav Salonu / Derslik</label>
              <input
                type="text"
                placeholder="D-203, Amfi 1"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Gözetmen / Hoca</label>
              <input
                type="text"
                placeholder="Arş. Gör. Esra Aydın"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
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
              <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Sınav Kategorisi</label>
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

          <div>
            <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">Ek Notlar / Kurallar</label>
            <input
              type="text"
              placeholder="Hesap makinesi serbesttir, formül kağıdı verilecek"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
            />
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold flex items-center gap-1.5"
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
