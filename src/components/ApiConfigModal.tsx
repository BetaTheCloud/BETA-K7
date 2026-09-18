import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, CheckCircle2, AlertCircle, RefreshCw, X, Globe, Save, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { getEffectiveApiBase, setCustomApiBase } from '../config';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const ADMIN_PASSCODE = '339';

export default function ApiConfigModal({ isOpen, onClose, onSaved }: ApiConfigModalProps) {
  const currentBase = getEffectiveApiBase();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [urlInput, setUrlInput] = useState(currentBase);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Reset password state whenever modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setPasswordInput('');
      setPasswordError(null);
      setTestResult(null);
    } else {
      setUrlInput(getEffectiveApiBase());
    }
  }, [isOpen]);

  const handlePasswordSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setPasswordError(null);
    } else {
      setPasswordError('Hatalı parola! Bu alanda değişiklik yetkiniz bulunmamaktadır.');
      setPasswordInput('');
    }
  };

  const handleSave = () => {
    setCustomApiBase(urlInput.trim());
    setTestResult({ success: true, message: 'Sunucu adresi başarıyla kaydedildi! Sayfa yenileniyor...' });
    setTimeout(() => {
      onSaved?.();
      onClose();
      window.location.reload();
    }, 1000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    const targetBase = urlInput.trim().replace(/\/+$/, '');
    const testUrl = targetBase ? `${targetBase}/api/announcements` : '/api/announcements';

    try {
      const startTime = Date.now();
      const res = await fetch(testUrl, { mode: 'cors' });
      const duration = Date.now() - startTime;

      if (res.ok) {
        setTestResult({
          success: true,
          message: `Bağlantı Başarılı! (${res.status} OK - ${duration}ms)`
        });
      } else {
        setTestResult({
          success: false,
          message: `Sunucuya ulaşıldı ancak hata döndü (HTTP ${res.status}: ${res.statusText})`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Bağlantı Hatası: ${err.message || 'Sunucuya ulaşılamadı. CORS veya internet iznini kontrol edin.'}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-3xl p-6 shadow-2xl text-stone-800 dark:text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  {isAuthenticated ? <Server className="w-5 h-5" strokeWidth={1.5} /> : <Lock className="w-5 h-5" strokeWidth={1.5} />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                    {isAuthenticated ? 'Uzak Sunucu / API Ayarı' : 'Yönetici Doğrulaması'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-white/60">
                    {isAuthenticated ? 'Canlı API bağlantı yapılandırması' : 'Erişim için parola gereklidir'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PASSWORD ENTRY SCREEN */}
            {!isAuthenticated ? (
              <form onSubmit={handlePasswordSubmit} className="pt-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-white/70 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    Erişim Parolası
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      placeholder="Parolayı girin..."
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/20 border border-stone-200 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm tracking-widest font-mono text-stone-800 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/30"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-white/50">
                    Bu ayar yalnızca sistem yöneticileri tarafından düzenlenebilir.
                  </p>
                </div>

                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl text-xs flex items-center gap-2 border bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{passwordError}</span>
                  </motion.div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl border border-stone-300 dark:border-white/20 text-stone-700 dark:text-white hover:bg-stone-100 dark:hover:bg-white/10 font-semibold text-xs transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* AUTHENTICATED CONFIG SCREEN */
              <div className="pt-5 space-y-4">
                {/* Current status info */}
                <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-white/5 border border-amber-500/20 dark:border-white/10 text-xs leading-relaxed space-y-1">
                  <div className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 shrink-0" />
                    Aktif API Base URL:
                  </div>
                  <div className="font-mono break-all text-[11px] text-stone-600 dark:text-white/80">
                    {currentBase || '(Varsayılan Yerel /api)'}
                  </div>
                </div>

                {/* Input field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-white/70">
                    Render / Backend Sunucu URL Adresi
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://projeniz.onrender.com"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/20 border border-stone-200 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono text-stone-800 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/30"
                    />
                  </div>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 font-medium">
                    Kullanılan Web Service URL'si bu alana tanımlıdır. Lütfen değişiklik yapmayın.
                  </p>
                </div>

                {/* Test result feedback */}
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    )}
                    <span className="leading-snug">{testResult.message}</span>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="flex-1 py-3 px-4 rounded-xl border border-stone-300 dark:border-white/20 text-stone-700 dark:text-white hover:bg-stone-100 dark:hover:bg-white/10 font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                    {testing ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4" />
                    Kaydet ve Uygula
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
