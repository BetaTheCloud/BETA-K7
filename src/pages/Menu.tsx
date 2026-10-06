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
  Search,
  Calendar as CalendarIcon,
  Flame,
  Info,
  CheckCircle2,
  Sparkles,
  X,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import LoadingState from '../components/LoadingState';
import CampusCardModal from '../components/CampusCardModal';

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

export default function Menu() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    return getCachedOrFallback<MenuItem[]>('k7_cached_menu_v6', FALLBACK_MENU);
  });
  const [loading, setLoading] = useState(false);
  const [isCampusCardOpen, setIsCampusCardOpen] = useState(false);

  // Date selection state: ISO string format "YYYY-MM-DD" or null
  const [selectedDateIso, setSelectedDateIso] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Search filter
  const [searchDish, setSearchDish] = useState('');

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
    const targetDayNum = targetDate.getDate();
    const targetMonthIdx = targetDate.getMonth();
    const targetWeekdayName = targetDate.toLocaleDateString('tr-TR', { weekday: 'long' }).toLowerCase();
    const targetFullTr = targetDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase();

    // 1. Direct match with exact Turkish full date
    const exactMatch = menu.find((item) => item.date.toLowerCase().includes(targetFullTr));
    if (exactMatch) return exactMatch;

    // 2. Match by Day number + Month Name
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

    // 3. Match by Weekday Name fallback (if menu dates are named like "Pazartesi Menüsü")
    const weekdayMatch = menu.find((item) => {
      const dateLower = item.date.toLowerCase();
      return dateLower.includes(targetWeekdayName);
    });
    if (weekdayMatch) return weekdayMatch;

    return null;
  };

  const selectedMenu = selectedDateIso ? findMenuForSelectedDate(selectedDateIso) : null;
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

  // Filter menu items by search query
  const filteredMenuItems = useMemo(() => {
    if (!searchDish.trim()) return menu;
    const q = searchDish.toLowerCase().trim();
    return menu.filter((item) => {
      return (
        item.mainDish.toLowerCase().includes(q) ||
        item.sideDish.toLowerCase().includes(q) ||
        item.soup.toLowerCase().includes(q) ||
        item.dessertOrFruit.toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q)
      );
    });
  }, [menu, searchDish]);

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
            if (window.history.length > 1) navigate(-1);
            else navigate('/');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold mb-3 transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
          <span>Geri Menüye Dön</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white flex items-center gap-3">
              <ChefHat className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
              Yemek Menüsü
            </h2>
            <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 tracking-wide font-medium">
              Kilis 7 Aralık Üniversitesi Sağlık, Kültür ve Spor Daire Başkanlığı Aylık Yemekhane Menüsü
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCampusCardOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/25 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <CreditCard className="w-4 h-4" />
            <span>Kartına Bakiye Yükle (Kampüs Kart)</span>
          </button>
        </div>
      </header>

      {/* ================= DATE PICKER & INTERACTIVE CONTROLS ================= */}
      <section className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
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
                  ? 'bg-amber-600 text-white shadow-sm'
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

        {/* Date Input & Dish Search in one line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Native Date Input */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDateIso}
              onChange={(e) => setSelectedDateIso(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e2d6] dark:border-white/15 bg-white dark:bg-white/5 text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer"
              title="Tarih Seçiniz"
            />
          </div>

          {/* Dish Name Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Yemek veya tatlı ara (örn: tavuk, köfte, pilav)..."
              value={searchDish}
              onChange={(e) => setSearchDish(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#e6e2d6] dark:border-white/15 bg-white dark:bg-white/5 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-stone-400 dark:placeholder-white/40 transition-all"
            />
            {searchDish && (
              <button
                onClick={() => setSearchDish('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
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
            <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-amber-600/20 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute -right-8 -top-8 md:-right-4 md:-top-4 opacity-10 pointer-events-none">
                <ChefHat strokeWidth={1.5} className="w-48 h-48 md:w-64 md:h-64" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-amber-50 font-bold tracking-wide uppercase text-xs px-3.5 py-1.5 rounded-full">
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
                    <div className="text-amber-200 text-xs font-bold uppercase tracking-widest mb-1.5">
                      1. Ana Yemek
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-display font-black leading-tight text-white drop-shadow-sm">
                      {selectedMenu.mainDish}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-amber-400/30 pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8">
                    <div>
                      <div className="text-amber-200 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                        2. Yardımcı Yemek
                      </div>
                      <div className="text-lg md:text-xl font-bold">{selectedMenu.sideDish}</div>
                    </div>
                    <div>
                      <div className="text-amber-200 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                        3. Çorba
                      </div>
                      <div className="text-lg md:text-xl font-bold">{selectedMenu.soup}</div>
                    </div>
                    <div>
                      <div className="text-amber-200 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                        4. Tatlı / Meyve / İçecek / Salata
                      </div>
                      <div className="text-lg md:text-xl font-bold">{selectedMenu.dessertOrFruit}</div>
                    </div>
                  </div>
                </div>

                {selectedMenu.calories > 0 && (
                  <div className="mt-6 pt-3 border-t border-amber-400/30 text-xs font-bold tracking-widest text-amber-100 flex items-center justify-end gap-1.5">
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>{selectedMenu.calories} KCAL</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6 sm:p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                Seçilen Tarihte Yemekhane Servisi Bulunmuyor
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-white/60 max-w-md mx-auto">
                <strong className="text-stone-700 dark:text-stone-300">{formatIsoToTr(selectedDateIso)}</strong> tarihinde yemekhane hizmet vermemektedir (Hafta sonu tatili veya resmi tatil).
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setDateOffset(0)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
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
              {searchDish ? `"${searchDish}" İçeren Günler (${filteredMenuItems.length})` : 'Tüm Ayın Yemek Listesi'}
            </h3>
          </div>
          {searchDish && (
            <button
              onClick={() => setSearchDish('')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              Aramayı Temizle
            </button>
          )}
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
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                      : isToday
                      ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/60 dark:border-amber-500/30 shadow-sm hover:border-amber-400'
                      : 'bg-[#fcfbf9] dark:bg-[#264653] border-[#e6e2d6] dark:border-white/10 hover:border-amber-400/50 hover:shadow-sm'
                  )}
                >
                  {/* Active highlight bar */}
                  {(isToday || isSelected) && (
                    <div className={cn('absolute top-0 left-0 w-full h-1', isSelected ? 'bg-amber-500' : 'bg-amber-400')}></div>
                  )}

                  {/* Date Header: Calendar tear-off style */}
                  <div className="flex items-center gap-3.5 border-b border-opacity-10 border-current pb-3.5 mb-3.5">
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl min-w-[3.5rem] py-1.5',
                        isSelected
                          ? 'bg-amber-600 text-white shadow-sm'
                          : isToday
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
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
                            ? 'text-amber-900 dark:text-amber-100'
                            : 'text-stone-800 dark:text-white/90'
                        )}
                      >
                        {dayName}
                      </span>
                      {isToday ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
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
                            ? 'bg-amber-600 dark:bg-amber-400'
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
                          ? 'text-amber-600/90 dark:text-amber-400'
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

      {/* Campus Card Modal */}
      <CampusCardModal
        isOpen={isCampusCardOpen}
        onClose={() => setIsCampusCardOpen(false)}
      />
    </motion.div>
  );
}
