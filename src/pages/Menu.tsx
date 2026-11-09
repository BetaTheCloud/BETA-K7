import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getMenu, getCachedOrFallback, FALLBACK_MENU } from '../mockData';
import { MenuItem } from '../types';
import {
  CalendarDays,
  ChefHat,
  Utensils,
  ArrowLeft,
  Calendar as CalendarIcon,
  Flame,
  Info,
  CheckCircle2,
  X,
  CreditCard,
  ExternalLink,
  Plus,
  Minus,
  RotateCcw,
  Check,
  Activity,
  Wallet,
  HelpCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import LoadingState from '../components/LoadingState';
import { useTheme } from '../hooks/useTheme';

const TURKISH_MONTHS: Record<string, number> = {
  ocak: 0,
  şubat: 1,
  subat: 1,
  mart: 2,
  nisan: 3,
  mayıs: 4,
  mayis: 4,
  haziran: 5,
  temmuz: 6,
  ağustos: 7,
  agustos: 7,
  eylül: 8,
  eylul: 8,
  ekim: 9,
  kasım: 10,
  kasim: 10,
  aralık: 11,
  aralik: 11
};

interface DayCalorieLog {
  checkedDishes: string[];
  includeBread: boolean;
  extraKcal: number;
}

export default function Menu() {
  const navigate = useNavigate();
  const { palette, palettes } = useTheme();
  const activePaletteInfo = useMemo(() => {
    return palettes.find((p) => p.id === palette) || palettes[0];
  }, [palettes, palette]);

  const [menu, setMenu] = useState<MenuItem[]>(() => {
    return getCachedOrFallback<MenuItem[]>('k7_cached_menu_v6', FALLBACK_MENU);
  });
  const [loading, setLoading] = useState(false);

  // Date selection state: ISO string format "YYYY-MM-DD" or null
  const [selectedDateIso, setSelectedDateIso] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Portal & Reservation Info Modal
  const [showPortalModal, setShowPortalModal] = useState(false);

  // Daily Calorie Gender Preset: 'male' (2200-2500 kcal) | 'female' (1800-2000 kcal)
  const [calorieGender, setCalorieGender] = useState<'male' | 'female'>(() => {
    try {
      const saved = localStorage.getItem('k7_calorie_gender');
      return saved === 'female' ? 'female' : 'male';
    } catch {
      return 'male';
    }
  });

  // Daily Calorie Goal (Default: Erkek için 2350 kcal [2200-2500 aralığı], Kadın için 1900 kcal [1800-2000 aralığı])
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('k7_calorie_goal');
      if (saved) return parseInt(saved, 10);
      const savedGender = localStorage.getItem('k7_calorie_gender');
      return savedGender === 'female' ? 1900 : 2350;
    } catch {
      return 2350;
    }
  });

  const handleSetCalorieGender = (gender: 'male' | 'female') => {
    setCalorieGender(gender);
    const newGoal = gender === 'female' ? 1900 : 2350;
    setDailyCalorieGoal(newGoal);
    try {
      localStorage.setItem('k7_calorie_gender', gender);
      localStorage.setItem('k7_calorie_goal', String(newGoal));
    } catch {}
  };

  // Calorie Tracker State per Day
  const [calorieTrackerLog, setCalorieTrackerLog] = useState<Record<string, DayCalorieLog>>(() => {
    try {
      const saved = localStorage.getItem('k7_calorie_tracker_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist Calorie Tracker state
  const saveCalorieLog = (dateKey: string, newEntry: DayCalorieLog) => {
    setCalorieTrackerLog((prev) => {
      const updated = { ...prev, [dateKey]: newEntry };
      try {
        localStorage.setItem('k7_calorie_tracker_v2', JSON.stringify(updated));
      } catch (e) {
        console.warn('Calorie log could not be saved to localStorage:', e);
      }
      return updated;
    });
  };

  const handleUpdateCalorieGoal = (delta: number) => {
    const nextGoal = Math.max(1200, Math.min(4500, dailyCalorieGoal + delta));
    setDailyCalorieGoal(nextGoal);
    try {
      localStorage.setItem('k7_calorie_goal', String(nextGoal));
    } catch {}
  };

  useEffect(() => {
    async function load() {
      const data = await getMenu();
      if (data && data.length > 0) {
        setMenu(data);
      }
    }
    load();
  }, []);

  if (loading) {
    return <LoadingState message="Yemek Menüsü Yükleniyor..." subtitle="Aylık yemekhane listesi alınıyor" />;
  }

  // Today string formatted in Turkish
  const today = new Date();
  const todayStr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).toLowerCase();

  // Helper to format ISO date to Turkish display
  const formatIsoToTr = (isoStr: string) => {
    try {
      const [y, m, d] = isoStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
    } catch {
      return isoStr;
    }
  };

  // Helper to find matching menu item for any given ISO date or date string
  const findMenuForSelectedDate = (isoStr: string) => {
    if (!isoStr || !menu.length) return null;
    const [y, m, d] = isoStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    const targetDayOfWeek = targetDate.getDay();

    // Cumartesi (6) ve Pazar (0) günleri yemekhane kesinlikle kapalıdır
    if (targetDayOfWeek === 0 || targetDayOfWeek === 6) {
      return null;
    }

    const targetDayNum = targetDate.getDate();
    const targetMonthIdx = targetDate.getMonth();
    const targetWeekdayName = targetDate.toLocaleDateString('tr-TR', { weekday: 'long' }).toLowerCase();

    // 1. Match by exact Day number + Month Name (tokenized parsing so '7' never matches '17' or '27')
    const dayMonthMatch = menu.find((item) => {
      const parts = item.date.toLowerCase().split(/\s+/);
      if (parts.length >= 2) {
        const itemDay = parseInt(parts[0], 10);
        const itemMonthName = parts[1];
        if (!isNaN(itemDay) && itemDay === targetDayNum && TURKISH_MONTHS[itemMonthName] === targetMonthIdx) {
          return true;
        }
      }
      return false;
    });
    if (dayMonthMatch) return dayMonthMatch;

    // 2. Exact word boundary regex match for "7 kasım 2026" or "07.11.2026"
    const monthKey = Object.keys(TURKISH_MONTHS).find((k) => TURKISH_MONTHS[k] === targetMonthIdx) || '';
    if (monthKey) {
      const regex = new RegExp(`(^|\\D)${targetDayNum}\\s+${monthKey}`, 'i');
      const regexMatch = menu.find((item) => regex.test(item.date));
      if (regexMatch) return regexMatch;
    }

    // 3. Match by Weekday Name fallback (only for weekdays Monday-Friday)
    if (targetDayOfWeek >= 1 && targetDayOfWeek <= 5) {
      const weekdayMatch = menu.find((item) => {
        const dateLower = item.date.toLowerCase();
        return dateLower.includes(targetWeekdayName);
      });
      if (weekdayMatch) return weekdayMatch;
    }

    return null;
  };

  const isDateWeekend = (isoStr: string) => {
    if (!isoStr) return false;
    const [y, m, d] = isoStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const selectedMenu = selectedDateIso ? findMenuForSelectedDate(selectedDateIso) : null;
  const isSelectedDateWeekend = selectedDateIso ? isDateWeekend(selectedDateIso) : false;

  const isSelectedDateToday = () => {
    if (!selectedDateIso) return false;
    const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return selectedDateIso === todayYmd;
  };

  const setDateOffset = (offsetDays: number) => {
    const target = new Date();
    target.setDate(today.getDate() + offsetDays);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setSelectedDateIso(`${yyyy}-${mm}-${dd}`);
  };

  const filteredMenuItems = menu;

  // Calorie calculations for selectedMenu
  const totalMenuKcal = selectedMenu?.calories || 850;
  const mainDishKcal = Math.round(totalMenuKcal * 0.44);
  const sideDishKcal = Math.round(totalMenuKcal * 0.26);
  const soupKcal = Math.round(totalMenuKcal * 0.18);
  const dessertKcal = Math.max(50, totalMenuKcal - mainDishKcal - sideDishKcal - soupKcal);
  const breadKcal = 120;

  // Active day's calorie tracker state
  const activeCalorieLog = useMemo<DayCalorieLog>(() => {
    if (!selectedDateIso) {
      return { checkedDishes: ['mainDish', 'sideDish', 'soup', 'dessertOrFruit'], includeBread: false, extraKcal: 0 };
    }
    if (calorieTrackerLog[selectedDateIso]) {
      return calorieTrackerLog[selectedDateIso];
    }
    // Default: all dishes checked for today's menu
    return {
      checkedDishes: ['mainDish', 'sideDish', 'soup', 'dessertOrFruit'],
      includeBread: false,
      extraKcal: 0
    };
  }, [selectedDateIso, calorieTrackerLog]);

  const toggleDishConsumed = (dishKey: string) => {
    if (!selectedDateIso) return;
    const isChecked = activeCalorieLog.checkedDishes.includes(dishKey);
    const updatedDishes = isChecked
      ? activeCalorieLog.checkedDishes.filter((k) => k !== dishKey)
      : [...activeCalorieLog.checkedDishes, dishKey];
    saveCalorieLog(selectedDateIso, {
      ...activeCalorieLog,
      checkedDishes: updatedDishes
    });
  };

  const toggleBreadConsumed = () => {
    if (!selectedDateIso) return;
    saveCalorieLog(selectedDateIso, {
      ...activeCalorieLog,
      includeBread: !activeCalorieLog.includeBread
    });
  };

  const handleExtraKcalDelta = (delta: number) => {
    if (!selectedDateIso) return;
    const nextExtra = Math.max(0, (activeCalorieLog.extraKcal || 0) + delta);
    saveCalorieLog(selectedDateIso, {
      ...activeCalorieLog,
      extraKcal: nextExtra
    });
  };

  const selectAllDishes = () => {
    if (!selectedDateIso) return;
    saveCalorieLog(selectedDateIso, {
      ...activeCalorieLog,
      checkedDishes: ['mainDish', 'sideDish', 'soup', 'dessertOrFruit'],
      includeBread: true
    });
  };

  const resetAllDishes = () => {
    if (!selectedDateIso) return;
    saveCalorieLog(selectedDateIso, {
      checkedDishes: [],
      includeBread: false,
      extraKcal: 0
    });
  };

  // Consumed Calories for current date
  const consumedCalories = useMemo(() => {
    let total = 0;
    if (activeCalorieLog.checkedDishes.includes('mainDish')) total += mainDishKcal;
    if (activeCalorieLog.checkedDishes.includes('sideDish')) total += sideDishKcal;
    if (activeCalorieLog.checkedDishes.includes('soup')) total += soupKcal;
    if (activeCalorieLog.checkedDishes.includes('dessertOrFruit')) total += dessertKcal;
    if (activeCalorieLog.includeBread) total += breadKcal;
    total += (activeCalorieLog.extraKcal || 0);
    return total;
  }, [activeCalorieLog, mainDishKcal, sideDishKcal, soupKcal, dessertKcal]);

  const caloriePercentage = Math.min(100, Math.round((consumedCalories / dailyCalorieGoal) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10"
    >
      {/* Header with Back Button */}
      <header className="border-b border-[#e6e2d6] dark:border-white/10 pb-4">
        <button
          onClick={() => {
            navigate('/');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold mb-3 transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          <span>Geri Ana Sayfaya Dön</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center border border-[var(--brand-primary)]/20 shadow-xs">
                <ChefHat className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <span>Yemek Menüsü</span>
            </h2>
            <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 tracking-wide font-medium">
              Kilis 7 Aralık Üniversitesi Sağlık, Kültür ve Spor Daire Başkanlığı Aylık Yemekhane Menüsü
            </p>
          </div>
        </div>
      </header>

      {/* ================= KAMPÜS KART BAKİYE YÜKLEME & PORTAL BAR ================= */}
      <section className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: activePaletteInfo.colors.gradient }}
        />
        <div className="space-y-1.5 max-w-xl relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--brand-primary)]/30 text-white text-[11px] font-bold border border-[var(--brand-primary)]/40 tracking-wide uppercase">
              <Wallet className="w-3 h-3 text-[var(--brand-accent)]" />
              <span>K7AÜ Kampüs Kart Portalı</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 tracking-wide">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Öğle Yemeği: 11:00 – 13:00</span>
            </div>
          </div>
          <h3 className="font-display font-bold text-lg sm:text-xl text-white">
            Yemekhane Kampüs Kart Bakiye Yükleme Portalı
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed">
            Öğrenci kimlik kartınıza online bakiye yükleyin ve yemekhanede doğrudan turnikeden kartınızı okutarak yemek hizmetinden yararlanın. (Rezervasyon gerekmez, doğrudan kart ile geçiş yapılır.)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0 relative z-10">
          <a
            href="https://kampuskart.kilis.edu.tr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bakiye Yükle (kampuskart.kilis.edu.tr)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <button
            type="button"
            onClick={() => setShowPortalModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-stone-200 hover:text-white font-semibold text-xs sm:text-sm transition-all border border-white/10 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>Bakiye & Turnike Rehberi</span>
          </button>
        </div>
      </section>

      {/* ================= DATE PICKER & INTERACTIVE CONTROLS ================= */}
      <section className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Tarihe Göre Menü Seç</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-white/60 mt-0.5">
              İstediğiniz tarihi seçerek o gün servis edilecek yemekleri anında görüntüleyebilirsiniz.
            </p>
          </div>

          {/* Quick Date Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setDateOffset(0)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                isSelectedDateToday()
                  ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-white/15'
              )}
            >
              Bugün
            </button>
            <button
              onClick={() => setDateOffset(1)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-white/15 transition-all cursor-pointer"
            >
              Yarın
            </button>
            {selectedDateIso && (
              <button
                onClick={() => setSelectedDateIso('')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tüm Ay</span>
              </button>
            )}
          </div>
        </div>

        {/* Native Date Input */}
        <div className="pt-1 max-w-sm">
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDateIso}
              onChange={(e) => setSelectedDateIso(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e2d6] dark:border-white/15 bg-white dark:bg-white/5 text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer"
              title="Tarih Seçiniz"
            />
          </div>
        </div>

        {/* Day Quick-Chips Carousel from available Menu Items */}
        {menu.length > 0 && (
          <div className="pt-2 border-t border-stone-100 dark:border-white/5">
            <div className="text-[11px] font-semibold text-stone-400 dark:text-white/40 mb-2">
              Menüdeki Günlere Hızlı Geçiş:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {menu.map((item, i) => {
                const isSelected = selectedMenu?.id === item.id;
                return (
                  <button
                    key={item.id || i}
                    onClick={() => {
                      // Parse item date and set selected
                      const parts = item.date.split(/\s+/);
                      if (parts.length >= 2) {
                        const dayNum = parseInt(parts[0], 10);
                        const monthName = parts[1].toLowerCase();
                        const monthIdx = TURKISH_MONTHS[monthName] ?? today.getMonth();
                        const targetDate = new Date(today.getFullYear(), monthIdx, dayNum);
                        const yyyy = targetDate.getFullYear();
                        const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
                        const dd = String(targetDate.getDate()).padStart(2, '0');
                        setSelectedDateIso(`${yyyy}-${mm}-${dd}`);
                      } else {
                        // Fallback
                        setSelectedDateIso('');
                      }
                    }}
                    className={cn(
                      'shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer',
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-stone-50 dark:bg-white/5 text-stone-700 dark:text-stone-300 border-[#e6e2d6] dark:border-white/10 hover:border-amber-400/50 hover:bg-stone-100 dark:hover:bg-white/10'
                    )}
                  >
                    {item.date}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ================= SELECTED DATE HERO CARD ================= */}
      {selectedDateIso && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-500" strokeWidth={2} />
              <h3 className="text-lg sm:text-xl font-display font-bold text-stone-900 dark:text-white">
                {isSelectedDateToday() ? 'Günün Menüsü' : 'Seçilen Tarihin Menüsü'}
              </h3>
            </div>
            <span className="text-xs text-stone-500 dark:text-white/60 font-medium">
              {formatIsoToTr(selectedDateIso)}
            </span>
          </div>

          {selectedMenu ? (
            <div
              className="rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-white/10"
              style={{
                background: activePaletteInfo.colors.gradient,
                boxShadow: `0 20px 25px -5px ${activePaletteInfo.colors.ringColor}`
              }}
            >
              {/* Background Decoration */}
              <div className="absolute -right-8 -top-8 md:-right-4 md:-top-4 opacity-10 pointer-events-none">
                <ChefHat strokeWidth={1.5} className="w-48 h-48 md:w-64 md:h-64" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white font-bold tracking-wide uppercase text-xs px-3.5 py-1.5 rounded-full border border-white/15">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{selectedMenu.date}</span>
                  </div>

                  {isSelectedDateToday() && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Bugünün Menüsü</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                  <div className="flex flex-col justify-center">
                    <div className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1.5">
                      1. Ana Yemek
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-display font-black leading-tight text-white drop-shadow-sm">
                      {selectedMenu.mainDish}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8">
                    <div>
                      <div className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                        2. Yardımcı Yemek
                      </div>
                      <div className="text-lg md:text-xl font-bold">{selectedMenu.sideDish}</div>
                    </div>
                    <div>
                      <div className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                        3. Çorba
                      </div>
                      <div className="text-lg md:text-xl font-bold">{selectedMenu.soup}</div>
                    </div>
                    <div>
                      <div className="text-white/80 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                        4. Tatlı / Meyve / İçecek / Salata
                      </div>
                      <div className="text-lg md:text-xl font-bold">{selectedMenu.dessertOrFruit}</div>
                    </div>
                  </div>
                </div>

                {selectedMenu.calories > 0 && (
                  <div className="mt-6 pt-3 border-t border-white/20 text-xs font-bold tracking-widest text-white/90 flex items-center justify-end gap-1.5">
                    <Flame className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span>{selectedMenu.calories} KCAL</span>
                  </div>
                )}

                {/* ================= GÜNLÜK KALORİ TAKİP SAYACI ================= */}
                <div className="mt-6 pt-6 border-t border-white/20 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                          <span>Günlük Kalori Takip Sayacı</span>
                          <span className="text-[11px] font-medium text-white/90 bg-white/15 px-2 py-0.5 rounded-full">
                            İnteraktif
                          </span>
                        </h4>
                        <p className="text-[11px] text-white/80">
                          Tükettiğiniz yemekleri işaretleyin, günlük ihtiyacınızın ne kadarını karşıladığınızı anında görün.
                        </p>
                      </div>
                    </div>

                    {/* Gender Profile Selection & Goal controls */}
                    <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
                      {/* Gender Selector */}
                      <div className="inline-flex p-0.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/15">
                        <button
                          type="button"
                          onClick={() => handleSetCalorieGender('male')}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                            calorieGender === 'male'
                              ? 'bg-white/25 text-white font-black shadow-sm ring-1 ring-white/30'
                              : 'text-stone-300 hover:text-white'
                          )}
                          title="Erkek: Günlük 2.200 – 2.500 kcal"
                        >
                          Erkek (2.200–2.500 kcal)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetCalorieGender('female')}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                            calorieGender === 'female'
                              ? 'bg-white/25 text-white font-black shadow-sm ring-1 ring-white/30'
                              : 'text-stone-300 hover:text-white'
                          )}
                          title="Kadın: Günlük 1.800 – 2.000 kcal"
                        >
                          Kadın (1.800–2.000 kcal)
                        </button>
                      </div>

                      {/* Goal Fine-tuner */}
                      <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-xs">
                        <span className="text-white/80 text-[11px] font-semibold">Hedef:</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCalorieGoal(-100)}
                          className="w-5 h-5 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 text-white cursor-pointer"
                          title="Hedefi 100 kcal azalt"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-white tracking-wide">{dailyCalorieGoal} kcal</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCalorieGoal(100)}
                          className="w-5 h-5 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 text-white cursor-pointer"
                          title="Hedefi 100 kcal artır"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={selectAllDishes}
                        className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-semibold text-white transition-all cursor-pointer"
                      >
                        Tümünü Seç
                      </button>
                      <button
                        type="button"
                        onClick={resetAllDishes}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-amber-200 hover:text-white transition-all cursor-pointer"
                        title="Seçimleri Sıfırla"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Recommended Range Banner Note */}
                  <div className="px-3.5 py-2 rounded-xl bg-black/20 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-white/90">
                    <span className="font-medium">
                      Günlük Önerilen: <strong className="text-white font-bold underline decoration-white/30">Erkek için 2.200 – 2.500 kcal</strong> | <strong className="text-white font-bold underline decoration-white/30">Kadın için 1.800 – 2.000 kcal</strong>
                    </span>
                    <span className="text-[11px] text-white/75">
                      Seçili Profil: <span className="font-bold text-white">{calorieGender === 'male' ? 'Erkek (Ort. 2.350 kcal)' : 'Kadın (Ort. 1.900 kcal)'}</span>
                    </span>
                  </div>

                  {/* Visual Progress Bar & Summary Stats */}
                  <div className="bg-black/25 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white/75 text-[11px] uppercase tracking-wider block">Öğünden Alınan</span>
                        <span className="text-2xl font-black font-display text-white">{consumedCalories}</span>
                        <span className="text-xs text-white/80 ml-1 font-bold">kcal</span>
                      </div>
                      <div className="text-center">
                        <span className="text-white/75 text-[11px] uppercase tracking-wider block">Hedef Karşılama</span>
                        <span className="text-xl font-black text-white">%{caloriePercentage}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white/75 text-[11px] uppercase tracking-wider block">Kalan İhtiyaç</span>
                        <span className="text-2xl font-black font-display text-white">
                          {Math.max(0, dailyCalorieGoal - consumedCalories)}
                        </span>
                        <span className="text-xs text-white/80 ml-1 font-bold">kcal</span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-white/15 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          caloriePercentage >= 100
                            ? 'bg-rose-400'
                            : caloriePercentage >= 40
                            ? 'bg-emerald-400'
                            : 'bg-white'
                        )}
                        style={{ width: `${Math.min(100, Math.max(4, caloriePercentage))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-white/75">
                      <span>0 kcal</span>
                      <span>{consumedCalories} / {dailyCalorieGoal} kcal ({caloriePercentage >= 100 ? 'Hedef tamamlandı veya aşıldı' : 'Dengeli yemekhane porsiyonu'})</span>
                      <span>{dailyCalorieGoal} kcal</span>
                    </div>
                  </div>

                  {/* Interactive Dish Toggles */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">
                      Bugün Tükettiğiniz Porsiyonları İşaretleyin:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {/* 1. Main Dish */}
                      <button
                        type="button"
                        onClick={() => toggleDishConsumed('mainDish')}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer',
                          activeCalorieLog.checkedDishes.includes('mainDish')
                            ? 'bg-white/20 border-white/40 shadow-sm'
                            : 'bg-black/20 border-white/10 opacity-70 hover:opacity-90'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                            activeCalorieLog.checkedDishes.includes('mainDish')
                              ? 'bg-emerald-500 text-white'
                              : 'border border-white/30 bg-white/10'
                          )}
                        >
                          {activeCalorieLog.checkedDishes.includes('mainDish') && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 block">
                            Ana Yemek
                          </span>
                          <span className="text-xs font-bold text-white line-clamp-1 block">
                            {selectedMenu.mainDish}
                          </span>
                          <span className="text-[11px] font-semibold text-white/90 mt-0.5 block">
                            ~{mainDishKcal} kcal
                          </span>
                        </div>
                      </button>

                      {/* 2. Side Dish */}
                      <button
                        type="button"
                        onClick={() => toggleDishConsumed('sideDish')}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer',
                          activeCalorieLog.checkedDishes.includes('sideDish')
                            ? 'bg-white/20 border-white/40 shadow-sm'
                            : 'bg-black/20 border-white/10 opacity-70 hover:opacity-90'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                            activeCalorieLog.checkedDishes.includes('sideDish')
                              ? 'bg-emerald-500 text-white'
                              : 'border border-white/30 bg-white/10'
                          )}
                        >
                          {activeCalorieLog.checkedDishes.includes('sideDish') && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 block">
                            Yardımcı Yemek
                          </span>
                          <span className="text-xs font-bold text-white line-clamp-1 block">
                            {selectedMenu.sideDish}
                          </span>
                          <span className="text-[11px] font-semibold text-white/90 mt-0.5 block">
                            ~{sideDishKcal} kcal
                          </span>
                        </div>
                      </button>

                      {/* 3. Soup */}
                      <button
                        type="button"
                        onClick={() => toggleDishConsumed('soup')}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer',
                          activeCalorieLog.checkedDishes.includes('soup')
                            ? 'bg-white/20 border-white/40 shadow-sm'
                            : 'bg-black/20 border-white/10 opacity-70 hover:opacity-90'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                            activeCalorieLog.checkedDishes.includes('soup')
                              ? 'bg-emerald-500 text-white'
                              : 'border border-white/30 bg-white/10'
                          )}
                        >
                          {activeCalorieLog.checkedDishes.includes('soup') && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 block">
                            Çorba
                          </span>
                          <span className="text-xs font-bold text-white line-clamp-1 block">
                            {selectedMenu.soup}
                          </span>
                          <span className="text-[11px] font-semibold text-white/90 mt-0.5 block">
                            ~{soupKcal} kcal
                          </span>
                        </div>
                      </button>

                      {/* 4. Dessert / Fruit */}
                      <button
                        type="button"
                        onClick={() => toggleDishConsumed('dessertOrFruit')}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer',
                          activeCalorieLog.checkedDishes.includes('dessertOrFruit')
                            ? 'bg-white/20 border-white/40 shadow-sm'
                            : 'bg-black/20 border-white/10 opacity-70 hover:opacity-90'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                            activeCalorieLog.checkedDishes.includes('dessertOrFruit')
                              ? 'bg-emerald-500 text-white'
                              : 'border border-white/30 bg-white/10'
                          )}
                        >
                          {activeCalorieLog.checkedDishes.includes('dessertOrFruit') && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 block">
                            Tatlı / Meyve
                          </span>
                          <span className="text-xs font-bold text-white line-clamp-1 block">
                            {selectedMenu.dessertOrFruit}
                          </span>
                          <span className="text-[11px] font-semibold text-white/90 mt-0.5 block">
                            ~{dessertKcal} kcal
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Additional Options: Bread / Extras */}
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      <button
                        type="button"
                        onClick={toggleBreadConsumed}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                          activeCalorieLog.includeBread
                            ? 'bg-white/25 border-white/40 text-white shadow-sm'
                            : 'bg-black/20 border-white/10 text-white/80 hover:text-white'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded flex items-center justify-center transition-colors',
                            activeCalorieLog.includeBread ? 'bg-emerald-500 text-white' : 'border border-white/30'
                          )}
                        >
                          {activeCalorieLog.includeBread && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>Ekmek / Su (+120 kcal)</span>
                      </button>

                      {/* Extra kcal adjuster */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 text-xs text-amber-100">
                        <span>İlave Atıştırmalık:</span>
                        <button
                          type="button"
                          onClick={() => handleExtraKcalDelta(-50)}
                          className="w-4 h-4 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold text-white">{activeCalorieLog.extraKcal || 0} kcal</span>
                        <button
                          type="button"
                          onClick={() => handleExtraKcalDelta(50)}
                          className="w-4 h-4 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isSelectedDateWeekend ? (
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[var(--brand-primary)]/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center mx-auto ring-8 ring-[var(--brand-primary)]/5">
                <CalendarDays className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] border border-[var(--brand-primary)]/30">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hafta Sonu Hizmet Verilmemektedir</span>
                </span>
                <h4 className="font-display font-bold text-xl text-stone-900 dark:text-white pt-1">
                  Cumartesi ve Pazar Günleri Yemekhane Kapalıdır
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-white/70 max-w-lg mx-auto leading-relaxed">
                  Kilis 7 Aralık Üniversitesi yemekhanesinde yalnızca <strong>hafta içi günlerde (Pazartesi – Cuma)</strong> yemek servisi sunulmaktadır. Hafta sonları ve resmi tatillerde yemekhane hizmeti verilmemektedir.
                </p>
              </div>

              {/* Next upcoming weekday menu teaser */}
              {menu.length > 0 && (
                <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-left">
                  <div className="text-[11px] font-bold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] uppercase tracking-wider mb-1">
                    Sıradaki İlk Hafta İçi Menüsü:
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-white">
                    {menu[0].date}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-white/60 mt-1">
                    {menu[0].mainDish} • {menu[0].sideDish} • {menu[0].soup} • {menu[0].dessertOrFruit}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setSelectedDateIso('')}
                  className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:opacity-90 active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Tüm Ayın Menüsünü Gör
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6 sm:p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                Seçilen Tarihte Yemekhane Servisi Bulunmuyor
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-white/60 max-w-md mx-auto">
                <strong className="text-stone-700 dark:text-stone-300">{formatIsoToTr(selectedDateIso)}</strong> tarihinde yemekhane hizmet vermemektedir (Resmi tatil veya yayınlanmış menü bulunamadı).
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setDateOffset(0)}
                  className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:opacity-90 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Bugünün Menüsüne Git
                </button>
                <button
                  onClick={() => setSelectedDateIso('')}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  Tüm Ayın Menüsünü Listele
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ================= ALL MENU CARDS LIST ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-stone-500" strokeWidth={2} />
            <h3 className="text-xl font-display font-bold text-stone-900 dark:text-white">
              Tüm Ayın Yemek Listesi
            </h3>
          </div>
        </div>

        {filteredMenuItems.length === 0 ? (
          <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-8 text-center text-stone-500 dark:text-white/60 text-sm">
            Aramanızla eşleşen bir yemek bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredMenuItems.map((item) => {
              const isToday = item.date.toLowerCase() === todayStr;
              const isSelected = selectedMenu?.id === item.id;

              let dayNum = '';
              let monthYear = '';
              let dayName = '';

              const parts = item.date.split(' ');
              if (parts.length >= 2) {
                dayNum = parts[0];
                dayName = parts[parts.length - 1];
                monthYear = parts.slice(1, parts.length - 1).join(' ');
              }

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    // Set as selected date
                    const p = item.date.split(/\s+/);
                    if (p.length >= 2) {
                      const dNum = parseInt(p[0], 10);
                      const mName = p[1].toLowerCase();
                      const mIdx = TURKISH_MONTHS[mName] ?? today.getMonth();
                      const tDate = new Date(today.getFullYear(), mIdx, dNum);
                      const yyyy = tDate.getFullYear();
                      const mm = String(tDate.getMonth() + 1).padStart(2, '0');
                      const dd = String(tDate.getDate()).padStart(2, '0');
                      setSelectedDateIso(`${yyyy}-${mm}-${dd}`);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }
                  }}
                  className={cn(
                    'rounded-2xl p-5 sm:p-6 transition-all border relative overflow-hidden cursor-pointer',
                    isSelected
                      ? 'bg-[var(--brand-primary)]/10 dark:bg-[var(--brand-primary)]/20 border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/30 shadow-md'
                      : isToday
                      ? 'bg-[var(--brand-primary)]/5 dark:bg-[var(--brand-primary)]/15 border-[var(--brand-primary)]/40 shadow-sm hover:border-[var(--brand-primary)]'
                      : 'bg-[#fcfbf9] dark:bg-[#264653] border-[#e6e2d6] dark:border-white/10 hover:border-[var(--brand-primary)]/40 hover:shadow-sm'
                  )}
                >
                  {/* Active highlight bar */}
                  {(isToday || isSelected) && (
                    <div
                      className="absolute top-0 left-0 w-full h-1"
                      style={{ background: isSelected ? 'var(--brand-primary)' : 'var(--brand-accent)' }}
                    ></div>
                  )}

                  {/* Date Header: Calendar tear-off style */}
                  <div className="flex items-center gap-3.5 border-b border-opacity-10 border-current pb-3.5 mb-3.5">
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl min-w-[3.5rem] py-1.5 transition-colors',
                        isSelected
                          ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                          : isToday
                          ? 'bg-[var(--brand-primary)]/90 text-white shadow-md'
                          : 'bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-white/80'
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                        {monthYear.split(' ')[0]}
                      </span>
                      <span className="text-2xl font-display font-black leading-none mt-0.5">{dayNum}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          'text-base sm:text-lg font-display font-bold leading-snug truncate',
                          isToday || isSelected
                            ? 'text-[var(--brand-primary)] dark:text-white font-extrabold'
                            : 'text-stone-800 dark:text-white/90'
                        )}
                      >
                        {dayName}
                      </span>
                      {isToday ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
                          Bugün
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-white/40 truncate">
                          {monthYear}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs sm:text-[0.9rem] font-medium tracking-wide">
                    <li className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          'mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full',
                          isToday || isSelected
                            ? 'bg-[var(--brand-primary)] dark:bg-[var(--brand-accent)]'
                            : 'bg-stone-900 dark:bg-[#fcfbf9]'
                        )}
                      ></div>
                      <span
                        className={cn(
                          'font-bold',
                          isToday || isSelected
                            ? 'text-stone-900 dark:text-white'
                            : 'text-stone-800 dark:text-white/90'
                        )}
                      >
                        {item.mainDish}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600"></div>
                      <span className="text-stone-600 dark:text-white/70">{item.sideDish}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600"></div>
                      <span className="text-stone-600 dark:text-white/70">{item.soup}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600"></div>
                      <span className="text-stone-600 dark:text-white/70">{item.dessertOrFruit}</span>
                    </li>
                  </ul>

                  {item.calories > 0 && (
                    <div
                      className={cn(
                        'mt-4 pt-3 border-t border-opacity-10 border-current text-[10px] font-bold tracking-widest text-right',
                        isToday || isSelected
                          ? 'text-[var(--brand-primary)] dark:text-[var(--brand-accent)]'
                          : 'text-stone-400'
                      )}
                    >
                      {item.calories} KCAL
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= AKILLI KART BAKİYE YÜKLEME & TURNİKE REHBERİ MODAL ================= */}
      <AnimatePresence>
        {showPortalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1f3a47] border border-[#e6e2d6] dark:border-white/10 rounded-3xl p-6 sm:p-7 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-5"
            >
              <button
                type="button"
                onClick={() => setShowPortalModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-500 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center shrink-0 border border-[var(--brand-primary)]/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-stone-900 dark:text-white">
                    K7AÜ Kampüs Kart Bakiye Yükleme & Turnike Rehberi
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-white/60">
                    Online bakiye yükleme, yemekhane servis saatleri ve doğrudan turnike geçiş adımları
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-white/80">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>Portala Giriş ve Kullanıcı Bilgileri</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-white/70 leading-relaxed pl-7">
                    Tarayıcınızdan <strong className="text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">kampuskart.kilis.edu.tr</strong> adresine gidin. Kullanıcı adı alanına <strong>Öğrenci Numaranızı veya T.C. Kimlik Numaranızı</strong>, şifre alanına ise üniversite portal şifrenizi girin.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>Online Bakiye Yükleme (3D Secure Güvenliği)</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-white/70 leading-relaxed pl-7">
                    Sol menüde bulunan <strong>"Bakiye Yükle"</strong> seçeneğine tıklayın. Yüklemek istediğiniz tutarı belirledikten sonra herhangi bir bankaya ait kredi kartı veya banka kartı ile 3D Secure güvencesiyle bakiyenizi anında kartınıza tanımlayın.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-[11px] flex items-center justify-center font-bold">3</span>
                    <span>Rezervasyonsuz Doğrudan Turnike Geçişi</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-white/70 leading-relaxed pl-7">
                    Kilis 7 Aralık Üniversitesi yemekhanesinde <strong>önceden rezervasyon yaptırma zorunluluğu yoktur</strong>. Kampüs kartınızda yeterli bakiye bulunduğu sürece, servis saatleri içerisinde doğrudan turnikeden kartınızı okutarak yemeğinizi alabilirsiniz.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
                    <Clock className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>Yemek Servis Saatleri</span>
                  </div>
                  <ul className="text-xs text-stone-600 dark:text-white/70 leading-relaxed pl-6 space-y-1.5 list-disc list-inside">
                    <li><strong>Öğle Yemeği:</strong> 11:00 – 13:00 saatleri arasında servis edilmektedir.</li>
                    <li>Akşam yemeği servisi bulunmamaktadır.</li>
                    <li>Hafta sonları ve resmi tatillerde yemekhane hizmeti verilmemektedir.</li>
                  </ul>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-2xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>Kart Kaybı & İletişim Destek</span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-white/80 leading-relaxed">
                    Kart kaybı, turnike okuma hataları veya bakiye yükleme sorunlarında <strong>SKS Daire Başkanlığı Yemekhane Şube Müdürlüğü (0348 814 26 66)</strong> veya Mediko Sosyal binası zemin katındaki kart birimi ile iletişime geçebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <a
                  href="https://kampuskart.kilis.edu.tr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Kampüs Kart Portalını Aç (kampuskart.kilis.edu.tr)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPortalModal(false)}
                  className="py-3 px-4 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
