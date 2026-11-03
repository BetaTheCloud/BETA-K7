/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Temaya Uygun Bildirim ve Toast Yöneticisi
 * Profesyonel, vektörel SVG ikonlar ve kurumsal akademik renk paleti ile donatılmıştır.
 */

import React, { useMemo } from 'react';
import { useToaster, resolveValue, toast, Toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Download,
  FileDown,
  Image as ImageIcon,
  Sparkles,
  X,
  Copy,
  CheckCheck,
  Calendar,
  CalendarDays,
  Bell,
  BellOff,
  BellRing,
  RefreshCw,
  Palette,
  Type,
  Lock,
  Unlock,
  Radio,
  Wifi,
  Database,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ThemedToastProps {
  toast: Toast;
  key?: React.Key;
}

export function ThemedToastItem({ toast: t }: ThemedToastProps) {
  const rawMessage = resolveValue(t.message, t);
  const messageStr = typeof rawMessage === 'string' ? rawMessage : '';

  // Classify toast context for theme-native presentation
  const context = useMemo(() => {
    const text = messageStr.toLowerCase();
    const iconStr = typeof t.icon === 'string' ? t.icon : '';

    const isImage =
      t.id === 'img-download-toast' ||
      iconStr === '🖼️' ||
      text.includes('görsel') ||
      text.includes('galeri') ||
      text.includes('fotoğraf') ||
      text.includes('resim');

    const isFont =
      text.includes('yazı tipi') ||
      text.includes('font') ||
      iconStr === '🔤';

    const isTheme =
      (!isFont && text.includes('tema')) ||
      text.includes('renk paleti') ||
      iconStr === '🎨';

    const isSecurity =
      text.includes('parola') ||
      text.includes('kilitlendi') ||
      text.includes('kilidi') ||
      iconStr === '🔒' ||
      iconStr === '🔓';

    const isServer =
      text.includes('sunucu') ||
      text.includes('bağlantı') ||
      iconStr === '🟢';

    const isNotificationOff =
      text.includes('bildirimler kapatıldı') ||
      text.includes('bildirim kapatıldı') ||
      iconStr === '🔕';

    const isNotificationOn =
      !isNotificationOff &&
      (text.includes('bildirim') ||
        text.includes('hatırlatıcı') ||
        iconStr === '🔔');

    const isCalendar =
      text.includes('takvim') ||
      text.includes('.ics') ||
      iconStr === '📅';

    const isFileDownload =
      text.includes('indirildi') ||
      text.includes('.k7plan') ||
      text.includes('.pdf') ||
      iconStr === '📥';

    const isCopy =
      text.includes('kopyalandı') ||
      text.includes('panoya');

    const isSchedule =
      text.includes('ders') ||
      text.includes('sınav') ||
      text.includes('şablon');

    const isSync =
      text.includes('canlı') ||
      text.includes('senkronizasyon') ||
      text.includes('güncellendi');

    const isCache =
      text.includes('önbellek') ||
      iconStr === '📦';

    let category:
      | 'font'
      | 'theme'
      | 'security'
      | 'server'
      | 'notification-off'
      | 'notification-on'
      | 'image'
      | 'calendar'
      | 'download'
      | 'copy'
      | 'schedule'
      | 'sync'
      | 'cache'
      | 'error'
      | 'loading'
      | 'success' = 'success';

    if (t.type === 'error') {
      category = 'error';
    } else if (t.type === 'loading') {
      category = 'loading';
    } else if (isSecurity) {
      category = 'security';
    } else if (isFont) {
      category = 'font';
    } else if (isTheme) {
      category = 'theme';
    } else if (isNotificationOff) {
      category = 'notification-off';
    } else if (isNotificationOn) {
      category = 'notification-on';
    } else if (isServer) {
      category = 'server';
    } else if (isImage) {
      category = 'image';
    } else if (isCalendar) {
      category = 'calendar';
    } else if (isFileDownload) {
      category = 'download';
    } else if (isCopy) {
      category = 'copy';
    } else if (isCache) {
      category = 'cache';
    } else if (isSchedule) {
      category = 'schedule';
    } else if (isSync) {
      category = 'sync';
    } else {
      category = 'success';
    }

    // Category styling & SVG vector icon mapping
    let badgeText = 'K7AÜ KAMPÜS';
    let avatarGradient = 'from-[#264653] via-[#2a9d8f] to-emerald-600';
    let progressGradient = 'from-[#264653] via-[#2a9d8f] to-amber-500';
    let subtitleText: string | null = null;
    let badgeColorClass = 'text-emerald-700 dark:text-emerald-400';
    let iconElement: React.ReactNode = <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.2} />;

    switch (category) {
      case 'font':
        badgeText = 'YAZI TİPİ & TİPOGRAFİ';
        avatarGradient = 'from-[#8a2a43] via-[#a33250] to-[#b83a5c]';
        progressGradient = 'from-[#8a2a43] via-[#b83a5c] to-amber-400';
        badgeColorClass = 'text-[#8a2a43] dark:text-[#f4a261]';
        iconElement = <Type className="w-5 h-5 text-white" strokeWidth={2.3} />;
        subtitleText = 'Uygulama genelindeki metin ailesi güncellendi.';
        break;

      case 'theme':
        badgeText = 'GÖRÜNÜM & TEMA';
        avatarGradient = 'from-[#264653] via-[#355b6c] to-[#2a9d8f]';
        progressGradient = 'from-[#264653] via-[#2a9d8f] to-teal-400';
        badgeColorClass = 'text-teal-700 dark:text-teal-300';
        iconElement = <Palette className="w-5 h-5 text-white" strokeWidth={2.2} />;
        subtitleText = 'Renk paleti ve arayüz tonları uygulandı.';
        break;

      case 'security':
        badgeText = 'GÜVENLİK AYARLARI';
        avatarGradient = 'from-[#9a3412] via-[#c2410c] to-[#ea580c]';
        progressGradient = 'from-[#9a3412] via-[#c2410c] to-amber-400';
        badgeColorClass = 'text-amber-700 dark:text-amber-400';
        iconElement = text.includes('açıldı') ? (
          <Unlock className="w-5 h-5 text-white" strokeWidth={2.2} />
        ) : (
          <Lock className="w-5 h-5 text-white" strokeWidth={2.2} />
        );
        break;

      case 'server':
        badgeText = 'SUNUCU BAĞLANTISI';
        avatarGradient = 'from-[#065f46] via-[#047857] to-[#059669]';
        progressGradient = 'from-[#047857] via-[#059669] to-teal-400';
        badgeColorClass = 'text-emerald-700 dark:text-emerald-400';
        iconElement = <Radio className="w-5 h-5 text-white" strokeWidth={2.2} />;
        break;

      case 'notification-off':
        badgeText = 'BİLDİRİM KAPATILDI';
        avatarGradient = 'from-[#475569] via-[#64748b] to-[#78889b]';
        progressGradient = 'from-slate-600 via-slate-500 to-slate-400';
        badgeColorClass = 'text-slate-600 dark:text-slate-300';
        iconElement = <BellOff className="w-5 h-5 text-white" strokeWidth={2.2} />;
        break;

      case 'notification-on':
        badgeText = 'BİLDİRİM & HATIRLATICI';
        avatarGradient = 'from-[#8a2a43] via-[#b83a5c] to-[#e76f51]';
        progressGradient = 'from-[#8a2a43] via-[#e76f51] to-amber-400';
        badgeColorClass = 'text-[#8a2a43] dark:text-[#f4a261]';
        iconElement = <BellRing className="w-5 h-5 text-white" strokeWidth={2.2} />;
        break;

      case 'image':
        badgeText = 'GALERİ & MEDYA';
        avatarGradient = 'from-[#8a2a43] via-[#a33250] to-[#e76f51]';
        progressGradient = 'from-[#8a2a43] via-[#e76f51] to-amber-500';
        badgeColorClass = 'text-[#8a2a43] dark:text-[#f4a261]';
        iconElement = <ImageIcon className="w-5 h-5 text-white" strokeWidth={2.2} />;
        subtitleText = 'Cihazınızın fotoğraf galerisinde görüntülenebilir.';
        break;

      case 'download':
        badgeText = 'DOSYA İNDİRİLDİ';
        avatarGradient = 'from-[#0d5c63] via-[#197278] to-[#2a9d8f]';
        progressGradient = 'from-[#0d5c63] via-[#2a9d8f] to-emerald-400';
        badgeColorClass = 'text-teal-700 dark:text-teal-300';
        iconElement = <FileDown className="w-5 h-5 text-white" strokeWidth={2.2} />;
        subtitleText = 'Dosya cihazınıza başarıyla aktarıldı.';
        break;

      case 'calendar':
        badgeText = 'AKADEMİK TAKVİM';
        avatarGradient = 'from-[#264653] via-[#2a9d8f] to-amber-500';
        progressGradient = 'from-[#264653] via-[#2a9d8f] to-amber-400';
        badgeColorClass = 'text-amber-700 dark:text-amber-400';
        iconElement = <Calendar className="w-5 h-5 text-white" strokeWidth={2.2} />;
        break;

      case 'copy':
        badgeText = 'PANOYA KOPYALANDI';
        avatarGradient = 'from-[#1e3a47] via-[#264653] to-[#2a9d8f]';
        progressGradient = 'from-[#1e3a47] via-[#2a9d8f] to-teal-400';
        badgeColorClass = 'text-teal-700 dark:text-teal-300';
        iconElement = <CheckCheck className="w-5 h-5 text-white" strokeWidth={2.2} />;
        break;

      case 'schedule':
        badgeText = 'DERS & SINAV TAKVİMİ';
        avatarGradient = 'from-[#8a2a43] via-[#9e324f] to-[#e76f51]';
        progressGradient = 'from-[#8a2a43] via-[#e76f51] to-amber-400';
        badgeColorClass = 'text-[#8a2a43] dark:text-[#f4a261]';
        iconElement = <CalendarDays className="w-5 h-5 text-white" strokeWidth={2.2} />;
        break;

      case 'sync':
        badgeText = 'CANLI SENKRONİZASYON';
        avatarGradient = 'from-[#047857] via-[#059669] to-[#10b981]';
        progressGradient = 'from-[#047857] via-[#059669] to-teal-400';
        badgeColorClass = 'text-emerald-700 dark:text-emerald-400';
        iconElement = <RefreshCw className="w-5 h-5 text-white" strokeWidth={2.2} />;
        break;

      case 'cache':
        badgeText = 'ÖNBELLEK MODU';
        avatarGradient = 'from-[#334155] via-[#475569] to-[#64748b]';
        progressGradient = 'from-slate-600 to-slate-400';
        badgeColorClass = 'text-slate-600 dark:text-slate-300';
        iconElement = <Database className="w-5 h-5 text-white" strokeWidth={2.2} />;
        break;

      case 'error':
        badgeText = 'BİLGİ / HATA';
        avatarGradient = 'from-[#8a2a43] via-[#b91c1c] to-[#dc2626]';
        progressGradient = 'from-rose-600 via-rose-500 to-red-400';
        badgeColorClass = 'text-rose-600 dark:text-rose-400';
        iconElement = <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.2} />;
        subtitleText = subtitleText || 'Lütfen tekrar deneyin veya ayarları kontrol edin.';
        break;

      case 'loading':
        badgeText = 'İŞLEM SÜRÜYOR';
        avatarGradient = 'from-[#8a2a43] via-[#d97706] to-[#f59e0b]';
        progressGradient = 'from-[#8a2a43] via-[#d97706] to-amber-400';
        badgeColorClass = 'text-amber-700 dark:text-amber-400';
        iconElement = <Loader2 className="w-5 h-5 text-white animate-spin" strokeWidth={2.2} />;
        break;

      case 'success':
      default:
        badgeText = 'İŞLEM BAŞARILI';
        avatarGradient = 'from-[#264653] via-[#2a9d8f] to-[#059669]';
        progressGradient = 'from-[#264653] via-[#2a9d8f] to-emerald-500';
        badgeColorClass = 'text-emerald-700 dark:text-emerald-400';
        iconElement = <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.2} />;
        break;
    }

    // Split compound text if separated by colon (e.g. "Dilekçe indirme bağlantısı kopyalandı: https://...")
    let displayTitle = messageStr;
    if (messageStr.includes(':') && category === 'copy') {
      const parts = messageStr.split(':');
      displayTitle = parts[0].trim();
      subtitleText = parts.slice(1).join(':').trim();
    }

    return {
      category,
      badgeText,
      badgeColorClass,
      avatarGradient,
      progressGradient,
      displayTitle,
      subtitleText,
      iconElement
    };
  }, [messageStr, t.icon, t.id, t.type]);

  const durationSec = ((t.duration || 3500) as number) / 1000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        y: -14,
        scale: 0.95,
        transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] }
      }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => toast.dismiss(t.id)}
      className={cn(
        'group relative w-full max-w-[390px] sm:max-w-md mx-auto overflow-hidden rounded-2xl cursor-pointer pointer-events-auto',
        'bg-[#fcfbf9]/95 dark:bg-[#1d3540]/95 backdrop-blur-xl',
        'border border-[#e6e2d6] dark:border-white/15',
        'shadow-[0_12px_36px_-6px_rgba(38,70,83,0.18)] dark:shadow-[0_16px_45px_-8px_rgba(0,0,0,0.65)]',
        'transition-shadow duration-200 select-none'
      )}
      role="status"
      aria-live="polite"
    >
      {/* Top subtle ambient university highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 dark:via-amber-400/30 to-transparent pointer-events-none" />

      {/* Main Content Area */}
      <div className="p-3.5 sm:p-4 flex items-center gap-3.5">
        {/* Animated Themed Icon Avatar - Pure Vector Lucide, Zero Emojis */}
        <div className="shrink-0 relative">
          <motion.div
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 18,
              stiffness: 300,
              mass: 0.7
            }}
            className={cn(
              'relative w-11 h-11 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-white shadow-md shadow-stone-900/10 ring-1 ring-white/25 overflow-hidden',
              context.avatarGradient
            )}
          >
            {/* Subtle inner radial sheen */}
            <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/10 pointer-events-none" />

            {/* Subtle ambient breathing aura */}
            <motion.div
              animate={{
                opacity: [0.1, 0.35, 0.1],
                scale: [0.95, 1.15, 0.95]
              }}
              transition={{
                repeat: Infinity,
                duration: 2.4,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 bg-white/20 rounded-2xl pointer-events-none"
            />

            {/* Vector SVG Icon: Perfectly centered, unclipped, and razor-sharp */}
            <div className="relative z-10 flex items-center justify-center w-full h-full drop-shadow-xs">
              {context.iconElement}
            </div>
          </motion.div>
        </div>

        {/* Text Section */}
        <div className="flex-1 min-w-0 pr-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'text-[10px] font-bold tracking-wider uppercase font-display',
                context.badgeColorClass
              )}
            >
              {context.badgeText}
            </span>
          </div>

          <div className="text-xs sm:text-[13px] font-semibold text-stone-900 dark:text-white leading-snug break-words">
            {typeof rawMessage === 'string' ? context.displayTitle : rawMessage}
          </div>

          {context.subtitleText && (
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight pt-0.5 truncate">
              {context.subtitleText}
            </p>
          )}
        </div>

        {/* Tactile Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss(t.id);
          }}
          className="shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Bildirimi Kapat"
          aria-label="Kapat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Animated Micro-Timer Progress Bar at bottom */}
      {t.duration && t.duration !== Infinity && (
        <div className="w-full h-1 bg-stone-200/50 dark:bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{
              duration: durationSec,
              ease: 'linear'
            }}
            className={cn('h-full bg-gradient-to-r', context.progressGradient)}
          />
        </div>
      )}
    </motion.div>
  );
}

/**
 * Universal Themed Toaster for the K7AÜ Application.
 * Powered by react-hot-toast hook + Framer Motion AnimatePresence.
 * Ensures butter-smooth entrance, pristine exit with zero-bounce/zero-flicker,
 * and unified theme styling for every action across the entire app.
 */
export default function ThemedToaster() {
  const { toasts, handlers } = useToaster({
    duration: 3500
  });

  return (
    <div
      onMouseEnter={handlers.startPause}
      onMouseLeave={handlers.endPause}
      className="fixed z-[999999] top-[calc(env(safe-area-inset-top,0px)+1.25rem)] left-0 right-0 pointer-events-none flex flex-col items-center gap-2.5 px-4"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts
          .filter((t) => t.visible)
          .map((t) => (
            <ThemedToastItem key={t.id} toast={t} />
          ))}
      </AnimatePresence>
    </div>
  );
}
