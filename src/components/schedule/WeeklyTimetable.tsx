/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Star,
  Edit2,
  Trash2,
  List,
  Grid3X3,
  BookOpen,
  Filter,
  AlertTriangle,
  Bell,
  BellOff,
  FileText,
  UserCheck
} from 'lucide-react';
import { CourseItem, DayOfWeek } from '../../types/schedule';
import { getOverlappingCourses } from '../../lib/scheduleStorage';
import {
  isItemNotificationEnabled,
  toggleItemNotification,
  NOTIFICATIONS_CONFIG_CHANGED_EVENT
} from '../../lib/scheduleNotificationService';
import { isCourseCompletedToday } from '../../lib/scheduleNotesStorage';
import {
  getCourseAttendance,
  getAttendanceHealthStatus,
  ATTENDANCE_CHANGED_EVENT
} from '../../lib/attendanceStorage';
import toast from 'react-hot-toast';

interface WeeklyTimetableProps {
  courses: CourseItem[];
  selectedGrade: number; // 0 for All, 1, 2, 3, 4
  onGradeChange: (grade: number) => void;
  onToggleEnroll: (id: string) => void;
  onEditCourse: (course: CourseItem) => void;
  onDeleteCourse: (id: string) => void;
  onAddNote?: (course: CourseItem) => void;
  onlyEnrolled: boolean;
  onToggleOnlyEnrolled: (val: boolean) => void;
}

