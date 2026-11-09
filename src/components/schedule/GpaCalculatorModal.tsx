/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Not & GNO (Harf Notu ve Ortalama) Hesaplama Modalı
 * Vize-Final hedef simülatörü ve dönemlik/genel GNO hesaplayıcısı.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calculator,
  Target,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Check,
  TrendingUp,
  BookOpen,
  Info
} from 'lucide-react';
import { CourseItem, GpaCourseItem } from '../../types/schedule';
import {
  K7_LETTER_GRADE_SCALE,
  calculateCourseWeightedScore,
  calculateRequiredFinalScore,
  calculateSemesterGpa,
  calculateCumulativeGpa,
  getStoredGpaCourses,
  saveStoredGpaCourses,
  syncGpaCoursesFromSchedule,
  scoreToLetterGrade,
  GPA_CHANGED_EVENT
} from '../../lib/gpaCalculator';
import { useModalScrollLock } from '../../lib/scrollLock';
import toast from 'react-hot-toast';

interface GpaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseItem[];
}

export default function GpaCalculatorModal({
  isOpen,
  onClose,
  courses
}: GpaCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'simulator' | 'gpa'>('simulator');

  // Simulator tab state
  const [vizeScore, setVizeScore] = useState<number>(65);
  const [targetGrade, setTargetGrade] = useState<string>('CC');
  const [vizeWeight, setVizeWeight] = useState<number>(40);
  const finalWeight = 100 - vizeWeight;

  // GPA tab state
  const [gpaCourses, setGpaCourses] = useState<GpaCourseItem[]>([]);
  const [prevGpa, setPrevGpa] = useState<string>('');
  const [prevCredits, setPrevCredits] = useState<string>('');

  useModalScrollLock(isOpen);

  // Load initial courses
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredGpaCourses();
      if (stored.length > 0) {
        setGpaCourses(stored);
      } else {
        const synced = syncGpaCoursesFromSchedule(courses);
        setGpaCourses(synced);
      }
    }
  }, [isOpen, courses]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Final Solver result
  const solverResult = calculateRequiredFinalScore(vizeScore, targetGrade, vizeWeight, finalWeight);

  // Semester GPA result
  const semesterGpa = calculateSemesterGpa(gpaCourses);

  // Cumulative GPA calculation
  const parsedPrevGpa = parseFloat(prevGpa) || 0;
  const parsedPrevCredits = parseInt(prevCredits, 10) || 0;
  const cumulativeGpa = parsedPrevCredits > 0
    ? calculateCumulativeGpa(parsedPrevGpa, parsedPrevCredits, semesterGpa.gpa, semesterGpa.totalCredits)
    : null;

  const handleUpdateCourse = (id: string, updates: Partial<GpaCourseItem>) => {
    const next = gpaCourses.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setGpaCourses(next);
    saveStoredGpaCourses(next);
  };

  const handleAddCustomCourse = () => {
    const newCourse: GpaCourseItem = {
      id: `custom-gpa-${Date.now()}`,
      courseCode: `DERS ${gpaCourses.length + 1}`,
      courseName: `Yeni Ders ${gpaCourses.length + 1}`,
      credits: 4,
      vize: null,
      vizeWeight: 40,
      final: null,
      finalWeight: 60,
      isCustom: true
    };
    const next = [...gpaCourses, newCourse];
    setGpaCourses(next);
    saveStoredGpaCourses(next);
    toast.success('Yeni ders eklendi.');
  };

  const handleDeleteCourse = (id: string) => {
    const next = gpaCourses.filter((c) => c.id !== id);
    setGpaCourses(next);
    saveStoredGpaCourses(next);
  };

  const handleSyncFromSchedule = () => {
    const synced = syncGpaCoursesFromSchedule(courses);
    setGpaCourses(synced);
    toast.success('Ders programınızdaki kayıtlı dersler aktarıldı.');
  };

  const handleResetScores = () => {
    if (window.confirm('Tüm girilen notlar sıfırlansın mı?')) {
      const reset = gpaCourses.map((c) => ({
        ...c,
        vize: null,
        final: null,
        letterGrade: undefined
      }));
      setGpaCourses(reset);
      saveStoredGpaCourses(reset);
      toast.success('Notlar temizlendi.');
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-[2px] z-0"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl max-h-[92vh] bg-[#fcfbf9] dark:bg-[#1d3540] rounded-3xl shadow-2xl border border-stone-200 dark:border-white/10 flex flex-col overflow-hidden text-stone-900 dark:text-white modal-gpu-layer"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between bg-stone-50/70 dark:bg-white/5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-extrabold tracking-tight leading-none text-stone-900 dark:text-white">
                  Not & GNO Hesaplayıcı
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-white/60 mt-0.5">
                  K7AÜ 4'lük Harf Notu Tablosu & Vize-Final Hedef Simülatörü
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Navigation Tabs */}
          <div className="px-5 py-2.5 bg-stone-100/90 dark:bg-white/5 border-b border-stone-200/70 dark:border-white/10 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-white/10 text-[#8a2a43] dark:text-[#f4a261] shadow-xs border border-stone-200/80 dark:border-white/10'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Finalden Kaç Almalıyım?</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gpa')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gpa'
                  ? 'bg-white dark:bg-white/10 text-[#8a2a43] dark:text-[#f4a261] shadow-xs border border-stone-200/80 dark:border-white/10'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Dönemlik & Genel GNO</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-xs sm:text-sm">
            {activeTab === 'simulator' ? (
              /* TAB 1: FINAL GOAL SIMULATOR */
              <div className="space-y-5">
                {/* Simulator Inputs Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shadow-xs space-y-4">
                  {/* Vize Score Input & Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-800 dark:text-stone-200">
                        Vize Sınavı Notunuz:
                      </label>
                      <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-900 dark:text-amber-200 font-mono font-extrabold text-base border border-amber-500/25">
                        {vizeScore}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vizeScore}
                      onChange={(e) => setVizeScore(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-2 bg-stone-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8a2a43]"
                    />

                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>0 (En Düşük)</span>
                      <span>50</span>
                      <span>100 (Tam Puan)</span>
                    </div>
                  </div>

                  {/* Target Grade Selector */}
                  <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-white/5">
                    <label className="font-bold text-stone-800 dark:text-stone-200 block">
                      Hedeflediğiniz Harf Notu:
                    </label>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {K7_LETTER_GRADE_SCALE.slice(0, 6).map((scale) => (
                        <button
                          key={scale.grade}
                          type="button"
                          onClick={() => setTargetGrade(scale.grade)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            targetGrade === scale.grade
                              ? 'bg-[#8a2a43] text-white border-[#8a2a43] shadow-md shadow-[#8a2a43]/20 font-bold scale-102'
                              : 'bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10'
                          }`}
                        >
                          <span className="block text-sm font-extrabold">{scale.grade}</span>
                          <span className="block text-[10px] opacity-80">{scale.points.toFixed(1)} Katsayı</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weight Percentage Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-white/5 text-xs text-stone-500 dark:text-stone-400">
                    <span>Sınav Ağırlığı:</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <button
                        type="button"
                        onClick={() => setVizeWeight(40)}
                        className={`px-2.5 py-1 rounded-lg border cursor-pointer ${
                          vizeWeight === 40
                            ? 'bg-stone-800 text-white dark:bg-white dark:text-stone-900 border-transparent'
                            : 'border-stone-200 dark:border-white/10'
                        }`}
                      >
                        %40 Vize / %60 Final (Standart)
                      </button>

                      <button
                        type="button"
                        onClick={() => setVizeWeight(50)}
                        className={`px-2.5 py-1 rounded-lg border cursor-pointer ${
                          vizeWeight === 50
                            ? 'bg-stone-800 text-white dark:bg-white dark:text-stone-900 border-transparent'
                            : 'border-stone-200 dark:border-white/10'
                        }`}
                      >
                        %50 / %50
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calculation Result Card */}
                <div
                  className={`p-5 rounded-2xl border text-center space-y-3 transition-all ${
                    !solverResult.isPossible
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                      : solverResult.requiredScore <= 50
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-80">
                    Final Sınavında Almanız Gereken Asgari Not
                  </span>

                  <div className="font-display font-black text-4xl sm:text-5xl tracking-tight">
                    {solverResult.requiredScore}
                    <span className="text-xl font-bold opacity-75"> / 100</span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium max-w-md mx-auto leading-relaxed">
                    {solverResult.message}
                  </p>
                </div>

                {/* Official K7AÜ Scale Legend */}
                <div className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 space-y-1.5 text-stone-600 dark:text-stone-300">
                  <span className="text-[11px] font-bold block text-stone-900 dark:text-white">
                    K7AÜ Not Dağılım Baremi (Referans Tablo):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    {K7_LETTER_GRADE_SCALE.map((s) => (
                      <div key={s.grade} className="flex items-center justify-between pr-2">
                        <strong>{s.grade} ({s.points.toFixed(1)}):</strong>
                        <span>{s.minScore}-{s.maxScore} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: SEMESTER & CUMULATIVE GPA CALCULATOR */
              <div className="space-y-4">
                {/* GPA Dashboard Top Ribbon */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1d3540] to-[#264653] text-white shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                        Dönemlik Ağırlıklı Not Ortalaması (GNO)
                      </span>
                      <div className="text-3xl sm:text-4xl font-display font-black">
                        {semesterGpa.gpa.toFixed(2)}
                        <span className="text-base font-normal text-white/60"> / 4.00</span>
                      </div>
                    </div>

                    {/* Honor Badge */}
                    {semesterGpa.gpa >= 3.5 ? (
                      <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Yüksek Onur</span>
                      </div>
                    ) : semesterGpa.gpa >= 3.0 ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Onur Öğrencisi</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-xl bg-white/10 text-white/80 font-bold text-xs">
                        <span>{semesterGpa.gpa >= 2.0 ? 'Başarılı' : 'Sınamalı'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/70 border-t border-white/10 pt-2.5">
                    <span>Toplam: <strong>{semesterGpa.totalCredits} AKTS</strong></span>
                    <span>Başarılan: <strong>{semesterGpa.passedCredits} AKTS</strong></span>
                    <span>Notlandırılan: <strong>{semesterGpa.gradedCourseCount} / {gpaCourses.length} Ders</strong></span>
                  </div>
                </div>

                {/* Cumulative Forecast Row */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-bold">Önceki Dönemler ile Kümülatif GNO:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Önceki GNO (örn: 2.85)"
                      value={prevGpa}
                      onChange={(e) => setPrevGpa(e.target.value)}
                      className="w-28 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-white/15 bg-stone-50 dark:bg-white/5 font-semibold text-xs"
                    />

                    <input
                      type="number"
                      placeholder="AKTS (örn: 60)"
                      value={prevCredits}
                      onChange={(e) => setPrevCredits(e.target.value)}
                      className="w-24 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-white/15 bg-stone-50 dark:bg-white/5 font-semibold text-xs"
                    />

                    {cumulativeGpa !== null && (
                      <span className="px-3 py-1.5 rounded-lg bg-[#8a2a43] text-white font-extrabold text-xs shrink-0">
                        Yeni GNO: {cumulativeGpa.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Course List Actions Bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-stone-700 dark:text-stone-300">
                    Dönem Dersleri ({gpaCourses.length})
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSyncFromSchedule}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Programdan Çek</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddCustomCourse}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#8a2a43] hover:bg-[#722237] text-white text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ders Ekle</span>
                    </button>
                  </div>
                </div>

                {/* Course List Items */}
                <div className="space-y-2.5">
                  {gpaCourses.map((c) => {
                    const weighted = calculateCourseWeightedScore(c.vize, c.final, c.vizeWeight, c.finalWeight);
                    const calculatedGrade = weighted !== null ? scoreToLetterGrade(weighted) : null;

                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        {/* Course Name & Credit */}
                        <div className="min-w-[140px] flex-1">
                          <span className="text-[10px] font-bold text-stone-400 block">
                            {c.courseCode}
                          </span>
                          <strong className="text-stone-900 dark:text-white block leading-tight">
                            {c.courseName}
                          </strong>
                        </div>

                        {/* Credit Selector */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-stone-400">AKTS:</span>
                          <select
                            value={c.credits}
                            onChange={(e) => handleUpdateCourse(c.id, { credits: parseInt(e.target.value, 10) || 1 })}
                            className="px-2 py-1 rounded-lg border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-800 font-bold"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cr) => (
                              <option key={cr} value={cr}>
                                {cr}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Vize Input */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-stone-400">Vize:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Not"
                            value={c.vize ?? ''}
                            onChange={(e) =>
                              handleUpdateCourse(c.id, {
                                vize: e.target.value === '' ? null : Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0))
                              })
                            }
                            className="w-14 px-2 py-1 rounded-lg border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-800 font-mono font-bold text-center"
                          />
                        </div>

                        {/* Final Input */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-stone-400">Final:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Not"
                            value={c.final ?? ''}
                            onChange={(e) =>
                              handleUpdateCourse(c.id, {
                                final: e.target.value === '' ? null : Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0))
                              })
                            }
                            className="w-14 px-2 py-1 rounded-lg border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-800 font-mono font-bold text-center"
                          />
                        </div>

                        {/* Direct Letter Grade override or calculated */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`w-11 py-1 rounded-lg font-bold text-center border font-mono ${
                              calculatedGrade
                                ? calculatedGrade.points >= 2.0
                                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                                  : calculatedGrade.points >= 1.0
                                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                                  : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30'
                                : 'bg-stone-100 dark:bg-white/10 text-stone-400 border-transparent'
                            }`}
                          >
                            {calculatedGrade ? calculatedGrade.grade : '-'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1.5 text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Bu dersi hesaplamadan çıkar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-stone-200/80 dark:border-white/10 bg-stone-50/70 dark:bg-white/5 flex items-center justify-between text-xs text-stone-500 shrink-0">
            {activeTab === 'gpa' && (
              <button
                type="button"
                onClick={handleResetScores}
                className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Notları Sıfırla</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#8a2a43] hover:bg-[#722237] text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer ml-auto"
            >
              Tamam
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
