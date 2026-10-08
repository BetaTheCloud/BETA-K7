import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Database, ShieldCheck, X, ArrowUpRight, Clock, Activity, CloudSun, Megaphone, Newspaper } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getEffectiveApiBase, getApiUrl, DEFAULT_REMOTE_API_BASE } from '../config';
import { getAnnouncements, getNews, getMenu, getEvents, getCalendarEvents } from '../mockData';

export type SyncState = 'live' | 'cached' | 'syncing' | 'offline';

export default function SyncStatusBadge() {
  const [syncState, setSyncState] = useState<SyncState>('live');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('k7_last_live_sync_time');
      return stored ? parseInt(stored, 10) : Date.now();
    } catch {
      return Date.now();
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [timeAgoStr, setTimeAgoStr] = useState<string>('Az önce');

  // Relative time updater
  const updateRelativeTime = useCallback(() => {
    const diffSec = Math.floor((Date.now() - lastSyncTime) / 1000);
    if (diffSec < 15) {
      setTimeAgoStr('Az önce');
    } else if (diffSec < 60) {
      setTimeAgoStr(`${diffSec} sn önce`);
    } else if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      setTimeAgoStr(`${mins} dk önce`);
    } else {
      const hrs = Math.floor(diffSec / 3600);
      setTimeAgoStr(`${hrs} sa önce`);
    }
  }, [lastSyncTime]);

  // Periodic heartbeat / health check to confirm server live status & latency
  const checkHealth = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncState('offline');
      return;
    }
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const primaryUrl = getApiUrl('/api/health');
      const res = await fetch(primaryUrl, { signal: controller.signal });
      clearTimeout(timer);
      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        setLatencyMs(latency);
        setSyncState('live');
        try {
          localStorage.setItem('k7_sync_mode', 'live');
        } catch {}
      } else {
        // If primary URL failed, try remote Render API if primary wasn't already remote
        const remoteHealthUrl = `${DEFAULT_REMOTE_API_BASE}/api/health`;
        if (primaryUrl !== remoteHealthUrl) {
          try {
            const remoteRes = await fetch(remoteHealthUrl);
            if (remoteRes.ok) {
              setLatencyMs(Math.round(performance.now() - startTime));
              setSyncState('live');
              return;
            }
          } catch {}
        }
        setSyncState('cached');
      }
    } catch {
      // Fallback check to remote Render API or local /api/health
      const remoteHealthUrl = `${DEFAULT_REMOTE_API_BASE}/api/health`;
      try {
        const remoteRes = await fetch(remoteHealthUrl);
        if (remoteRes.ok) {
          setLatencyMs(Math.round(performance.now() - startTime));
          setSyncState('live');
          return;
        }
      } catch {}

      try {
        const localRes = await fetch('/api/health');
        if (localRes.ok) {
          setLatencyMs(Math.round(performance.now() - startTime));
          setSyncState('live');
          return;
        }
      } catch {}
      setSyncState('cached');
    }
  }, []);

  useEffect(() => {
    // Initial health check on mount
    checkHealth();

    // Heartbeat every 30 seconds while app is active
    const healthInterval = setInterval(checkHealth, 30000);
    const timeAgoInterval = setInterval(updateRelativeTime, 5000);
    updateRelativeTime();

    const handleOnline = () => {
      setIsOnline(true);
      checkHealth();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('offline');
    };

    const handleFocus = () => {
      checkHealth();
      updateRelativeTime();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocus);

    const handleSyncEvent = (e: any) => {
      if (e?.detail?.status) {
        setSyncState(e.detail.status);
      }
      if (e?.detail?.time) {
        setLastSyncTime(e.detail.time);
      }
      updateRelativeTime();
    };

    window.addEventListener('k7_sync_status_change', handleSyncEvent);

    return () => {
      clearInterval(healthInterval);
      clearInterval(timeAgoInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('k7_sync_status_change', handleSyncEvent);
    };
  }, [checkHealth, updateRelativeTime]);

  // Re-check health and time on modal open
  useEffect(() => {
    if (isModalOpen) {
      checkHealth();
      updateRelativeTime();
    }
  }, [isModalOpen, checkHealth, updateRelativeTime]);

  const formatLastSyncClock = (timestamp: number) => {
    if (!timestamp) return '--:--:--';
    const d = new Date(timestamp);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    setSyncState('syncing');
    try {
      const toastId = toast.loading('Sunucudan canlı veriler çekiliyor...');
      const [ann, nw, mn, ev, cal] = await Promise.allSettled([
        getAnnouncements(true),
        getNews(true),
        getMenu(true),
        getEvents(true),
        getCalendarEvents(true)
      ]);

      const anySuccess = 
        (ann.status === 'fulfilled' && ann.value.length > 0) ||
        (nw.status === 'fulfilled' && nw.value.length > 0) ||
        (mn.status === 'fulfilled' && mn.value.length > 0);

      const now = Date.now();
      setLastSyncTime(now);
      localStorage.setItem('k7_last_live_sync_time', String(now));

      if (anySuccess) {
        setSyncState('live');
        localStorage.setItem('k7_sync_mode', 'live');
        toast.success('Canlı veriler başarıyla güncellendi!', { id: toastId });
        await checkHealth();
      } else {
        setSyncState('cached');
        localStorage.setItem('k7_sync_mode', 'cached');
        toast('Önbellek verileri yüklendi (Sunucu yanıt vermedi)', { id: toastId, icon: '⚡' });
      }

      // Dispatch global refresh event so active pages re-read data
      window.dispatchEvent(new CustomEvent('k7_force_refreshed'));
      updateRelativeTime();
    } catch (error) {
      setSyncState('cached');
      toast.error('Bağlantı kurulamadı, önbellek kullanılıyor');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      {/* Header Compact Badge Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        title={`Veri Durumu: ${syncState === 'live' ? `Canlı Sunucuya Bağlı (${latencyMs ? `${latencyMs}ms` : 'Aktif'})` : syncState === 'syncing' ? 'Eşitleniyor...' : 'Önbellek / Çevrimdışı'} (Tıkla ve İncele)`}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-amber-500/50 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
        aria-label="Veri Senkronizasyon Durumu"
      >
        {syncState === 'syncing' || isRefreshing ? (
          <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
        ) : syncState === 'live' ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        ) : syncState === 'offline' ? (
          <span className="relative flex h-2.5 w-2.5 rounded-full bg-rose-500"></span>
        ) : (
          <span className="relative flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
        )}

        <span className="hidden xs:inline text-[11px] font-bold text-stone-700 dark:text-stone-200">
          {syncState === 'syncing' || isRefreshing
            ? 'Eşitleniyor'
            : syncState === 'live'
            ? 'Canlı'
            : syncState === 'offline'
            ? 'Çevrimdışı'
            : 'Önbellek'}
        </span>
      </button>

      {/* Detailed Status Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex min-h-screen items-center justify-center bg-black/65 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
              className="w-full max-w-sm sm:max-w-md my-auto bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-stone-800 dark:text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/60 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                    syncState === 'live'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}>
                    {syncState === 'live' ? <Wifi className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-stone-900 dark:text-white">
                      Veri & Sunucu Bağlantı Durumu
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-white/60">
                      Canlı servisler ve akıllı önbellek kontrol paneli
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Details Cards */}
              <div className="py-4 space-y-3">
                {/* 1. Main Status Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  syncState === 'live'
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-950 dark:text-emerald-100'
                    : 'bg-amber-500/10 border-amber-500/25 text-amber-950 dark:text-amber-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3.5 w-3.5">
                      {syncState === 'live' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                        syncState === 'live' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}></span>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <span>{syncState === 'live' ? 'Canlı Sunucuya Bağlı' : 'Önbellek Verileri Aktif'}</span>
                        {latencyMs !== null && syncState === 'live' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono font-semibold">
                            {latencyMs}ms
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        {syncState === 'live'
                          ? 'Üniversite web servislerinden anlık veriler çekilmektedir.'
                          : 'Cihaz hafızasındaki güncel veriler gösterilmektedir.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-stone-100/70 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
                    <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-white/40 flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Son Senkronizasyon
                    </div>
                    <div className="font-mono text-xs font-bold text-stone-800 dark:text-white flex items-baseline gap-1">
                      <span>{timeAgoStr}</span>
                      <span className="text-[10px] text-stone-400 font-normal">({formatLastSyncClock(lastSyncTime)})</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-100/70 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
                    <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-white/40 flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      İnternet & Bağlantı
                    </div>
                    <div className="text-xs font-bold text-stone-800 dark:text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span>{isOnline ? 'Çevrimiçi & Aktif' : 'Çevrimdışı'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Live Streaming & Cache Distribution */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-stone-600 dark:text-white/70 font-semibold text-[10px] uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-500" />
                      Canlı Akış Sağlanan Servisler
                    </span>
                    <span className="text-emerald-500 font-bold">🟢 Canlı</span>
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-300 space-y-0.5">
                    <p>• <strong>Duyurular & Haberler:</strong> Rektörlük ve birimlerden anlık</p>
                    <p>• <strong>Hava Durumu:</strong> Open-Meteo uydusundan canlı</p>
                    <p>• <strong>Etkinlik Takvimi:</strong> Kampüs etkinlikleri canlı</p>
                  </div>

                  <div className="pt-1 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-[10px] text-stone-400 dark:text-white/40">
                    <span>Statik Veriler (Yemekhane, Bologna, Takvim)</span>
                    <span className="text-amber-500 font-semibold">⚡ Hızlı Önbellek</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleForceRefresh}
                  disabled={isRefreshing}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Veriler Çekiliyor...' : 'Canlı Verileri Yenile (Zorunlu Senkronize)'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
