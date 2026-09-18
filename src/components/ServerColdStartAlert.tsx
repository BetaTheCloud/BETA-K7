import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudLightning, CheckCircle2, AlertCircle, RefreshCw, X, ChevronUp, ChevronDown, Wifi } from 'lucide-react';
import { subscribeServerStatus, ServerConnectionState } from '../config';

export function ServerColdStartAlert() {
  const [serverState, setServerState] = useState<ServerConnectionState>({
    isPending: false,
    isColdStart: false,
    secondsElapsed: 0,
    stage: 'idle'
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeServerStatus((state) => {
      setServerState(state);
      // Reset dismissed state when a new long connection attempt starts
      if (state.stage === 'connecting' || state.stage === 'waking') {
        setDismissed(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Only show alert if it's taking noticeable time (> 7 seconds) or connected/error after delay
  const shouldShow = 
    !dismissed && 
    (serverState.stage === 'waking' || 
     serverState.stage === 'extended_delay' || 
     (serverState.stage === 'connected' && serverState.isColdStart) ||
     (serverState.stage === 'error' && serverState.isColdStart));

  if (!shouldShow) return null;

  return (
    <aside aria-label="Sunucu Durum Bildirimi" className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 pointer-events-none">
      <AnimatePresence mode="wait">
        {serverState.stage === 'connected' ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto p-4 rounded-2xl bg-emerald-900/90 dark:bg-emerald-950/90 text-white shadow-2xl backdrop-blur-md border border-emerald-500/30 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-100">Sunucu Bağlantısı Sağlandı</h4>
                <p className="text-[11px] text-emerald-200/80">Canlı veriler başarıyla senkronize edildi.</p>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : serverState.stage === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto p-4 rounded-2xl bg-stone-900/95 dark:bg-[#264653]/95 text-white shadow-2xl backdrop-blur-md border border-amber-500/30 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-200">Çevrimdışı / Yerel Mod</h4>
                <p className="text-[11px] text-stone-300 dark:text-white/70">
                  Uygulama yerel önbellek verileriyle kesintisiz çalışmaktadır.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : isMinimized ? (
          /* Minimized floating pill */
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsMinimized(false)}
            className="pointer-events-auto cursor-pointer p-3 rounded-2xl bg-stone-900/90 dark:bg-[#264653]/90 text-white shadow-xl backdrop-blur-md border border-amber-500/30 flex items-center justify-between gap-3 hover:border-amber-400 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-xs font-medium text-amber-100">
                Sunucu Hazırlanıyor ({serverState.secondsElapsed}s)
              </span>
            </div>
            <div className="flex items-center gap-1 text-stone-400 hover:text-white">
              <ChevronUp className="w-4 h-4" />
            </div>
          </motion.div>
        ) : (
          /* Full expanded informing card */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="pointer-events-auto p-4 sm:p-5 rounded-3xl bg-stone-900/95 dark:bg-[#264653]/95 text-white shadow-2xl backdrop-blur-xl border border-amber-500/30 space-y-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <CloudLightning className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-display font-bold text-amber-100 flex items-center gap-1.5">
                    {serverState.stage === 'extended_delay' 
                      ? 'Sunucu Güvenli Bağlantısı Hazırlanıyor' 
                      : 'Bulut Servisleri Başlatılıyor'}
                  </h4>
                  <p className="text-[11px] text-amber-400/90 font-mono font-medium">
                    Geçen Süre: {serverState.secondsElapsed} sn
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  title="Simge durumuna küçült"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  title="Bildirimi Kapat"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Explanation text */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-stone-200 dark:text-white/80 leading-relaxed">
              {serverState.stage === 'extended_delay' ? (
                <>
                  Bulut veri sağlayıcısı güvenlik ve optimizasyon protokollerini tamamlıyor. İlk bağlantının tam kapasiteye ulaşması beklenenden biraz daha fazla zaman alabilir.
                  <span className="block mt-1.5 font-semibold text-amber-300">
                    ✓ Uygulamanız normal çalışmaya devam etmektedir; veriler hazır olduğunda otomatik olarak yüklenecektir.
                  </span>
                </>
              ) : (
                <>
                  Enerji tasarrufu ve kaynak koruma modundaki veri köprüsü devreye alınıyor. İlk bağlantı hazırlığı birkaç saniye sürebilir.
                  <span className="block mt-1 text-stone-300 dark:text-white/70">
                    Sayfalar arasında serbestçe gezinebilirsiniz.
                  </span>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-amber-400 h-full rounded-full"
                  initial={{ width: '15%' }}
                  animate={{ 
                    width: serverState.stage === 'extended_delay' ? '88%' : `${Math.min(75, 15 + serverState.secondsElapsed * 2.5)}%` 
                  }}
                  transition={{ ease: 'easeInOut', duration: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-white/50">
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-amber-400" />
                  Arka Plan Senkronizasyonu
                </span>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-amber-400 hover:underline font-medium"
                >
                  Arka Planda Bekle
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
