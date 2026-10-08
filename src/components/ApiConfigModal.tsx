import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, CheckCircle2, AlertCircle, RefreshCw, X, Globe, Save, ArrowRight, Smartphone, Sparkles } from 'lucide-react';
import { getEffectiveApiBase, setCustomApiBase, DEFAULT_REMOTE_API_BASE, isMobileAppEnvironment } from '../config';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function ApiConfigModal({ isOpen, onClose, onSaved }: ApiConfigModalProps) {
  const currentBase = getEffectiveApiBase();
  const [urlInput, setUrlInput] = useState(currentBase);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  const isMobile = isMobileAppEnvironment();

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getEffectiveApiBase());
      setTestResult(null);
    }
  }, [isOpen]);

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
    setCustomApiBase(urlInput.trim());
    setTestResult({
      success: true,
      message: 'Sunucu adresi başarıyla kaydedildi! Sayfa yenileniyor...'
    });
    setTimeout(() => {
      onSaved?.();
      onClose();
      window.location.reload();
    }, 800);
  };

  const handleSelectPreset = (presetUrl: string) => {
    setUrlInput(presetUrl);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    const targetBase = urlInput.trim().replace(/\/+$/, '');
    const testUrl = targetBase ? `${targetBase}/api/health` : '/api/health';

    try {
      const startTime = performance.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(testUrl, { 
        mode: 'cors',
        signal: controller.signal
      });
      clearTimeout(timer);
      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        setTestResult({
          success: true,
          message: `Bağlantı Başarılı! Sunucu yanıt veriyor.`,
          latency
        });
      } else {
        setTestResult({
          success: false,
          message: `Sunucuya ulaşıldı ancak durum kodu: HTTP ${res.status} ${res.statusText}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Bağlantı Başarısız: ${err?.message || 'Sunucuya ulaşılamadı. Sunucu uyku modunda olabilir veya adres hatalı.'}`
      });
    } finally {
      setTesting(false);
    }
  };

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
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Server className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white flex items-center gap-2">
                    <span>Sunucu & API Yapılandırması</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-white/60">
                    Android ve Render canlı backend bağlantı yönetimi
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Environment Info Banner */}
            <div className="mt-4 p-3 rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {isMobile ? 'Android / Mobil Uygulama Modu' : 'Web / Tarayıcı Modu'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Aktif
              </span>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-white/70">
                Hızlı Sunucu Seçimi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(DEFAULT_REMOTE_API_BASE)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    urlInput === DEFAULT_REMOTE_API_BASE
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold'
                      : 'bg-white dark:bg-black/20 border-stone-200 dark:border-white/10 hover:border-amber-500/30 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Render Canlı API</span>
                  </div>
                  <span className="text-[10px] opacity-70 block truncate mt-0.5">
                    {DEFAULT_REMOTE_API_BASE}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    urlInput === ''
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold'
                      : 'bg-white dark:bg-black/20 border-stone-200 dark:border-white/10 hover:border-amber-500/30 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    <span>Otomatik (Aynı Alan)</span>
                  </div>
                  <span className="text-[10px] opacity-70 block truncate mt-0.5">
                    /api (Web & Yerel)
                  </span>
                </button>
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-white/70">
                Hedef Backend URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="https://projeniz.onrender.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-mono text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>
              <p className="text-[11px] text-stone-500 dark:text-white/60">
                Render üzerinde kendi GitHub deponuzu dağıttıysanız, Render servisinizin URL'sini buraya yapıştırabilirsiniz.
              </p>
            </div>

            {/* Test Result Box */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.latency !== undefined && (
                    <span className="text-[10px] opacity-75 font-mono block mt-0.5">
                      Gecikme süresi: {testResult.latency}ms
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 pt-4 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-800 dark:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2.5 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