const DEFAULT_DAYS: DayOfWeek[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

const TURKISH_DAYS_MAP: Record<number, DayOfWeek> = {
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
  0: 'Pazar',
};

export default function WeeklyTimetable({
  courses,
  selectedGrade,
  onGradeChange,
  onToggleEnroll,
  onEditCourse,
  onDeleteCourse,
  onAddNote,
  onlyEnrolled,
  onToggleOnlyEnrolled,
}: WeeklyTimetableProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [, setNotificationTick] = useState(0);

  // Dynamic days (includes Saturday/Sunday if any courses exist on those days or if today is weekend)
  const activeDays = useMemo<DayOfWeek[]>(() => {
    const list: DayOfWeek[] = [...DEFAULT_DAYS];
    const hasSat = courses.some((c) => c.day === 'Cumartesi');
    const hasSun = courses.some((c) => c.day === 'Pazar');
    const todayIndex = new Date().getDay();
    if (hasSat || todayIndex === 6) list.push('Cumartesi');
    if (hasSun || todayIndex === 0) list.push('Pazar');
    return list;
  }, [courses]);

  useEffect(() => {
    const handleConfigChange = () => setNotificationTick((t) => t + 1);
    window.addEventListener(NOTIFICATIONS_CONFIG_CHANGED_EVENT, handleConfigChange);
    window.addEventListener(ATTENDANCE_CHANGED_EVENT, handleConfigChange);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CONFIG_CHANGED_EVENT, handleConfigChange);
      window.removeEventListener(ATTENDANCE_CHANGED_EVENT, handleConfigChange);
    };
  }, []);

  const handleToggleCourseNotification = (courseId: string, courseName: string) => {
    const isNowEnabled = toggleItemNotification(courseId);
    setNotificationTick((t) => t + 1);
    if (isNowEnabled) {
      toast.success(`"${courseName}" için 10 ve 5 dk kala bildirimler açıldı.`);
    } else {
      toast(`"${courseName}" için bildirimler kapatıldı.`);
    }
  };
  
  // Current day in Turkish
  const todayIndex = new Date().getDay();
  const currentDayName = TURKISH_DAYS_MAP[todayIndex] || 'Pazartesi';
  const [activeDayTab, setActiveDayTab] = useState<DayOfWeek | 'all'>('all');

  useEffect(() => {
    if (activeDayTab !== 'all' && !activeDays.includes(activeDayTab)) {
      setActiveDayTab('all');
    }
  }, [activeDays, activeDayTab]);

  // Filter courses by grade and enrolled status
  const filteredCourses = useMemo(() => {
    const activeG = selectedGrade > 0 ? selectedGrade : 1;
    return courses.filter((c) => {
      if (onlyEnrolled && !c.isEnrolled) return false;
      if (c.grade !== activeG && c.grade !== 0) return false;
      return true;
    });
  }, [courses, selectedGrade, onlyEnrolled]);

  // Group by day
  const coursesByDay = useMemo(() => {
    const map: Record<DayOfWeek, CourseItem[]> = {
      Pazartesi: [],
      Salı: [],
      Çarşamba: [],
      Perşembe: [],
      Cuma: [],
      Cumartesi: [],
      Pazar: [],
    };
    filteredCourses.forEach((c) => {
      if (map[c.day]) {
        map[c.day].push(c);
      }
    });

    // Sort by startTime
    Object.keys(map).forEach((d) => {
      map[d as DayOfWeek].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return map;
  }, [filteredCourses]);

  return (
    <div className="space-y-5">
      {/* Grade Selector & Filter Controls Bar (Option 2: Birleştirilmiş Filtre Çubuğu) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200/80 dark:border-white/10 shadow-xs">
        {/* Sınıf Seçici: Segmented Control (1., 2., 3., 4. Sınıf) */}
        <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-white/5 overflow-x-auto scrollbar-none">
          {[1, 2, 3, 4].map((g) => (
            <button
              key={g}
              onClick={() => onGradeChange(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                (selectedGrade === g || (selectedGrade === 0 && g === 1))
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {g}. Sınıf
            </button>
          ))}
        </div>

        {/* View mode & Only enrolled toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => onToggleOnlyEnrolled(!onlyEnrolled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              onlyEnrolled
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold'
                : 'bg-stone-50 dark:bg-white/5 border-stone-200/80 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:border-stone-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyEnrolled ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>Sadece Seçtiklerim</span>
          </button>

          <div className="flex p-0.5 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-white'
              }`}
              title="Haftalık Tablo"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-white'
              }`}
              title="Günlük Liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200 dark:border-white/10">
          <BookOpen className="w-10 h-10 text-stone-300 dark:text-white/20 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-800 dark:text-white">
            Bu sınıf için henüz ders bulunmuyor
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            Yukarıdaki "+ Ders Ekle" butonunu kullanarak derslerinizi ekleyebilirsiniz.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Weekly Grid View */
        <div className={`grid grid-cols-1 ${activeDays.length > 5 ? 'md:grid-cols-6 lg:grid-cols-7' : 'md:grid-cols-5'} gap-3`}>
          {activeDays.map((day) => {
            const dayCourses = coursesByDay[day];
            const isToday = day === currentDayName;

            return (
              <div
                key={day}
                className={`flex flex-col rounded-2xl border p-3 bg-white dark:bg-[#1d3540] transition-shadow ${
                  isToday
                    ? 'border-amber-500/50 dark:border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                    : 'border-stone-200 dark:border-white/10'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 dark:text-white">
                      {day}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        Bugün
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {dayCourses.length} Ders
                  </span>
                </div>

                {/* Courses in this day */}
                <div className="flex-1 space-y-2">
                  {dayCourses.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-stone-400">
                      Ders yok
                    </div>
                  ) : (
                    dayCourses.map((course) => {
                      const overlapping = getOverlappingCourses(course, dayCourses);
                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group relative p-2.5 rounded-xl border border-stone-200/80 dark:border-white/10 hover:border-amber-500/40 bg-stone-50/70 dark:bg-white/[0.03] transition-all hover:shadow-sm"
                          style={{ borderLeftWidth: '3.5px', borderLeftColor: course.color || '#0284c7' }}
                        >
                          {/* Course header */}
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <div className="min-w-0 flex-1">
                              {course.courseCode && (
                                <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 block truncate">
                                  {course.courseCode}
                                </span>
                              )}
                              <h4 className="text-xs font-semibold text-stone-900 dark:text-white leading-tight">
                                {course.courseName}
                              </h4>
                            </div>

                            {/* Quick Bell & Star */}
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleCourseNotification(course.id, course.courseName);
                                }}
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  isItemNotificationEnabled(course.id)
                                    ? 'text-[#8a2a43] dark:text-rose-400 hover:bg-[#8a2a43]/10'
                                    : 'text-stone-300 dark:text-white/20 hover:text-stone-600 dark:hover:text-white/60'
                                }`}
                                title={
                                  isItemNotificationEnabled(course.id)
                                    ? 'Bildirim Açık (10 ve 5 dk kala uyarı)'
                                    : 'Bildirimi Aç (10 ve 5 dk kala)'
                                }
                              >
                                <Bell
                                  className={`w-3.5 h-3.5 ${
                                    isItemNotificationEnabled(course.id)
                                      ? 'fill-[#8a2a43] dark:fill-rose-400'
                                      : ''
                                  }`}
                                />
                              </button>
                              <button
                                onClick={() => onToggleEnroll(course.id)}
                                className="p-1 text-stone-300 hover:text-amber-500 transition-colors cursor-pointer"
                                title={course.isEnrolled ? 'Derslerimden Çıkar' : 'Derslerime Ekle'}
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    course.isEnrolled ? 'fill-amber-500 text-amber-500' : ''
                                  }`}
                                />
                              </button>
                              {onAddNote && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddNote(course);
                                  }}
                                  className="p-1 text-stone-300 hover:text-[#8a2a43] dark:hover:text-[#f4a261] transition-colors cursor-pointer"
                                  title="Ders Notu Ekle"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Time & Classroom */}
                          <div className="space-y-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                            <div className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{course.startTime} - {course.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span className="truncate">{course.classroom}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-stone-400" />
                              <span className="truncate">{course.instructor}</span>
                            </div>
                          </div>

                          {/* Completed Status & Quick Note Button */}
                          {isCourseCompletedToday(course) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddNote?.(course);
                              }}
                              className="mt-1 w-full flex items-center justify-between text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                              title="Ders bugün tamamlandı. Ders notu eklemek için tıklayın."
                            >
                              <span>Bugün Tamamlandı</span>
                              <span className="flex items-center gap-0.5 text-[#8a2a43] dark:text-[#f4a261]">
                                <FileText className="w-2.5 h-2.5" />
                                Not Yaz
                              </span>
                            </button>
                          )}

                          {/* Overlap Badge */}
                          {overlapping.length > 0 && (
                            <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/25">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">
                                Çakışma: {overlapping.map((o) => o.courseCode || o.courseName).join(', ')}
                              </span>
                            </div>
                          )}

                          {/* Attendance Status Badge (if absence recorded) */}
                          {(() => {
                            const attRecord = getCourseAttendance(course.id, course.courseName, course);
                            if (course.isEnrolled && attRecord.absenceCount > 0) {
                              const attHealth = getAttendanceHealthStatus(attRecord);
                              return (
                                <div className={`mt-1 flex items-center justify-between text-[9px] font-bold px-1.5 py-0.5 rounded border ${attHealth.badgeClass}`}>
                                  <span className="flex items-center gap-1">
                                    <UserCheck className="w-2.5 h-2.5" />
                                    Devamsızlık: {attRecord.absenceCount}/{attRecord.maxAllowedAbsenceWeeks} hf
                                  </span>
                                  <span>{attHealth.remainingWeeks === 0 ? 'Aşıldı!' : `${attHealth.remainingWeeks} hak`}</span>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Grade badge */}
                          <div className="mt-1.5 flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-white/5">
                            <span className="text-[9px] font-medium text-stone-400">
                              {course.gradeLabel}
                            </span>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditCourse(course)}
                                className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-white"
                                title="Düzenle"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteCourse(course.id)}
                                className="p-0.5 text-stone-400 hover:text-rose-600"
                                title="Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Daily & Weekly List View */
        <div className="space-y-4">
          {/* Day switcher tabs bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* Tüm Hafta Tab */}
            <button
              type="button"
              onClick={() => setActiveDayTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border shrink-0 transition-all cursor-pointer ${
                activeDayTab === 'all'
                  ? 'bg-[#8a2a43] text-white border-[#8a2a43] shadow-xs font-bold'
                  : 'bg-white dark:bg-[#1d3540] border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Tüm Hafta</span>
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">
                {filteredCourses.length} Ders Toplam
              </div>
            </button>

            {/* Individual Day Tabs */}
            {activeDays.map((day) => {
              const count = coursesByDay[day]?.length || 0;
              const isToday = day === currentDayName;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDayTab(day)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border shrink-0 transition-all cursor-pointer text-left min-w-[105px] ${
                    activeDayTab === day
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
                      : isToday
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20'
                      : 'bg-white dark:bg-[#1d3540] border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between gap-1.5">
                    <span>{day}</span>
                    {isToday && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          activeDayTab === day
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        Bugün
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {count} Ders
                  </div>
                </button>
              );
            })}
          </div>

          {/* List items rendering */}
          {(() => {
            const daysToDisplay = activeDayTab === 'all'
              ? activeDays
              : [activeDayTab];

            const totalCourses = daysToDisplay.reduce(
              (sum, d) => sum + (coursesByDay[d]?.length || 0),
              0
            );

            if (totalCourses === 0) {
              return (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200 dark:border-white/10 text-xs text-stone-500 dark:text-stone-400">
                  <BookOpen className="w-8 h-8 text-stone-300 dark:text-white/20 mx-auto mb-2" />
                  <p className="font-semibold text-stone-800 dark:text-white text-sm">
                    {activeDayTab === 'all'
                      ? 'Haftalık programda ders bulunmuyor.'
                      : `${activeDayTab} günü için ders bulunmuyor.`}
                  </p>
                  <p className="mt-1 text-stone-400 text-xs">
                    Yukarıdaki "+ Ders Ekle" butonu ile ders ekleyebilir veya filtreyi değiştirebilirsiniz.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-5">
                {daysToDisplay.map((day) => {
                  const dayCourses = coursesByDay[day] || [];
                  if (activeDayTab === 'all' && dayCourses.length === 0) {
                    return null;
                  }

                  const isToday = day === currentDayName;

                  return (
                    <div key={day} className="space-y-2.5">
                      {/* Day Header */}
                      <div className="flex items-center justify-between px-1 pt-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                            <span>{day}</span>
                            {isToday && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                                Bugün
                              </span>
                            )}
                          </h4>
                        </div>
                        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                          {dayCourses.length} Ders
                        </span>
                      </div>

                      {/* Course cards for this day */}
                      <div className="space-y-3">
                        {dayCourses.map((course) => {
                          const overlapping = getOverlappingCourses(course, dayCourses);
                          const isNotifOn = isItemNotificationEnabled(course.id);
                          const attRecord = getCourseAttendance(course.id, course.courseName, course);
                          const hasAttendanceWarning = course.isEnrolled && attRecord.absenceCount > 0;
                          const attHealth = hasAttendanceWarning ? getAttendanceHealthStatus(attRecord) : null;

                          return (
                            <motion.div
                              key={course.id}
                              initial={{ opacity: 0, y: 3 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200/90 dark:border-white/10 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 relative overflow-hidden"
                              style={{
                                borderLeftWidth: '5px',
                                borderLeftColor: course.color || '#0284c7'
                              }}
                            >
                              {/* Left & Main Content Area */}
                              <div className="flex-1 min-w-0 space-y-2">
                                {/* Top Badges Row */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Time Badge */}
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-stone-200 text-xs font-bold shrink-0">
                                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span>{course.startTime} - {course.endTime}</span>
                                  </div>

                                  {/* Grade Badge */}
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                                    {course.gradeLabel}
                                  </span>

                                  {/* Course Code */}
                                  {course.courseCode && (
                                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                                      {course.courseCode}
                                    </span>
                                  )}

                                  {/* Enrolled Badge */}
                                  {course.isEnrolled && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                      <span>Derslerimde</span>
                                    </span>
                                  )}
                                </div>

                                {/* Course Title */}
                                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-snug break-words">
                                  {course.courseName}
                                </h3>

                                {/* Classroom & Instructor */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                                  <span className="inline-flex items-center gap-1.5 font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span className="text-stone-800 dark:text-stone-200">
                                      {course.classroom || 'Derslik Belirtilmemiş'}
                                    </span>
                                  </span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                    <span>
                                      {course.instructor || 'Öğretim Görevlisi Belirtilmemiş'}
                                    </span>
                                  </span>
                                </div>

                                {/* Overlap Warning Banner */}
                                {overlapping.length > 0 && (
                                  <div className="mt-1 flex items-start gap-2 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-300/80 dark:border-amber-700/50">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <span className="leading-snug">
                                      Aynı saatte çakışan ders: <strong className="font-bold">{overlapping.map((o) => o.courseCode || o.courseName).join(', ')}</strong>
                                    </span>
                                  </div>
                                )}

                                {/* Attendance Status Badge */}
                                {hasAttendanceWarning && attHealth && (
                                  <div className={`mt-1 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${attHealth.badgeClass}`}>
                                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                      Devamsızlık: <strong>{attRecord.absenceCount} / {attRecord.maxAllowedAbsenceWeeks} hafta</strong> ({attHealth.label})
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Actions Toolbar - Responsive Bottom on Mobile, Right on Desktop */}
                              <div className="flex items-center justify-end flex-wrap gap-1.5 pt-2.5 md:pt-0 border-t md:border-t-0 border-stone-100 dark:border-white/5 shrink-0">
                                {/* Notification Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleCourseNotification(course.id, course.courseName)}
                                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    isNotifOn
                                      ? 'border-[#8a2a43]/40 bg-[#8a2a43]/10 text-[#8a2a43] dark:text-rose-300 font-bold'
                                      : 'border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-stone-500 dark:text-stone-400'
                                  }`}
                                  title={isNotifOn ? 'Bildirim Açık (10 ve 5 dk kala)' : 'Bildirimi Aç (10 ve 5 dk kala)'}
                                >
                                  <Bell className={`w-3.5 h-3.5 ${isNotifOn ? 'fill-[#8a2a43] dark:fill-rose-400' : ''}`} />
                                  <span className="text-[11px]">{isNotifOn ? 'Bildirim Açık' : 'Bildirim'}</span>
                                </button>

                                {/* Enroll (Star) Toggle */}
                                <button
                                  type="button"
                                  onClick={() => onToggleEnroll(course.id)}
                                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    course.isEnrolled
                                      ? 'border-amber-400 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                                      : 'border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-stone-500 dark:text-stone-400'
                                  }`}
                                  title={course.isEnrolled ? 'Derslerimden Çıkar' : 'Derslerime Ekle'}
                                >
                                  <Star className={`w-3.5 h-3.5 ${course.isEnrolled ? 'fill-amber-500 text-amber-500' : ''}`} />
                                  <span className="text-[11px]">{course.isEnrolled ? 'Seçildi' : 'Seç'}</span>
                                </button>

                                {/* Note Button */}
                                {onAddNote && (
                                  <button
                                    type="button"
                                    onClick={() => onAddNote(course)}
                                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-stone-500 dark:text-stone-400 hover:text-[#8a2a43] dark:hover:text-[#f4a261] transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                                    title="Ders Notu Ekle"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-[11px]">Not</span>
                                  </button>
                                )}

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => onEditCourse(course)}
                                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                                  title="Dersi Düzenle"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline text-[11px]">Düzenle</span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => onDeleteCourse(course.id)}
                                  className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center text-xs"
                                  title="Dersi Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
