/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Calendar, Clock, MapPin, ChevronRight, Hourglass } from 'lucide-react';
import { getStoredExams, getActiveGrade, SCHEDULE_CHANGED_EVENT } from '../../lib/scheduleStorage';
import { ExamItem } from '../../types/schedule';

export default function HomeExamWidget() {
  const [exams, setExams] = useState<ExamItem[]>(getStoredExams);
  const [activeGrade, setActiveGradeState] = useState<number>(getActiveGrade);

  useEffect(() => {
    const handleUpdate = () => {
      setExams(getStoredExams());
      setActiveGradeState(getActiveGrade());
    };
    window.addEventListener(SCHEDULE_CHANGED_EVENT, handleUpdate);
    return () => window.removeEventListener(SCHEDULE_CHANGED_EVENT, handleUpdate);
  }, []);

  // Filter upcoming exams
  const upcomingExams = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return exams
      .filter((e) => {
        if (activeGrade !== 0 && e.grade !== activeGrade && e.grade !== 0) return false;
        const examDate = new Date(e.date);
        examDate.setHours(0, 0, 0, 0);
        return examDate.getTime() >= today.getTime();
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3); // top 3 upcoming
  }, [exams, activeGrade]);

  const getDiffDays = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (upcomingExams.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1 border-b border-[#e6e2d6] dark:border-white/10 pb-2">
        <h3 className="text-xl font-display font-bold flex items-center gap-2 text-stone-900 dark:text-white">
          <CalendarClock className="w-5 h-5 text-rose-600 dark:text-rose-400" strokeWidth={1.75} />
          <span>Yaklaşan Sınavlarım</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300">
            {activeGrade === 0 ? 'Tüm Sınıflar' : `${activeGrade}. Sınıf`}
          </span>
        </h3>

        <Link
          to="/schedule"
          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 group"
        >
          Tüm Sınav Takvimi <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {upcomingExams.map((exam) => {
          const diff = getDiffDays(exam.date);
          return (
            <div
              key={exam.id}
              className="p-3.5 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-rose-500/40 shadow-xs transition-all flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                    {exam.examType}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      diff === 0
                        ? 'bg-rose-600 text-white animate-pulse'
                        : diff === 1
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {diff === 0 ? 'Bugün!' : diff === 1 ? 'Yarın!' : `${diff} gün kaldı`}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                  {exam.courseName}
                </h4>
              </div>

              <div className="text-[11px] text-stone-500 dark:text-white/60 space-y-0.5 pt-1.5 border-t border-stone-200/60 dark:border-white/5">
                <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                  <Calendar className="w-3 h-3 text-rose-500" />
                  <span>{new Date(exam.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} • {exam.startTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span className="truncate">Salon: {exam.classroom}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
