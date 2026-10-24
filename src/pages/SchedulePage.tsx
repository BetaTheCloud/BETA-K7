/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays,
  ClipboardPaste,
  Plus,
  RefreshCw,
  BookOpen,
  Calendar,
  Layers,
  Trash2,
  FileDown,
  ArrowLeft,
  BellRing,
  Share2,
} from 'lucide-react';
import WeeklyTimetable from '../components/schedule/WeeklyTimetable';
import ExamScheduleView from '../components/schedule/ExamScheduleView';
import ScheduleImportModal from '../components/schedule/ScheduleImportModal';
import CourseFormModal from '../components/schedule/CourseFormModal';
import ExamFormModal from '../components/schedule/ExamFormModal';
import ScheduleNotificationModal from '../components/schedule/ScheduleNotificationModal';
import ScheduleTemplateModal from '../components/schedule/ScheduleTemplateModal';
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'courses' | 'exams'>('courses');
  const [courses, setCourses] = useState<CourseItem[]>(getStoredCourses);
  const [exams, setExams] = useState<ExamItem[]>(getStoredExams);
  const [selectedGrade, setSelectedGrade] = useState<number>(getActiveGrade);
  const [onlyEnrolled, setOnlyEnrolled] = useState<boolean>(false);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateModalInitialMode, setTemplateModalInitialMode] = useState<'export' | 'import'>('export');
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8 sm:pb-12 space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
          <span>Geri Ana Sayfaya Dön</span>
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Akademik Takvim</span>
        </button>
      </div>

      {/* Top Header & Quick Action Bar (Option 1: Ferah ve Hafif Başlık) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1d3540] border border-stone-200/80 dark:border-white/10 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span>Kilis 7 Aralık Üniversitesi</span>
            <span>·</span>
            <span className="text-amber-700 dark:text-amber-300 font-bold">{courses.length} Ders Kayıtlı</span>
            <span>·</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{exams.length} Sınav</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight">
            Ders Programı & Sınav Takvimi
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsNotificationModalOpen(true)}
            className="px-3.5 py-2.5 bg-[#8a2a43]/10 hover:bg-[#8a2a43]/20 text-[#8a2a43] dark:text-rose-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-[#8a2a43]/30 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Ders ve Sınav Bildirimleri (10 ve 5 dakika kala)"
          >
            <BellRing className="w-4 h-4 text-[#8a2a43] dark:text-rose-300 animate-pulse" />
            <span>Bildirimler (10 & 5 Dk)</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Metinden İçe Aktar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTemplateModalInitialMode('export');
              setIsTemplateModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Ders ve Sınav Programı Şablonunu Paylaş veya İçe Aktar"
          >
            <Share2 className="w-4 h-4" />
            <span>Şablon Paylaş & Yükle</span>
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
            className="px-4 py-2.5 bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-900 dark:text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200 dark:border-white/10"
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{activeTab === 'courses' ? 'Ders Ekle' : 'Sınav Ekle'}</span>
          </button>
          {(courses.length > 0 || exams.length > 0) && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-500/20"
              title="Tüm programı sıfırla"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Segmented Control Bar (Option 2: Birleştirilmiş Segmented Toolbar) */}
      <div className="flex p-1.5 rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 max-w-lg mx-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-white dark:bg-[#1d3540] text-amber-700 dark:text-amber-400 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Haftalık Ders Programı</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-white dark:bg-[#1d3540] text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Sınav Takvimi</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-800 dark:text-rose-200">
            {exams.length}
          </span>
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

      <ScheduleNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      <ScheduleTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onApplied={reloadData}
        currentCourses={courses}
        currentExams={exams}
        initialMode={templateModalInitialMode}
      />
    </div>
  );
}
