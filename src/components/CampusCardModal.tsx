import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CreditCard,
  ExternalLink,
  Wallet,
  Utensils,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Clock,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Wifi
} from 'lucide-react';
import { cn } from '../lib/utils';
import K7Logo from './K7Logo';

interface CampusCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
}

const TOPUP_PRESETS = [50, 100, 150, 250, 500];

export default function CampusCardModal({ isOpen, onClose, initialAmount }: CampusCardModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount || 100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [userType, setUserType] = useState<'student' | 'staff'>('student');
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [cardBalance, setCardBalance] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('k7_simulated_card_balance');
      if (stored) return Number(stored);
    } catch {}
    return 85.0;
  });

  // Lock body scroll when modal is active
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

  const officialPortalUrl = 'https://kampuskart.kilis.edu.tr/User/Login';

  const handleCopyPortalLink = () => {
    try {
      navigator.clipboard.writeText(officialPortalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleOpenPortal = () => {
    window.open(officialPortalUrl, '_blank', 'noopener,noreferrer');
  };

  const faqs = [
    {
      q: 'Yüklediğim bakiye ne zaman kartımda aktif olur?',
      a: 'Online olarak kredi/banka kartı ve 3D Secure ile yapılan yüklemeler kampuskart.kilis.edu.tr üzerinden tamamlandığı anda sistemle senkronize olur ve yemekhane turnikelerinde anında kullanılabilir.'
    },
    {
      q: 'Kartımı kaybettim veya bozuldu, ne yapmalıyım?',
      a: 'Kartınızı kaybettiğinizde derhal Sağlık Kültür ve Spor Daire Başkanlığı (SKS) Kart İşlem Birimi’ne başvurarak eski kartınızı kullanıma kapattırabilir ve yeni akıllı kartınızı teslim alabilirsiniz.'
    },
    {
      q: 'Öğrenci kimlik kartı ile yemekhane kartı aynı mı?',
      a: 'Evet, Kilis 7 Aralık Üniversitesi Akıllı Kimlik Kartları temassız RFID/NFC çiplidir. Hem kampüs girişlerinde hem de yemekhane ve kütüphane turnikelerinde tek kart olarak kullanılır.'
    },
    {
      q: 'Kampüste fiziki nakit dolum noktaları nerede bulunur?',
      a: 'Merkez Kampüs Öğrenci Yemekhanesi giriş katı, Karataş Kampüsü yemekhane holü ve Mercidabık Kampüsü idari bina girişindeki 7/24 Kiosk makinelerinden nakit veya kartla bakiye yüklenebilir.'
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#fcfbf9] dark:bg-[#1d3540] border border-[#e6e2d6] dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200/70 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-stone-900 dark:text-white flex items-center gap-2">
                  <span>Kampüs Kart & Yemekhane</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                    Online Bakiye
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-white/60">
                  Kilis 7 Aralık Üniversitesi Akıllı Kart ve Yemekhane Sistemi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* 1. Visual Digital Smart Campus Card Preview */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-[#13252d] via-[#1e3c49] to-[#2d586b] text-white p-5 sm:p-6 shadow-xl border border-white/15">
              {/* Hologram Background pattern */}
              <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <K7Logo className="w-8 h-8 drop-shadow-md" />
                  <div>
                    <div className="font-display font-extrabold text-sm sm:text-base tracking-wide">
                      KİLİS 7 ARALIK ÜNİVERSİTESİ
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-white/60 font-semibold">
                      Akıllı Kampüs & Yemekhane Kartı
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-white/80">
                  <Wifi className="w-5 h-5 rotate-90" />
                </div>
              </div>

              {/* Chip & User Type */}
              <div className="my-5 flex items-center justify-between relative z-10">
                <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-inner flex items-center justify-center border border-amber-300/40">
                  <div className="w-7 h-5 border border-amber-900/30 rounded-sm grid grid-cols-2 gap-0.5 opacity-60" />
                </div>

                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/10">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{userType === 'student' ? 'Öğrenci Kartı' : 'Personel Kartı'}</span>
                </div>
              </div>

              {/* Card Number & Balance */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 relative z-10 pt-1">
                <div>
                  <div className="text-[10px] text-white/50 font-medium uppercase tracking-wider mb-0.5">
                    Kart Numarası
                  </div>
                  <div className="font-mono text-xs sm:text-sm tracking-widest text-white/90 font-semibold">
                    7924 •••• •••• 5406
                  </div>
                </div>

                <div className="bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-right">
                  <div className="text-[9px] uppercase text-amber-400 font-bold tracking-wider">
                    Turnike & Yemekhane
                  </div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Öğün Hakkı Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Top-Up Amount Selection & Direct Action */}
            <div className="bg-white dark:bg-[#264653] border border-stone-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white">
                    Bakiye Yükleme Tutarı Seçin:
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-stone-500 dark:text-white/60">
                  3D Secure Güvenli Ödeme
                </span>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TOPUP_PRESETS.map((amt) => {
                  const isSelected = selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={cn(
                        "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer text-center",
                        isSelected
                          ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25 scale-[1.02]"
                          : "bg-stone-50 dark:bg-white/5 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 border-stone-200 dark:border-white/10"
                      )}
                    >
                      ₺{amt}
                    </button>
                  );
                })}
              </div>

              {/* Action Button: Directly Launches University Portal */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleOpenPortal}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-700/25 active:scale-[0.99] cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Resmi Kampüs Kart Portalı ile Güvenli Yükle</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-white/60 px-1">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>256-Bit SSL & Banka 3D Korumalı</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPortalLink}
                    className="hover:underline text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Link Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Portal Adresini Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Physical Recharge Kiosk Locations & Meal Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Kiosks Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#264653] border border-stone-200/80 dark:border-white/10 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                  <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Fiziki Kart Dolum Kioskları:</span>
                </div>
                <ul className="text-xs text-stone-600 dark:text-white/70 space-y-1.5 list-disc list-inside">
                  <li><strong>Merkez Kampüs:</strong> Öğrenci Yemekhanesi Giriş Katı</li>
                  <li><strong>Karataş Kampüsü:</strong> Yemekhane & Kantin Girişi</li>
                  <li><strong>Mercidabık Kampüsü:</strong> İdari Bina Girişi Kiosk</li>
                </ul>
              </div>

              {/* Meal Hours Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#264653] border border-stone-200/80 dark:border-white/10 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                  <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Yemekhane Servis Saatleri:</span>
                </div>
                <div className="text-xs text-stone-600 dark:text-white/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Öğle Yemeği Servisi:</span>
                    <strong className="text-stone-900 dark:text-white">11:30 - 13:30</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Akşam Yemeği Servisi:</span>
                    <strong className="text-stone-900 dark:text-white">16:30 - 18:30</strong>
                  </div>
                  <div className="text-[10px] text-stone-400 dark:text-white/50 pt-1">
                    *Tüm yerleşkelerimizde Sağlık Kültür ve Spor Daire Başkanlığı denetimindedir.
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Frequently Asked Questions Accordion */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 px-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Kampüs Kart Hakkında Sıkça Sorulanlar:</span>
              </div>

              <div className="space-y-2">
                {faqs.map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-stone-200/70 dark:border-white/10 rounded-xl bg-white/60 dark:bg-white/5 overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full p-3 text-left text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between gap-2 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-3 pb-3 text-xs text-stone-600 dark:text-white/70 leading-relaxed border-t border-stone-100 dark:border-white/5 pt-2"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 bg-stone-100 dark:bg-[#182c35] border-t border-stone-200/70 dark:border-white/10 flex items-center justify-between shrink-0 text-xs">
            <div className="text-[11px] text-stone-500 dark:text-white/50 flex items-center gap-1">
              <span>Resmi Portal:</span>
              <span className="font-mono text-[10px] text-amber-700 dark:text-amber-300">kampuskart.kilis.edu.tr</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-white/10 text-stone-800 dark:text-white font-semibold hover:bg-stone-300 dark:hover:bg-white/15 transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
