/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Paylaşılabilir Ders ve Sınav Programı Şablon Modalı
 */

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Download,
  Copy,
  Upload,
  Check,
  FileText,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  FileCode,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CourseItem, ExamItem } from '../../types/schedule';
import {
  ScheduleExportPackage,
  SAMPLE_TEMPLATES,
  createScheduleExportPackage,
  downloadSchedulePackage,
  copySchedulePackageToClipboard,
  shareSchedulePackage,
  parseAndValidateSchedulePackage,
  applySchedulePackage
} from '../../lib/scheduleTemplate';

interface ScheduleTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplied: () => void;
  currentCourses: CourseItem[];
  currentExams: ExamItem[];
  initialMode?: 'export' | 'import';
}

export default function ScheduleTemplateModal({
  isOpen,
  onClose,
  onApplied,
  currentCourses,
  currentExams,
  initialMode = 'export'
}: ScheduleTemplateModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialMode);

  // --- Export State ---
  const [exportTitle, setExportTitle] = useState(() => {
    return currentCourses[0]?.department
      ? `${currentCourses[0].department} Ders & Sınav Programı`
      : 'K7AÜ Ders & Sınav Programım';
  });
  const [exportDepartment, setExportDepartment] = useState(() => currentCourses[0]?.department || '');
  const [exportGrade, setExportGrade] = useState<number>(() => currentCourses[0]?.grade || 1);
  const [exportDescription, setExportDescription] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // --- Import State ---
  const [importInputMode, setImportInputMode] = useState<'file' | 'text'>('file');
  const [pastedJson, setPastedJson] = useState('');
  const [stagedPackage, setStagedPackage] = useState<ScheduleExportPackage | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || typeof document === 'undefined') return null;

  // Handle Export File Download
  const handleDownloadFile = () => {
    if (currentCourses.length === 0 && currentExams.length === 0) {
      toast.error('Dışa aktarılacak kayıtlı ders veya sınav bulunmuyor.');
      return;
    }

    const pkg = createScheduleExportPackage({
      title: exportTitle,
      department: exportDepartment,
      grade: exportGrade,
      description: exportDescription,
      selectedCourses: currentCourses,
      selectedExams: currentExams
    });

    downloadSchedulePackage(pkg);
    toast.success('Şablon dosyası (.k7plan) indirildi!', { icon: '📥' });
  };

  // Handle Copy to Clipboard
  const handleCopyCode = async () => {
    if (currentCourses.length === 0 && currentExams.length === 0) {
      toast.error('Dışa aktarılacak kayıtlı ders veya sınav bulunmuyor.');
      return;
    }

    const pkg = createScheduleExportPackage({
      title: exportTitle,
      department: exportDepartment,
      grade: exportGrade,
      description: exportDescription,
      selectedCourses: currentCourses,
      selectedExams: currentExams
    });

    const success = await copySchedulePackageToClipboard(pkg);
    if (success) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
      toast.success('Şablon metni panoya kopyalandı! Arkadaşınıza yapıştırıp gönderebilirsiniz.');
    } else {
      toast.error('Panoya kopyalama başarısız oldu.');
    }
  };

  // Handle Native Mobile Share
  const handleNativeShare = async () => {
    const pkg = createScheduleExportPackage({
      title: exportTitle,
      department: exportDepartment,
      grade: exportGrade,
      description: exportDescription,
      selectedCourses: currentCourses,
      selectedExams: currentExams
    });

    const shared = await shareSchedulePackage(pkg);
    if (shared) {
      toast.success('Paylaşım menüsü açıldı.');
    }
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseAndValidateSchedulePackage(content);
      if (res.success && res.package) {
        setStagedPackage(res.package);
        toast.success(`Şablon incelendi: ${res.package.summary.courseCount} ders, ${res.package.summary.examCount} sınav tespit edildi.`);
      } else {
        toast.error(res.error || 'Dosya okunamadı veya geçersiz şablon biçimi.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Handle Parse Pasted JSON
  const handleParsePastedJson = () => {
    const res = parseAndValidateSchedulePackage(pastedJson);
    if (res.success && res.package) {
      setStagedPackage(res.package);
      toast.success(`Şablon incelendi: ${res.package.summary.courseCount} ders, ${res.package.summary.examCount} sınav bulundu.`);
    } else {
      toast.error(res.error || 'Yapıştırılan metin geçerli bir şablon formatı içermiyor.');
    }
  };

  // Handle Apply Staged Package
  const handleApplyPackage = () => {
    if (!stagedPackage) return;

    applySchedulePackage(stagedPackage, importMode);
    toast.success(
      importMode === 'replace'
        ? `Yeni program uygulandı (${stagedPackage.summary.courseCount} ders, ${stagedPackage.summary.examCount} sınav).`
        : `Ders ve sınavlar mevcut programınıza eklendi.`
    );
    onApplied();
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/70 dark:bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative w-full max-w-xl bg-[#faf8f5] dark:bg-[#14232c] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-white/10 overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-black/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-tight">
                  Program Şablonu Paylaş & İçe Aktar
                </h3>
                <p className="text-xs text-stone-500 dark:text-white/60">
                  Ders ve sınav takviminizi dosyaya aktarın veya hazır program yükleyin
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Kapat"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="p-2 sm:p-2.5 bg-stone-100/90 dark:bg-black/30 border-b border-stone-200/80 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2 p-1 bg-stone-200/60 dark:bg-white/5 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('export')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'export'
                    ? 'bg-[#8a2a43] text-white shadow-sm'
                    : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Programımı Dışa Aktar (Paylaş)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'import'
                    ? 'bg-[#8a2a43] text-white shadow-sm'
                    : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Şablon Yükle (İçe Aktar)</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            {/* ================= TAB 1: EXPORT (DIŞA AKTAR) ================= */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                {/* Current Program Stats Card */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-800 dark:text-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Aktarılacak Mevcut Program
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-white/50">
                      Format: .k7plan (JSON)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-white">
                      <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{currentCourses.length} Ders</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>{currentExams.length} Sınav</span>
                    </div>
                  </div>
                </div>

                {/* Metadata Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      Şablon Başlığı / Açıklaması
                    </label>
                    <input
                      type="text"
                      value={exportTitle}
                      onChange={(e) => setExportTitle(e.target.value)}
                      placeholder="Örn: Bilgisayar Mühendisliği 2. Sınıf Güz Dönemi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-900/50 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Bölüm / Program
                      </label>
                      <input
                        type="text"
                        value={exportDepartment}
                        onChange={(e) => setExportDepartment(e.target.value)}
                        placeholder="Örn: Mimarlık, Hemşirelik..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-900/50 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Sınıf
                      </label>
                      <select
                        value={exportGrade}
                        onChange={(e) => setExportGrade(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-900/50 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                      >
                        <option value={0}>Genel / Tüm Sınıflar</option>
                        <option value={1}>1. Sınıf</option>
                        <option value={2}>2. Sınıf</option>
                        <option value={3}>3. Sınıf</option>
                        <option value={4}>4. Sınıf</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Share & Download Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleDownloadFile}
                    className="w-full py-3 px-4 rounded-xl bg-[#8a2a43] hover:bg-[#721f34] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Şablon Dosyasını İndir (.k7plan)</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="py-2.5 px-3 rounded-xl bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/15 text-stone-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                    >
                      {copiedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-300">Kopyalandı!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Şablon Kodunu Kopyala</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-amber-500/20 cursor-pointer active:scale-98"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Arkadaşla Paylaş</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-100 dark:bg-white/5 text-[11px] text-stone-500 dark:text-white/60 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <span>
                    İndirilen <strong>.k7plan</strong> dosyasını veya kopyalanan kodu WhatsApp, Telegram ya da e-posta ile arkadaşlarınızla paylaşabilirsiniz. Arkadaşınız bu dosyayı kendi K7AÜ uygulamasına yüklediğinde dersler ve sınavlar eksiksiz olarak ekranına gelecektir.
                  </span>
                </div>
              </div>
            )}

            {/* ================= TAB 2: IMPORT (İÇE AKTAR) ================= */}
            {activeTab === 'import' && (
              <div className="space-y-4">
                {/* Secondary sub-tabs for import method */}
                <div className="flex items-center gap-1.5 p-1 bg-stone-200/50 dark:bg-white/5 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setImportInputMode('file')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                      importInputMode === 'file'
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold'
                        : 'text-stone-600 dark:text-white/60'
                    }`}
                  >
                    Dosya Yükle (.k7plan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportInputMode('text')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                      importInputMode === 'text'
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold'
                        : 'text-stone-600 dark:text-white/60'
                    }`}
                  >
                    Kod / Metin Yapıştır
                  </button>
                </div>

                {/* Sub-mode 1: File Upload */}
                {importInputMode === 'file' && (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".k7plan,.json,application/json,text/plain"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-stone-300 dark:border-white/15 hover:border-amber-500 dark:hover:border-amber-400 bg-white/60 dark:bg-white/2 hover:bg-amber-500/5 text-center cursor-pointer transition-all group flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-700 dark:text-amber-300 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                          Cihazınızdan .k7plan veya .json dosyası seçin
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-white/50 mt-0.5">
                          Arkadaşınızın paylaştığı program dosyasını seçmek için tıklayın
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-mode 2: Text Paste */}
                {importInputMode === 'text' && (
                  <div className="space-y-3">
                    <textarea
                      rows={5}
                      value={pastedJson}
                      onChange={(e) => setPastedJson(e.target.value)}
                      placeholder='Arkadaşınızın kopyaladığı şablon kodunu buraya yapıştırın {"format": "k7au_schedule_template", ...}'
                      className="w-full p-3 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-900/50 text-xs font-mono text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                    />
                    <button
                      type="button"
                      onClick={handleParsePastedJson}
                      disabled={!pastedJson.trim()}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98 transition-all"
                    >
                      <FileCode className="w-4 h-4" />
                      <span>Kodu Çözümle ve İncele</span>
                    </button>
                  </div>
                )}

                {/* Staged Package Preview & Apply Area */}
                {stagedPackage && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/60 border border-emerald-500/40 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Şablon Hazır & Doğrulandı
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {new Date(stagedPackage.exportedAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                        {stagedPackage.metadata.title}
                      </h4>
                      {stagedPackage.metadata.department && (
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Bölüm: {stagedPackage.metadata.department} {stagedPackage.metadata.grade ? `(${stagedPackage.metadata.grade}. Sınıf)` : ''}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold">
                        {stagedPackage.summary.courseCount} Ders
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-800 dark:text-rose-300 font-bold">
                        {stagedPackage.summary.examCount} Sınav
                      </span>
                    </div>

                    {/* Merge or Replace Choice */}
                    <div className="pt-2 border-t border-stone-200/80 dark:border-white/10 space-y-2">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                        Uygulama Şekli:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setImportMode('replace')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                            importMode === 'replace'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                              : 'bg-stone-100 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-white/60'
                          }`}
                        >
                          Mevcut Programı Değiştir
                          <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                            Eskileri siler, sadece bu şablonu koyar
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setImportMode('merge')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                            importMode === 'merge'
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                              : 'bg-stone-100 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-white/60'
                          }`}
                        >
                          Üzerine Ekle (Birleştir)
                          <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                            Mevcut derslerinizi korur, bunları da ekler
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleApplyPackage}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Şablonu Programa Uygula ve Kaydet</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
