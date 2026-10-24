/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  X,
  FileText,
  CheckCircle2,
  Layers,
  Clock,
  MapPin,
  ClipboardPaste,
  BookOpen,
  RefreshCw,
  SlidersHorizontal,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  parsePlainText,
  buildGradeSummary,
} from '../../lib/scheduleParser';
import { batchImportItems } from '../../lib/scheduleStorage';
import { parseAndValidateSchedulePackage } from '../../lib/scheduleTemplate';
import { CourseItem, ExamItem, ParsedDocumentResult } from '../../types/schedule';

interface ScheduleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleImportModal({ isOpen, onClose, onSuccess }: ScheduleImportModalProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedDocumentResult | null>(null);

  // Forced class mode: 0 = Auto-detect, 1..4 = Force all items to that class
  const [preImportGradeMode, setPreImportGradeMode] = useState<number>(0);

  // Editable lists in preview
  const [previewCourses, setPreviewCourses] = useState<CourseItem[]>([]);
  const [previewExams, setPreviewExams] = useState<ExamItem[]>([]);

  // Multi-Grade Filter states in preview screen
  const [filterGradeTab, setFilterGradeTab] = useState<'all' | number>('all');
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [selectedExamIds, setSelectedExamIds] = useState<Set<string>>(new Set());
  const [replaceExisting, setReplaceExisting] = useState(false);

  // Paste text tab
  const [pastedText, setPastedText] = useState('');
  const [pasteDefaultGrade, setPasteDefaultGrade] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePasteParse = async () => {
    if (!pastedText.trim()) {
      toast.error('Lütfen ayrıştırılacak metni yapıştırın.');
      return;
    }

    setIsParsing(true);
    try {
      const trimmed = pastedText.trim();

      // Check if user pasted a structured template package (.k7plan / JSON)
      if (trimmed.startsWith('{') || trimmed.includes('k7au_schedule_template') || trimmed.includes('"courses"')) {
        const tplRes = parseAndValidateSchedulePackage(trimmed);
        if (tplRes.success && tplRes.package) {
          const pkg = tplRes.package;
          setPreviewCourses(pkg.courses);
          setPreviewExams(pkg.exams);
          setSelectedCourseIds(new Set(pkg.courses.map((c) => c.id)));
          setSelectedExamIds(new Set(pkg.exams.map((e) => e.id)));
          setParsedResult({
            courses: pkg.courses,
            exams: pkg.exams,
            rawTextLength: trimmed.length,
            detectedGrades: pkg.metadata.grade ? [pkg.metadata.grade] : [1]
          });
          setIsParsing(false);
          toast.success(`Şablon algılandı: ${pkg.summary.courseCount} ders, ${pkg.summary.examCount} sınav`);
          return;
        }
      }

      const forced = preImportGradeMode > 0 ? preImportGradeMode : undefined;
      const res = await parsePlainText(pastedText, pasteDefaultGrade, forced);

      if (res.courses.length === 0 && res.exams.length === 0) {
        toast.error('Metinde ders veya sınav bilgisi tespit edilemedi. Lütfen geçerli bir ders listesi yapıştırın.');
        setIsParsing(false);
        return;
      }

      let finalCourses = res.courses;
      let finalExams = res.exams;

      if (preImportGradeMode > 0) {
        finalCourses = finalCourses.map((c) => ({
          ...c,
          grade: preImportGradeMode,
          gradeLabel: `${preImportGradeMode}. Sınıf`,
        }));
        finalExams = finalExams.map((ex) => ({
          ...ex,
          grade: preImportGradeMode,
          gradeLabel: `${preImportGradeMode}. Sınıf`,
        }));
      }

      setPreviewCourses(finalCourses);
      setPreviewExams(finalExams);
      setParsedResult(res);

      setSelectedCourseIds(new Set(finalCourses.map((c) => c.id)));
      setSelectedExamIds(new Set(finalExams.map((e) => e.id)));
      setFilterGradeTab('all');

      toast.success(
        `Metin başarıyla çözümlendi! (${finalCourses.length} ders, ${finalExams.length} sınav bulundu)`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Metin çözümlenirken hata oluştu.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleToggleCourse = (id: string) => {
    setSelectedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleExam = (id: string) => {
    setSelectedExamIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    const visibleCourseIds = previewCourses
      .filter((c) => filterGradeTab === 'all' || c.grade === filterGradeTab)
      .map((c) => c.id);
    const visibleExamIds = previewExams
      .filter((e) => filterGradeTab === 'all' || e.grade === filterGradeTab)
      .map((e) => e.id);

    setSelectedCourseIds((prev) => {
      const next = new Set(prev);
      visibleCourseIds.forEach((id) => next.add(id));
      return next;
    });

    setSelectedExamIds((prev) => {
      const next = new Set(prev);
      visibleExamIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleDeselectAllVisible = () => {
    const visibleCourseIds = new Set(
      previewCourses
        .filter((c) => filterGradeTab === 'all' || c.grade === filterGradeTab)
        .map((c) => c.id)
    );
    const visibleExamIds = new Set(
      previewExams
        .filter((e) => filterGradeTab === 'all' || e.grade === filterGradeTab)
        .map((e) => e.id)
    );

    setSelectedCourseIds((prev) => {
      const next = new Set(prev);
      visibleCourseIds.forEach((id) => next.delete(id));
      return next;
    });

    setSelectedExamIds((prev) => {
      const next = new Set(prev);
      visibleExamIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleSaveImport = () => {
    const coursesToSave = previewCourses.filter((c) => selectedCourseIds.has(c.id));
    const examsToSave = previewExams.filter((e) => selectedExamIds.has(e.id));

    if (coursesToSave.length === 0 && examsToSave.length === 0) {
      toast.error('Lütfen içe aktarılacak en az bir ders veya sınav seçin.');
      return;
    }

    batchImportItems(coursesToSave, examsToSave, replaceExisting);

    toast.success(
      `${coursesToSave.length} ders ve ${examsToSave.length} sınav programınıza eklendi!`
    );

    onSuccess();
    onClose();
  };

  // Filtered lists for preview tab
  const visibleCourses = previewCourses.filter((c) => filterGradeTab === 'all' || c.grade === filterGradeTab);
  const visibleExams = previewExams.filter((e) => filterGradeTab === 'all' || e.grade === filterGradeTab);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const modalMarkup = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] sm:pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] sm:pb-3 px-3 sm:px-4 bg-stone-900/60 backdrop-blur-sm">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl max-h-[96vh] h-[92vh] sm:h-[88vh] flex flex-col bg-white dark:bg-[#1d3540] rounded-2xl shadow-2xl border border-stone-200 dark:border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-white/10 flex items-center justify-between bg-stone-50/80 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-medium">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                Metinden Ders & Sınav Programı Aktar
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Kopyalanan Ders veya Sınav Listesi Metnini İçe Aktarın
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!parsedResult ? (
            <>
              {/* Pre-import Grade Choice Bar */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Sınıf Tercihi:
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {preImportGradeMode === 0 ? 'Ders koduna göre otomatik algılanır' : `Tüm dersler ${preImportGradeMode}. sınıfa atanır`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setPreImportGradeMode(0)}
                    className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                      preImportGradeMode === 0
                        ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-sm'
                        : 'bg-white dark:bg-white/5 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-white/10 hover:border-amber-500'
                    }`}
                  >
                    Otomatik (1-4)
                  </button>
                  {[1, 2, 3, 4].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPreImportGradeMode(g)}
                      className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                        preImportGradeMode === g
                          ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-sm'
                          : 'bg-white dark:bg-white/5 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-white/10 hover:border-amber-500'
                      }`}
                    >
                      {g}. Sınıf
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Area */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5">
                    Ders Programı veya Sınav Listesi Metnini Buraya Yapıştırın:
                  </label>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Örnek Metin:&#10;Pazartesi 08:30-10:15 MAT101 Genel Matematik I D-101 Doç. Dr. Selim Kaya&#10;Salı 09:00-11:45 BLG101 Programlama Lab 2..."
                    className="w-full text-xs font-mono p-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">Varsayılan Sınıf:</span>
                    <select
                      value={pasteDefaultGrade}
                      onChange={(e) => setPasteDefaultGrade(Number(e.target.value))}
                      className="text-xs p-1.5 rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white font-semibold"
                    >
                      <option value={0}>Otomatik / Bologna Kodu</option>
                      <option value={1}>1. Sınıf</option>
                      <option value={2}>2. Sınıf</option>
                      <option value={3}>3. Sınıf</option>
                      <option value={4}>4. Sınıf</option>
                    </select>
                  </div>

                  <button
                    onClick={handlePasteParse}
                    disabled={isParsing || !pastedText.trim()}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                  >
                    {isParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardPaste className="w-4 h-4" />}
                    <span>Metni Ayrıştır ve İncele</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Multi-Grade Review & Selection Screen */
            <div className="space-y-4">
              {/* Document Summary Badge */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-stone-900 dark:text-white">
                      {parsedResult.fileName}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {previewCourses.length} ders, {previewExams.length} sınav bulundu.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setParsedResult(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-200 text-xs font-medium hover:bg-stone-300 dark:hover:bg-white/20 transition-colors"
                >
                  Yeniden Metin Gir
                </button>
              </div>

              {/* Grade Tabs Bar in Preview */}
              {parsedResult.detectedGrades.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium border-b border-stone-200 dark:border-white/10">
                  <button
                    onClick={() => setFilterGradeTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                      filterGradeTab === 'all'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    Tümü ({previewCourses.length + previewExams.length})
                  </button>
                  {parsedResult.detectedGrades.map((g) => (
                    <button
                      key={g.grade}
                      onClick={() => setFilterGradeTab(g.grade)}
                      className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                        filterGradeTab === g.grade
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                    >
                      {g.label} ({g.coursesCount + g.examsCount})
                    </button>
                  ))}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllVisible}
                    className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    Tümünü Seç
                  </button>
                  <span className="text-stone-300 dark:text-white/20">•</span>
                  <button
                    onClick={handleDeselectAllVisible}
                    className="text-stone-500 dark:text-stone-400 hover:underline"
                  >
                    Seçimi Temizle
                  </button>
                </div>

                <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                  {selectedCourseIds.size + selectedExamIds.size} öğe seçili
                </span>
              </div>

              {/* Preview Content Lists */}
              <div className="space-y-4 max-h-[42vh] overflow-y-auto pr-1">
                {/* Courses List */}
                {visibleCourses.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Dersler ({visibleCourses.length})
                    </h3>
                    <div className="space-y-1.5">
                      {visibleCourses.map((c) => {
                        const isSelected = selectedCourseIds.has(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleToggleCourse(c.id)}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500/40 text-stone-900 dark:text-white'
                                : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold truncate">
                                  {c.courseCode ? `${c.courseCode} - ` : ''}
                                  {c.courseName}
                                </div>
                                <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                                  <span>{c.day} {c.startTime}-{c.endTime}</span>
                                  {c.classroom && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        <MapPin className="w-3 h-3" />
                                        {c.classroom}
                                      </span>
                                    </>
                                  )}
                                  <span className="px-1.5 py-0.2 rounded bg-stone-200 dark:bg-white/10 text-[10px] font-bold">
                                    {c.gradeLabel}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Exams List */}
                {visibleExams.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      Sınavlar ({visibleExams.length})
                    </h3>
                    <div className="space-y-1.5">
                      {visibleExams.map((e) => {
                        const isSelected = selectedExamIds.has(e.id);
                        return (
                          <div
                            key={e.id}
                            onClick={() => handleToggleExam(e.id)}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-rose-500/10 border-rose-500/40 text-stone-900 dark:text-white'
                                : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold truncate">
                                  [{e.examType.toUpperCase()}] {e.courseCode ? `${e.courseCode} - ` : ''}
                                  {e.courseName}
                                </div>
                                <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                                  <span>Tarih: {e.date} ({e.startTime}-{e.endTime})</span>
                                  {e.classroom && (
                                    <>
                                      <span>•</span>
                                      <span>{e.classroom}</span>
                                    </>
                                  )}
                                  <span className="px-1.5 py-0.2 rounded bg-stone-200 dark:bg-white/10 text-[10px] font-bold">
                                    {e.gradeLabel}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {parsedResult && (
          <div className="px-5 py-3.5 border-t border-stone-200 dark:border-white/10 flex items-center justify-between bg-stone-50/80 dark:bg-white/[0.03]">
            <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Mevcut program verilerini temizle (Üzerine yaz)</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-white/10 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSaveImport}
                disabled={selectedCourseIds.size === 0 && selectedExamIds.size === 0}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Seçilenleri Programa Ekle ({selectedCourseIds.size + selectedExamIds.size})
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
}
