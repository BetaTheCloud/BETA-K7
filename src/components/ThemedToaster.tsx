import React, { useMemo } from 'react';
import { useToaster, resolveValue, toast, Toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Image as ImageIcon,
  Sparkles,
  X,
  Copy,
  Calendar,
  Bell,
  RefreshCw,
  Check,
  Palette,
  FileText
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

    const isCalendar = text.includes('takvim') || text.includes('.ics') || iconStr === '📅';
    const isFileDownload = text.includes('indirildi') || text.includes('.k7plan') || iconStr === '📥';
    const isCopy = text.includes('kopyalandı') || text.includes('panoya');
    const isSchedule = text.includes('ders') || text.includes('sınav') || text.includes('şablon');
    const isSync = text.includes('canlı') || text.includes('senkronizasyon') || text.includes('güncellendi');
    const isNotification = text.includes('bildirim') || iconStr === '🔕';
    const isTheme = text.includes('tema') || text.includes('yazı tipi') || iconStr === '🎨' || iconStr === '🔤';

    let category:
      | 'image'
      | 'calendar'
      | 'download'
      | 'copy'
      | 'schedule'
      | 'sync'
      | 'notification'
      | 'theme'
      | 'error'
      | 'loading'
      | 'success' = 'success';

    if (t.type === 'error') {
      category = 'error';
    } else if (t.type === 'loading') {
      category = 'loading';
    } else if (isImage) {
      category = 'image';
    } else if (isCalendar) {
      category = 'calendar';
    } else if (isFileDownload) {
      category = 'download';
    } else if (isCopy) {
      category = 'copy';
    } else if (isTheme) {
      category = 'theme';
    } else if (isNotification) {
      category = 'notification';
    } else if (isSchedule) {
      category = 'schedule';
    } else if (isSync) {
      category = 'sync';
    } else {
      category = 'success';
    }

    // Category Badge text, theme gradients, and icons
    let badgeText = 'K7AÜ Kampüs';
    let avatarGradient = 'from-[#264653] via-[#2a9d8f] to-emerald-600';
    let progressGradient = 'from-[#264653] via-[#2a9d8f] to-amber-500';
    let subtitleText: string | null = null;
    let badgeColorClass = 'text-amber-700 dark:text-amber-400';

    switch (category) {
      case 'image':
        badgeText = 'Galeri & İndirme';
        avatarGradient = 'from-[#8a2a43] via-[#a33250] to-[#e76f51]';
        progressGradient = 'from-[#8a2a43] via-[#e76f51] to-amber-500';
        badgeColorClass = 'text-[#8a2a43] dark:text-[#f4a261]';
        subtitleText = 'Cihazınızın fotoğraf galerisinde görüntülenebilir.';
        break;

      case 'download':
      case 'calendar':
        badgeText = category === 'calendar' ? 'Akademik Takvim' : 'Dosya İndirildi';
        avatarGradient = 'from-[#e76f51] via-[#f4a261] to-amber-500';
        progressGradient = 'from-[#e76f51] via-[#f4a261] to-amber-400';
        badgeColorClass = 'text-amber-700 dark:text-amber-400';
        subtitleText = 'Dosya cihazınıza başarıyla aktarıldı.';
        break;

      case 'copy':
        badgeText = 'Panoya Kopyalandı';
        avatarGradient = 'from-[#264653] via-[#3a6073] to-[#2a9d8f]';
        progressGradient = 'from-[#264653] via-[#2a9d8f] to-teal-400';
        badgeColorClass = 'text-teal-700 dark:text-teal-300';
        break;

      case 'schedule':
        badgeText = 'Ders & Sınav Takvimi';
        avatarGradient = 'from-[#8a2a43] via-[#b53a5b] to-[#f4a261]';
        progressGradient = 'from-[#8a2a43] via-[#e76f51] to-amber-400';
        badgeColorClass = 'text-[#8a2a43] dark:text-[#f4a261]';
        break;

      case 'notification':
        badgeText = 'Hatırlatıcı & Bildirim';
        avatarGradient = 'from-[#3a0ca3] via-[#4361ee] to-[#7209b7]';
        progressGradient = 'from-[#3a0ca3] via-[#4361ee] to-amber-400';
        badgeColorClass = 'text-indigo-600 dark:text-indigo-400';
        break;

      case 'sync':
        badgeText = 'Canlı Senkronizasyon';
        avatarGradient = 'from-[#264653] via-[#2a9d8f] to-emerald-500';
        progressGradient = 'from-[#264653] via-[#2a9d8f] to-emerald-400';
        badgeColorClass = 'text-emerald-700 dark:text-emerald-400';
        break;

      case 'theme':
        badgeText = 'Görünüm & Tema';
        avatarGradient = 'from-[#7209b7] via-[#8a2a43] to-[#e76f51]';
        progressGradient = 'from-[#7209b7] via-[#8a2a43] to-amber-500';
        badgeColorClass = 'text-purple-600 dark:text-purple-400';
        break;

      case 'error':
        badgeText = 'İşlem Başarısız';
        avatarGradient = 'from-[#8a2a43] via-[#c1121f] to-rose-600';
        progressGradient = 'from-rose-600 via-rose-500 to-red-400';
        badgeColorClass = 'text-rose-600 dark:text-rose-400';
        subtitleText = 'Lütfen tekrar deneyin veya ayarları kontrol edin.';
        break;

      case 'loading':
        badgeText = 'İşlem Sürüyor';
        avatarGradient = 'from-[#8a2a43] via-[#e76f51] to-amber-500';
        progressGradient = 'from-[#8a2a43] via-[#e76f51] to-amber-400';
        badgeColorClass = 'text-amber-700 dark:text-amber-400';
        break;

      case 'success':
      default:
        badgeText = 'İşlem Başarılı';
        avatarGradient = 'from-[#264653] via-[#2a9d8f] to-emerald-600';
        progressGradient = 'from-[#264653] via-[#2a9d8f] to-amber-500';
        badgeColorClass = 'text-emerald-700 dark:text-emerald-400';
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
      subtitleText
    };
  }, [messageStr, t.icon, t.id, t.type]);

  const durationSec = ((t.duration || 3500) as number) / 1000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.92, filter: 'blur(3px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{
        opacity: 0,
        y: -16,
        scale: 0.95,
        filter: 'blur(2px)',
        transition: { duration: 0.18, ease: [0.32, 0.72, 0, 1] }
      }}
      transition={{
        type: 'spring',
        damping: 26,
        stiffness: 360,
        mass: 0.75
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
      <div className="p-3.5 sm:p-4 flex items-start gap-3.5">
        {/* Animated Themed Icon Avatar */}
        <div className="shrink-0 relative">
          <motion.div
            initial={{ scale: 0.6, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 280 }}
            className={cn(
              'relative w-11 h-11 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white shadow-md overflow-hidden',
              context.avatarGradient
            )}
          >
            {/* Subtle background pulse animation aura */}
            <motion.div
              animate={{
                opacity: [0.15, 0.45, 0.15],
                scale: [1, 1.25, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 bg-white/20 rounded-xl pointer-events-none"
            />

            {/* Core Icon */}
            {context.category === 'image' ? (
              <ImageIcon className="w-5 h-5 text-white/95" />
            ) : context.category === 'download' ? (
              <Download className="w-5 h-5 text-white/95" />
            ) : context.category === 'calendar' ? (
              <Calendar className="w-5 h-5 text-white/95" />
            ) : context.category === 'copy' ? (
              <Copy className="w-5 h-5 text-white/95" />
            ) : context.category === 'schedule' ? (
              <Calendar className="w-5 h-5 text-white/95" />
            ) : context.category === 'notification' ? (
              <Bell className="w-5 h-5 text-white/95" />
            ) : context.category === 'sync' ? (
              <RefreshCw className="w-5 h-5 text-white/95" />
            ) : context.category === 'theme' ? (
              <Palette className="w-5 h-5 text-white/95" />
            ) : context.category === 'loading' ? (
              <Loader2 className="w-5 h-5 text-white/95 animate-spin" />
            ) : context.category === 'error' ? (
              <AlertCircle className="w-5 h-5 text-white/95" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-white/95" />
            )}

            {/* Little floating animated status badge on top/right corner */}
            {context.category !== 'loading' && (
              <motion.div
                initial={{ scale: 0, y: 4 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', damping: 12 }}
                className={cn(
                  'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-[#1d3540]',
                  context.category === 'error'
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-400 text-stone-950'
                )}
              >
                {context.category === 'error' ? (
                  <span className="text-[11px] font-black leading-none">!</span>
                ) : (
                  <Check className="w-3 h-3 stroke-[3]" />
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Text Section */}
        <div className="flex-1 min-w-0 pr-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'text-[10px] font-bold tracking-wider uppercase',
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
