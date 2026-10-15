/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  FileText,
  FileSpreadsheet,
  FileType,
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
  parseWordFile,
  parseExcelFile,
  parsePdfFile,
  parsePlainText,
  buildGradeSummary,
} from '../../lib/scheduleParser';
import { batchImportItems } from '../../lib/scheduleStorage';
import { CourseItem, ExamItem, ParsedDocumentResult } from '../../types/schedule';

interface ScheduleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleImportModal({ isOpen, onClose, onSuccess }: ScheduleImportModalProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParsedResult(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let res: ParsedDocumentResult;

      const forced = preImportGradeMode > 0 ? preImportGradeMode : undefined;

      if (ext === 'docx' || ext === 'doc') {
        res = await parseWordFile(file, forced);
      } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        res = await parseExcelFile(file, forced);
      } else if (ext === 'pdf') {
        res = await parsePdfFile(file, forced);
      } else {
        throw new Error('Desteklenmeyen dosya formatı. Lütfen .docx, .xlsx, .xls veya .pdf yükleyin.');
      }

      if (res.courses.length === 0 && res.exams.length === 0) {
        toast.error('Belgede ders veya sınav tablosu bulunamadı. Metin sekmesinden kopyalayıp yapıştırmayı deneyebilirsiniz.', { duration: 5000 });
        setIsParsing(false);
        return;
      }

      // If user had selected forced grade, ensure all items match it
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
        res.detectedGrades = buildGradeSummary(finalCourses, finalExams);
      }

      setPreviewCourses(finalCourses);
      setPreviewExams(finalExams);
      setParsedResult(res);

      // Select all by default
      setSelectedCourseIds(new Set(finalCourses.map((c) => c.id)));
      setSelectedExamIds(new Set(finalExams.map((e) => e.id)));
      setFilterGradeTab('all');

      toast.success(
        `Belge başarıyla okundu! (${finalCourses.length} ders, ${finalExams.length} sınav bulundu)`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Dosya çözümlenirken hata oluştu.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteParse = () => {
    if (!pastedText.trim()) {
      toast.error('Lütfen ayrıştırılacak metni yapıştırın.');
      return;
    }

    setIsParsing(true);
    try {
      const forced = preImportGradeMode > 0 ? preImportGradeMode : undefined;
      const res = parsePlainText(pastedText, pasteDefaultGrade, forced);
      if (res.courses.length === 0 && res.exams.length === 0) {
        toast.error('Metinde saat veya ders bilgisi tespit edilemedi.');
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
        res.detectedGrades = buildGradeSummary(finalCourses, finalExams);
      }

      setPreviewCourses(finalCourses);
      setPreviewExams(finalExams);
      setParsedResult(res);
      setSelectedCourseIds(new Set(finalCourses.map((c) => c.id)));
      setSelectedExamIds(new Set(finalExams.map((e) => e.id)));
      setFilterGradeTab('all');

      toast.success(`Metin ayrıştırıldı! ${finalCourses.length} ders, ${finalExams.length} sınav.`);
    } catch {
      toast.error('Ayrıştırma hatası.');
    } finally {
      setIsParsing(false);
    }
  };

  // Change individual item grade in preview table
  const handleChangeCourseGrade = (courseId: string, newGrade: number) => {
    setPreviewCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              grade: newGrade,
              gradeLabel: newGrade === 0 ? 'Ortak / Seçmeli' : `${newGrade}. Sınıf`,
            }
          : c
      )
    );
  };

  const handleChangeExamGrade = (examId: string, newGrade: number) => {
    setPreviewExams((prev) =>
      prev.map((e) =>
        e.id === examId
          ? {
              ...e,
              grade: newGrade,
              gradeLabel: newGrade === 0 ? 'Genel' : `${newGrade}. Sınıf`,
            }
          : e
      )
    );
  };

  // Batch assign all currently visible or selected items to a grade
  const handleBatchAssignGrade = (targetGrade: number) => {
    setPreviewCourses((prev) =>
      prev.map((c) =>
        selectedCourseIds.has(c.id)
          ? {
              ...c,
              grade: targetGrade,
              gradeLabel: targetGrade === 0 ? 'Ortak / Seçmeli' : `${targetGrade}. Sınıf`,
            }
          : c
      )
    );
    setPreviewExams((prev) =>
      prev.map((e) =>
        selectedExamIds.has(e.id)
          ? {
              ...e,
              grade: targetGrade,
              gradeLabel: targetGrade === 0 ? 'Genel' : `${targetGrade}. Sınıf`,
            }
          : e
      )
    );
    toast.success(`Seçili öğeler ${targetGrade === 0 ? 'Ortak' : `${targetGrade}. Sınıf`} olarak güncellendi.`);
  };

  const handleGradeFilterTab = (tab: 'all' | number) => {
    setFilterGradeTab(tab);
  };

  // Select / Deselect visible items
  const handleSelectAllVisible = () => {
    const visibleCourseIds = previewCourses
      .filter((c) => filterGradeTab === 'all' || c.grade === filterGradeTab)
      .map((c) => c.id);
    const visibleExamIds = previewExams
      .filter((e) => filterGradeTab === 'all' || e.grade === filterGradeTab)
      .map((e) => e.id);

    setSelectedCourseIds((prev) => new Set([...prev, ...visibleCourseIds]));
    setSelectedExamIds((prev) => new Set([...prev, ...visibleExamIds]));
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

    setSelectedCourseIds((prev) => new Set([...prev].filter((id) => !visibleCourseIds.has(id))));
    setSelectedExamIds((prev) => new Set([...prev].filter((id) => !visibleExamIds.has(id))));
  };

  const toggleCourseSelect = (id: string) => {
    const next = new Set(selectedCourseIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCourseIds(next);
  };

  const toggleExamSelect = (id: string) => {
    const next = new Set(selectedExamIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedExamIds(next);
  };

  const handleConfirmImport = () => {
    const finalCourses = previewCourses.filter((c) => selectedCourseIds.has(c.id));
    const finalExams = previewExams.filter((e) => selectedExamIds.has(e.id));

    if (finalCourses.length === 0 && finalExams.length === 0) {
      toast.error('Lütfen içe aktarılacak en az bir ders veya sınav seçin.');
      return;
    }

    batchImportItems(finalCourses, finalExams, replaceExisting);
    toast.success(`${finalCourses.length} ders ve ${finalExams.length} sınav takviminize eklendi!`, {
      icon: '✅',
    });
    onSuccess();
    onClose();
  };

  // Filtered lists for preview tab
  const visibleCourses = previewCourses.filter((c) => filterGradeTab === 'all' || c.grade === filterGradeTab);
  const visibleExams = previewExams.filter((e) => filterGradeTab === 'all' || e.grade === filterGradeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] sm:pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] sm:pb-3 px-3 sm:px-4 bg-stone-900/60 backdrop-blur-sm">
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                Ders & Sınav Programı Yükle
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Word, Excel, PDF veya Kopyala-Yapıştır ile Çoklu Sınıf Desteği
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
                    Sınıf Ayrıştırma Tercihi:
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {preImportGradeMode === 0 ? 'Çoklu sınıf otomatik algılanır' : `Tüm içerik ${preImportGradeMode}. sınıfa atanır`}
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

              {/* Tabs */}
              <div className="flex p-1 bg-stone-100 dark:bg-white/5 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'file'
                      ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm font-semibold'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Belge Yükle (.docx, .xlsx, .pdf)
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'paste'
                      ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm font-semibold'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                  }`}
                >
                  <ClipboardPaste className="w-4 h-4" />
                  Metin Kopyala-Yapıştır
                </button>
              </div>

              {activeTab === 'file' ? (
                <div className="space-y-4">
                  {/* File Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 dark:border-white/15 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-stone-50/50 dark:bg-white/[0.02]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.doc,.xlsx,.xls,.csv,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                      {isParsing ? (
                        <RefreshCw className="w-7 h-7 animate-spin" />
                      ) : (
                        <Upload className="w-7 h-7" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-white mb-1">
                      {isParsing ? 'Belge Çözümleniyor...' : 'Belgenizi seçmek için tıklayın'}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                      Fakültenizden aldığınız ders programı veya sınav takvimi dosyasını yükleyin (.pdf, .docx veya .xlsx).
                    </p>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-200 dark:border-white/10">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                        <FileType className="w-3.5 h-3.5 text-blue-500" /> Word
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Excel
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                        <FileText className="w-3.5 h-3.5 text-rose-500" /> PDF
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Ders Programı veya Sınav Listesini Buraya Yapıştırın:
                    </label>
                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Örnek:&#10;1. Sınıf&#10;Pazartesi 08:30-10:15 MAT101 Genel Matematik I D-101 Doç. Dr. Selim Kaya&#10;Salı 09:00-11:45 BLG101 Programlama Lab 2..."
                      className="w-full text-xs font-mono p-3 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-600 dark:text-stone-300">Başlık yoksa sınıf:</span>
                      <select
                        value={pasteDefaultGrade}
                        onChange={(e) => setPasteDefaultGrade(Number(e.target.value))}
                        className="text-xs p-1.5 rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 text-stone-800 dark:text-white"
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
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
                    >
                      {isParsing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      Metni Ayrıştır
                    </button>
                  </div>
                </div>
              )}
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
                    setPreviewCourses([]);
                    setPreviewExams([]);
                    setSelectedCourseIds(new Set());
                    setSelectedExamIds(new Set());
                  }}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Yeni Dosya
                </button>
              </div>

              {/* Class Filter Tabs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200">
                    🎓 Sınıf Görünümü & Filtresi:
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllVisible}
                      className="text-amber-600 hover:underline font-medium"
                    >
                      Görünenleri Seç
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllVisible}
                      className="text-stone-500 hover:underline"
                    >
                      Seçimi Kaldır
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGradeFilterTab('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      filterGradeTab === 'all'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold'
                        : 'bg-white dark:bg-white/5 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-white/10 hover:border-amber-500'
                    }`}
                  >
                    Tümü ({previewCourses.length + previewExams.length})
                  </button>

                  {[1, 2, 3, 4].map((g) => {
                    const count =
                      previewCourses.filter((c) => c.grade === g).length +
                      previewExams.filter((e) => e.grade === g).length;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleGradeFilterTab(g)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          filterGradeTab === g
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold'
                            : 'bg-white dark:bg-white/5 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-white/10 hover:border-amber-500'
                        }`}
                      >
                        {g}. Sınıf ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Batch Class Reassignment Toolbar */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Seçilenleri Toplu Ata:
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {[1, 2, 3, 4].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleBatchAssignGrade(g)}
                      className="px-2.5 py-1 bg-white dark:bg-white/10 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 rounded-lg border border-amber-500/30 font-medium transition-colors"
                    >
                      {g}. Sınıf Yap
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleBatchAssignGrade(0)}
                    className="px-2 py-1 bg-white dark:bg-white/10 hover:bg-stone-200 rounded-lg border border-stone-300 text-[11px]"
                  >
                    Ortak Yap
                  </button>
                </div>
              </div>

              {/* Course list preview */}
              {visibleCourses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      Dersler ({visibleCourses.length})
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      {previewCourses.filter((c) => selectedCourseIds.has(c.id)).length} seçili
                    </span>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1.5 border border-stone-200 dark:border-white/10 rounded-xl p-2 bg-stone-50/50 dark:bg-white/[0.02]">
                    {visibleCourses.map((course) => {
                      const isSelected = selectedCourseIds.has(course.id);
                      return (
                        <div
                          key={course.id}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/30 text-stone-900 dark:text-white'
                              : 'bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 opacity-60 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          <div
                            onClick={() => toggleCourseSelect(course.id)}
                            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCourseSelect(course.id)}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                                  {course.courseCode || 'KODSUZ'}
                                </span>
                                <span className="truncate font-medium">{course.courseName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                <span>{course.day}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" /> {course.startTime} - {course.endTime}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 truncate">
                                  <MapPin className="w-3 h-3" /> {course.classroom}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Inline Grade Selector */}
                          <div className="shrink-0 flex items-center gap-1">
                            <select
                              value={course.grade}
                              onChange={(e) => handleChangeCourseGrade(course.id, Number(e.target.value))}
                              className="text-[11px] font-semibold py-1 px-1.5 rounded-lg border border-stone-300 dark:border-white/15 bg-white dark:bg-[#1d3540] text-stone-800 dark:text-stone-200"
                              title="Bu dersin sınıfını değiştir"
                            >
                              <option value={1}>1. Sınıf</option>
                              <option value={2}>2. Sınıf</option>
                              <option value={3}>3. Sınıf</option>
                              <option value={4}>4. Sınıf</option>
                              <option value={0}>Ortak / Seçmeli</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Exam list preview */}
              {visibleExams.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-rose-500" />
                      Sınavlar ({visibleExams.length})
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      {previewExams.filter((e) => selectedExamIds.has(e.id)).length} seçili
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-stone-200 dark:border-white/10 rounded-xl p-2 bg-stone-50/50 dark:bg-white/[0.02]">
                    {visibleExams.map((exam) => {
                      const isSelected = selectedExamIds.has(exam.id);
                      return (
                        <div
                          key={exam.id}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors ${
                            isSelected
                              ? 'bg-rose-500/10 border-rose-500/30 text-stone-900 dark:text-white'
                              : 'bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 opacity-60 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          <div
                            onClick={() => toggleExamSelect(exam.id)}
                            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleExamSelect(exam.id)}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="uppercase text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                                  {exam.examType}
                                </span>
                                {exam.courseCode && (
                                  <span className="font-mono font-bold">{exam.courseCode}</span>
                                )}
                                <span className="truncate font-medium">{exam.courseName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                <span>{exam.date}</span>
                                <span>•</span>
                                <span>{exam.startTime}</span>
                                <span>•</span>
                                <span className="truncate">{exam.classroom}</span>
                              </div>
                            </div>
                          </div>

                          {/* Inline Grade Selector for Exam */}
                          <div className="shrink-0 flex items-center gap-1">
                            <select
                              value={exam.grade}
                              onChange={(e) => handleChangeExamGrade(exam.id, Number(e.target.value))}
                              className="text-[11px] font-semibold py-1 px-1.5 rounded-lg border border-stone-300 dark:border-white/15 bg-white dark:bg-[#1d3540] text-stone-800 dark:text-stone-200"
                              title="Bu sınavın sınıfını değiştir"
                            >
                              <option value={1}>1. Sınıf</option>
                              <option value={2}>2. Sınıf</option>
                              <option value={3}>3. Sınıf</option>
                              <option value={4}>4. Sınıf</option>
                              <option value={0}>Genel</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Import Options */}
              <div className="pt-2 border-t border-stone-200 dark:border-white/10 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                  />
                  <span>Mevcut kayıtları temizleyip sıfırdan ekle</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-stone-200 dark:border-white/10 bg-stone-50/80 dark:bg-white/[0.03] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 text-xs font-medium rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
          >
            Vazgeç
          </button>

          {parsedResult && (
            <button
              onClick={handleConfirmImport}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-transform flex items-center gap-2"
            >
              <span>Seçilenleri Takvime Ekle</span>
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px]">
                {selectedCourseIds.size + selectedExamIds.size}
              </span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
