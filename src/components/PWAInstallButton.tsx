import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition"
      >
        <Download strokeWidth={2} className="w-4 h-4" />
        Uygulamayı Yükle
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg border border-[#e6e2d6] dark:border-white/10 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-white/80 hover:bg-stone-100 dark:hover:bg-white/10"
        >
          iOS'a Yükle
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#fcfbf9] p-6 shadow-xl dark:bg-[#264653]">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">iPhone / iPad'e Yükle</h3>
              <p className="mt-2 text-sm text-stone-600 dark:text-white/80 mb-6 space-y-2">
                <span className="block">1. Safari alt çubuğundaki <strong>Paylaş</strong> simgesine dokunun.</span>
                <span className="block">2. Aşağı kaydırıp <strong>Ana Ekrana Ekle</strong> (Add to Home Screen) seçeneğine dokunun.</span>
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-stone-100 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-200 dark:bg-white/10 dark:text-white/90"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
