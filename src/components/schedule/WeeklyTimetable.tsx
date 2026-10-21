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
  BellOff
} from 'lucide-react';
import { CourseItem, DayOfWeek } from '../../types/schedule';
import { getOverlappingCourses } from '../../lib/scheduleStorage';
import {
  isItemNotificationEnabled,
  toggleItemNotification,
  NOTIFICATIONS_CONFIG_CHANGED_EVENT
} from '../../lib/scheduleNotificationService';
import toast from 'react-hot-toast';

interface WeeklyTimetableProps {
  courses: CourseItem[];
  selectedGrade: number; // 0 for All, 1, 2, 3, 4
  onGradeChange: (grade: number) => void;
  onToggleEnroll: (id: string) => void;
  onEditCourse: (course: CourseItem) => void;
  onDeleteCourse: (id: string) => void;
  onlyEnrolled: boolean;
  onToggleOnlyEnrolled: (val: boolean) => void;
}

const DAYS: DayOfWeek[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

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
  onlyEnrolled,
  onToggleOnlyEnrolled,
}: WeeklyTimetableProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [, setNotificationTick] = useState(0);

  useEffect(() => {
    const handleConfigChange = () => setNotificationTick((t) => t + 1);
    window.addEventListener(NOTIFICATIONS_CONFIG_CHANGED_EVENT, handleConfigChange);
    return () => window.removeEventListener(NOTIFICATIONS_CONFIG_CHANGED_EVENT, handleConfigChange);
  }, []);

  const handleToggleCourseNotification = (courseId: string, courseName: string) => {
    const isNowEnabled = toggleItemNotification(courseId);
    setNotificationTick((t) => t + 1);
    if (isNowEnabled) {
      toast.success(`"${courseName}" için 10 ve 5 dk kala bildirimler açıldı.`);
    } else {
      toast(`"${courseName}" için bildirimler kapatıldı.`, { icon: '🔕' });
    }
  };
  
  // Current day in Turkish
  const todayIndex = new Date().getDay();
  const currentDayName = TURKISH_DAYS_MAP[todayIndex] || 'Pazartesi';
  const [activeDayTab, setActiveDayTab] = useState<DayOfWeek>(
    DAYS.includes(currentDayName) ? currentDayName : 'Pazartesi'
  );

  // Filter courses by grade and enrolled status
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (onlyEnrolled && !c.isEnrolled) return false;
      if (selectedGrade !== 0 && c.grade !== selectedGrade && c.grade !== 0) return false;
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
        {/* Sınıf Seçici: Segmented Control */}
        <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-white/5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onGradeChange(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedGrade === 0
                ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Tüm Sınıflar
          </button>
          {[1, 2, 3, 4].map((g) => (
            <button
              key={g}
              onClick={() => onGradeChange(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedGrade === g
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
            Yukarıdaki "+ Ders Ekle" veya "Metinden İçe Aktar" butonunu kullanarak derslerinizi ekleyebilirsiniz.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Weekly Grid View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {DAYS.map((day) => {
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

                          {/* Overlap Badge */}
                          {overlapping.length > 0 && (
                            <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/25">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">
                                Çakışma: {overlapping.map((o) => o.courseCode || o.courseName).join(', ')}
                              </span>
                            </div>
                          )}

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
        /* Daily / List View */
        <div className="space-y-3">
          {/* Day switcher tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DAYS.map((day) => {
              const count = coursesByDay[day]?.length || 0;
              const isToday = day === currentDayName;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDayTab(day)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    activeDayTab === day
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-[#1d3540] border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span className="block font-semibold">{day}</span>
                  <span className="text-[10px] opacity-80">
                    {count} Ders {isToday && '• Bugün'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List items for active day */}
          <div className="space-y-2">
            {(coursesByDay[activeDayTab] || []).length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200 dark:border-white/10 text-xs text-stone-400">
                {activeDayTab} günü için ders bulunmuyor.
              </div>
            ) : (
              (coursesByDay[activeDayTab] || []).map((course) => {
                const dayList = coursesByDay[activeDayTab] || [];
                const overlapping = getOverlappingCourses(course, dayList);
                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200 dark:border-white/10 shadow-sm flex items-center justify-between gap-3"
                    style={{ borderLeftWidth: '4px', borderLeftColor: course.color || '#0284c7' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300">
                          {course.gradeLabel}
                        </span>
                        {course.courseCode && (
                          <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                            {course.courseCode}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                        {course.courseName}
                      </h3>

                      {overlapping.length > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/25">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">
                            Aynı saatte çakışan ders: {overlapping.map((o) => o.courseCode || o.courseName).join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1">
                        <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                          <Clock className="w-3.5 h-3.5" />
                          {course.startTime} - {course.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {course.classroom}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {course.instructor}
                        </span>
                      </div>
                    </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleCourseNotification(course.id, course.courseName)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isItemNotificationEnabled(course.id)
                          ? 'border-[#8a2a43]/40 bg-[#8a2a43]/10 text-[#8a2a43] dark:text-rose-300'
                          : 'border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-stone-400'
                      }`}
                      title={
                        isItemNotificationEnabled(course.id)
                          ? 'Bildirim Açık (10 ve 5 dk kala)'
                          : 'Bildirimi Aç (10 ve 5 dk kala)'
                      }
                    >
                      <Bell
                        className={`w-4 h-4 ${
                          isItemNotificationEnabled(course.id)
                            ? 'fill-[#8a2a43] dark:fill-rose-400'
                            : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onToggleEnroll(course.id)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title={course.isEnrolled ? 'Derslerimden Çıkar' : 'Derslerime Ekle'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          course.isEnrolled ? 'fill-amber-500 text-amber-500' : 'text-stone-400'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onEditCourse(course)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 text-stone-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-stone-500 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      )}
    </div>
  );
}
