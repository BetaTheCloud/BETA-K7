/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { CourseItem, DayOfWeek } from '../../types/schedule';

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
    <div className="space-y-4">
      {/* Grade Selector & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1d3540] border border-stone-200 dark:border-white/10 shadow-sm">
        {/* Sınıf Seçici: 1. Sınıf, 2. Sınıf, 3. Sınıf, 4. Sınıf, Tümü */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => onGradeChange(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedGrade === 0
                ? 'bg-amber-600 text-white shadow-sm'
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
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5'
              }`}
            >
              {g}. Sınıf
            </button>
          ))}
        </div>

        {/* View mode & Only enrolled toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onToggleOnlyEnrolled(!onlyEnrolled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              onlyEnrolled
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                : 'bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyEnrolled ? 'fill-amber-500 text-amber-500' : ''}`} />
            Sadece Seçtiklerim
          </button>

          <div className="flex p-0.5 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Haftalık Tablo"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
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
            Yukarıdaki "Belge Yükle" butonunu kullanarak fakültenizin Word, Excel veya PDF ders programını aktarabilir veya el ile ders ekleyebilirsiniz.
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
                    dayCourses.map((course) => (
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

                          {/* Quick Star */}
                          <button
                            onClick={() => onToggleEnroll(course.id)}
                            className="p-1 text-stone-300 hover:text-amber-500 transition-colors"
                            title={course.isEnrolled ? 'Derslerimden Çıkar' : 'Derslerime Ekle'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                course.isEnrolled ? 'fill-amber-500 text-amber-500' : ''
                              }`}
                            />
                          </button>
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
                    ))
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
              (coursesByDay[activeDayTab] || []).map((course) => (
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleEnroll(course.id)}
                      className="p-2 rounded-xl border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
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
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
