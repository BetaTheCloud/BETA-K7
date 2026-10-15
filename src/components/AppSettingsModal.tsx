/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  SlidersHorizontal,
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
  Zap,
  Save,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  CloudSun,
  Search,
  LayoutGrid,
  ChefHat,
  Newspaper,
  Megaphone,
  CalendarDays,
  GraduationCap,
  PhoneCall,
  Layers,
  BookOpen,
  CalendarClock,
  Type
} from 'lucide-react';
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
import toast from 'react-hot-toast';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'widgets' | 'font' | 'server';
}

const VALID_PASSWORDS = ['Lynkas.339', 'lynkas.339'];

export default function AppSettingsModal({
  isOpen,
  onClose,
  initialTab = 'widgets'
}: AppSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'widgets' | 'font' | 'server'>(initialTab);
  const [selectedFont, setSelectedFont] = useState<FontThemeId>(() => getStoredFontTheme());

  // Widget settings state
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(() => getHomeWidgetConfigs());

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
    const updated = moveWidget(widgetConfigs, id, direction);
    setWidgetConfigs(updated);
    saveHomeWidgetConfigs(updated);
  };

  const handleToggleWidget = (id: WidgetId) => {
    const target = widgetConfigs.find((c) => c.id === id);
    if (!target) return;

    const visibleCount = widgetConfigs.filter((c) => c.visible).length;
    if (target.visible && visibleCount <= 1) {
      toast.error('En az bir widget görünür kalmalıdır!');
      return;
    }

    const updated = toggleWidgetVisibility(widgetConfigs, id);
    setWidgetConfigs(updated);
    saveHomeWidgetConfigs(updated);

    if (target.visible) {
      toast.success(`"${target.title}" gizlendi`, { duration: 1500 });
    } else {
      toast.success(`"${target.title}" görünür yapıldı`, { duration: 1500 });
    }
  };

  const handleResetWidgets = () => {
    const defaults = resetHomeWidgetConfigs();
    setWidgetConfigs(defaults);
    toast.success('Widget düzeni varsayılana sıfırlandı');
  };

  // --- Font Theme Handlers ---
  const handleSelectFont = (id: FontThemeId) => {
    setSelectedFont(id);
    applyFontTheme(id);
    const theme = FONT_THEMES.find((f) => f.id === id);
    toast.success(`Yazı tipi "${theme?.name}" olarak ayarlandı`);
  };

  const handleResetFont = () => {
    setSelectedFont('jakarta');
    applyFontTheme('jakarta');
    toast.success('Varsayılan yazı tipine dönüldü');
  };

  // --- Password Unlock Handler ---
  const handleUnlockServer = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = passwordInput.trim();
    if (VALID_PASSWORDS.includes(raw) || VALID_PASSWORDS.includes(raw.toLowerCase())) {
      setIsServerUnlocked(true);
      setPasswordError('');
      setPasswordInput('');
      toast.success('Yönetici erişimi açıldı');
    } else {
      setPasswordError('Hatalı parola! Lütfen yetkili geliştirici parolasını girin.');
      toast.error('Yetkisiz erişim: Parola hatalı');
    }
  };

  const handleLockServer = () => {
    setIsServerUnlocked(false);
    setPasswordInput('');
    setPasswordError('');
    toast('Sunucu ayarları kilitlendi');
  };

  // --- Server Config Handlers ---
  const handleSaveServer = () => {
    const cleanUrl = urlInput.trim().replace(/\/+$/, '');
    setCustomApiBase(cleanUrl);
    setTestResult({ success: true, message: 'Sunucu adresi başarıyla kaydedildi! Uygulama yenileniyor...' });
    toast.success('Sunucu adresi güncellendi');
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 800);
  };

  const handleResetServerToDefault = () => {
    setUrlInput(DEFAULT_REMOTE_API_BASE);
    setCustomApiBase('');
    setTestResult({
      success: true,
      message: `Varsayılan Render sunucusuna (${DEFAULT_REMOTE_API_BASE}) sıfırlandı.`
    });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestSeconds(0);
    setTestResult(null);

    const timer = setInterval(() => {
      setTestSeconds((s) => s + 1);
    }, 1000);

    const targetBase = urlInput.trim().replace(/\/+$/, '');
    const testUrl = targetBase ? `${targetBase}/api/health` : '/api/health';

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), 45000);

    try {
      const startTime = Date.now();
      const res = await fetch(testUrl, {
        mode: 'cors',
        signal: controller.signal
      });
      clearTimeout(timeoutTimer);
      clearInterval(timer);
      const duration = Date.now() - startTime;

      if (res.ok) {
        let serverEnv = '';
        try {
          const data = await res.json();
          if (data?.status === 'ok' && data.environment) {
            serverEnv = ` [${data.environment}]`;
          }
        } catch {}

        setTestResult({
          success: true,
          message: `Bağlantı Başarılı! (${res.status} OK - ${duration}ms)${serverEnv}. Canlı sunucu aktif ve yanıt veriyor.`,
          isColdStart: duration > 4000
        });
      } else {
        setTestResult({
          success: false,
          message: `Sunucuya ulaşıldı ancak durum kodu: HTTP ${res.status} (${res.statusText || 'Hata'})`
        });
      }
    } catch (err: any) {
      clearTimeout(timeoutTimer);
      clearInterval(timer);
      const isAbort = err?.name === 'AbortError';
      setTestResult({
        success: false,
        message: isAbort
          ? 'Zaman Aşımı (45 sn): Render sunucusu uyku modundan henüz uyanamadı veya URL adresi geçersiz.'
          : `Bağlantı Hatası: ${err?.message || 'Sunucuya ulaşılamadı.'}`
      });
    } finally {
      clearInterval(timer);
      setTesting(false);
    }
  };

  const getWidgetIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4' };
    switch (iconName) {
      case 'CloudSun':
        return <CloudSun {...props} className="w-4 h-4 text-amber-500" />;
      case 'Search':
        return <Search {...props} className="w-4 h-4 text-stone-500 dark:text-stone-300" />;
      case 'LayoutGrid':
        return <LayoutGrid {...props} className="w-4 h-4 text-emerald-500" />;
      case 'ChefHat':
        return <ChefHat {...props} className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Newspaper':
        return <Newspaper {...props} className="w-4 h-4 text-sky-500" />;
      case 'Megaphone':
        return <Megaphone {...props} className="w-4 h-4 text-amber-500" />;
      case 'CalendarDays':
        return <CalendarDays {...props} className="w-4 h-4 text-rose-500" />;
      case 'GraduationCap':
        return <GraduationCap {...props} className="w-4 h-4 text-purple-500" />;
      case 'BookOpen':
        return <BookOpen {...props} className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'CalendarClock':
        return <CalendarClock {...props} className="w-4 h-4 text-rose-500" />;
      case 'PhoneCall':
        return <PhoneCall {...props} className="w-4 h-4 text-red-500" />;
      default:
        return <Layers {...props} className="w-4 h-4 text-stone-400" />;
    }
  };

  const visibleCount = widgetConfigs.filter((c) => c.visible).length;
  const hiddenCount = widgetConfigs.length - visibleCount;
  const isAndroid = isMobileAppEnvironment();

  const modalMarkup = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#fcfbf9] dark:bg-[#1f3741] rounded-3xl shadow-2xl border border-stone-200 dark:border-white/10 overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-white/10 bg-stone-100/70 dark:bg-black/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-tight">
                Uygulama Ayarları
              </h3>
              <p className="text-xs text-stone-500 dark:text-white/60">
                Ana sayfa düzeni ve teknik sistem yapılandırması
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors"
            title="Kapat"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1.5 bg-stone-200/50 dark:bg-black/30 border-b border-stone-200 dark:border-white/10 shrink-0 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('widgets')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'widgets'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Widget'lar</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
              {visibleCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('font')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'font'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Yazı Tipi</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0">
              5 Seçenek
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('server')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'server'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {isServerUnlocked ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
            <span className="truncate">Sunucu</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-300 dark:bg-white/10 text-stone-700 dark:text-white/70 shrink-0">
              {isServerUnlocked ? 'Açık' : 'Parolalı'}
            </span>
          </button>
        </div>

        {/* ================= TAB 1: WIDGET MANAGEMENT ================= */}
        {activeTab === 'widgets' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Status Info */}
            <div className="px-4 py-2.5 bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 shrink-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                  <Check className="w-3 h-3" />
                  {visibleCount} Görünür
                </span>
                {hiddenCount > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold text-stone-600 dark:text-stone-400 bg-stone-200/60 dark:bg-white/10 px-2 py-0.5 rounded-md">
                    <EyeOff className="w-3 h-3" />
                    {hiddenCount} Gizli
                  </span>
                )}
              </div>
              <span className="text-[11px] text-stone-500 dark:text-white/50 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-amber-500" />
                Otomatik kaydedilir
              </span>
            </div>

            {/* Widget List */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
              {widgetConfigs.map((widget, index) => {
                const isFirst = index === 0;
                const isLast = index === widgetConfigs.length - 1;

                return (
                  <div
                    key={widget.id}
                    className={`flex items-center justify-between gap-2.5 p-3 rounded-2xl border transition-all ${
                      widget.visible
                        ? 'bg-white dark:bg-[#264653] border-stone-200/80 dark:border-white/10 shadow-xs'
                        : 'bg-stone-100/70 dark:bg-white/5 border-dashed border-stone-300 dark:border-white/10 opacity-60'
                    }`}
                  >
                    {/* Left: Reorder buttons & Icon */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveWidget(widget.id, 'up')}
                          className="p-1 rounded bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/80 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Yukarı Taşı"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveWidget(widget.id, 'down')}
                          className="p-1 rounded bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/80 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Aşağı Taşı"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                        {getWidgetIcon(widget.iconName)}
                      </div>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                          {widget.title}
                        </span>
                        {widget.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            {widget.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-white/60 line-clamp-1">
                        {widget.shortDesc}
                      </p>
                    </div>

                    {/* Right: Visibility Toggle Button */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleWidget(widget.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          widget.visible
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                            : 'bg-stone-200 dark:bg-white/10 text-stone-500 dark:text-white/50 hover:bg-stone-300 dark:hover:bg-white/20'
                        }`}
                        title={widget.visible ? 'Gizle' : 'Göster'}
                      >
                        {widget.visible ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Görünür</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Gizli</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Widgets Footer */}
            <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-black/20 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetWidgets}
                className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 font-medium px-3 py-2 rounded-xl hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Varsayılana Sıfırla</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                Tamamla
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TYPOGRAPHY & FONT THEMES ================= */}
        {activeTab === 'font' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Status Info */}
            <div className="px-4 py-2.5 bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 shrink-0">
              <span className="flex items-center gap-1.5 font-medium">
                <Type className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Tipografi</span>
              </span>
              <span className="text-[11px] text-stone-500 dark:text-white/50">
                Anında Canlı Uygulanır
              </span>
            </div>

            {/* Font Options List */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1">
              {FONT_THEMES.map((theme) => {
                const isSelected = selectedFont === theme.id;

                return (
                  <motion.div
                    key={theme.id}
                    whileHover={{ scale: 1.008 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectFont(theme.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                        : 'bg-white dark:bg-[#264653]/70 border-stone-200/90 dark:border-white/10 hover:border-amber-500/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            style={{ fontFamily: theme.fontDisplay }}
                            className="font-bold text-base text-stone-900 dark:text-white leading-tight"
                          >
                            {theme.name}
                          </h4>
                          {theme.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                                  : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70'
                              }`}
                            >
                              {theme.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                          {theme.familyLabel}
                        </div>
                      </div>

                      {/* Selection Radio Indicator */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 shadow-xs ring-2 ring-amber-500/40'
                            : 'border-2 border-stone-300 dark:border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-white/70 mb-3 leading-relaxed">
                      {theme.description}
                    </p>

                    {/* Live Font Specimen Preview Box */}
                    <div
                      style={{ fontFamily: theme.fontSans }}
                      className="p-3 rounded-xl bg-stone-100/90 dark:bg-black/30 border border-stone-200/70 dark:border-white/10 text-xs text-stone-800 dark:text-white/90 space-y-1"
                    >
                      <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-white/40 tracking-wider">
                        Canlı Önizleme
                      </div>
                      <div
                        style={{ fontFamily: theme.fontDisplay }}
                        className="font-bold text-sm text-stone-900 dark:text-white"
                      >
                        {theme.previewSample}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-white/60 tabular-nums">
                        Saat 09:00 - 10:30 • Amfi 2 • BLM201 • 24s Kaldı
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Font Tab Footer */}
            <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-black/20 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetFont}
                className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 font-medium px-3 py-2 rounded-xl hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Varsayılan Fonta Dön</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Tamamla
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PASSWORD PROTECTED SERVER / API ================= */}
        {activeTab === 'server' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {!isServerUnlocked ? (
              /* Security Gate: Password Required */
              <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg border border-rose-500/20">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                    Geliştirici & Yönetici Koruması
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-white/60 leading-relaxed">
                    Sunucu uç noktası ve Render yapılandırması kritik sistem ayarıdır. Yanlış yapılandırma veri bağlantısını koparabilir. Lütfen erişim parolasını girin.
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
                      autoFocus
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-white dark:bg-black/30 border border-stone-300 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-stone-900 dark:text-white placeholder:text-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
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
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Kilidi Aç ve Yönet</span>
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
                    <span>Yönetici Oturumu Açık</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLockServer}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-bold transition-colors"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Kilitle</span>
                  </button>
                </div>

                {/* Status Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-white/5 border border-amber-500/20 dark:border-white/10 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 shrink-0" />
                      Etkin API Sunucu Adresi:
                    </span>
                    {isAndroid && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        Android APK Modu
                      </span>
                    )}
                  </div>
                  <div className="font-mono break-all text-xs text-stone-700 dark:text-white/90 bg-white/60 dark:bg-black/20 p-2 rounded-xl border border-stone-200/50 dark:border-white/10">
                    {getEffectiveApiBase() || DEFAULT_REMOTE_API_BASE}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-white/60">
                    💡 Render.com ücretsiz sunucuları uyku modundan 30-50 saniyede uyanabilir.
                  </p>
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
                      <RotateCcw className="w-3 h-3" />
                      Varsayılana Sıfırla
                    </button>
                  </div>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://beta-k7.onrender.com"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/20 border border-stone-200 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono text-stone-800 dark:text-white"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-stone-400 dark:text-white/40">Hızlı Seçim:</span>
                    <button
                      type="button"
                      onClick={() => setUrlInput(DEFAULT_REMOTE_API_BASE)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 hover:bg-amber-100 dark:hover:bg-white/20 text-stone-700 dark:text-stone-200 transition-colors"
                    >
                      beta-k7.onrender.com (Render)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrlInput('')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 hover:bg-amber-100 dark:hover:bg-white/20 text-stone-700 dark:text-stone-200 transition-colors"
                    >
                      Yerel / Doğrudan (/api)
                    </button>
                  </div>
                </div>

                {/* Testing Progress */}
                {testing && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                    <div className="text-amber-800 dark:text-amber-200">
                      <span className="font-bold">Sunucu Test Ediliyor ({testSeconds} sn)...</span>
                      {testSeconds > 5 && (
                        <span className="block text-[11px] opacity-80">
                          Render sunucusu uyandırılıyor, lütfen bekleyin...
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Test Result */}
                {testResult && !testing && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium leading-snug">{testResult.message}</p>
                      {testResult.isColdStart && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                          ✓ Soğuk başlatma tamamlandı, artık anında yanıt verir.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-stone-300 dark:border-white/20 text-stone-700 dark:text-white hover:bg-stone-100 dark:hover:bg-white/10 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-98"
                  >
                    <Zap className={`w-4 h-4 text-amber-500 ${testing ? 'animate-bounce' : ''}`} />
                    <span>{testing ? `Test Ediliyor (${testSeconds}s)...` : 'Bağlantıyı Test Et'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveServer}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Kaydet ve Uygula</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
}
