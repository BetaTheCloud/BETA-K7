import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, Landmark, Server, ArrowLeft } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { PWAInstallButton } from './PWAInstallButton';
import ApiConfigModal from './ApiConfigModal';
import SyncStatusBadge from './SyncStatusBadge';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isNotHome = location.pathname !== '/';

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-900 to-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] group-hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-white/20 rounded-2xl mix-blend-overlay"></div>
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" strokeWidth={1.5} />
            </div>
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

          <button
            onClick={() => setIsApiModalOpen(true)}
            title="Sunucu / API Ayarı"
            className="relative p-2 sm:p-2.5 rounded-xl bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-white/60 hover:bg-stone-200 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="API Ayarı"
          >
            <Server className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={1.5} />
          </button>
          
          <PWAInstallButton />
          
          <button
            onClick={toggleTheme}
            className="relative p-2 sm:p-2.5 rounded-xl bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-white/60 hover:bg-stone-200 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={1.5} />
            ) : (
              <Moon className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={1.5} />
            )}
          </button>
        </div>

      </div>

      {/* API Config & Live Test Modal */}
      <ApiConfigModal 
        isOpen={isApiModalOpen} 
        onClose={() => setIsApiModalOpen(false)} 
      />
    </header>
  );
}
