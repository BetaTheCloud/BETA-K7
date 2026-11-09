/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Ders Programı Görsel İhracı (PNG & Story) Modalı
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Share2,
  Smartphone,
  Monitor,
  ImageDown,
  Check,
  Calendar,
  Layers
} from 'lucide-react';
import { CourseItem } from '../../types/schedule';
import {
  ScheduleImageFormat,
  downloadScheduleImage,
  shareScheduleImage
} from '../../lib/scheduleImageExport';
import { useModalScrollLock } from '../../lib/scrollLock';
import toast from 'react-hot-toast';

interface ScheduleExportImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseItem[];
  activeGrade?: number;
}

export default function ScheduleExportImageModal({
  isOpen,
  onClose,
  courses,
  activeGrade = 1
}: ScheduleExportImageModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ScheduleImageFormat>('story');
  const [isExporting, setIsExporting] = useState(false);

  useModalScrollLock(isOpen);

  if (!isOpen || typeof document === 'undefined') return null;

  const enrolledCount = courses.filter((c) => c.isEnrolled).length;
  const gradeLabel = activeGrade === 0 ? 'Ortak / Seçmeli' : `${activeGrade}. Sınıf`;

  const handleDownload = async () => {
    if (enrolledCount === 0) {
      toast.error('Görsel oluşturmak için kayıtlı en az bir ders bulunmalıdır.');
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading('Yüksek çözünürlüklü program görseli hazırlanıyor...');
    try {
      await downloadScheduleImage(courses, selectedFormat, 'Ders Programı');
      toast.success(
        selectedFormat === 'story'
          ? 'Story formatında (9:16) PNG görseli cihazınıza indirildi!'
          : 'Yatay formatta (16:9) PNG görseli cihazınıza indirildi!',
        { id: toastId }
      );
      onClose();
    } catch {
      toast.error('Görsel oluşturulurken bir sorun meydana geldi.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (enrolledCount === 0) {
      toast.error('Paylaşmak için kayıtlı en az bir ders bulunmalıdır.');
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading('Paylaşım menüsü hazırlanıyor...');
    try {
      const shared = await shareScheduleImage(courses, selectedFormat, 'Ders Programı');
      if (shared) {
        toast.success('Ders programı görseli paylaşıldı!', { id: toastId });
        onClose();
      } else {
        toast.dismiss(toastId);
      }
    } catch {
      toast.error('Paylaşım sırasında bir sorun oluştu.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3.5 sm:p-5 overflow-hidden">
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
          className="relative z-10 w-full max-w-lg bg-[#fcfbf9] dark:bg-[#1d3540] rounded-3xl shadow-2xl border border-stone-200 dark:border-white/10 flex flex-col overflow-hidden text-stone-900 dark:text-white modal-gpu-layer"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between bg-stone-50/70 dark:bg-white/5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ImageDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-extrabold tracking-tight leading-none text-stone-900 dark:text-white">
                  K7AÜ Ajanda
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-white/60 mt-0.5">
                  Program Şeması • HD Görsel İndir & Paylaş
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

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
            {/* Format Selector Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Görsel Formatı Seçin:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Story / Dikey */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('story')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    selectedFormat === 'story'
                      ? 'bg-[#8a2a43]/10 dark:bg-[#8a2a43]/20 border-[#8a2a43] text-stone-900 dark:text-white ring-2 ring-[#8a2a43]/40'
                      : 'bg-stone-50/80 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#8a2a43]/15 text-[#8a2a43] dark:text-rose-300 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    {selectedFormat === 'story' && (
                      <span className="w-5 h-5 rounded-full bg-[#8a2a43] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                      Story & Durum (9:16)
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                      1080 x 1920 piksel. Instagram Story, WhatsApp Durumu veya kilit ekranı için dikey akış.
                    </p>
                  </div>
                </button>

                {/* 2. Landscape / Yatay */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('landscape')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    selectedFormat === 'landscape'
                      ? 'bg-[#8a2a43]/10 dark:bg-[#8a2a43]/20 border-[#8a2a43] text-stone-900 dark:text-white ring-2 ring-[#8a2a43]/40'
                      : 'bg-stone-50/80 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#264653]/15 text-[#264653] dark:text-teal-300 flex items-center justify-center">
                      <Monitor className="w-4 h-4" />
                    </div>
                    {selectedFormat === 'landscape' && (
                      <span className="w-5 h-5 rounded-full bg-[#8a2a43] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                      Masaüstü & Haftalık (16:9)
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                      1920 x 1080 piksel. 5 sütunlu klasik tam hafta tablosu. WhatsApp grupları ve tablet için.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Program Info Card */}
            <div className="p-3.5 rounded-2xl bg-stone-100/90 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">Aktif Program:</span>
                <strong className="text-stone-900 dark:text-white">{gradeLabel}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">Dahil Edilecek Ders:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {enrolledCount} Adet Kayıtlı Ders
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">Çözünürlük & Kalite:</span>
                <span className="text-stone-700 dark:text-stone-300">
                  {selectedFormat === 'story' ? '1080x1920 Full HD' : '1920x1080 Full HD (PNG)'}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-stone-200/80 dark:border-white/10 bg-stone-50/70 dark:bg-white/5 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-200/80 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/15 text-stone-800 dark:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              <span>Paylaş</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#722237] text-white text-xs font-bold shadow-md shadow-[#8a2a43]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Hazırlanıyor...' : 'PNG Olarak İndir'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
