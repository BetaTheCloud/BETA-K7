/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, MapPin, ChevronRight, User, Calendar } from 'lucide-react';
import { getStoredCourses, getActiveGrade, SCHEDULE_CHANGED_EVENT } from '../../lib/scheduleStorage';
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

  // Find currently running or next course
  const currentCourse = todayCourses.find((c) => nowTime >= c.startTime && nowTime <= c.endTime);
  const nextCourse = todayCourses.find((c) => nowTime < c.startTime);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1 border-b border-[#e6e2d6] dark:border-white/10 pb-2">
        <h3 className="text-xl font-display font-bold flex items-center gap-2 text-stone-900 dark:text-white">
          <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.75} />
          <span>Bugünkü Derslerim</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
            {todayName} • {activeGrade === 0 ? 'Tüm Sınıflar' : `${activeGrade}. Sınıf`}
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
              Fakültenizin ders programı dosyasını yükleyebilir veya haftalık takvimi inceleyebilirsiniz.
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
        <div className="space-y-2">
          {/* Active / Next Class Spotlight */}
          {currentCourse && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/40 shadow-sm flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-stone-950 uppercase animate-pulse">
                    Şu An Derstesiniz
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                    {currentCourse.courseCode}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                  {currentCourse.courseName}
                </h4>
                <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300 mt-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {currentCourse.startTime} - {currentCourse.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {currentCourse.classroom}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* List of today's classes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {todayCourses.map((course) => {
              const isNow = currentCourse?.id === course.id;
              const isNext = nextCourse?.id === course.id && !currentCourse;
              return (
                <div
                  key={course.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isNow
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : isNext
                      ? 'bg-blue-50/70 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
                      : 'bg-[#fcfbf9] dark:bg-[#264653] border-[#e6e2d6] dark:border-white/10'
                  }`}
                  style={{ borderLeftWidth: '4px', borderLeftColor: course.color || '#0284c7' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-stone-600 dark:text-stone-300">
                      {course.courseCode || course.gradeLabel}
                    </span>
                    <span className="text-xs font-bold text-stone-800 dark:text-white">
                      {course.startTime} - {course.endTime}
                    </span>
                  </div>

                  <h5 className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                    {course.courseName}
                  </h5>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-white/60 mt-1.5">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {course.classroom}
                    </span>
                    <span className="truncate ml-2 text-right">
                      {course.instructor.split(' ')[0]} {course.instructor.split(' ').slice(-1)[0]}
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
