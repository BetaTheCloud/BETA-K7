import { useState } from 'react';
import { Sun, Moon, Landmark, Server } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { PWAInstallButton } from './PWAInstallButton';
import ApiConfigModal from './ApiConfigModal';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#fcfbf9]/80 dark:bg-[#264653]/80 backdrop-blur-xl border-b border-[#e6e2d6]/80 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-900 to-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]">
            <div className="absolute inset-0 bg-white/20 rounded-2xl mix-blend-overlay"></div>
            <Landmark className="w-6 h-6 relative z-10" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-display font-extrabold tracking-tight text-stone-900 dark:text-white leading-none">
              K7AÜ
            </span>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 dark:text-white/40 mt-1">
              KAMPÜS DİJİTAL
            </span>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsApiModalOpen(true)}
            title="Sunucu / API Ayarı"
            className="relative p-2.5 rounded-xl bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-white/60 hover:bg-stone-200 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="API Ayarı"
          >
            <Server className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          <PWAInstallButton />
          
          <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-white/60 hover:bg-stone-200 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Moon className="w-5 h-5" strokeWidth={1.5} />
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
