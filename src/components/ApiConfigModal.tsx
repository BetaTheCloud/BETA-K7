import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, CheckCircle2, AlertCircle, RefreshCw, X, Globe, Save, ArrowRight, RotateCcw, Zap } from 'lucide-react';
import { getEffectiveApiBase, setCustomApiBase, DEFAULT_REMOTE_API_BASE, isMobileAppEnvironment } from '../config';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function ApiConfigModal({ isOpen, onClose, onSaved }: ApiConfigModalProps) {
  const currentBase = getEffectiveApiBase();
  const [urlInput, setUrlInput] = useState(currentBase || DEFAULT_REMOTE_API_BASE);
  const [testing, setTesting] = useState(false);
  const [testSeconds, setTestSeconds] = useState(0);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; isColdStart?: boolean } | null>(null);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setUrlInput(getEffectiveApiBase() || DEFAULT_REMOTE_API_BASE);
      setTestResult(null);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSave = () => {
    const cleanUrl = urlInput.trim().replace(/\/+$/, '');
    setCustomApiBase(cleanUrl);
    setTestResult({ success: true, message: 'Sunucu adresi başarıyla kaydedildi! Uygulama yenileniyor...' });
    setTimeout(() => {
      onSaved?.();
      onClose();
      window.location.reload();
    }, 800);
  };

  const handleResetToDefault = () => {
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
    const timeoutTimer = setTimeout(() => controller.abort(), 45000); // 45s for Render cold start

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
          if (data?.status === 'ok') {
            serverEnv = data.environment ? ` [${data.environment}]` : '';
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
          ? 'Zaman Aşımı (45 sn): Render sunucusu uyku modundan henüz uyanamadı veya URL adresi geçersiz. Birkaç saniye sonra tekrar deneyin.'
          : `Bağlantı Hatası: ${err?.message || 'Sunucuya ulaşılamadı. İnternet bağlantınızı ve URL adresinizi kontrol edin.'}`
      });
    } finally {
      clearInterval(timer);
      setTesting(false);
    }
  };

  const isAndroid = isMobileAppEnvironment();

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex min-h-screen items-center justify-center bg-black/65 backdrop-blur-sm"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="w-full max-w-lg my-auto bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-stone-800 dark:text-white max-h-[calc(100vh-2rem)] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                    Render & Canlı Sunucu Ayarı
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-white/60">
                    Android APK ve Web Canlı API Bağlantı Yapılandırması
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-5 space-y-4">
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
                  {currentBase || DEFAULT_REMOTE_API_BASE}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-white/60">
                  💡 <strong>İpucu:</strong> Render.com ücretsiz sunucuları 15 dakika hareketsiz kalırsa uyku moduna geçer. İlk bağlantıda uyanması 30-50 saniye sürebilir.
                </p>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-white/70">
                    Render Sunucu URL Adresi
                  </label>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Varsayılana Sıfırla
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://beta-k7.onrender.com"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/20 border border-stone-200 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono text-stone-800 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/30 shadow-inner"
                  />
                </div>
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

              {/* Progress indicator during test */}
              {testing && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                  <div className="text-amber-800 dark:text-amber-200">
                    <span className="font-bold">Sunucu Test Ediliyor ({testSeconds} sn)...</span>
                    {testSeconds > 5 && (
                      <span className="block text-[11px] opacity-80">
                        Render sunucusu uyku modundan uyandırılıyor, lütfen bekleyin...
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Test result feedback */}
              {testResult && !testing && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
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
                        ✓ Sunucu soğuk başlatma (Cold Start) başarıyla tamamlandı. Artık anında yanıt verecektir.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
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
                  onClick={handleSave}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Kaydet ve Uygula</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
