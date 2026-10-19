/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Kusursuz, Huzurlu & Modern Uygulama Ayarları
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  X,
  Settings,
  SlidersHorizontal,
  LayoutGrid,
  Type,
  Server,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Check,
  Globe,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  CloudSun,
  Search,
  ChefHat,
  Newspaper,
  Megaphone,
  CalendarDays,
  GraduationCap,
  PhoneCall,
  Layers,
  BookOpen,
  CalendarClock,
  Users,
  Calendar,
  MapPin,
  Trophy,
  FileText,
  Bus,
  Hotel,
  Landmark,
  Palette,
  SunMedium,
  MoonStar,
  SunMoon,
  Laptop,
  HelpCircle
} from 'lucide-react';
import HorizontalScrollWrapper from './HorizontalScrollWrapper';
import {
  WidgetConfig,
  WidgetId,
  getHomeWidgetConfigs,
  moveWidget,
  toggleWidgetVisibility,
  resetHomeWidgetConfigs,
  saveHomeWidgetConfigs
} from '../lib/widgetStorage';
import {
  QuickServiceConfig,
  QuickServiceId,
  getQuickServicesConfigs,
  saveQuickServicesConfigs,
  moveQuickService,
  toggleQuickServiceVisibility,
  resetQuickServicesConfigs
} from '../lib/quickServicesStorage';
import {
  FONT_THEMES,
  FontThemeId,
  getStoredFontTheme,
  applyFontTheme
} from '../lib/fontStorage';
import {
  getEffectiveApiBase,
  setCustomApiBase,
  DEFAULT_REMOTE_API_BASE,
  isMobileAppEnvironment
} from '../config';
import { useTheme, ThemePalette } from '../hooks/useTheme';
import K7Logo from './K7Logo';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'theme' | 'quick_services' | 'widgets' | 'font' | 'server';
}

type TabId = 'theme' | 'quick_services' | 'widgets' | 'font' | 'server';

const VALID_PASSWORDS = ['Lynkas.339', 'lynkas.339'];

