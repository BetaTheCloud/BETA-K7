/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - 14 Haftalık İnteraktif Devamsızlık Takip Modalı
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UserCheck,
  UserX,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Plus,
  Minus,
  Check,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { CourseItem, AttendanceRecord, WeekAttendanceStatus } from '../../types/schedule';
import {
  getAllAttendanceRecords,
  getCourseAttendance,
  toggleWeekAttendance,
  incrementAbsence,
  decrementAbsence,
  updateCourseAttendanceLimit,
  resetCourseAttendance,
  getAttendanceHealthStatus,
  ATTENDANCE_CHANGED_EVENT
} from '../../lib/attendanceStorage';
import { useModalScrollLock } from '../../lib/scrollLock';
import toast from 'react-hot-toast';

interface AttendanceTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseItem[];
}

export default function AttendanceTrackerModal({
  isOpen,
  onClose,
  courses
}: AttendanceTrackerModalProps) {
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
  const [editingLimitCourseId, setEditingLimitCourseId] = useState<string | null>(null);

  useModalScrollLock(isOpen);

  // Sync state with storage and events
  useEffect(() => {
    const refresh = () => {
      setRecords(getAllAttendanceRecords());
    };
    refresh();
    window.addEventListener(ATTENDANCE_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(ATTENDANCE_CHANGED_EVENT, refresh);
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const enrolledCourses = courses.filter((c) => c.isEnrolled);

  // Overall Health Stats
  let safeCount = 0;
  let warningCount = 0;
  let dangerCount = 0;

  enrolledCourses.forEach((c) => {
    const rec = records[c.id] || getCourseAttendance(c.id, c.courseName, c);
    const health = getAttendanceHealthStatus(rec);
    if (health.status === 'safe') safeCount++;
    else if (health.status === 'warning') warningCount++;
    else dangerCount++;
  });

  const handleToggleWeek = (course: CourseItem, weekNum: number) => {
    const updated = toggleWeekAttendance(course.id, weekNum, course);
    const health = getAttendanceHealthStatus(updated);
    const newStatus = updated.weekStatuses?.[weekNum];

    if (newStatus === 'absent') {
      if (health.status === 'danger') {
        toast.error(`${weekNum}. Hafta devamsız işaretlendi. Sınır aşıldı!`);
      } else if (health.status === 'warning') {
        toast(`${weekNum}. Hafta devamsız işaretlendi. Son 1 hafta hakkınız kaldı!`);
      } else {
        toast(`${weekNum}. Hafta devamsız olarak işaretlendi.`);
      }
    } else if (newStatus === 'present') {
      toast.success(`${weekNum}. Hafta derse katıldım olarak işaretlendi.`);
    } else {
      toast(`${weekNum}. Hafta işareti temizlendi.`);
    }
  };

  const handleQuickAdd = (course: CourseItem) => {
    const updated = incrementAbsence(course.id, course);
    const health = getAttendanceHealthStatus(updated);
    if (health.status === 'danger') {
      toast.error(`"${course.courseName}" devamsızlık sınırı aşıldı!`);
    } else {
      toast.success(`+1 devamsızlık eklendi (${updated.absenceCount}/${updated.maxAllowedAbsenceWeeks} Hafta)`);
    }
  };

  const handleQuickRemove = (courseId: string) => {
    decrementAbsence(courseId);
    toast.success('Son devamsızlık kaydı geri alındı.');
  };

  const handleResetCourse = (courseId: string, courseName: string) => {
    if (window.confirm(`"${courseName}" dersinin tüm 14 haftalık devamsızlık kayıtları sıfırlansın mı?`)) {
      resetCourseAttendance(courseId);
      toast.success(`"${courseName}" devamsızlıkları sıfırlandı.`);
    }
  };

  const handleSetLimit = (courseId: string, limit: number, isExempt: boolean = false) => {
    updateCourseAttendanceLimit(courseId, limit, isExempt);
    setEditingLimitCourseId(null);
    toast.success(isExempt ? 'Ders devamsızlıktan muaf tutuldu.' : `Devamsızlık sınırı ${limit} hafta olarak ayarlandı.`);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-[2px] z-0"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl max-h-[92vh] bg-[#fcfbf9] dark:bg-[#1d3540] rounded-3xl shadow-2xl border border-stone-200 dark:border-white/10 flex flex-col overflow-hidden text-stone-900 dark:text-white modal-gpu-layer"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between bg-stone-50/70 dark:bg-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-extrabold tracking-tight leading-none text-stone-900 dark:text-white">
                  Devamsızlık Takipçisi
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-white/60 mt-0.5">
                  14 Haftalık İnteraktif Dönem Şeridi • K7AÜ Yönetmeliği
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Health Summary Ribbon */}
          <div className="px-5 py-2.5 bg-stone-100/90 dark:bg-white/5 border-b border-stone-200/70 dark:border-white/10 flex items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {safeCount} Güvende
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {warningCount} Kritik
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {dangerCount} Sınırda / Aşıldı
                </span>
              </div>
            </div>

            {/* Quick Legend */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Devamsız
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Katıldım
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600" /> İşlenmedi
              </span>
            </div>
          </div>

          {/* Modal Body: Course Cards */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">
            {enrolledCourses.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <Info className="w-8 h-8 mx-auto text-stone-400" />
                <p className="font-semibold text-stone-600 dark:text-stone-300">
                  Henüz kayıtlı dersiniz bulunmuyor.
                </p>
                <p className="text-xs">
                  Ders Programı sayfasındaki derslerinizin yanındaki yıldız (★) simgesine basarak devamsızlık takibini başlatabilirsiniz.
                </p>
              </div>
            ) : (
              enrolledCourses.map((course) => {
                const record = records[course.id] || getCourseAttendance(course.id, course.courseName, course);
                const health = getAttendanceHealthStatus(record);
                const weekStatuses = record.weekStatuses || {};
                const isEditingLimit = editingLimitCourseId === course.id;

                return (
                  <div
                    key={course.id}
                    className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shadow-xs space-y-3 transition-all hover:border-stone-300 dark:hover:border-white/20"
                    style={{
                      borderLeftWidth: '5px',
                      borderLeftColor: course.color || '#0284c7'
                    }}
                  >
                    {/* Top Row: Course Info, Health Status & Limit Adjust */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {course.courseCode && (
                            <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              {course.courseCode}
                            </span>
                          )}
                          <span className="text-xs text-stone-500 dark:text-stone-400">
                            {course.day} {course.startTime ? `• ${course.startTime}` : ''}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug break-words">
                          {course.courseName}
                        </h4>
                      </div>

                      {/* Health Badge & Settings */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${health.badgeClass}`}
                        >
                          {health.status === 'safe' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {health.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                          {health.status === 'danger' && <ShieldAlert className="w-3.5 h-3.5" />}
                          <span>{health.label}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setEditingLimitCourseId(isEditingLimit ? null : course.id)}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/10 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
                          title="Devamsızlık sınırını ayarla"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Custom Limit Editor Popover (Inline) */}
                    {isEditingLimit && (
                      <div className="p-3 rounded-xl bg-stone-50 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 space-y-2">
                        <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                          Devamsızlık Hakkı Belirle:
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5">
                          {[2, 3, 4, 5].map((weeks) => (
                            <button
                              key={weeks}
                              type="button"
                              onClick={() => handleSetLimit(course.id, weeks, false)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                !record.isExempt && record.maxAllowedAbsenceWeeks === weeks
                                  ? 'bg-[#8a2a43] text-white border-[#8a2a43]'
                                  : 'bg-white dark:bg-white/10 border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                              }`}
                            >
                              {weeks} Hafta {weeks === 4 && '(Standart %30)'}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleSetLimit(course.id, 99, true)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              record.isExempt
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-white/10 border-stone-200 dark:border-white/10 text-blue-700 dark:text-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            Devamsızlık Şartsız (Muaf)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* The 14-Week Interactive Strip */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="font-medium">
                          14 Haftalık Dönem Akışı (Dokunarak Değiştir):
                        </span>
                        <span className="text-[10px]">
                          🔴 Devamsız • 🟢 Katıldım • ⚪ Boş
                        </span>
                      </div>

                      {/* Horizontal 14 Week Buttons Strip */}
                      <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
                        {Array.from({ length: record.totalWeeks || 14 }, (_, i) => i + 1).map((weekNum) => {
                          const status: WeekAttendanceStatus = weekStatuses[weekNum] || 'unmarked';
                          const isMidtermWeek = weekNum === 8;

                          return (
                            <button
                              key={weekNum}
                              type="button"
                              onClick={() => handleToggleWeek(course, weekNum)}
                              className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center relative active:scale-90 select-none shadow-2xs ${
                                status === 'absent'
                                  ? 'bg-rose-500 text-white border border-rose-600 shadow-rose-500/20'
                                  : status === 'present'
                                  ? 'bg-emerald-500 text-white border border-emerald-600 shadow-emerald-500/20'
                                  : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-white/10 hover:bg-stone-200 dark:hover:bg-white/15'
                              }`}
                              title={`${weekNum}. Hafta: ${
                                status === 'absent'
                                  ? 'Devamsız (Dokunarak Katıldı Yap)'
                                  : status === 'present'
                                  ? 'Katıldım (Dokunarak Sıfırla)'
                                  : 'Boş (Dokunarak Devamsız Yap)'
                              }`}
                            >
                              <span className="text-[10px] leading-none opacity-80">H{weekNum}</span>
                              <div className="mt-0.5">
                                {status === 'absent' && <X className="w-3.5 h-3.5 stroke-[3]" />}
                                {status === 'present' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                {status === 'unmarked' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400/40 dark:bg-white/30 block" />
                                )}
                              </div>

                              {isMidtermWeek && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#1d3540]" title="Vize Haftası" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Status & Quick Stepper Controls */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-stone-100 dark:border-white/5">
                      <div className="text-xs text-stone-600 dark:text-stone-300">
                        Yapılan Devamsızlık: <strong className="text-stone-900 dark:text-white font-bold">{record.absenceCount}</strong> / {record.isExempt ? 'Muaf' : `${record.maxAllowedAbsenceWeeks} Hafta`}
                        {!record.isExempt && (
                          <span className="ml-1 text-stone-400">
                            ({Math.max(0, record.maxAllowedAbsenceWeeks - record.absenceCount)} Hak Kaldı)
                          </span>
                        )}
                      </div>

                      {/* Stepper Buttons & Reset */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickRemove(course.id)}
                          disabled={record.absenceCount === 0}
                          className="p-1.5 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                          title="1 Devamsızlık Azalt"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="px-2 py-1 rounded-md bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                          {record.absenceCount} / {record.maxAllowedAbsenceWeeks}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleQuickAdd(course)}
                          className="p-1.5 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold active:scale-95"
                          title="1 Devamsızlık Ekle"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        {/* Reset button */}
                        {record.absenceCount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleResetCourse(course.id, course.courseName)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                            title="Bu dersin tüm haftalarını sıfırla"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-stone-200/80 dark:border-white/10 bg-stone-50/70 dark:bg-white/5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 shrink-0">
            <span className="text-[11px] max-w-sm truncate">
              K7AÜ Yönetmeliği: Mazeretsiz devamsızlık teorik derslerde %30'u aşamaz.
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#8a2a43] hover:bg-[#722237] text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer ml-auto shrink-0"
            >
              Tamam
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
