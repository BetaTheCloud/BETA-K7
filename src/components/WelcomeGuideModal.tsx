/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - K7AÜ Dijital Kampüs Tanıtım ve Karşılama Rehberi
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Megaphone,
  Newspaper,
  ChefHat,
  CalendarClock,
  GraduationCap,
  Landmark,
  Users,
  Building2,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Smartphone
} from 'lucide-react';
import K7Logo from './K7Logo';

export const WELCOME_STORAGE_KEY = 'k7_welcome_guide_seen_v1';

interface WelcomeGuideModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function WelcomeGuideModal({ forceOpen = false, onClose }: WelcomeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'academic' | 'campus' | 'tools'>('all');

  // Lock body scroll while modal is visible
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    // If explicitly forced open via props
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // Check localStorage for first-time visit
    try {
      const seen = localStorage.getItem(WELCOME_STORAGE_KEY);
      if (!seen) {
        // Small delay for smooth entry after DOM paint
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, [forceOpen]);

  // Listen to custom event to reopen anytime
  useEffect(() => {
    const handleReopen = () => {
      setActiveCategory('all');
      setIsOpen(true);
    };
    window.addEventListener('k7_open_welcome_guide', handleReopen);
    return () => {
      window.removeEventListener('k7_open_welcome_guide', handleReopen);
    };
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const featureCards = [
    {
      id: 'announcements',
      category: 'academic',
      title: 'Üniversite & Bölüm Duyuruları',
      badge: 'Akademik & İdari',
      icon: Megaphone,
      iconBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20',
      description: 'Rektörlük ve üniversite geneli duyuruların yanı sıra tüm fakülte, enstitü ve meslek yüksekokullarının güncel duyurularını tek ekrandan inceleyin.'
    },
    {
      id: 'news',
      category: 'academic',
      title: 'Bölüm & Üniversite Haberleri',
      badge: 'Güncel Akış',
      icon: Newspaper,
      iconBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
      description: 'Kampüsteki akademik gelişmeler, sempozyumlar, etkinlikler, duyurulan projeler ve birim bazlı haber akışlarını fotoğraflı detaylarıyla takip edin.'
    },
    {
      id: 'calendar',
      category: 'academic',
      title: 'Akademik Takvim & Sayaçlar',
      badge: 'Sınav & Kayıt',
      icon: CalendarClock,
      iconBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20',
      description: 'Güz ve bahar yarıyılı başlangıç-bitiş tarihleri, vize-final takvimleri ve kayıt süreçleri. Etkinlikleri Google Calendar ve .ics olarak takviminize tek tıkla aktarın.'
    },
    {
      id: 'menu',
      category: 'campus',
      title: 'Günlük Yemekhane Menüsü',
      badge: 'Beslenme',
      icon: ChefHat,
      iconBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      description: 'Merkez ve Karataş yerleşkelerindeki öğle ve akşam yemek listeleri, kalori değerleri, vejetaryen seçenekler ve alerjen bilgilendirmeleri.'
    },
    {
      id: 'schedule',
      category: 'academic',
      title: 'Kişisel Ders Programı',
      badge: 'Öğrenci Özel',
      icon: Calendar,
      iconBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20',
      description: 'Kendi haftalık ders programınızı oluşturun, ders saatlerini ve derslikleri kaydedin; yaklaşan derslerinizi ana sayfadan anlık takip edin.'
    },
    {
      id: 'directory',
      category: 'campus',
      title: 'Personel & Dahili Rehber',
      badge: 'İletişim',
      icon: Users,
      iconBg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
      description: 'Rektörlük, dekanlıklar, öğretim üyeleri ve daire başkanlıklarının dahili telefon numaralarına, e-posta adreslerine ve birim listesine anında ulaşın.'
    },
    {
      id: 'campus',
      category: 'campus',
      title: 'Kampüs Hizmetleri & Yerleşkeler',
      badge: 'Tesisler',
      icon: Building2,
      iconBg: 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/20',
      description: 'Merkez, Karataş ve Mercidabık yerleşkeleri, kütüphane çalışma saatleri, spor tesisleri, uygulama oteli, ulaşım ve öğrenci formları.'
    },
    {
      id: 'bologna',
      category: 'academic',
      title: 'Bologna Bilgi Paketi',
      badge: 'Müfredat',
      icon: Landmark,
      iconBg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
      description: 'Tüm bölümlerin ders planları, AKTS kredi yükleri, ders kazanımları ve mezuniyet koşullarına doğrudan resmi sistem üzerinden erişin.'
    },
    {
      id: 'themes',
      category: 'tools',
      title: 'K7AÜ Logo Teması & Kişiselleştirme',
      badge: 'Özelleştirme',
      icon: SlidersHorizontal,
      iconBg: 'bg-[#8a2a43]/15 text-[#8a2a43] dark:text-[#d46682] border-[#8a2a43]/20',
      description: 'K7AÜ kurumsal bordo ve lacivert renk teması, açık ve koyu mod desteği, ana sayfa widget sıralama ve yazı tipi boyutu ayarları.'
    },
    {
      id: 'offline',
      category: 'tools',
      title: 'PWA & Çevrimdışı Çalışma',
      badge: 'Hızlı & Güvenli',
      icon: Smartphone,
      iconBg: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/20',
      description: 'Uygulamayı telefonunuza veya bilgisayarınıza ana ekran ikonu olarak yükleyebilir, internetiniz zayıfken veya kesildiğinde bile verilerinizi görüntüleyebilirsiniz.'
    }
  ];

  const filteredCards = activeCategory === 'all'
    ? featureCards
    : featureCards.filter((card) => card.category === activeCategory);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-5 md:p-6 overflow-hidden pointer-events-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-modal-title"
        >
          {/* Backdrop with balanced dimming */}
          <motion.div
            key="welcome-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Symmetrical Modal Card (Clean balanced side margins on both mobile and desktop) */}
          <motion.div
            key="welcome-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[86dvh] sm:max-h-[84vh] bg-[#fcfbf9] dark:bg-[#1f3844] border border-[#e6e2d6] dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 font-sans mx-auto"
          >
            {/* Header: Symmetrical, Harmonious & Centered */}
            <div className="relative px-5 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5 bg-gradient-to-br from-[#363d50] to-[#8a2a43] text-white border-b border-white/10 shrink-0 text-center">
              {/* Close Button Positioned in Symmetrical Header Corner */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer border border-white/15 active:scale-95"
                title="Pencereyi Kapat"
                aria-label="Pencereyi Kapat"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {/* Centered Brand Stack */}
              <div className="flex flex-col items-center">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner mb-2.5">
                  <K7Logo className="w-10 h-10 sm:w-11 sm:h-11" />
                </div>

                {/* Institutional Tag in Pure Turkish Title Case */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-semibold text-amber-200 border border-white/15 mb-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Kilis 7 Aralık Üniversitesi</span>
                </div>

                <h2
                  id="welcome-modal-title"
                  className="text-lg sm:text-2xl font-display font-extrabold text-white tracking-tight leading-tight"
                >
                  K7AÜ Dijital Kampüs Rehberi
                </h2>

                <p className="mt-1.5 text-xs sm:text-sm text-white/85 leading-relaxed max-w-xl mx-auto font-normal">
                  Öğrencilerimiz ve personelimiz için geliştirilen akademik sistemler, fakülte duyuruları, ders ve sınav programı, Bologna bilgi paketi ve kampüs servisleri tek bir dijital platformda.
                </p>
              </div>

              {/* Symmetrical Highlights Strip on Medium+ screens */}
              <div className="hidden sm:grid grid-cols-4 gap-2 pt-3 mt-3.5 border-t border-white/10 text-[11px] font-medium text-white/90">
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tek Tıkla Erişim</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Çevrimdışı Çalışır</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>K7AÜ Kurumsal Tema</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Ders Programı</span>
                </div>
              </div>
            </div>

            {/* Category Tabs Filter - Balanced & Centered */}
            <div className="px-4 sm:px-6 py-2.5 bg-stone-100/80 dark:bg-black/25 border-b border-[#e6e2d6] dark:border-white/5 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'all' as const, label: 'Tüm Özellikler' },
                { id: 'academic' as const, label: 'Akademik & Dersler' },
                { id: 'campus' as const, label: 'Kampüs & Yaşam' },
                { id: 'tools' as const, label: 'Kişiselleştirme' }
              ].map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#363d50] dark:bg-amber-500 text-white dark:text-stone-950 shadow-xs font-bold'
                        : 'bg-white dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200/70 dark:hover:bg-white/10 border border-stone-200/60 dark:border-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Features Scrollable Body - Symmetrical Side Paddings */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {filteredCards.map((feat) => {
                  const IconComponent = feat.icon;
                  return (
                    <div
                      key={feat.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#264653]/70 border border-[#e6e2d6] dark:border-white/10 shadow-xs hover:border-[#8a2a43]/40 dark:hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className={`p-2 rounded-xl border ${feat.iconBg}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 border border-stone-200 dark:border-white/10">
                            {feat.badge}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-xs sm:text-sm text-stone-900 dark:text-white leading-snug group-hover:text-[#8a2a43] dark:group-hover:text-amber-400 transition-colors">
                          {feat.title}
                        </h3>
                        <p className="mt-1 text-[11px] sm:text-xs text-stone-600 dark:text-white/70 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions - Minimalized & Sleek */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-stone-50/90 dark:bg-[#1a2e38]/90 border-t border-[#e6e2d6] dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Tekrar açmak için: Üst bardaki <span className="font-medium text-stone-600 dark:text-white/70">Rehber</span> butonu</span>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#363d50] to-[#8a2a43] hover:from-[#2e3444] hover:to-[#782339] text-white text-xs sm:text-sm font-bold tracking-wide shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0 sm:ml-auto"
              >
                <span>Anladım, Keşfetmeye Başla</span>
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