/** Modern, tactile iOS-style Toggle Switch */
function ToggleSwitch({
  checked,
  onChange,
  disabled
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-40 disabled:cursor-not-allowed',
        checked ? 'bg-amber-500 dark:bg-amber-500' : 'bg-stone-300 dark:bg-white/20'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

export default function AppSettingsModal({
  isOpen,
  onClose,
  initialTab = 'theme'
}: AppSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  
  // Theme management hook
  const { theme, palette, setTheme, setPalette, palettes } = useTheme();

  // Font settings state
  const [selectedFont, setSelectedFont] = useState<FontThemeId>(() => getStoredFontTheme());

  // Widget settings state
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(() => getHomeWidgetConfigs());

  // Quick Campus Services shortcuts state
  const [quickServiceConfigs, setQuickServiceConfigs] = useState<QuickServiceConfig[]>(() => getQuickServicesConfigs());

  // Password protection state for server tab
  const [isServerUnlocked, setIsServerUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Server API configuration state
  const [urlInput, setUrlInput] = useState(() => getEffectiveApiBase() || DEFAULT_REMOTE_API_BASE);
  const [testing, setTesting] = useState(false);
  const [testSeconds, setTestSeconds] = useState(0);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; isColdStart?: boolean } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setWidgetConfigs(getHomeWidgetConfigs());
      setQuickServiceConfigs(getQuickServicesConfigs());
      setUrlInput(getEffectiveApiBase() || DEFAULT_REMOTE_API_BASE);
      setTestResult(null);
      setPasswordError('');
      if (initialTab) {
        setActiveTab(initialTab);
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialTab]);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  // --- Widget Handlers ---
  const handleMoveWidget = (id: WidgetId, direction: 'up' | 'down') => {
    setWidgetConfigs((prev) => {
      const updated = moveWidget(prev, id, direction);
      saveHomeWidgetConfigs(updated);
      return updated;
    });
  };

  const handleToggleWidget = (id: WidgetId) => {
    setWidgetConfigs((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;

      const visibleCount = prev.filter((c) => c.visible).length;
      if (target.visible && visibleCount <= 1) {
        toast.error('En az bir ana sayfa bölümü açık kalmalıdır.');
        return prev;
      }

      const updated = toggleWidgetVisibility(prev, id);
      saveHomeWidgetConfigs(updated);

      if (target.visible) {
        toast.success(`"${target.title}" gizlendi`, { duration: 1500 });
      } else {
        toast.success(`"${target.title}" görünür yapıldı`, { duration: 1500 });
      }
      return updated;
    });
  };

  const handleResetWidgets = () => {
    const defaults = resetHomeWidgetConfigs();
    setWidgetConfigs(defaults);
    toast.success('Widget düzeni varsayılana sıfırlandı');
  };

  // --- Quick Services Handlers ---
  const handleMoveQuickService = (id: QuickServiceId, direction: 'up' | 'down') => {
    setQuickServiceConfigs((prev) => {
      const updated = moveQuickService(prev, id, direction);
      saveQuickServicesConfigs(updated);
      return updated;
    });
  };

  const handleToggleQuickService = (id: QuickServiceId) => {
    setQuickServiceConfigs((prev) => {
      const target = prev.find((s) => s.id === id);
      if (!target) return prev;

      const visibleCount = prev.filter((s) => s.visible).length;
      if (target.visible && visibleCount <= 2) {
        toast.error('En az 2 hızlı kısayol butonu aktif kalmalıdır.');
        return prev;
      }

      const updated = toggleQuickServiceVisibility(prev, id);
      saveQuickServicesConfigs(updated);

      if (target.visible) {
        toast.success(`"${target.title}" kısayolu gizlendi`, { duration: 1500 });
      } else {
        toast.success(`"${target.title}" kısayolu eklendi`, { duration: 1500 });
      }
      return updated;
    });
  };

  const handleResetQuickServices = () => {
    const defaults = resetQuickServicesConfigs();
    setQuickServiceConfigs(defaults);
    toast.success('Hızlı servisler varsayılana sıfırlandı');
  };

  // --- Font Handlers ---
  const handleSelectFont = (fontId: FontThemeId) => {
    setSelectedFont(fontId);
    applyFontTheme(fontId);
    const targetTheme = FONT_THEMES.find((f) => f.id === fontId);
    toast.success(`"${targetTheme?.name || fontId}" yazı tipi uygulandı!`, {
      icon: '🔤',
      duration: 2000
    });
  };

  const handleResetFont = () => {
    handleSelectFont('jakarta');
  };

  // --- Theme Handlers ---
  const handleSelectPalette = (pId: ThemePalette) => {
    setPalette(pId);
    const selected = palettes.find((p) => p.id === pId);
    toast.success(`"${selected?.name || pId}" teması uygulandı!`, {
      icon: '🎨',
      duration: 2000
    });
  };

  // --- Server / API Handlers ---
  const handleUnlockServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(passwordInput.trim())) {
      setIsServerUnlocked(true);
      setPasswordError('');
      toast.success('Gelişmiş ayarların kilidi açıldı');
    } else {
      setPasswordError('Hatalı parola! Lütfen tekrar deneyiniz.');
      toast.error('Hatalı parola');
    }
  };

  const handleLockServer = () => {
    setIsServerUnlocked(false);
    setPasswordInput('');
    setPasswordError('');
    toast('Gelişmiş ayarlar kilitlendi', { icon: '🔒' });
  };

  const handleSaveServerUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setCustomApiBase('');
      toast.success('Varsayılan yerel proxy sunucuya dönüldü');
      return;
    }

    try {
      new URL(trimmed);
      setCustomApiBase(trimmed);
      toast.success('Özel sunucu adresi başarıyla kaydedildi!');
    } catch {
      toast.error('Geçerli bir URL giriniz (örn: https://beta-k7.onrender.com)');
    }
  };

  const handleResetServerToDefault = () => {
    setUrlInput(DEFAULT_REMOTE_API_BASE);
    setCustomApiBase(DEFAULT_REMOTE_API_BASE);
    toast.success('Sunucu adresi varsayılana sıfırlandı');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestSeconds(0);
    setTestResult(null);

    const targetUrl = urlInput.trim() || DEFAULT_REMOTE_API_BASE;
    const cleanUrl = targetUrl.replace(/\/+$/, '');
    const pingUrl = `${cleanUrl}/api/ping`;

    const timer = setInterval(() => {
      setTestSeconds((s) => s + 1);
    }, 1000);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 65000);

      const res = await fetch(pingUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setTestResult({
          success: true,
          message: 'Sunucuya başarıyla bağlanıldı! Canlı servis aktif.'
        });
        toast.success('Sunucu yanıt verdi: Bağlantı Kusursuz!', { icon: '🟢' });
      } else {
        setTestResult({
          success: false,
          message: `Sunucu HTTP ${res.status} hatası döndürdü.`
        });
        toast.error(`Sunucu hatası: HTTP ${res.status}`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setTestResult({
          success: false,
          message: 'Bağlantı zaman aşımına uğradı (65 saniye). Sunucu uyku modunda olabilir.'
        });
      } else {
        setTestResult({
          success: false,
          message: `Bağlantı başarısız: ${err.message || 'Ağ hatası veya CORS kısıtlaması.'}`
        });
      }
      toast.error('Sunucuya ulaşılamadı');
    } finally {
      clearInterval(timer);
      setTesting(false);
    }
  };

  // Icon Helper for Widgets
  const getWidgetIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5' };
    switch (iconName) {
      case 'CloudSun': return <CloudSun {...props} className="text-amber-500" />;
      case 'Search': return <Search {...props} className="text-stone-500 dark:text-stone-300" />;
      case 'LayoutGrid': return <LayoutGrid {...props} className="text-emerald-500" />;
      case 'ChefHat': return <ChefHat {...props} className="text-amber-600 dark:text-amber-400" />;
      case 'Newspaper': return <Newspaper {...props} className="text-sky-500" />;
      case 'Megaphone': return <Megaphone {...props} className="text-amber-500" />;
      case 'CalendarDays': return <CalendarDays {...props} className="text-rose-500" />;
      case 'GraduationCap': return <GraduationCap {...props} className="text-purple-500" />;
      case 'BookOpen': return <BookOpen {...props} className="text-amber-600 dark:text-amber-400" />;
      case 'CalendarClock': return <CalendarClock {...props} className="text-rose-500" />;
      case 'PhoneCall': return <PhoneCall {...props} className="text-red-500" />;
      default: return <Layers {...props} className="text-stone-400" />;
    }
  };

  // Icon Helper for Quick Shortcuts
  const getQuickServiceIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5' };
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Calendar': return <Calendar {...props} />;
      case 'MapPin': return <MapPin {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'ChefHat': return <ChefHat {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'Bus': return <Bus {...props} />;
      case 'Hotel': return <Hotel {...props} />;
      case 'Landmark': return <Landmark {...props} />;
      case 'CalendarClock': return <CalendarClock {...props} />;
      case 'PhoneCall': return <PhoneCall {...props} />;
      default: return <LayoutGrid {...props} />;
    }
  };

  // Color Helper for Quick Shortcuts
  const getServiceColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'emerald': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
      case 'rose': return 'bg-rose-500/15 text-rose-600 dark:text-rose-400';
      case 'red': return 'bg-red-500/15 text-red-600 dark:text-red-400';
      case 'green': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      case 'orange': return 'bg-orange-500/15 text-orange-600 dark:text-orange-400';
      case 'indigo': return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400';
      case 'blue': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'cyan': return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400';
      case 'purple': return 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
      case 'teal': return 'bg-teal-500/15 text-teal-600 dark:text-teal-400';
      default: return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
    }
  };

  const isAndroid = isMobileAppEnvironment();
  const visibleShortcuts = quickServiceConfigs.filter((s) => s.visible);

  // Full Screen Modal Markup
  const modalMarkup = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Soft Dimming Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 dark:bg-black/75 backdrop-blur-md"
      />

      {/* Main Calm Settings Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative w-full max-w-xl bg-[#faf8f5] dark:bg-[#0d172c] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-white/10 overflow-hidden z-10 my-auto flex flex-col max-h-[88vh]"
      >
        {/* Header: Clean & Calming */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-black/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-tight">
                Uygulama Ayarları
              </h3>
              <p className="text-xs text-stone-500 dark:text-white/60">
                K7AÜ tema renkleri, kısayollar ve kişiselleştirme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('k7_open_welcome_guide'));
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-bold transition-all cursor-pointer active:scale-95"
              title="Karşılama Ekranı & Tanıtım Rehberini Aç"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Karşılama Rehberi</span>
              <span className="sm:hidden">Rehber</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Kapat"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Clean, Distinct, Spacious Primary Tabs */}
        <div className="p-2 sm:p-2.5 bg-stone-100/80 dark:bg-black/30 border-b border-stone-200/80 dark:border-white/10 shrink-0">
          <HorizontalScrollWrapper showArrows={true}>
            <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-white/5 rounded-2xl min-w-max">
              {/* 1. Tema & Renkler */}
              <button
                type="button"
                onClick={() => setActiveTab('theme')}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
                  activeTab === 'theme'
                    ? 'bg-[#8a2a43] text-white shadow-sm'
                    : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                <Palette className="w-3.5 h-3.5 shrink-0" />
                <span>Tema & Renkler</span>
              </button>

              {/* 2. Hızlı Servisler */}
              <button
                type="button"
                onClick={() => setActiveTab('quick_services')}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
                  activeTab === 'quick_services'
                    ? 'bg-[#8a2a43] text-white shadow-sm'
                    : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                <span>Hızlı Servisler</span>
              </button>

              {/* 3. Bölümler (Widget'lar) */}
              <button
                type="button"
                onClick={() => setActiveTab('widgets')}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
                  activeTab === 'widgets'
                    ? 'bg-[#8a2a43] text-white shadow-sm'
                    : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>Bölümler</span>
              </button>

              {/* 4. Yazı Tipi */}
              <button
                type="button"
                onClick={() => setActiveTab('font')}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
                  activeTab === 'font'
                    ? 'bg-[#8a2a43] text-white shadow-sm'
                    : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                <Type className="w-3.5 h-3.5 shrink-0" />
                <span>Yazı Tipi</span>
              </button>

              {/* 5. Sunucu */}
              <button
                type="button"
                onClick={() => setActiveTab('server')}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
                  activeTab === 'server'
                    ? 'bg-[#8a2a43] text-white shadow-sm'
                    : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                {isServerUnlocked ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Server className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>Sunucu</span>
              </button>
            </div>
          </HorizontalScrollWrapper>
        </div>

        {/* ================= TAB 1: TEMA & RENKLER (K7AÜ LOGO RENKLERİ) ================= */}
        {activeTab === 'theme' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-5 py-2.5 border-b border-stone-200/70 dark:border-white/5 bg-white/40 dark:bg-white/2 text-xs text-stone-500 dark:text-white/60 shrink-0">
              Kilis 7 Aralık Üniversitesi kalkan logosu ve kurumsal kimlik renklerini uygulayın.
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
              {/* 1. Görünüm Modu Seçimi: Açık / Koyu */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-white/70 block mb-2.5">
                  Görünüm Modu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Açık Mod */}
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={cn(
                      'p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer text-left',
                      theme === 'light'
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/25 shadow-sm'
                        : 'bg-white dark:bg-[#111d35] border-stone-200 dark:border-white/10 hover:border-amber-400'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <SunMedium className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">Açık Mod</div>
                        <div className="text-[11px] text-stone-500 dark:text-white/60">Gündüz & Berrak</div>
                      </div>
                    </div>
                    {theme === 'light' && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>

                  {/* Koyu Mod */}
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer text-left',
                      theme === 'dark'
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/25 shadow-sm'
                        : 'bg-white dark:bg-[#111d35] border-stone-200 dark:border-white/10 hover:border-amber-400'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <MoonStar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">Koyu Mod</div>
                        <div className="text-[11px] text-stone-500 dark:text-white/60">Gece Kalkanı</div>
                      </div>
                    </div>
                    {theme === 'dark' && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. Logo Renk Paletleri */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-white/70 block">
                    K7AÜ Logo & Renk Paleti
                  </label>
                  <span className="text-[11px] text-stone-400 dark:text-white/50">
                    Seçim anında canlı uygulanır
                  </span>
                </div>

                <div className="space-y-3">
                  {palettes.map((p) => {
                    const isSelected = palette === p.id;
                    const isK7auOfficial = p.id === 'k7au';

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPalette(p.id)}
                        className={cn(
                          'p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden',
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/25 shadow-sm'
                            : 'bg-white dark:bg-[#111d35] border-stone-200/90 dark:border-white/10 hover:border-amber-400'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            {isK7auOfficial ? (
                              <K7Logo className="w-9 h-9 shrink-0" />
                            ) : (
                              <div
                                style={{ backgroundColor: p.primaryColor }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                              >
                                <Palette className="w-4 h-4 text-white" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-stone-900 dark:text-white leading-tight">
                                  {p.name}
                                </h4>
                                {p.badge && (
                                  <span className={cn(
                                    'text-[10px] font-bold px-2 py-0.5 rounded-md',
                                    isK7auOfficial
                                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold'
                                      : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70'
                                  )}>
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 dark:text-white/60 mt-0.5 line-clamp-1">
                                {p.tagline}
                              </p>
                            </div>
                          </div>

                          {/* Checkmark selection bubble */}
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all mt-0.5',
                              isSelected
                                ? 'bg-amber-500 text-stone-950 shadow-xs ring-2 ring-amber-500/40'
                                : 'border-2 border-stone-300 dark:border-white/20'
                            )}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Color Swatches Strip */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-white/5 mt-2">
                          <div className="flex items-center gap-1.5">
                            {p.colorSwatches.map((swatch, idx) => (
                              <span
                                key={idx}
                                style={{ backgroundColor: swatch }}
                                title={swatch}
                                className="w-5 h-5 rounded-full border border-black/10 dark:border-white/20 shadow-2xs inline-block"
                              />
                            ))}
                          </div>
                          
                          <span className="text-[11px] font-mono text-stone-400 dark:text-white/40">
                            {p.primaryColor} • {p.accentColor}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-black/20 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleSelectPalette('k7au')}
                className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-white/60 hover:text-amber-600 dark:hover:text-amber-400 font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>K7AÜ Resmi Logoya Dön</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#732236] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Tamamla
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: HIZLI SERVİSLER (8'Lİ KISAYOL BUTONLARI) ================= */}
        {activeTab === 'quick_services' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-5 py-2.5 border-b border-stone-200/70 dark:border-white/5 bg-white/40 dark:bg-white/2 text-xs text-stone-500 dark:text-white/60 shrink-0">
              Ana sayfadaki hızlı servis kısayollarını açıp kapatabilir, oklarla buton sırasını belirleyebilirsiniz.
            </div>

            {/* Live Active Preview Ribbon */}
            <div className="px-5 py-2.5 bg-stone-100/60 dark:bg-white/3 border-b border-stone-200/60 dark:border-white/5 flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-stone-700 dark:text-white/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Aktif Kısayollar ({visibleShortcuts.length} Seçili):
              </span>
              <div className="flex items-center gap-1">
                {visibleShortcuts.map((s) => (
                  <span
                    key={s.id}
                    title={s.title}
                    className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px]', getServiceColorClasses(s.colorName))}
                  >
                    {getQuickServiceIcon(s.iconName)}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Services List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
              {quickServiceConfigs.map((service, index) => {
                const isFirst = index === 0;
                const isLast = index === quickServiceConfigs.length - 1;

                return (
                  <div
                    key={service.id}
                    className={cn(
                      'flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all',
                      service.visible
                        ? 'bg-white dark:bg-[#111d35] border-stone-200/90 dark:border-white/10 shadow-xs'
                        : 'bg-stone-100/60 dark:bg-white/3 border-stone-200/40 dark:border-white/5 opacity-50'
                    )}
                  >
                    {/* Left: Reorder Stepper & Icon */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveQuickService(service.id, 'up')}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 disabled:opacity-20 transition-all cursor-pointer"
                          title="Yukarı Taşı"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveQuickService(service.id, 'down')}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 disabled:opacity-20 transition-all cursor-pointer"
                          title="Aşağı Taşı"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0', getServiceColorClasses(service.colorName))}>
                        {getQuickServiceIcon(service.iconName)}
                      </div>
                    </div>

                    {/* Middle: Title & Subtitle */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                          {service.title}
                        </h4>
                        <span className="text-[11px] text-stone-400 dark:text-white/40">
                          • {service.subtitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-white/50 truncate mt-0.5">
                        {service.isModal ? 'Ajanda Açılır Penceresi' : `Hedef Menü: ${service.to}`}
                      </p>
                    </div>

                    {/* Right: Modern Tactile Toggle Switch */}
                    <div className="shrink-0 flex items-center">
                      <ToggleSwitch
                        checked={service.visible}
                        onChange={() => handleToggleQuickService(service.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-black/20 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetQuickServices}
                className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-white/60 hover:text-amber-600 dark:hover:text-amber-400 font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Varsayılan Kısayollara Dön</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#732236] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Tamamla
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: WIDGET'LAR (ANA SAYFA BÖLÜMLERİ) ================= */}
        {activeTab === 'widgets' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-5 py-2.5 border-b border-stone-200/70 dark:border-white/5 bg-white/40 dark:bg-white/2 text-xs text-stone-500 dark:text-white/60 shrink-0">
              Ana sayfa ekranındaki büyük kart bloklarını açıp kapatabilir, oklarla dikey sırasını düzenleyebilirsiniz.
            </div>

            {/* Widgets List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
              {widgetConfigs.map((widget, index) => {
                const isFirst = index === 0;
                const isLast = index === widgetConfigs.length - 1;

                return (
                  <div
                    key={widget.id}
                    className={cn(
                      'flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all',
                      widget.visible
                        ? 'bg-white dark:bg-[#111d35] border-stone-200/90 dark:border-white/10 shadow-xs'
                        : 'bg-stone-100/60 dark:bg-white/3 border-stone-200/40 dark:border-white/5 opacity-50'
                    )}
                  >
                    {/* Left: Reorder Stepper & Icon */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveWidget(widget.id, 'up')}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 disabled:opacity-20 transition-all cursor-pointer"
                          title="Yukarı Taşı"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveWidget(widget.id, 'down')}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 disabled:opacity-20 transition-all cursor-pointer"
                          title="Aşağı Taşı"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="w-10 h-10 rounded-2xl bg-stone-100/90 dark:bg-white/10 flex items-center justify-center shrink-0">
                        {getWidgetIcon(widget.iconName)}
                      </div>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-display font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                        {widget.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-white/60 line-clamp-1 mt-0.5">
                        {widget.shortDesc}
                      </p>
                    </div>

                    {/* Right: Modern Tactile Toggle Switch */}
                    <div className="shrink-0 flex items-center">
                      <ToggleSwitch
                        checked={widget.visible}
                        onChange={() => handleToggleWidget(widget.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-black/20 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetWidgets}
                className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-white/60 hover:text-amber-600 dark:hover:text-amber-400 font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Varsayılan Düzene Dön</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#732236] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Tamamla
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: YAZI TİPİ ================= */}
        {activeTab === 'font' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-5 py-2.5 border-b border-stone-200/70 dark:border-white/5 bg-white/40 dark:bg-white/2 text-xs text-stone-500 dark:text-white/60 shrink-0">
              Uygulamanın genel başlık ve gövde yazı tiplerini zevkinize göre seçin. Seçim anında canlı uygulanır.
            </div>

            {/* Font Options List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {FONT_THEMES.map((font) => {
                const isSelected = selectedFont === font.id;

                return (
                  <motion.div
                    key={font.id}
                    whileHover={{ scale: 1.006 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectFont(font.id)}
                    className={cn(
                      'p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden',
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/25 shadow-sm'
                        : 'bg-white dark:bg-[#111d35] border-stone-200/90 dark:border-white/10 hover:border-amber-400'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            style={{ fontFamily: font.fontDisplay }}
                            className="font-bold text-base text-stone-900 dark:text-white leading-tight"
                          >
                            {font.name}
                          </h4>
                          {font.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70">
                              {font.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                          {font.familyLabel}
                        </div>
                      </div>

                      {/* Selection Radio Indicator */}
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all',
                          isSelected
                            ? 'bg-amber-500 text-stone-950 shadow-xs ring-2 ring-amber-500/40'
                            : 'border-2 border-stone-300 dark:border-white/20'
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-white/70 mb-3 leading-relaxed">
                      {font.description}
                    </p>

                    {/* Live Font Specimen Preview Box */}
                    <div
                      style={{ fontFamily: font.fontSans }}
                      className="p-3 rounded-xl bg-stone-100/80 dark:bg-black/30 border border-stone-200/60 dark:border-white/10 text-xs text-stone-800 dark:text-white/90 space-y-1"
                    >
                      <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-white/40 tracking-wider">
                        Canlı Görünüm
                      </div>
                      <div
                        style={{ fontFamily: font.fontDisplay }}
                        className="font-bold text-sm text-stone-900 dark:text-white"
                      >
                        {font.previewSample}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-white/60 tabular-nums">
                        Saat 09:00 - 10:30 • Amfi 2 • BLM201 • K7AÜ Kampüs
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-black/20 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetFont}
                className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-white/60 hover:text-amber-600 dark:hover:text-amber-400 font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Varsayılan Fonta Dön</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#732236] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Tamamla
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SUNUCU & SİSTEM ================= */}
        {activeTab === 'server' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {!isServerUnlocked ? (
              /* Security Gate: Password Required */
              <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-md">
                  <Lock className="w-7 h-7" />
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                    Gelişmiş Sistem Yapılandırması
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-white/60 leading-relaxed">
                    API sunucu adresi ve ağ köprüsü kritik sistem ayarlarıdır. Yetkili erişim için parolayı giriniz.
                  </p>
                </div>

                <form onSubmit={handleUnlockServer} className="w-full max-w-xs space-y-3 pt-2">
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="Yönetici Parolası"
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-white dark:bg-black/30 border border-stone-300 dark:border-white/15 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm text-stone-900 dark:text-white placeholder:text-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {passwordError && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {passwordError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#8a2a43] hover:bg-[#732236] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Kilidi Aç</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Unlocked Server & API Configuration */
              <div className="p-4 sm:p-5 space-y-4 flex-1">
                {/* Unlocked banner with Lock button */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Gelişmiş Erişim Açık</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLockServer}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-bold transition-colors cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Kilitle</span>
                  </button>
                </div>

                {/* Status Box */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111d35] border border-stone-200 dark:border-white/10 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800 dark:text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                      Etkin API Sunucu Uç Noktası:
                    </span>
                    {isAndroid && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        Android APK
                      </span>
                    )}
                  </div>
                  <div className="font-mono break-all text-xs text-stone-700 dark:text-white/90 bg-stone-100 dark:bg-black/20 p-2.5 rounded-xl border border-stone-200/50 dark:border-white/10">
                    {getEffectiveApiBase() || DEFAULT_REMOTE_API_BASE}
                  </div>
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-white/70">
                      Sunucu URL Adresi
                    </label>
                    <button
                      type="button"
                      onClick={handleResetServerToDefault}
                      className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Varsayılana Sıfırla
                    </button>
                  </div>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://beta-k7.onrender.com"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/20 border border-stone-200 dark:border-white/15 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-mono text-stone-800 dark:text-white"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setUrlInput(DEFAULT_REMOTE_API_BASE)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-amber-100 dark:hover:bg-white/20 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                    >
                      beta-k7.onrender.com
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrlInput('')}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-amber-100 dark:hover:bg-white/20 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                    >
                      Yerel / API Proxy
                    </button>
                  </div>
                </div>

                {/* Action Buttons: Test & Save */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="flex-1 py-2.5 rounded-xl bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/15 text-stone-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={cn('w-3.5 h-3.5', testing && 'animate-spin')} />
                    <span>{testing ? `Test Ediliyor (${testSeconds}s)...` : 'Bağlantıyı Test Et'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveServerUrl}
                    className="flex-1 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#732236] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Kaydet</span>
                  </button>
                </div>

                {/* Test Result Message */}
                {testResult && !testing && (
                  <div
                    className={cn(
                      'p-3.5 rounded-xl text-xs flex items-start gap-2.5 border',
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                    )}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{testResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
}
