/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Clock,
  MapPin,
  User,
  Calendar,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  CalendarCheck,
  AlertCircle,
  BellRing
} from 'lucide-react';
import {
  CourseScheduleItem,
  ExamScheduleItem,
  DayOfWeek,
  DAYS_OF_WEEK,
  getCourses,
  getSortedExams,
  getCurrentDayOfWeek,
  SCHEDULE_UPDATED_EVENT,
  SCHEDULE_CHANGED_EVENT
} from '../lib/scheduleStorage';
import ScheduleManagerModal from './ScheduleManagerModal';
import ScheduleNotificationModal from './schedule/ScheduleNotificationModal';
import SectionHeader from './SectionHeader';

interface TodayScheduleWidgetProps {
  onOpenManager?: () => void;
}

export default function TodayScheduleWidget({ onOpenManager }: TodayScheduleWidgetProps) {
  const [courses, setCourses] = useState<CourseScheduleItem[]>(() => getCourses());
  const [exams, setExams] = useState<ExamScheduleItem[]>(() => getSortedExams());
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [managerInitialTab, setManagerInitialTab] = useState<'courses' | 'exams'>('courses');

  // Active view: 'today' | 'tomorrow' | 'exams' | DayOfWeek
  const currentTodayDay = getCurrentDayOfWeek();
  const [activeViewDay, setActiveViewDay] = useState<DayOfWeek>(currentTodayDay);
  const [showOnlyExams, setShowOnlyExams] = useState(false);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');

  const loadData = () => {
    setCourses(getCourses());
    setExams(getSortedExams());
  };

  useEffect(() => {
    const handleUpdate = () => loadData();
    window.addEventListener(SCHEDULE_UPDATED_EVENT, handleUpdate);
    window.addEventListener(SCHEDULE_CHANGED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(SCHEDULE_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(SCHEDULE_CHANGED_EVENT, handleUpdate);
    };
  }, []);

  const openManager = (tab: 'courses' | 'exams' = 'courses') => {
    if (onOpenManager) {
      onOpenManager();
    } else {
      setManagerInitialTab(tab);
      setIsManagerOpen(true);
    }
  };

  // Get next day
  const getTomorrowDay = (): DayOfWeek => {
    const idx = DAYS_OF_WEEK.indexOf(currentTodayDay);
    return DAYS_OF_WEEK[(idx + 1) % DAYS_OF_WEEK.length];
  };

  // Filter courses for active day and grade
  const dayCourses = useMemo(() => {
    return courses
      .filter((c) => {
        if (c.day !== activeViewDay) return false;
        if (selectedGradeFilter !== 'all' && c.grade !== selectedGradeFilter) return false;
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [courses, activeViewDay, selectedGradeFilter]);

  // Filter exams for active grade
  const displayExams = useMemo(() => {
    if (selectedGradeFilter === 'all') return exams;
    return exams.filter((e) => e.grade === selectedGradeFilter);
  }, [exams, selectedGradeFilter]);

  // Check current time status for classes
  const getCurrentClassStatus = (startTime: string, endTime: string, day: DayOfWeek) => {
    if (day !== currentTodayDay) return null;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (currentMins >= startMins && currentMins <= endMins) {
      return { status: 'in_progress' as const, label: 'Şu An Derste' };
    }
    if (currentMins < startMins && startMins - currentMins <= 45) {
      const minsLeft = startMins - currentMins;
      return { status: 'next_soon' as const, label: `${minsLeft} dk içinde başlıyor`, minsLeft };
    }
    return null;
  };

  // Upcoming nearest exams (next 14 days)
  const upcomingExams = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return exams.filter((e) => e.date >= todayStr).slice(0, 2);
  }, [exams]);

  // Detailed countdown calculation (under 24h = red pulse, under 3d = amber, otherwise normal)
  const getExamCountdown = (dateStr: string, timeStr?: string) => {
    const now = new Date();
    const examDate = new Date(`${dateStr}T${timeStr || '09:00'}:00`);
    const diffMs = examDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs <= 0) {
      return {
        label: 'Tamamlandı',
        badgeClass: 'bg-stone-100 dark:bg-white/5 text-stone-400 border border-stone-200 dark:border-white/10',
        urgency: 'passed'
      };
    }

    // Under 24 hours -> Critical Red Pulse
    if (diffHours <= 24) {
      return {
        label: diffHours <= 1 ? '1 saatten az kaldı!' : `${diffHours}s Kaldı (24s İçinde!)`,
        badgeClass: 'bg-rose-600 text-white font-bold shadow-xs animate-pulse border border-rose-500',
        urgency: 'critical'
      };
    }

    // Under 3 days -> Warning Amber
    if (diffDays <= 3) {
      return {
        label: `${diffDays} gün kaldı (Yaklaşıyor)`,
        badgeClass: 'bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/35',
        urgency: 'urgent'
      };
    }

    // Normal (> 3 days)
    return {
      label: `${diffDays} gün kaldı`,
      badgeClass: 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 border border-stone-200/60 dark:border-white/10 font-medium',
      urgency: 'normal'
    };
  };

  return (
    <section className="space-y-3.5">
      {/* Standardized SectionHeader */}
      <SectionHeader
        icon={GraduationCap}
        theme="amber"
        title="Günün Ders & Sınav Programı"
        subtitle={`${activeViewDay === currentTodayDay ? `Bugün: ${currentTodayDay}` : activeViewDay} · ${dayCourses.length} Ders Kayıtlı`}
        secondaryAction={{
          label: 'Bildirimler (10 & 5 Dk)',
          onClick: () => setIsNotificationModalOpen(true),
          icon: BellRing
        }}
        action={{
          label: 'Programı Düzenle',
          onClick: () => openManager('courses'),
          icon: SlidersHorizontal
        }}
      />

      {/* Day Selector Segmented Bar (Option 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 overflow-x-auto scrollbar-none text-xs">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setActiveViewDay(currentTodayDay);
              setShowOnlyExams(false);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeViewDay === currentTodayDay && !showOnlyExams
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Bugün ({currentTodayDay.slice(0, 3)})
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setActiveViewDay(getTomorrowDay());
              setShowOnlyExams(false);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeViewDay === getTomorrowDay() && !showOnlyExams
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Yarın ({getTomorrowDay().slice(0, 3)})
          </motion.button>

          {/* Quick day buttons */}
          {DAYS_OF_WEEK.map((day) => {
            if (day === currentTodayDay || day === getTomorrowDay()) return null;
            const count = courses.filter((c) => {
              if (c.day !== day) return false;
              if (selectedGradeFilter !== 'all' && c.grade !== selectedGradeFilter) return false;
              return true;
            }).length;
            return (
              <motion.button
                key={day}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setActiveViewDay(day);
                  setShowOnlyExams(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeViewDay === day && !showOnlyExams
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {day.slice(0, 3)}{' '}
                {count > 0 && <span className="tabular-nums text-[10px] opacity-75">({count})</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Sınavlar Quick Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setShowOnlyExams(!showOnlyExams)}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 text-xs ${
            showOnlyExams
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 border border-rose-500/20'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Sınavlar</span>
          <span className="tabular-nums text-[11px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/15">
            {exams.length}
          </span>
        </motion.button>
      </div>

      {/* 1.-2.-3.-4. Sınıf Segmented Filter */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
        <span className="text-[11px] text-stone-400 font-semibold shrink-0 mr-1">Sınıf:</span>
        <div className="flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => setSelectedGradeFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedGradeFilter === 'all'
                ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white font-bold shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Tümü
          </motion.button>
          {[1, 2, 3, 4].map((g) => {
            const count = courses.filter((c) => c.grade === g).length;
            return (
              <motion.button
                key={g}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => setSelectedGradeFilter(g)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedGradeFilter === g
                    ? 'bg-amber-600 text-white font-bold shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {g}. Sınıf{' '}
                {count > 0 && <span className="tabular-nums text-[10px] opacity-75">({count})</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area with Spring Animated Transition */}
      <AnimatePresence mode="wait">
        {!showOnlyExams ? (
          <motion.div
            key={activeViewDay + String(selectedGradeFilter)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="space-y-3"
          >
            {/* Upcoming Exam Alert Strip with Live Countdown (if any exam exists) */}
            {upcomingExams.length > 0 && (() => {
              const exam = upcomingExams[0];
              const countdown = getExamCountdown(exam.date, exam.time || exam.startTime);

              return (
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 flex-wrap transition-all ${
                    countdown.urgency === 'critical'
                      ? 'bg-rose-500/15 border-rose-500/40 ring-1 ring-rose-500/30'
                      : countdown.urgency === 'urgent'
                      ? 'bg-amber-500/15 border-amber-500/35 ring-1 ring-amber-500/20'
                      : 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/25'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        countdown.urgency === 'critical'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white">
                          {exam.examType}
                        </span>
                        <span className="text-xs font-bold text-stone-900 dark:text-white truncate">
                          {exam.courseName}
                        </span>
                        {exam.gradeLabel && exam.grade !== 0 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20">
                            {exam.gradeLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-white/70 flex items-center gap-2 mt-0.5 truncate">
                        <span className="tabular-nums">
                          {exam.date} • {exam.time || exam.startTime}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-rose-700 dark:text-rose-300 truncate tabular-nums">
                          {exam.classroom}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <span className={`text-xs px-2.5 py-1 rounded-lg ${countdown.badgeClass}`}>
                      {countdown.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => openManager('exams')}
                      className="text-xs text-rose-700 dark:text-rose-300 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      Tüm Sınavlar <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })()}

            {/* Courses List */}
            {dayCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dayCourses.map((course) => {
                  const liveStatus = getCurrentClassStatus(course.startTime, course.endTime, activeViewDay);
                  const isCurrent = liveStatus?.status === 'in_progress';
                  const isSoon = liveStatus?.status === 'next_soon';

                  return (
                    <motion.div
                      key={course.id}
                      whileHover={{ y: -2, scale: 1.006 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                        isCurrent
                          ? 'border-l-[6px] border-l-emerald-500 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-[#fcfbf9] to-[#fcfbf9] dark:from-emerald-500/15 dark:via-[#264653] dark:to-[#264653] shadow-md ring-1 ring-emerald-500/30'
                          : isSoon
                          ? 'border-l-[5px] border-l-amber-500 border-amber-500/35 bg-gradient-to-r from-amber-500/8 via-[#fcfbf9] to-[#fcfbf9] dark:from-amber-500/10 dark:via-[#264653] dark:to-[#264653] shadow-sm'
                          : 'bg-[#fcfbf9] dark:bg-[#264653] border-[#e6e2d6] dark:border-white/10 hover:border-amber-500/40 hover:shadow-md'
                      }`}
                    >
                      {/* Top row: Time pill & Live status indicator & Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-500/25">
                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="tabular-nums font-semibold tracking-tight">
                            {course.startTime} - {course.endTime}
                          </span>
                        </div>

                        {/* Live Status Vurgusu */}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/35 shadow-2xs">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>Şu An Derste</span>
                          </span>
                        )}

                        {isSoon && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/35">
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>{liveStatus.label}</span>
                          </span>
                        )}

                        {/* Sınıf & Bölüm Rozetleri */}
                        <div className="flex items-center gap-1.5 flex-wrap ml-auto">
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
                          {course.courseCode && (
                            <span className="text-[11px] font-mono font-semibold text-stone-400 dark:text-white/40 tabular-nums">
                              {course.courseCode}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Course Title */}
                      <div>
                        <h4 className="font-display font-bold text-base text-stone-900 dark:text-white leading-snug">
                          {course.courseName}
                        </h4>
                      </div>

                      {/* Classroom & Instructor Details with Tabular Alignment */}
                      <div className="space-y-1.5 pt-1 border-t border-stone-200/60 dark:border-white/10 text-xs">
                        {/* Derslik */}
                        <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                          <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="font-bold text-stone-900 dark:text-white truncate tabular-nums">
                            {course.classroom}
                          </span>
                        </div>

                        {/* Ders Hocası */}
                        <div className="flex items-center gap-2 text-stone-600 dark:text-white/70">
                          <User className="w-4 h-4 text-sky-500 shrink-0" />
                          <span className="truncate">{course.instructor}</span>
                        </div>

                        {/* Notes */}
                        {course.notes && (
                          <div className="text-[11px] text-stone-400 dark:text-white/40 italic truncate pt-0.5">
                            💡 {course.notes}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Empty state for the day */
              <div className="p-6 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-dashed border-[#e6e2d6] dark:border-white/15 text-center space-y-2.5">
                <BookOpen className="w-8 h-8 text-stone-300 dark:text-white/20 mx-auto" />
                <p className="text-sm font-semibold text-stone-800 dark:text-white">
                  {activeViewDay} günü için{' '}
                  {selectedGradeFilter !== 'all' ? `${selectedGradeFilter}. Sınıf ` : ''}
                  kayıtlı ders bulunmuyor.
                </p>
                <p className="text-xs text-stone-400 dark:text-white/40 max-w-sm mx-auto">
                  Bölüm ve sınıfınıza ait derslerinizi kolayca ekleyebilir, derslik ve hoca bilgilerinizi kaydedebilirsiniz.
                </p>
                <div className="pt-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => openManager('courses')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ders Ekle</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Only Exams View with Live Countdown States */
          <motion.div
            key="exams-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="space-y-3"
          >
            {displayExams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayExams.map((exam) => {
                  const countdown = getExamCountdown(exam.date, exam.time || exam.startTime);

                  return (
                    <motion.div
                      key={exam.id}
                      whileHover={{ y: -2, scale: 1.006 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                      className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                        countdown.urgency === 'critical'
                          ? 'border-l-[6px] border-l-rose-600 border-rose-500/40 bg-gradient-to-r from-rose-500/10 via-[#fcfbf9] to-[#fcfbf9] dark:from-rose-500/15 dark:via-[#264653] dark:to-[#264653] shadow-md ring-1 ring-rose-500/30'
                          : countdown.urgency === 'urgent'
                          ? 'border-l-[5px] border-l-amber-500 border-amber-500/35 bg-gradient-to-r from-amber-500/8 via-[#fcfbf9] to-[#fcfbf9] dark:from-amber-500/10 dark:via-[#264653] dark:to-[#264653] shadow-sm'
                          : 'bg-[#fcfbf9] dark:bg-[#264653] border-rose-500/20 hover:border-rose-500/40 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25">
                            {exam.examType}
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
                        </div>

                        {/* Geri Sayım Rozeti */}
                        <span className={`text-xs px-2.5 py-0.5 rounded-md ${countdown.badgeClass}`}>
                          {countdown.label}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-base text-stone-900 dark:text-white leading-snug">
                        {exam.courseName}
                        {exam.courseCode && (
                          <span className="text-xs font-mono font-normal text-stone-400 dark:text-white/40 ml-1.5 tabular-nums">
                            ({exam.courseCode})
                          </span>
                        )}
                      </h4>

                      <div className="space-y-1.5 text-xs text-stone-600 dark:text-white/70 border-t border-stone-200/60 dark:border-white/10 pt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-semibold text-stone-800 dark:text-white tabular-nums">
                            {exam.date} • {exam.time || exam.startTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-bold text-stone-900 dark:text-white truncate tabular-nums">
                            {exam.classroom}
                          </span>
                        </div>
                        {exam.instructor && (
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                            <span className="truncate">{exam.instructor}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-dashed border-[#e6e2d6] dark:border-white/15 text-center space-y-2">
                <GraduationCap className="w-8 h-8 text-stone-300 dark:text-white/20 mx-auto" />
                <p className="text-sm font-semibold text-stone-800 dark:text-white">
                  Henüz kayıtlı bir sınav bulunmuyor.
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => openManager('exams')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Sınav Ekle</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Manager Modal */}
      <ScheduleManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        initialTab={managerInitialTab}
      />

      {/* Schedule Notification Modal */}
      <ScheduleNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </section>
  );
}
