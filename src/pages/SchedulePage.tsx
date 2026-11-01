/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays,
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
  FileText,
  GraduationCap,
  SlidersHorizontal
} from 'lucide-react';
import WeeklyTimetable from '../components/schedule/WeeklyTimetable';
import ExamScheduleView from '../components/schedule/ExamScheduleView';
import CourseNotesView from '../components/schedule/CourseNotesView';
import CourseFormModal from '../components/schedule/CourseFormModal';
import ExamFormModal from '../components/schedule/ExamFormModal';
import CourseNoteFormModal from '../components/schedule/CourseNoteFormModal';
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
  resetSampleSchedule,
  SCHEDULE_CHANGED_EVENT,
} from '../lib/scheduleStorage';
import {
  getStoredCourseNotes,
  resetSampleCourseNotes,
  COURSE_NOTES_CHANGED_EVENT,
} from '../lib/scheduleNotesStorage';
import { CourseItem, ExamItem, CourseNoteItem } from '../types/schedule';
import toast from 'react-hot-toast';

export default function SchedulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'courses' | 'exams' | 'notes'>(() => {
    const tabParam = new URLSearchParams(window.location.search).get('tab');
    if (tabParam === 'notes' || tabParam === 'exams' || tabParam === 'courses') {
      return tabParam;
    }
    return 'courses';
  });

  const handleTabChange = (tab: 'courses' | 'exams' | 'notes') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab') || (location.state as any)?.tab;
    if (tabParam === 'notes' || tabParam === 'exams' || tabParam === 'courses') {
      setActiveTab(tabParam);
    }
  }, [searchParams, location.state]);
  const [courses, setCourses] = useState<CourseItem[]>(getStoredCourses);
  const [exams, setExams] = useState<ExamItem[]>(getStoredExams);
  const [notes, setNotes] = useState<CourseNoteItem[]>(getStoredCourseNotes);
  const [selectedGrade, setSelectedGrade] = useState<number>(() => {
    const g = getActiveGrade();
    return g > 0 ? g : 1;
  });
  const [onlyEnrolled, setOnlyEnrolled] = useState<boolean>(false);

  // Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateModalInitialMode, setTemplateModalInitialMode] = useState<'export' | 'import'>('export');
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [editingNote, setEditingNote] = useState<CourseNoteItem | null>(null);
  const [noteInitialCourse, setNoteInitialCourse] = useState<CourseItem | null>(null);

  const reloadData = useCallback(() => {
    setCourses(getStoredCourses());
    setExams(getStoredExams());
    setNotes(getStoredCourseNotes());
    setSelectedGrade(getActiveGrade());
  }, []);

  useEffect(() => {
    reloadData();
    const handleChanged = () => reloadData();
    window.addEventListener(SCHEDULE_CHANGED_EVENT, handleChanged);
    window.addEventListener(COURSE_NOTES_CHANGED_EVENT, handleChanged);
    return () => {
      window.removeEventListener(SCHEDULE_CHANGED_EVENT, handleChanged);
      window.removeEventListener(COURSE_NOTES_CHANGED_EVENT, handleChanged);
    };
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all border border-stone-200/80 dark:border-white/10 active:scale-95 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
          <span>Ana Sayfaya Dön</span>
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-all border border-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Akademik Takvim</span>
        </button>
      </div>

      {/* Modern, Clean & Spacious Header Card */}
      <div className="relative p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1d3540] border border-stone-200/90 dark:border-white/10 shadow-sm overflow-visible">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#8a2a43]/5 dark:bg-[#8a2a43]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Section: Title & Actions */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8a2a43] to-[#681c30] text-white flex items-center justify-center shadow-md shadow-[#8a2a43]/20 shrink-0 ring-4 ring-[#8a2a43]/10">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
                Derslerim
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium mt-0.5">
                Haftalık Ders Programı, Notlar ve Sınav Takvimi
              </p>
            </div>
          </div>

          {/* Primary Action & Unified Tools Menu */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {/* Primary Action Button */}
            <button
              onClick={
                activeTab === 'courses'
                  ? () => {
                      setEditingCourse(null);
                      setIsCourseFormOpen(true);
                    }
                  : activeTab === 'exams'
                  ? () => {
                      setEditingExam(null);
                      setIsExamFormOpen(true);
                    }
                  : () => {
                      setEditingNote(null);
                      setNoteInitialCourse(null);
                      setIsNoteFormOpen(true);
                    }
              }
              className="px-4 py-2.5 bg-[#8a2a43] hover:bg-[#742036] active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === 'courses'
                  ? 'Ders Ekle'
                  : activeTab === 'exams'
                  ? 'Sınav Ekle'
                  : 'Not Ekle'}
              </span>
            </button>

            {/* Tools & Operations Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isToolsMenuOpen
                    ? 'bg-stone-200 dark:bg-white/20 text-stone-900 dark:text-white border-stone-300 dark:border-white/20'
                    : 'bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-white/10 active:scale-95'
                }`}
                title="Ders programı araçları ve ayarları"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                <span>İşlemler</span>
              </button>

              {/* Tools Dropdown Popover */}
              <AnimatePresence>
                {isToolsMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsToolsMenuOpen(false)}
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#152730] border border-stone-200 dark:border-white/15 shadow-xl p-1.5 z-40 space-y-1"
                    >
                      <div className="px-3 py-1.5 border-b border-stone-100 dark:border-white/5">
                        <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                          Program Araçları
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          setIsNotificationModalOpen(true);
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 text-xs font-medium text-stone-700 dark:text-stone-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <BellRing className="w-4 h-4 text-[#8a2a43] dark:text-rose-300 shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold">Ders Bildirimleri</div>
                          <div className="text-[10px] text-stone-600 dark:text-stone-300">10 ve 5 dk kala otomatik uyarı</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          setTemplateModalInitialMode('export');
                          setIsTemplateModalOpen(true);
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 text-xs font-medium text-stone-700 dark:text-stone-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold">Şablon Paylaş & Yükle</div>
                          <div className="text-[10px] text-stone-600 dark:text-stone-300">Dosya veya kodla paylaş</div>
                        </div>
                      </button>

                      <div className="border-t border-stone-100 dark:border-white/5 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          resetSampleSchedule();
                          resetSampleCourseNotes();
                          reloadData();
                          toast.success('Örnek ders programı ve ders notları yüklendi!');
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold">Örnek Programı Yükle</div>
                          <div className="text-[10px] text-stone-600 dark:text-stone-300">Test verilerini geri getir</div>
                        </div>
                      </button>

                      {(courses.length > 0 || exams.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsToolsMenuOpen(false);
                            if (window.confirm('Tüm kayıtlı ders programı ve sınavları sıfırlamak istediğinize emin misiniz?')) {
                              handleClearAll();
                            }
                          }}
                          className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          <div className="flex-1">
                            <div className="font-semibold">Programı Sıfırla</div>
                            <div className="text-[10px] text-stone-600 dark:text-stone-300">Tüm ders ve sınavları temizle</div>
                          </div>
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Section: Clean Metrics & Quick Utility Shortcuts */}
        <div className="relative mt-4 pt-3.5 border-t border-stone-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
          {/* Micro Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{courses.length} Ders</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#8a2a43]/10 text-[#8a2a43] dark:text-[#f4a261] text-xs font-semibold">
              <FileText className="w-3.5 h-3.5 text-[#8a2a43] dark:text-[#f4a261]" />
              <span>{notes.length} Ders Notu</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-800 dark:text-rose-200 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{exams.length} Sınav</span>
            </div>
          </div>

          {/* Quick Action Chips (Convenient 1-tap shortcuts) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer border border-stone-200/80 dark:border-white/5 active:scale-95"
            >
              <BellRing className="w-3 h-3 text-[#8a2a43] dark:text-rose-300" />
              <span>Bildirimler</span>
            </button>

            <button
              onClick={() => {
                setTemplateModalInitialMode('export');
                setIsTemplateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer border border-stone-200/80 dark:border-white/5 active:scale-95"
            >
              <Share2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Şablon</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode Segmented Control Bar (Derslerim Modları) - Robust 3-Column Grid */}
      <div className="grid grid-cols-3 gap-1 p-1 sm:p-1.5 rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 max-w-2xl mx-auto shadow-2xs">
        <button
          onClick={() => handleTabChange('courses')}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer min-w-0 ${
            activeTab === 'courses'
              ? 'bg-white dark:bg-[#1d3540] text-amber-700 dark:text-amber-400 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 min-w-4 min-h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="truncate">Ders Programı</span>
          <span className="text-[10px] px-1 sm:px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200 font-bold shrink-0">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('notes')}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer min-w-0 ${
            activeTab === 'notes'
              ? 'bg-white dark:bg-[#1d3540] text-[#8a2a43] dark:text-[#f4a261] shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 min-w-4 min-h-4 shrink-0 text-[#8a2a43] dark:text-[#f4a261]" />
          <span className="truncate">Ders Notları</span>
          <span className="text-[10px] px-1 sm:px-1.5 py-0.5 rounded-md bg-[#8a2a43]/15 text-[#8a2a43] dark:text-[#f4a261] font-bold shrink-0">
            {notes.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('exams')}
          className={`py-2 px-1.5 sm:py-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer min-w-0 ${
            activeTab === 'exams'
              ? 'bg-white dark:bg-[#1d3540] text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 min-w-4 min-h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="truncate">Sınav Takvimi</span>
          <span className="text-[10px] px-1 sm:px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-800 dark:text-rose-200 font-bold shrink-0">
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
              onAddNote={(course) => {
                setNoteInitialCourse(course);
                setEditingNote(null);
                setIsNoteFormOpen(true);
              }}
              onlyEnrolled={onlyEnrolled}
              onToggleOnlyEnrolled={setOnlyEnrolled}
            />
          </motion.div>
        ) : activeTab === 'exams' ? (
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
        ) : (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <CourseNotesView
              notes={notes}
              courses={courses}
              onAddNote={(course) => {
                setNoteInitialCourse(course || null);
                setEditingNote(null);
                setIsNoteFormOpen(true);
              }}
              onEditNote={(note) => {
                setEditingNote(note);
                setNoteInitialCourse(null);
                setIsNoteFormOpen(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CourseFormModal
        isOpen={isCourseFormOpen}
        onClose={() => {
          setIsCourseFormOpen(false);
          setEditingCourse(null);
        }}
        initialCourse={editingCourse}
        defaultGrade={selectedGrade > 0 ? selectedGrade : 1}
        onSaved={(savedCourse) => {
          reloadData();
          if (savedCourse && savedCourse.grade && savedCourse.grade !== selectedGrade) {
            handleGradeChange(savedCourse.grade);
          }
        }}
      />

      <ExamFormModal
        isOpen={isExamFormOpen}
        onClose={() => {
          setIsExamFormOpen(false);
          setEditingExam(null);
        }}
        initialExam={editingExam}
        defaultGrade={selectedGrade > 0 ? selectedGrade : 1}
        onSaved={(savedExam) => {
          reloadData();
          if (savedExam && savedExam.grade && savedExam.grade !== selectedGrade) {
            handleGradeChange(savedExam.grade);
          }
        }}
      />

      <CourseNoteFormModal
        isOpen={isNoteFormOpen}
        onClose={() => {
          setIsNoteFormOpen(false);
          setEditingNote(null);
          setNoteInitialCourse(null);
        }}
        courses={courses}
        initialCourse={noteInitialCourse}
        initialNote={editingNote}
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
