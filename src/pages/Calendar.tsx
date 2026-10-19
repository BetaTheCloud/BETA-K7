import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getCalendarEvents, getCachedOrFallback } from '../mockData';
import { CalendarEvent } from '../types';
import { classifyCalendarEvent } from '../utils/calendarClassifier';
import {
  analyzeEvent,
  getGoogleCalendarUrl,
  downloadEventIcs,
  downloadAllCalendarIcs,
  ParsedEventInfo
} from '../utils/calendarHelpers';
import {
  Calendar as CalendarIcon,
  BookOpen,
  Flag,
  Bookmark,
  GraduationCap,
  ListFilter,
  RefreshCw,
  ArrowLeft,
  Search,
  Clock,
  ArrowRight,
  AlertCircle,
  Download,
  CalendarCheck2,
  CalendarPlus,
  ExternalLink,
  CheckCircle2,
  X,
  CalendarDays
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

const INITIAL_FALLBACK_CALENDAR: CalendarEvent[] = [
  { id: 'g1', title: 'Özel Öğrenci Giden/Gelen Başvurusu İçin Son Gün', date: '2026-08-14', term: 'Güz Yarıyılı', type: 'registration' as const, rawStart: '14 Ağustos 2026' },
  { id: 'g2', title: 'Ders Muafiyetleri İle İlgili Dekanlık/Müdürlüğe Başvuru İçin Son Gün', date: '2026-08-28', term: 'Güz Yarıyılı', type: 'registration' as const, rawStart: '28 Ağustos 2026' },
  { id: 'g3', title: 'Çift Anadal / Yandal Başvuruları', date: '2026-08-24', endDate: '2026-08-28', term: 'Güz Yarıyılı', type: 'registration' as const, rawStart: '24 Ağustos 2026', rawEnd: '28 Ağustos 2026' },
  { id: 'g4', title: 'Katkı Payı ve Öğrenim Ücreti Yatırma / Kayıt Yenileme ve Ders Kayıtları', date: '2026-09-07', endDate: '2026-09-11', term: 'Güz Yarıyılı', type: 'registration' as const, rawStart: '07 Eylül 2026', rawEnd: '11 Eylül 2026' },
  { id: 'g5', title: 'Ders Ekleme-Bırakma ve Danışman Onayı', date: '2026-09-07', endDate: '2026-09-15', term: 'Güz Yarıyılı', type: 'registration' as const, rawStart: '07 Eylül 2026', rawEnd: '15 Eylül 2026' },
  { id: 'g8', title: 'Güz Yarıyılı Derslerinin Başlaması ve Sona Ermesi', date: '2026-09-14', endDate: '2026-12-25', term: 'Güz Yarıyılı', type: 'other' as const, rawStart: '14 Eylül 2026', rawEnd: '25 Aralık 2026' },
  { id: 'g9', title: 'Güz Yarıyılı Ara Sınavları (Vize)', date: '2026-10-31', endDate: '2026-11-08', term: 'Güz Yarıyılı', type: 'exam' as const, rawStart: '31 Ekim 2026', rawEnd: '08 Kasım 2026' },
  { id: 'g10', title: 'Yarıyıl Sonu Sınavları (Final)', date: '2026-12-26', endDate: '2027-01-03', term: 'Güz Yarıyılı', type: 'exam' as const, rawStart: '26 Aralık 2026', rawEnd: '03 Ocak 2027' },
  { id: 'g11', title: 'Bütünleme Sınavları', date: '2027-01-11', endDate: '2027-01-15', term: 'Güz Yarıyılı', type: 'exam' as const, rawStart: '11 Ocak 2027', rawEnd: '15 Ocak 2027' },
  { id: 't1', title: 'Cumhuriyet Bayramı', date: '2026-10-29', term: 'Resmi Tatiller', type: 'holiday' as const, rawStart: '29 Ekim 2026' },
  { id: 't2', title: 'Yılbaşı Tatili', date: '2027-01-01', term: 'Resmi Tatiller', type: 'holiday' as const, rawStart: '01 Ocak 2027' }
];

type CategoryFilter = 'all' | 'exam' | 'registration' | 'other' | 'holiday';

export default function Calendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const raw = getCachedOrFallback<CalendarEvent[]>('k7_cached_calendar', INITIAL_FALLBACK_CALENDAR);
    return raw.map(classifyCalendarEvent);
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string>('Tümü');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyUpcoming, setOnlyUpcoming] = useState<boolean>(false);

  const loadData = async (force: boolean = false) => {
    if (force) setRefreshing(true);

    try {
      const data = await getCalendarEvents(force);
      if (data && data.length > 0) {
        const classified = data.map(classifyCalendarEvent);
        classified.sort((a, b) => {
          const timeA = a.date ? new Date(a.date).getTime() : 0;
          const timeB = b.date ? new Date(b.date).getTime() : 0;
          return timeA - timeB;
        });
        setEvents(classified);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // Pre-calculate analyzed data for all events
  const analyzedEvents = useMemo(() => {
    return events.map((event) => ({
      event,
      info: analyzeEvent(event)
    }));
  }, [events]);

  // Find currently active or next upcoming hero event
  const heroEvent = useMemo(() => {
    if (analyzedEvents.length === 0) return null;
    
    // 1. First priority: Currently active event
    const active = analyzedEvents.find(item => item.info.status === 'active');
    if (active) return active;

    // 2. Second priority: Today deadline
    const deadline = analyzedEvents.find(item => item.info.status === 'today-deadline');
    if (deadline) return deadline;

    // 3. Third priority: Upcoming event with nearest daysUntilStart >= 0
    const upcoming = analyzedEvents
      .filter(item => item.info.daysUntilStart >= 0)
      .sort((a, b) => a.info.daysUntilStart - b.info.daysUntilStart)[0];
    
    return upcoming || analyzedEvents[0];
  }, [analyzedEvents]);

  // Filter terms
  const presentTerms: string[] = Array.from(new Set(events.map(e => e.term || 'Diğer')));
  const standardOrder: string[] = ['Güz Yarıyılı', 'Bahar Yarıyılı', 'Resmi Tatiller', 'Lisansüstü'];
  const orderedPresentTerms: string[] = [
    ...standardOrder.filter(t => presentTerms.includes(t)),
    ...presentTerms.filter(t => !standardOrder.includes(t))
  ];
  const terms: string[] = ['Tümü', ...orderedPresentTerms];

  // Filtered events
  const filteredAnalyzedEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return analyzedEvents.filter(({ event, info }) => {
      // Semester / Term filter
      if (selectedTerm !== 'Tümü' && (event.term || 'Diğer') !== selectedTerm) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && event.type !== selectedCategory) {
        return false;
      }

      // Only upcoming / active toggle
      if (onlyUpcoming && info.status === 'past') {
        return false;
      }

      // Search query
      if (q) {
        const titleMatch = (event.title || '').toLowerCase().includes(q);
        const termMatch = (event.term || '').toLowerCase().includes(q);
        const dateMatch = (info.startFormatted.fullDisplay || '').toLowerCase().includes(q) ||
                          (info.endFormatted?.fullDisplay || '').toLowerCase().includes(q);
        return titleMatch || termMatch || dateMatch;
      }

      return true;
    });
  }, [analyzedEvents, selectedTerm, selectedCategory, onlyUpcoming, searchQuery]);

  // Group filtered events by term for display
  const groupedEvents = useMemo(() => {
    const groups: Record<string, Array<{ event: CalendarEvent; info: ParsedEventInfo }>> = {};
    for (const item of filteredAnalyzedEvents) {
      const term = item.event.term || 'Diğer';
      if (!groups[term]) groups[term] = [];
      groups[term].push(item);
    }
    return groups;
  }, [filteredAnalyzedEvents]);

  const categoryCounts = useMemo(() => {
    return {
      all: events.length,
      exam: events.filter(e => e.type === 'exam').length,
      registration: events.filter(e => e.type === 'registration').length,
      other: events.filter(e => e.type === 'other').length,
      holiday: events.filter(e => e.type === 'holiday').length,
    };
  }, [events]);

  const hasActiveFilters = selectedTerm !== 'Tümü' || selectedCategory !== 'all' || searchQuery !== '' || onlyUpcoming;

  const resetFilters = () => {
    setSelectedTerm('Tümü');
    setSelectedCategory('all');
    setSearchQuery('');
    setOnlyUpcoming(false);
  };

  const getTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return <BookOpen strokeWidth={2} className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'registration': return <Bookmark strokeWidth={2} className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'holiday': return <Flag strokeWidth={2} className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default: return <GraduationCap strokeWidth={2} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const getTypeName = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return 'Sınav & Not';
      case 'registration': return 'Kayıt & Başvuru';
      case 'holiday': return 'Resmi Tatil';
      default: return 'Ders & Akademik Süreç';
    }
  };

  const getTypeBadgeStyle = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam':
        return 'bg-rose-100/90 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30';
      case 'registration':
        return 'bg-indigo-100/90 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30';
      case 'holiday':
        return 'bg-amber-100/90 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
      default:
        return 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
    }
  };

  if (loading) {
    return <LoadingState message="Akademik Takvim Yükleniyor..." subtitle="2026-2027 öğretim yılı ve tatil verileri alınıyor" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      {/* Top Navigation & Breadcrumbs */}
      <header className="border-b border-[#e6e2d6] dark:border-white/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
            <span>Ana Sayfaya Dön</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => downloadAllCalendarIcs(events)}
              title="Tüm akademik takvimi telefon veya bilgisayar takviminize (.ics) indirin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all border border-stone-200 dark:border-white/10 shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span>Tümünü Takvime İndir (.ics)</span>
            </button>

            <button
              onClick={() => navigate('/schedule')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ders & Sınav Programım →</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="Takvimi Yenile"
              className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:text-white/70 dark:hover:text-white bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/10 hover:bg-stone-200 dark:hover:bg-white/15 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white flex items-center gap-3 tracking-tight">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                <CalendarDays className="w-6 h-6" strokeWidth={2} />
              </div>
              Akademik Takvim
            </h1>
            <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm mt-1.5 font-medium">
              Kilis 7 Aralık Üniversitesi 2026-2027 Eğitim Öğretim Yılı Sınav, Kayıt ve Tatil Takvimi
            </p>
          </div>
        </div>
      </header>

      {/* HERO BANNER: Current or Next Academic Milestone */}
      {heroEvent && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-50/90 via-[#fcfbf9] to-amber-100/30 dark:from-amber-950/20 dark:via-[#264653] dark:to-amber-900/10 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                {heroEvent.info.status === 'active' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  heroEvent.info.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className="text-[11px] font-black tracking-widest uppercase text-amber-900 dark:text-amber-300">
                {heroEvent.info.status === 'active' ? 'ŞU ANDA DEVAM EDEN SÜREÇ' : 'SIRADAKİ AKADEMİK SÜREÇ'}
              </span>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              heroEvent.info.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
            }`}>
              {heroEvent.info.statusLabel}
            </span>
          </div>

          <h3 className="text-base sm:text-xl font-display font-extrabold text-stone-900 dark:text-white mb-4">
            {heroEvent.event.title}
          </h3>

          {/* DEDICATED START & END TIMELINE IN HERO */}
          {heroEvent.info.isRange && heroEvent.info.endFormatted ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/5 border border-emerald-500/30 shadow-xs">
                <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    BAŞLANGIÇ TARİHİ
                  </span>
                  <span className="text-sm font-bold text-stone-900 dark:text-white block leading-tight">
                    {heroEvent.info.startFormatted.dateStr}
                  </span>
                  <span className="text-xs font-semibold text-stone-500 dark:text-white/60">
                    {heroEvent.info.startFormatted.dayName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/5 border border-rose-500/30 shadow-xs">
                <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0">
                  <CalendarCheck2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                    BİTİŞ TARİHİ
                  </span>
                  <span className="text-sm font-bold text-stone-900 dark:text-white block leading-tight">
                    {heroEvent.info.endFormatted.dateStr}
                  </span>
                  <span className="text-xs font-semibold text-stone-500 dark:text-white/60">
                    {heroEvent.info.endFormatted.dayName}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-amber-500/30 flex items-center gap-3.5 mb-4 shadow-xs">
              <div className="p-2.5 rounded-lg bg-amber-600 text-white shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                  {heroEvent.info.isDeadline ? '⚠️ SON GÜN / TESLİM TARİHİ' : 'ETKİNLİK TARİHİ'}
                </span>
                <span className="text-base font-extrabold text-stone-900 dark:text-white">
                  {heroEvent.info.startFormatted.dateStr}
                </span>
                <span className="text-xs font-bold text-stone-500 dark:text-white/60 ml-2">
                  ({heroEvent.info.startFormatted.dayName})
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-amber-500/20">
            <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-white/70">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                {heroEvent.info.isRange ? `Toplam Süre: ${heroEvent.info.durationText}` : 'Tek Günlük Etkinlik'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={getGoogleCalendarUrl(heroEvent.event, heroEvent.info)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Google Takvim'e Ekle</span>
              </a>
              <button
                onClick={() => downloadEventIcs(heroEvent.event, heroEvent.info)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-200/80 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-800 dark:text-white text-xs font-semibold shadow-xs transition-all"
                title=".ics Takvim Dosyasını İndir"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.ics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="space-y-3 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Takvimde ara (örn: Vize, Final, Ders Kaydı, Ekle-Bırak, Bütünleme, Tatil, Muafiyet)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-stone-100/90 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Semester / Term Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <ListFilter className="w-4 h-4 text-stone-400 mr-1 shrink-0" />
          {terms.map((term) => {
            const count = term === 'Tümü' 
              ? events.length 
              : events.filter(e => (e.term || 'Diğer') === term).length;

            return (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedTerm === term
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs'
                    : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/10'
                }`}
              >
                {term}
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-md ${
                  selectedTerm === term
                    ? 'bg-white/20 text-white dark:bg-stone-900/15 dark:text-stone-900'
                    : 'bg-stone-200/80 dark:bg-white/10 text-stone-500 dark:text-white/60'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Pills & Upcoming Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/10'
              }`}
            >
              Tüm Türler ({categoryCounts.all})
            </button>

            <button
              onClick={() => setSelectedCategory('exam')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'exam'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Sınavlar ({categoryCounts.exam})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('registration')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'registration'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>Kayıt & Başvuru ({categoryCounts.registration})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('other')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'other'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Ders Dönemi ({categoryCounts.other})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('holiday')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'holiday'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20'
              }`}
            >
              <Flag className="w-3 h-3" />
              <span>Resmi Tatiller ({categoryCounts.holiday})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={onlyUpcoming}
                onChange={(e) => setOnlyUpcoming(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 dark:border-white/20 bg-stone-100 dark:bg-white/10"
              />
              <span>Sadece Aktif & Yaklaşanlar</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER RESULTS COUNTER */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-white/60 px-1">
        <span>
          Toplam <strong>{events.length}</strong> etkinlikten <strong>{filteredAnalyzedEvents.length}</strong> tanesi listeleniyor
        </span>
        {selectedTerm !== 'Tümü' && (
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            Dönem: {selectedTerm}
          </span>
        )}
      </div>

      {/* NO RESULTS VIEW */}
      {filteredAnalyzedEvents.length === 0 && (
        <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-dashed border-[#e6e2d6] dark:border-white/20 rounded-2xl p-8 sm:p-12 text-center space-y-3">
          <CalendarIcon className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-900 dark:text-white">
            Aramanıza Uygun Etkinlik Bulunamadı
          </h3>
          <p className="text-xs text-stone-500 dark:text-white/60 max-w-md mx-auto">
            Farklı bir arama kelimesi deneyebilir veya tüm akademik takvimi görmek için filtreleri sıfırlayabilirsiniz.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-xs hover:bg-amber-400 transition-all cursor-pointer"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* GROUPED CALENDAR EVENTS LIST */}
      <div className="space-y-8">
        {orderedPresentTerms.filter(t => groupedEvents[t] && groupedEvents[t].length > 0).map((term) => {
          const termItems = groupedEvents[term];
          const isHolidayTerm = term === 'Resmi Tatiller';

          return (
            <section key={term} className="space-y-4">
              {/* Term Header */}
              <div className="flex items-center justify-between border-b border-[#e6e2d6] dark:border-white/10 pb-2.5">
                <h2 className="text-lg sm:text-xl font-display font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isHolidayTerm ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  <span>{term}</span>
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-200/80 dark:bg-white/10 text-stone-600 dark:text-white/70">
                  {termItems.length} Etkinlik
                </span>
              </div>

              {/* Event Cards */}
              <div className="space-y-4">
                {termItems.map(({ event, info }) => {
                  const isRange = info.isRange && info.endFormatted;

                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative bg-[#fcfbf9] dark:bg-[#264653] border rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all ${
                        info.status === 'active'
                          ? 'border-emerald-500/50 ring-1 ring-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.04] to-transparent'
                          : info.status === 'today-deadline'
                          ? 'border-rose-500/50 ring-1 ring-rose-500/20'
                          : event.type === 'holiday'
                          ? 'border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-r from-amber-500/[0.03] to-transparent'
                          : 'border-[#e6e2d6] dark:border-white/10'
                      }`}
                    >
                      {/* Top Badges & Category */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider px-2.5 py-0.8 rounded-md uppercase border ${getTypeBadgeStyle(event.type)}`}>
                            {getTypeIcon(event.type)}
                            <span>{getTypeName(event.type)}</span>
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/60 border border-stone-200 dark:border-white/10">
                            {event.term || 'Akademik'}
                          </span>
                        </div>

                        {/* Temporal status badge */}
                        <div className="flex items-center gap-1.5">
                          {info.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              Devam Ediyor
                            </span>
                          )}
                          {info.status === 'today-deadline' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[11px] font-extrabold">
                              <AlertCircle className="w-3 h-3" />
                              Bugün Son Gün!
                            </span>
                          )}
                          {info.status === 'upcoming' && (
                            <span className="text-[11px] font-semibold text-stone-500 dark:text-white/60">
                              {info.statusLabel}
                            </span>
                          )}
                          {info.status === 'past' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-white/5 text-stone-400 dark:text-white/40">
                              Tamamlandı
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-extrabold text-base sm:text-lg text-stone-900 dark:text-white leading-snug mb-4">
                        {event.title}
                      </h3>

                      {/* CLEAR, UNAMBIGUOUS DATE SECTION */}
                      {isRange ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 sm:p-3.5 rounded-xl bg-stone-100/70 dark:bg-black/20 border border-stone-200/80 dark:border-white/10">
                            {/* BAŞLANGIÇ KUTUSU */}
                            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25">
                              <div className="p-2 rounded-md bg-emerald-600 text-white shrink-0 shadow-xs">
                                <CalendarPlus className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-black tracking-wider uppercase text-emerald-800 dark:text-emerald-300 block">
                                  🟢 BAŞLANGIÇ TARİHİ
                                </span>
                                <span className="text-sm font-extrabold text-stone-900 dark:text-white block leading-tight">
                                  {info.startFormatted.dateStr}
                                </span>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                                  {info.startFormatted.dayName}
                                </span>
                              </div>
                            </div>

                            {/* BİTİŞ KUTUSU */}
                            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/25">
                              <div className="p-2 rounded-md bg-rose-600 text-white shrink-0 shadow-xs">
                                <CalendarCheck2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-black tracking-wider uppercase text-rose-800 dark:text-rose-300 block">
                                  🔴 BİTİŞ TARİHİ
                                </span>
                                <span className="text-sm font-extrabold text-stone-900 dark:text-white block leading-tight">
                                  {info.endFormatted?.dateStr}
                                </span>
                                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                                  {info.endFormatted?.dayName}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-white/60 px-1 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Süreç Uzunluğu: <strong className="text-stone-700 dark:text-white/90">{info.durationText}</strong></span>
                            </span>
                            {info.status === 'active' && info.daysUntilEnd > 0 && (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                Bitimine {info.daysUntilEnd} gün var
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* SINGLE DATE / DEADLINE BOX */
                        <div className={`p-3 rounded-xl border flex items-center gap-3.5 ${
                          info.isDeadline
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : event.type === 'holiday'
                            ? 'bg-amber-500/10 border-amber-500/25'
                            : 'bg-stone-100/70 dark:bg-black/20 border-stone-200/80 dark:border-white/10'
                        }`}>
                          <div className={`p-2.5 rounded-lg text-white shrink-0 shadow-xs ${
                            info.isDeadline
                              ? 'bg-amber-600'
                              : event.type === 'holiday'
                              ? 'bg-red-600'
                              : event.type === 'exam'
                              ? 'bg-rose-600'
                              : 'bg-indigo-600'
                          }`}>
                            {info.isDeadline ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : event.type === 'holiday' ? (
                              <Flag className="w-4 h-4" />
                            ) : event.type === 'exam' ? (
                              <BookOpen className="w-4 h-4" />
                            ) : (
                              <CalendarIcon className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <span className={`text-[10px] font-black tracking-wider uppercase block ${
                              info.isDeadline
                                ? 'text-amber-800 dark:text-amber-300'
                                : event.type === 'holiday'
                                ? 'text-red-700 dark:text-red-400'
                                : 'text-stone-500 dark:text-white/60'
                            }`}>
                              {info.isDeadline 
                                ? '⚠️ SON GÜN / TESLİM TARİHİ' 
                                : event.type === 'holiday' 
                                ? 'RESMİ TATİL GÜNÜ' 
                                : event.type === 'exam'
                                ? 'SINAV GÜNÜ'
                                : 'ETKİNLİK TARİHİ'}
                            </span>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-base font-extrabold text-stone-900 dark:text-white">
                                {info.startFormatted.dateStr}
                              </span>
                              <span className="text-xs font-bold text-stone-600 dark:text-white/70">
                                ({info.startFormatted.dayName})
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Action Buttons: Add to Calendar, Download .ics */}
                      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-stone-200/60 dark:border-white/10">
                        <a
                          href={getGoogleCalendarUrl(event, info)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10"
                          title="Google Takvime Ekle"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Google Takvim</span>
                        </a>

                        <button
                          onClick={() => downloadEventIcs(event, info)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 cursor-pointer"
                          title="Apple / Outlook Takvim için .ics İndir"
                        >
                          <Download className="w-3 h-3 text-stone-500 dark:text-white/60" />
                          <span>.ics</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </motion.div>
  );
}
