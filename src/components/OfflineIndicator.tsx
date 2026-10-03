import React, { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-[calc(env(safe-area-inset-top,0px)+5.5rem)] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 backdrop-blur-md border border-amber-400 px-4 py-2 text-xs font-bold tracking-wide text-white shadow-xl">
      <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
      Çevrimdışı Mod (Önbellekten Yükleniyor)
    </div>
  );
};
