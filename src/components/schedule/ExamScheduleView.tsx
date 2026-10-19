/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Star,
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Share2,
} from 'lucide-react';
import { ExamItem, ExamType } from '../../types/schedule';
import { generateIcsFile, downloadFile } from '../../lib/scheduleParser';
import toast from 'react-hot-toast';

interface ExamScheduleViewProps {
  exams: ExamItem[];
  selectedGrade: number; // 0 for All, 1, 2, 3, 4
  onGradeChange: (grade: number) => void;
  onToggleEnroll: (id: string) => void;
  onEditExam: (exam: ExamItem) => void;
  onDeleteExam: (id: string) => void;
  onlyEnrolled: boolean;
  onToggleOnlyEnrolled: (val: boolean) => void;
  onOpenImport?: () => void;
}

export default function ExamScheduleView({
  exams,
  selectedGrade,
  onGradeChange,
  onToggleEnroll,
  onEditExam,
  onDeleteExam,
  onlyEnrolled,
  onToggleOnlyEnrolled,
  onOpenImport,
}: ExamScheduleViewProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter exams
  const filteredExams = useMemo(() => {
    return exams
      .filter((e) => {
        if (onlyEnrolled && !e.isEnrolled) return false;
        if (selectedGrade !== 0 && e.grade !== selectedGrade && e.grade !== 0) return false;
        if (selectedType !== 'all' && e.examType !== selectedType) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            e.courseName.toLowerCase().includes(q) ||
            e.courseCode.toLowerCase().includes(q) ||
            e.classroom.toLowerCase().includes(q) ||
            e.instructor.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.startTime || '00:00'}`).getTime();
        const timeB = new Date(`${b.date}T${b.startTime || '00:00'}`).getTime();
        return timeA - timeB;
      });
  }, [exams, selectedGrade, selectedType, onlyEnrolled, searchQuery]);

  // Export to .ics
  const handleExportIcs = () => {
    if (filteredExams.length === 0) {
      toast.error('Dışa aktarılacak sınav bulunamadı.');
      return;
    }
    const icsContent = generateIcsFile(filteredExams);
    downloadFile(icsContent, 'Kilis7_Aralik_Sinav_Takvimi.ics', 'text/calendar;charset=utf-8');
    toast.success('Sınav takvimi (.ics) indirildi! Telefon takviminize aktarabilirsiniz.', { icon: '📅' });
  };

  // Helper for exam countdown badge
  const getExamCountdownBadge = (dateStr: string, timeStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examDate = new Date(dateStr);
    examDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-white/10 text-stone-500">
          Tamamlandı
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white animate-pulse">
          Bugün!
        </span>
      );
    }
    if (diffDays === 1) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-white">
          Yarın!
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
        {diffDays} gün kaldı
      </span>
    );
  };

  const getExamTypeColor = (type: ExamType) => {
    switch (type) {
      case 'vize':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20';
      case 'final':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20';
      case 'butunleme':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200 dark:border-white/10 shadow-sm">
        {/* Grade Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => onGradeChange(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedGrade === 0
                ? 'bg-rose-600 text-white shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5'
            }`}
          >
            Tüm Sınıflar
          </button>
          {[1, 2, 3, 4].map((g) => (
            <button
              key={g}
              onClick={() => onGradeChange(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedGrade === g
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5'
              }`}
            >
              {g}. Sınıf
            </button>
          ))}
        </div>

        {/* Actions & Filters */}
        <div className="flex items-center gap-2 self-end sm:self-auto">

          <button
            onClick={() => onToggleOnlyEnrolled(!onlyEnrolled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              onlyEnrolled
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300'
                : 'bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyEnrolled ? 'fill-rose-500 text-rose-500' : ''}`} />
            Sadece Sınavlarım
          </button>

          <button
            onClick={handleExportIcs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 dark:bg-white/5 hover:bg-stone-200 text-stone-700 dark:text-stone-300 transition-colors"
            title="Google / Apple Takvimine Aktar (.ics)"
          >
            <Download className="w-3.5 h-3.5" />
            Takvime Ekle (.ics)
          </button>
        </div>
      </div>

      {/* Sub-Filter: Exam Type */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {['all', 'vize', 'final', 'butunleme'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedType === type
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              {type === 'all' ? 'Tüm Sınavlar' : type === 'vize' ? 'Vizeler' : type === 'final' ? 'Finaller' : 'Bütünleme'}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-400">
          {filteredExams.length} Sınav listelendi
        </span>
      </div>

      {/* Exam List */}
      {filteredExams.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200 dark:border-white/10">
          <Calendar className="w-10 h-10 text-stone-300 dark:text-white/20 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-800 dark:text-white">
            Sınav kaydı bulunamadı
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            Manuel sınav ekleyerek veya metinden içe aktararak sınav takviminizi doldurabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExams.map((exam) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-500/30 transition-all"
            >
              <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getExamTypeColor(exam.examType)}`}>
                    {exam.examType}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300">
                    {exam.gradeLabel}
                  </span>
                  {exam.department && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      {exam.department}
                    </span>
                  )}
                  {exam.category && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                      {exam.category}
                    </span>
                  )}
                  {exam.courseCode && (
                    <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300">
                      {exam.courseCode}
                    </span>
                  )}
                  {getExamCountdownBadge(exam.date, exam.startTime)}
                </div>

                {/* Course Name */}
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  {exam.courseName}
                </h3>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400 mt-1.5">
                  <span className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    {new Date(exam.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                    <Clock className="w-3.5 h-3.5" />
                    {exam.startTime} {exam.endTime ? `- ${exam.endTime}` : ''}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Salon: {exam.classroom}
                  </span>
                  {exam.supervisor && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Gözetmen: {exam.supervisor}
                    </span>
                  )}
                </div>

                {exam.notes && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic">
                    Not: {exam.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-white/5 shrink-0">
                <button
                  onClick={() => onToggleEnroll(exam.id)}
                  className="p-2 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title={exam.isEnrolled ? 'Sınavlarımdan Çıkar' : 'Sınavlarıma Ekle'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      exam.isEnrolled ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                    }`}
                  />
                </button>
                <button
                  onClick={() => onEditExam(exam)}
                  className="p-2 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Düzenle"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {confirmDeleteId === exam.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteExam(exam.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      Sil
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1.5 rounded-xl bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 font-medium text-xs hover:bg-stone-300 transition-all cursor-pointer"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(exam.id)}
                    className="p-2 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
