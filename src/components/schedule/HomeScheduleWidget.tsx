/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, MapPin, ChevronRight, AlertTriangle } from 'lucide-react';
import {
  getStoredCourses,
  getActiveGrade,
  SCHEDULE_CHANGED_EVENT,
  hasTimeOverlap,
  getOverlappingCourses
} from '../../lib/scheduleStorage';
import { CourseItem, DayOfWeek } from '../../types/schedule';

const TURKISH_DAYS_MAP: Record<number, DayOfWeek> = {
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
  0: 'Pazar',
};

export default function HomeScheduleWidget() {
  const [courses, setCourses] = useState<CourseItem[]>(getStoredCourses);
  const [activeGrade, setActiveGradeState] = useState<number>(getActiveGrade);

  useEffect(() => {
    const handleUpdate = () => {
      setCourses(getStoredCourses());
      setActiveGradeState(getActiveGrade());
    };
    window.addEventListener(SCHEDULE_CHANGED_EVENT, handleUpdate);
    return () => window.removeEventListener(SCHEDULE_CHANGED_EVENT, handleUpdate);
  }, []);

  const todayName = TURKISH_DAYS_MAP[new Date().getDay()] || 'Pazartesi';

  // Filter today's courses
  const todayCourses = useMemo(() => {
    return courses
      .filter((c) => {
        if (c.day !== todayName) return false;
        if (activeGrade !== 0 && c.grade !== activeGrade && c.grade !== 0) return false;
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [courses, activeGrade, todayName]);

  // Current time in HH:MM
  const now = new Date();
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Find ALL currently running courses (supports multiple courses at the same hour)
  const currentCourses = useMemo(() => {
    return todayCourses.filter((c) => nowTime >= c.startTime && nowTime <= c.endTime);
  }, [todayCourses, nowTime]);

  // Find next upcoming courses
  const nextCourses = useMemo(() => {
    const future = todayCourses.filter((c) => nowTime < c.startTime);
    if (future.length === 0) return [];
    const firstStartTime = future[0].startTime;
    return future.filter((c) => c.startTime === firstStartTime);
  }, [todayCourses, nowTime]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1 border-b border-[#e6e2d6] dark:border-white/10 pb-2">
        <h3 className="text-xl font-display font-bold flex items-center gap-2 text-stone-900 dark:text-white">
          <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.75} />
          <span>Bugünkü Derslerim</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
            {todayName} • {activeGrade === 0 ? 'Tüm Sınıflar' : `${activeGrade}. Sınıf`} ({todayCourses.length} Ders)
          </span>
        </h3>

        <Link
          to="/schedule"
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 group"
        >
          Haftalık Program <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {todayCourses.length === 0 ? (
        <div className="p-5 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-stone-800 dark:text-white">
              Bugün ({todayName}) planlanmış dersiniz bulunmuyor 🎉
            </h4>
            <p className="text-xs text-stone-500 dark:text-white/60">
              Derslerinizi ve sınavlarınızı ekleyebilir veya haftalık takvimi inceleyebilirsiniz.
            </p>
          </div>
          <Link
            to="/schedule"
            className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-colors"
          >
            Programı Aç
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Active Classes Spotlight (Supports multiple simultaneously running courses) */}
          {currentCourses.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-stone-950 uppercase animate-pulse">
                  {currentCourses.length > 1 ? `Şu An Derstesiniz (${currentCourses.length} Ders Aynı Saatte)` : 'Şu An Derstesiniz'}
                </span>
                <span className="text-xs font-mono font-semibold text-amber-800 dark:text-amber-200">
                  {nowTime}
                </span>
              </div>

              <div className={`grid grid-cols-1 ${currentCourses.length > 1 ? 'sm:grid-cols-2' : ''} gap-2.5`}>
                {currentCourses.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-white/70 dark:bg-black/20 border border-amber-500/30">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                        {c.courseCode || c.gradeLabel}
                      </span>
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {c.startTime} - {c.endTime}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                      {c.courseName}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 mt-1">
                      <span className="flex items-center gap-1 font-semibold truncate">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        {c.classroom}
                      </span>
                      <span className="truncate ml-2 text-stone-500 dark:text-white/60">
                        {c.instructor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List of today's classes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {todayCourses.map((course) => {
              const isNow = currentCourses.some((c) => c.id === course.id);
              const isNext = nextCourses.some((c) => c.id === course.id) && currentCourses.length === 0;
              const overlapping = getOverlappingCourses(course, todayCourses);
              const hasConflict = overlapping.length > 0;

              return (
                <div
                  key={course.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isNow
                      ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                      : isNext
                      ? 'bg-blue-50/70 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
                      : 'bg-[#fcfbf9] dark:bg-[#264653] border-[#e6e2d6] dark:border-white/10'
                  }`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: course.color || '#0284c7' }}
                >
                  <div className="flex items-center justify-between mb-1 gap-1">
                    <span className="text-[10px] font-mono font-bold text-stone-600 dark:text-stone-300 truncate">
                      {course.courseCode || course.gradeLabel}
                    </span>
                    <span className="text-xs font-bold text-stone-800 dark:text-white shrink-0">
                      {course.startTime} - {course.endTime}
                    </span>
                  </div>

                  <h5 className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                    {course.courseName}
                  </h5>

                  {/* Collision Warning Badge if multiple courses share or overlap time */}
                  {hasConflict && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">
                        Çakışan Ders: {overlapping.map((o) => o.courseCode || o.courseName).join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-white/60 mt-1.5">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {course.classroom}
                    </span>
                    <span className="truncate ml-2 text-right">
                      {course.instructor ? course.instructor.split(' ')[0] + ' ' + (course.instructor.split(' ').slice(-1)[0] || '') : 'Hoca'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

