import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Database, ShieldCheck, X, ArrowUpRight, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getEffectiveApiBase } from '../config';
import { getAnnouncements, getNews, getMenu, getEvents, getCalendarEvents } from '../mockData';

export type SyncState = 'live' | 'cached' | 'syncing' | 'offline';

export default function SyncStatusBadge() {
  const [syncState, setSyncState] = useState<SyncState>('live');
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

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncState('live');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleSyncEvent = (e: any) => {
      if (e?.detail?.status) {
        setSyncState(e.detail.status);
      }
      if (e?.detail?.time) {
        setLastSyncTime(e.detail.time);
      }
    };

    window.addEventListener('k7_sync_status_change', handleSyncEvent);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('k7_sync_status_change', handleSyncEvent);
    };
  }, []);

  const formatLastSync = (timestamp: number) => {
    if (!timestamp) return 'Bilinmiyor';
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
      } else {
        setSyncState('cached');
        localStorage.setItem('k7_sync_mode', 'cached');
        toast('Önbellek verileri yüklendi (Sunucu yanıt vermedi)', { id: toastId, icon: '⚡' });
      }

      // Dispatch global refresh event so active pages re-read data
      window.dispatchEvent(new CustomEvent('k7_force_refreshed'));
    } catch (error) {
      setSyncState('cached');
      toast.error('Bağlantı kurulamadı, önbellek kullanılıyor');
    } finally {
      setIsRefreshing(false);
    }
  };

  const apiBase = getEffectiveApiBase();

  return (
    <>
      {/* Header Compact Badge Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        title={`Veri Durumu: ${syncState === 'live' ? 'Canlı Sunucuya Bağlı' : syncState === 'syncing' ? 'Eşitleniyor...' : 'Önbellek / Çevrimdışı'} (Tıkla ve İncele)`}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:border-amber-500/50 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
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
                      Veri Bağlantı Durumu
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-white/60">
                      Sunucu senkronizasyon göstergesi
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
                {/* 1. Main Status Pill */}
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
                      <div className="text-xs font-bold uppercase tracking-wider">
                        {syncState === 'live' ? 'Canlı Sunucuya Bağlı' : 'Önbellek Verileri Aktif'}
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        {syncState === 'live'
                          ? 'Üniversite web servislerinden anlık veriler çekilmektedir.'
                          : 'Cihaz hafızasındaki en son güncel veriler gösterilmektedir.'}
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
                    <div className="font-mono text-sm font-bold text-stone-800 dark:text-white">
                      {formatLastSync(lastSyncTime)}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-100/70 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
                    <div className="text-[10px] uppercase font-bold text-stone-400 dark:text-white/40 flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      İnternet Durumu
                    </div>
                    <div className="text-sm font-bold text-stone-800 dark:text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span>{isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. API Source info */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 text-[11px] space-y-1">
                  <div className="text-stone-500 dark:text-white/50 font-semibold">
                    Veri Kaynakları:
                  </div>
                  <div className="text-stone-700 dark:text-stone-300 font-medium">
                    • Kilis 7 Aralık Üniversitesi Rektörlüğü (kilis.edu.tr)<br/>
                    • Sağlık Kültür Spor Daire Bşk. (sks.kilis.edu.tr)<br/>
                    • Öğrenci Bilgi Sistemi (obs.kilis.edu.tr)
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
                  <span>{isRefreshing ? 'Veriler Çekiliyor...' : 'Canlı Verileri Yenile'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
