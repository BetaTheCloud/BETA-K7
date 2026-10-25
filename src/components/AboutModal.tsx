/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Geliştirici Hakkında & Şeffaflık Karşılama Ekranı
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  Mail,
  Code2,
  ArrowRight,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

export const ABOUT_STORAGE_KEY = 'k7_about_seen_v1';

interface AboutContentProps {
  isModal?: boolean;
}

export function AboutContent({ isModal = false }: AboutContentProps) {
  return (
    <div className="space-y-4 text-stone-700 dark:text-stone-300">
      {/* Top Hero Layout: Spacious Logo Badge & Restored BETA Badge */}
      <div className="flex flex-col items-center justify-center text-center pt-1 pb-3">
        {/* Spacious, unconstrained Emblem Badge */}
        <div className="relative group mb-3">
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 dark:bg-white/5 border border-amber-500/25 dark:border-white/10 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:border-amber-500/40">
            <picture>
              <source srcSet="/beta_dev_logo.webp" type="image/webp" />
              <img
                src="/beta_dev_logo.png"
                alt="BETA Amblem"
                loading="eager"
                decoding="sync"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('beta_dev_logo.png')) {
                    target.src = '/beta_dev_logo.png';
                  }
                }}
              />
            </picture>
          </div>
        </div>

        {/* Restored Previous Styled BETA Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-linear-to-r from-amber-500/15 via-[#8a2a43]/15 to-amber-500/15 border border-amber-500/30 text-stone-900 dark:text-white shadow-xs">
          <span className="font-display font-black text-lg sm:text-xl tracking-[0.3em] uppercase">
            BETA
          </span>
        </div>
      </div>

      {/* Main Narrative Paragraphs */}
      <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed">
        <p className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-white/5 border border-stone-200/80 dark:border-white/5">
          <strong className="text-stone-900 dark:text-white font-bold block mb-1">
            Geliştirici Hakkında
          </strong>
          Merhaba, ben <span className="font-bold text-stone-900 dark:text-white">BETA</span>. Yazılım ve mühendislik alanlarında 13 yılı aşkın profesyonel deneyime sahip, günümüzün birçok modern programlama diline hâkim bağımsız bir geliştiriciyim.
        </p>

        <p className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-white/5 border border-stone-200/80 dark:border-white/5">
          <strong className="text-stone-900 dark:text-white font-bold block mb-1">
            Telif Hakları & Teknolojik Altyapı
          </strong>
          Kaynak kodları tamamen özgün olup, tüm hakları tarafıma (<span className="font-semibold text-stone-900 dark:text-white">Davut ŞAHİN</span>) aittir. Geliştirme sürecinde TypeScript, JavaScript (ESNext & CommonJS), HTML5, CSS3 & Tailwind CSS, JSON ve daha birçok modern teknoloji ile altyapı kullanılmıştır.
        </p>

        <p className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-white/5 border border-stone-200/80 dark:border-white/5">
          <strong className="text-stone-900 dark:text-white font-bold block mb-1">
            Gizlilik ve Veri Güvenliği
          </strong>
          Bu uygulamayı hiçbir ticari amaç gütmeden geliştirdim. Uygulama, kullanıcı verisi toplamamakta olup kullanılan tüm bilgiler kamuya açık kaynaklardan derlenmiştir. Sunucularda hiçbir veri depolanmamakta, veriler yalnızca kullanıcının kendi cihazında muhafaza edilmektedir.
        </p>

        <div className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-white/5 border border-stone-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <strong className="text-stone-900 dark:text-white font-bold block mb-0.5">
              İletişim & Destek
            </strong>
            <p className="text-xs">
              Uygulama ile ilgili herhangi bir sorun yaşamanız durumunda iletişime geçebilirsiniz.
            </p>
          </div>
          <a
            href="mailto:beta.arkas@gmail.com"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all active:scale-95 shrink-0 shadow-sm"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>beta.arkas@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}

interface AboutModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
  onProceed?: () => void;
}

export default function AboutModal({ forceOpen = false, onClose, onProceed }: AboutModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // First time check
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    try {
      const seen = localStorage.getItem(ABOUT_STORAGE_KEY);
      if (!seen) {
        // Show About first on initial launch
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [forceOpen]);

  // Listen to custom event to reopen anytime
  useEffect(() => {
    const handleReopen = () => {
      setIsOpen(true);
    };
    window.addEventListener('k7_open_about_modal', handleReopen);
    return () => {
      window.removeEventListener('k7_open_about_modal', handleReopen);
    };
  }, []);

  const handleConfirmAndProceed = () => {
    try {
      localStorage.setItem(ABOUT_STORAGE_KEY, 'true');
    } catch {}
    setIsOpen(false);
    if (onClose) onClose();
    if (onProceed) {
      onProceed();
    } else {
      // Trigger the welcome guide modal to open next!
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('k7_open_welcome_guide'));
      }, 200);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(ABOUT_STORAGE_KEY, 'true');
    } catch {}
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative z-10 w-full max-w-lg max-h-[92vh] flex flex-col bg-[#fcfbf9] dark:bg-[#1d3540] rounded-3xl shadow-2xl border border-stone-200 dark:border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between bg-[#fcfbf9] dark:bg-[#264653] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-white/10 border border-amber-500/25 p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src="/beta_dev_logo.png"
                    alt="BETA"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('beta_dev_logo.png')) {
                        target.src = '/beta_dev_logo.png';
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-display font-extrabold text-stone-900 dark:text-white leading-tight">
                    Hakkımda
                  </h2>
                  <span className="text-[10px] text-stone-500 dark:text-white/50">
                    Geliştirici ve Gizlilik Bilgilendirmesi
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-xl hover:bg-stone-200/70 dark:hover:bg-white/10 text-stone-500 dark:text-stone-300 transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
              <AboutContent isModal={true} />
            </div>

            {/* Footer with Confirmation & Proceed Button */}
            <div className="p-4 border-t border-stone-200/80 dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653] flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-stone-500 dark:text-white/50 hidden sm:inline">
                K7AÜ Kampüs Dijital
              </span>
              <button
                type="button"
                onClick={handleConfirmAndProceed}
                className="w-full sm:w-auto ml-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#721f34] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span>Anladım, Devam Et</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
