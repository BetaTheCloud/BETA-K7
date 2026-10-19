/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SunMoon, Settings, ArrowLeft, HelpCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { PWAInstallButton } from './PWAInstallButton';
import AppSettingsModal from './AppSettingsModal';
import SyncStatusBadge from './SyncStatusBadge';
import K7Logo from './K7Logo';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'theme' | 'quick_services' | 'widgets' | 'font' | 'server'>('theme');
  const location = useLocation();
  const navigate = useNavigate();

  const isNotHome = location.pathname !== '/';

  const handleGoBack = () => {
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }

    // 1. Allow active page or open modal to handle step-back navigation (e.g. Bologna depth, CampusHub subtabs, open modals)
    const backEvent = new CustomEvent('k7_header_back', { cancelable: true });
    const wasHandled = !window.dispatchEvent(backEvent);
    if (wasHandled) {
      return;
    }

    // 2. Default: Clean return to home screen avoiding disparate history loops
    navigate('/');
  };

  useEffect(() => {
    const handleOpenSettingsEvent = (e: any) => {
      const requested = e?.detail?.tab;
      const tab = requested === 'server' 
        ? 'server' 
        : requested === 'font' 
          ? 'font' 
          : requested === 'widgets' 
            ? 'widgets' 
            : requested === 'quick_services'
              ? 'quick_services'
              : 'theme';
      setSettingsInitialTab(tab);
      setIsSettingsOpen(true);
    };
    window.addEventListener('k7_open_settings', handleOpenSettingsEvent);
    return () => {
      window.removeEventListener('k7_open_settings', handleOpenSettingsEvent);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#fcfbf9]/90 dark:bg-[#264653]/90 backdrop-blur-xl border-b border-[#e6e2d6]/80 dark:border-white/10 transition-colors pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between">
        
        {/* Logo & Back Button Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isNotHome && (
            <button
              onClick={handleGoBack}
              title="Önceki Menüye / Sayfaya Geri Dön"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-800 dark:text-white text-xs font-bold transition-all border border-stone-200 dark:border-white/10 shadow-sm active:scale-95 cursor-pointer"
              aria-label="Geri Dön"
            >
              <ArrowLeft className="w-4 h-4 text-rose-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Geri</span>
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <K7Logo className="w-10 h-10 sm:w-11 sm:h-11 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-stone-900 dark:text-white leading-none">
                K7AÜ
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] text-stone-400 dark:text-white/40 mt-0.5 sm:mt-1">
                KAMPÜS DİJİTAL
              </span>
            </div>
          </Link>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <SyncStatusBadge />

          {/* Welcome & Features Guide Modal Trigger */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('k7_open_welcome_guide'));
            }}
            title="Karşılama Ekranı & Uygulama Tanıtım Rehberi"
            className="relative p-1.5 sm:p-2.5 rounded-xl bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-stone-200 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            aria-label="Karşılama Ekranı & Uygulama Rehberi"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />
          </button>

          {/* App Settings: Customizable Widgets & Password-Protected Server Config */}
          <button
            onClick={() => {
              setSettingsInitialTab('quick_services');
              setIsSettingsOpen(true);
            }}
            title="Uygulama Ayarları (Kısayollar, Widget'lar & Sunucu)"
            className="relative p-2 sm:p-2.5 rounded-xl bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-200 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Ayarlar"
          >
            <Settings className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={1.6} />
          </button>
          
          <PWAInstallButton />
          
          <button
            onClick={toggleTheme}
            title={`Görünüm Modu: ${theme === 'dark' ? 'Koyu Mod (Tıkla: Açık Moda Geç)' : 'Açık Mod (Tıkla: Koyu Moda Geç)'}`}
            className="relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 border border-stone-200/80 dark:border-white/10 transition-all duration-300 active:scale-95 cursor-pointer shrink-0 shadow-xs group"
            aria-label="Koyu veya Açık Görünüm Modunu Değiştir"
          >
            <SunMoon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-300 transition-transform duration-500 group-hover:rotate-180 shrink-0" strokeWidth={1.8} />
            <span className="hidden sm:inline text-[11px] font-bold text-stone-700 dark:text-stone-200">
              {theme === 'dark' ? 'Koyu' : 'Açık'}
            </span>
          </button>
        </div>

      </div>

      {/* App Settings Modal (Widget Management & Protected Server/API) */}
      <AppSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsInitialTab}
      />
    </header>
  );
}
