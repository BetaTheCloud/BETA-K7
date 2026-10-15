/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays,
  Upload,
  Plus,
  RefreshCw,
  BookOpen,
  Calendar,
  Layers,
  Trash2,
  FileDown,
  Info,
} from 'lucide-react';
import WeeklyTimetable from '../components/schedule/WeeklyTimetable';
import ExamScheduleView from '../components/schedule/ExamScheduleView';
import ScheduleImportModal from '../components/schedule/ScheduleImportModal';
import CourseFormModal from '../components/schedule/CourseFormModal';
import ExamFormModal from '../components/schedule/ExamFormModal';
import {
  getStoredCourses,
  getStoredExams,
  getActiveGrade,
  setActiveGrade,
  toggleCourseEnrollment,
  toggleExamEnrollment,
  deleteCourse,
  deleteExam,
  clearAllScheduleData,
  SCHEDULE_CHANGED_EVENT,
} from '../lib/scheduleStorage';
import { CourseItem, ExamItem } from '../types/schedule';
import toast from 'react-hot-toast';

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'exams'>('courses');
  const [courses, setCourses] = useState<CourseItem[]>(getStoredCourses);
  const [exams, setExams] = useState<ExamItem[]>(getStoredExams);
  const [selectedGrade, setSelectedGrade] = useState<number>(getActiveGrade);
  const [onlyEnrolled, setOnlyEnrolled] = useState<boolean>(false);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);

  const reloadData = useCallback(() => {
    setCourses(getStoredCourses());
    setExams(getStoredExams());
    setSelectedGrade(getActiveGrade());
  }, []);

  useEffect(() => {
    reloadData();
    const handleChanged = () => reloadData();
    window.addEventListener(SCHEDULE_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(SCHEDULE_CHANGED_EVENT, handleChanged);
  }, [reloadData]);

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
    setActiveGrade(grade);
  };

  const handleClearAll = () => {
    clearAllScheduleData();
    reloadData();
    toast.success('Program temizlendi.');
  };

  const handleDeleteCourse = (id: string) => {
    deleteCourse(id);
    reloadData();
    toast.success('Ders programdan silindi.');
  };

  const handleDeleteExam = (id: string) => {
    deleteExam(id);
    reloadData();
    toast.success('Sınav takvimden silindi.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-12 space-y-7">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold backdrop-blur-md">
            <Layers className="w-3.5 h-3.5" />
            Çoklu Sınıf & Belge Desteği (PDF / Word / Excel)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ders Programı & Sınav Takvimi
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Fakültenizin PDF, Word veya Excel formatındaki belgelerini yükleyin. 1., 2., 3. ve 4. sınıflar aynı dosyada olsa dahi sistem otomatik ayrıştırır veya dilediğiniz sınıfa atamanızı sağlar.
          </p>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Upload className="w-4 h-4" />
              Belge Yükle (PDF / Word / Excel)
            </button>
            <button
              onClick={
                activeTab === 'courses'
                  ? () => {
                      setEditingCourse(null);
                      setIsCourseFormOpen(true);
                    }
                  : () => {
                      setEditingExam(null);
                      setIsExamFormOpen(true);
                    }
              }
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center gap-2 backdrop-blur-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'courses' ? 'Ders Ekle' : 'Sınav Ekle'}
            </button>
            {(courses.length > 0 || exams.length > 0) && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2.5 bg-white/5 hover:bg-rose-500/20 text-stone-400 hover:text-rose-300 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                title="Tümünü Temizle"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Mode Tabs: Ders Programı vs Sınav Takvimi */}
      <div className="flex p-1.5 rounded-2xl bg-stone-200/80 dark:bg-white/5 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'courses'
              ? 'bg-white dark:bg-[#1d3540] text-amber-700 dark:text-amber-400 shadow-md'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Haftalık Ders Programı ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'exams'
              ? 'bg-white dark:bg-[#1d3540] text-rose-600 dark:text-rose-400 shadow-md'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Sınav Takvimi ({exams.length})
        </button>
      </div>

      {/* Active Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'courses' ? (
          <motion.div
            key="courses"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <WeeklyTimetable
              courses={courses}
              selectedGrade={selectedGrade}
              onGradeChange={handleGradeChange}
              onToggleEnroll={toggleCourseEnrollment}
              onEditCourse={(course) => {
                setEditingCourse(course);
                setIsCourseFormOpen(true);
              }}
              onDeleteCourse={handleDeleteCourse}
              onlyEnrolled={onlyEnrolled}
              onToggleOnlyEnrolled={setOnlyEnrolled}
            />
          </motion.div>
        ) : (
          <motion.div
            key="exams"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ExamScheduleView
              exams={exams}
              selectedGrade={selectedGrade}
              onGradeChange={handleGradeChange}
              onToggleEnroll={toggleExamEnrollment}
              onEditExam={(exam) => {
                setEditingExam(exam);
                setIsExamFormOpen(true);
              }}
              onDeleteExam={handleDeleteExam}
              onlyEnrolled={onlyEnrolled}
              onToggleOnlyEnrolled={setOnlyEnrolled}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ScheduleImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={reloadData}
      />

      <CourseFormModal
        isOpen={isCourseFormOpen}
        onClose={() => {
          setIsCourseFormOpen(false);
          setEditingCourse(null);
        }}
        initialCourse={editingCourse}
        onSaved={reloadData}
      />

      <ExamFormModal
        isOpen={isExamFormOpen}
        onClose={() => {
          setIsExamFormOpen(false);
          setEditingExam(null);
        }}
        initialExam={editingExam}
        onSaved={reloadData}
      />
    </div>
  );
}
