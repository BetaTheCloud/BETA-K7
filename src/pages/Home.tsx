/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getAnnouncements,
  getNews,
  getEvents,
  getMenu,
  getCalendarEvents,
  getCachedOrFallback,
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_NEWS,
  FALLBACK_EVENTS,
  FALLBACK_MENU
} from '../mockData';
import { Announcement, MenuItem, CampusEvent, CalendarEvent } from '../types';
import {
  Megaphone,
  Newspaper,
  ChefHat,
  ChevronRight,
  Search,
  Calendar,
  FileText,
  BookOpen,
  Trophy,
  LayoutGrid,
  Users,
  Utensils,
  Clock,
  MapPin,
  SlidersHorizontal,
  GraduationCap,
  PhoneCall,
  ChevronUp,
  ChevronDown,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  Bus,
  Hotel,
  Landmark,
  CalendarClock,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DetailModal, { DetailModalItem } from '../components/DetailModal';
import WeatherWidget from '../components/WeatherWidget';
import WeatherBackground from '../components/WeatherBackground';
import PullToRefresh from '../components/PullToRefresh';
import TodayScheduleWidget from '../components/TodayScheduleWidget';
import ScheduleManagerModal from '../components/ScheduleManagerModal';
import SectionHeader from '../components/SectionHeader';
import { getAcademicSummaryEvents } from '../utils/calendarHelpers';
import {
  getHomeWidgetConfigs,
  saveHomeWidgetConfigs,
  moveWidget,
  moveVisibleWidget,
  toggleWidgetVisibility,
  resetHomeWidgetConfigs,
  WidgetConfig,
  WidgetId,
  WIDGETS_CHANGED_EVENT
} from '../lib/widgetStorage';
import {
  QuickServiceConfig,
  getQuickServicesConfigs,
  QUICK_SERVICES_CHANGED_EVENT
} from '../lib/quickServicesStorage';
import { parseDateToTimestamp, getTodayMenuInfo, TodayMenuInfo, cleanDuplicateTitle } from '../lib/utils';
import { getPinnedUnit } from '../lib/pinnedStorage';
import toast from 'react-hot-toast';

export default function Home() {
  const [pinnedUnit, setPinnedUnit] = useState<string | null>(() => getPinnedUnit());
  const [isScheduleManagerOpen, setIsScheduleManagerOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_announcements', FALLBACK_ANNOUNCEMENTS);
  });

  const [news, setNews] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_news', FALLBACK_NEWS);
  });

  const [events, setEvents] = useState<CampusEvent[]>(() => {
    return getCachedOrFallback<CampusEvent[]>('k7_cached_events_v5', FALLBACK_EVENTS);
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    return getCachedOrFallback<CalendarEvent[]>('k7_cached_calendar', []);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [todayMenuInfo, setTodayMenuInfo] = useState<TodayMenuInfo<MenuItem>>(() => {
    const menuList = getCachedOrFallback<MenuItem[]>('k7_cached_menu_v6', FALLBACK_MENU);
    return getTodayMenuInfo(menuList);
  });

  const [weatherInfo, setWeatherInfo] = useState<{ code: number; isDay: number } | null>(null);

  // Widget Customization State
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(() => getHomeWidgetConfigs());
  const [quickServices, setQuickServices] = useState<QuickServiceConfig[]>(() => getQuickServicesConfigs());
  const [inlineEditMode, setInlineEditMode] = useState(false);

  const handleWeatherChange = useCallback((code: number, isDay: number) => {
    setWeatherInfo((prev) => {
      if (prev && prev.code === code && prev.isDay === isDay) return prev;
      return { code, isDay };
    });
  }, []);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<DetailModalItem | null>(null);

  const handleRefresh = async () => {
    try {
      const [announcementsData, newsData, eventsData, menuData, calendarData] = await Promise.all([
        getAnnouncements(true),
        getNews(true),
        getEvents(true),
        getMenu(true),
        getCalendarEvents(true)
      ]);
      if (announcementsData?.length) setAnnouncements(announcementsData);
      if (newsData?.length) setNews(newsData);
      if (eventsData?.length) setEvents(eventsData);
      if (menuData?.length) setTodayMenuInfo(getTodayMenuInfo(menuData));
      if (calendarData?.length) setCalendarEvents(calendarData);
      window.dispatchEvent(new CustomEvent('k7_force_refreshed'));
    } catch (error) {
      console.error('Yenileme hatası', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [announcementsData, newsData, eventsData, menuData, calendarData] = await Promise.all([
          getAnnouncements(false), // SWR & Client Cache
          getNews(false),          // SWR & Client Cache
          getEvents(false),        // SWR & Client Cache
          getMenu(),              // 24 saat TTL
          getCalendarEvents()     // 14 gün TTL
        ]);

        if (!isMounted) return;
        if (announcementsData?.length) setAnnouncements(announcementsData);
        if (newsData?.length) setNews(newsData);
        if (eventsData?.length) setEvents(eventsData);
        if (menuData?.length) setTodayMenuInfo(getTodayMenuInfo(menuData));
        if (calendarData?.length) setCalendarEvents(calendarData);
      } catch (error) {
        console.warn('Veri güncellenirken bildirim:', error);
      }
    }

    loadDashboardData();

    const onGlobalRefresh = () => {
      loadDashboardData();
    };
    window.addEventListener('k7_force_refreshed', onGlobalRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener('k7_force_refreshed', onGlobalRefresh);
    };
  }, []);

  useEffect(() => {
    const onPinnedChange = () => {
      setPinnedUnit(getPinnedUnit());
    };
    window.addEventListener('k7_pinned_unit_changed', onPinnedChange);
    return () => {
      window.removeEventListener('k7_pinned_unit_changed', onPinnedChange);
    };
  }, []);

  // Sync widget configuration events
  useEffect(() => {
    const handleWidgetsChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setWidgetConfigs(e.detail);
      } else {
        setWidgetConfigs(getHomeWidgetConfigs());
      }
    };
    window.addEventListener(WIDGETS_CHANGED_EVENT, handleWidgetsChange);
    return () => {
      window.removeEventListener(WIDGETS_CHANGED_EVENT, handleWidgetsChange);
    };
  }, []);

  // Sync quick services configuration events
  useEffect(() => {
    const handleQuickServicesChange = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setQuickServices(e.detail);
      } else {
        setQuickServices(getQuickServicesConfigs());
      }
    };
    window.addEventListener(QUICK_SERVICES_CHANGED_EVENT, handleQuickServicesChange);
    return () => {
      window.removeEventListener(QUICK_SERVICES_CHANGED_EVENT, handleQuickServicesChange);
    };
  }, []);

  useEffect(() => {
    const handleOpenSchedule = () => setIsScheduleManagerOpen(true);
    window.addEventListener('k7_open_schedule', handleOpenSchedule);
    return () => {
      window.removeEventListener('k7_open_schedule', handleOpenSchedule);
    };
  }, []);

  const handleInlineMove = (id: WidgetId, direction: 'up' | 'down') => {
    setWidgetConfigs((prev) => {
      const updated = moveVisibleWidget(prev, id, direction);
      saveHomeWidgetConfigs(updated);
      return updated;
    });
  };

  const handleInlineHide = (id: WidgetId, title: string) => {
    setWidgetConfigs((prev) => {
      const visibleCount = prev.filter((c) => c.visible).length;
      if (visibleCount <= 1) {
        toast.error('En az bir widget görünür kalmalıdır!');
        return prev;
      }
      const updated = toggleWidgetVisibility(prev, id);
      saveHomeWidgetConfigs(updated);
      toast.success(`"${title}" widget'ı gizlendi`);
      return updated;
    });
  };

  const handleResetWidgets = () => {
    const defaults = resetHomeWidgetConfigs();
    setWidgetConfigs(defaults);
    toast.success('Widget düzeni varsayılana sıfırlandı');
  };

  const isMainAnnouncement = (item: Announcement) => {
    const cat = (item.category || '').toLowerCase().trim();
    return (
      cat === 'ana duyurular' ||
      cat === 'ana duyuru' ||
      cat.includes('ana duyuru') ||
      cat.includes('genel') ||
      cat.includes('rektörlük')
    );
  };

  const isMainNews = (item: Announcement) => {
    const cat = (item.category || '').toLowerCase().trim();
    return (
      cat === 'üniversite haberleri' ||
      cat === 'universite haberleri' ||
      cat.includes('üniversite haber') ||
      cat.includes('universite haber') ||
      cat.includes('ana haber') ||
      cat.includes('genel')
    );
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const isMainA = isMainAnnouncement(a);
    const isMainB = isMainAnnouncement(b);
    if (isMainA && !isMainB) return -1;
    if (!isMainA && isMainB) return 1;
    return parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date);
  });

  const sortedNews = [...news].sort((a, b) => {
    const isMainA = isMainNews(a);
    const isMainB = isMainNews(b);
    if (isMainA && !isMainB) return -1;
    if (!isMainA && isMainB) return 1;
    return parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date);
  });

  const filteredAnnouncements = searchQuery
    ? sortedAnnouncements.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedAnnouncements.slice(0, 3);

  const filteredNews = searchQuery
    ? sortedNews.filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedNews.slice(0, 3);

  const filteredEvents = useMemo(() => {
    const seen = new Set<string>();
    const seenImgs = new Set<string>();
    const unique = events
      .filter((e) => {
        const cleanTitle = cleanDuplicateTitle(e.title);
        const key = (e.url || cleanTitle || '').trim().toLowerCase();
        const imgKey = e.img ? e.img.trim().toLowerCase() : '';
        if (seen.has(key)) return false;
        if (imgKey && seenImgs.has(imgKey)) return false;
        seen.add(key);
        if (imgKey) seenImgs.add(imgKey);
        return true;
      })
      .map((e) => ({ ...e, title: cleanDuplicateTitle(e.title) }));

    if (searchQuery) {
      return unique.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return unique.slice(0, 3);
  }, [events, searchQuery]);

  // Academic highlight items (shows ongoing process first, followed by upcoming milestones)
  const academicSummary = useMemo(() => {
    const list = calendarEvents.length > 0 ? calendarEvents : [
      { id: 'g8', title: 'Güz Yarıyılı Derslerinin Başlaması ve Sona Ermesi', date: '2026-09-14', endDate: '2026-12-25', term: 'Güz Yarıyılı', type: 'other' as const },
      { id: 't1', title: 'Cumhuriyet Bayramı', date: '2026-10-29', term: 'Resmi Tatiller', type: 'holiday' as const },
      { id: 'g9', title: 'Güz Yarıyılı Ara Sınavları (Vize)', date: '2026-10-31', endDate: '2026-11-08', term: 'Güz Yarıyılı', type: 'exam' as const },
      { id: 'g10', title: 'Yarıyıl Sonu Sınavları (Final)', date: '2026-12-26', endDate: '2027-01-03', term: 'Güz Yarıyılı', type: 'exam' as const },
      { id: 't2', title: 'Yılbaşı Tatili', date: '2027-01-01', term: 'Resmi Tatiller', type: 'holiday' as const },
      { id: 'g11', title: 'Bütünleme Sınavları', date: '2027-01-11', endDate: '2027-01-15', term: 'Güz Yarıyılı', type: 'exam' as const }
    ];
    return getAcademicSummaryEvents(list, 3);
  }, [calendarEvents]);

  const visibleWidgets = useMemo(() => {
    return widgetConfigs.filter((w) => w.visible);
  }, [widgetConfigs]);

  // Render individual widget component by ID
  const renderWidget = (widget: WidgetConfig, index: number) => {
    const isFirst = index === 0;
    const isLast = index === visibleWidgets.length - 1;

    // Inline customizer bar shown when "Hızlı Düzenleme" is toggled
    const inlineHeader = inlineEditMode && (
      <div className="flex items-center justify-between bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-xl px-3 py-1.5 mb-2 text-xs text-amber-900 dark:text-amber-200">
        <span className="font-semibold flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-[10px]">
            {index + 1}
          </span>
          {widget.title}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => handleInlineMove(widget.id, 'up')}
            className="p-1 rounded bg-white dark:bg-black/30 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Yukarı Taşı"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => handleInlineMove(widget.id, 'down')}
            className="p-1 rounded bg-white dark:bg-black/30 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Aşağı Taşı"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInlineHide(widget.id, widget.title)}
            className="p-1 rounded bg-white dark:bg-black/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors ml-1"
            title="Gizle"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );

    switch (widget.id) {
      case 'hero_weather':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <section className="bg-[#264653] rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-stone-800/80 shadow-md overflow-hidden relative">
              {weatherInfo ? (
                <WeatherBackground weatherCode={weatherInfo.code} isDay={weatherInfo.isDay} />
              ) : (
                <>
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-rose-600/15 rounded-full blur-2xl mix-blend-screen pointer-events-none"></div>
                  <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-red-700/10 rounded-full blur-2xl mix-blend-screen pointer-events-none"></div>
                </>
              )}

              <div className="z-10 text-center sm:text-left flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-200 tracking-tight truncate drop-shadow-md">
                  Kilis 7 Aralık Üniversitesi
                </h2>
              </div>

              <div className="z-10 w-full sm:w-auto flex justify-center shrink-0">
                <WeatherWidget onWeatherChange={handleWeatherChange} />
              </div>
            </section>
          </div>
        );

      case 'search_bar':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400" strokeWidth={1.5} />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-lg text-sm focus:border-amber-500 focus:ring-0 outline-none transition-colors text-stone-900 dark:text-white placeholder-stone-400"
                placeholder="Duyuru veya haber ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        );

      case 'quick_services': {
        const visibleServices = quickServices.filter((s) => s.visible);

        const getQuickIcon = (iconName: string) => {
          const props = { className: 'w-5 h-5' };
          switch (iconName) {
            case 'GraduationCap': return <GraduationCap {...props} />;
            case 'Users': return <Users {...props} />;
            case 'Calendar': return <Calendar {...props} />;
            case 'MapPin': return <MapPin {...props} />;
            case 'Trophy': return <Trophy {...props} />;
            case 'ChefHat': return <ChefHat {...props} />;
            case 'FileText': return <FileText {...props} />;
            case 'BookOpen': return <BookOpen {...props} />;
            case 'Bus': return <Bus {...props} />;
            case 'Hotel': return <Hotel {...props} />;
            case 'Landmark': return <Landmark {...props} />;
            case 'CalendarClock': return <CalendarClock {...props} />;
            case 'PhoneCall': return <PhoneCall {...props} />;
            default: return <LayoutGrid {...props} />;
          }
        };

        const getColorClasses = (colorName: string) => {
          switch (colorName) {
            case 'emerald':
              return {
                bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                border: 'hover:border-emerald-500/50'
              };
            case 'rose':
              return {
                bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                border: 'hover:border-rose-500/50'
              };
            case 'red':
              return {
                bg: 'bg-red-500/10 text-red-600 dark:text-red-400',
                border: 'hover:border-red-500/50'
              };
            case 'green':
              return {
                bg: 'bg-green-500/10 text-green-600 dark:text-green-400',
                border: 'hover:border-green-500/50'
              };
            case 'orange':
              return {
                bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                border: 'hover:border-orange-500/50'
              };
            case 'indigo':
              return {
                bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                border: 'hover:border-indigo-500/50'
              };
            case 'blue':
              return {
                bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                border: 'hover:border-blue-500/50'
              };
            case 'cyan':
              return {
                bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                border: 'hover:border-cyan-500/50'
              };
            case 'purple':
              return {
                bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                border: 'hover:border-purple-500/50'
              };
            case 'teal':
              return {
                bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
                border: 'hover:border-teal-500/50'
              };
            default:
              return {
                bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                border: 'hover:border-amber-500/50'
              };
          }
        };

        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <section className="space-y-3">
              <SectionHeader
                icon={LayoutGrid}
                theme="amber"
                title="Hızlı Kampüs Servisleri"
                subtitle={`En Çok Kullanılan ${visibleServices.length} Kısayol`}
                secondaryAction={{
                  label: 'Kısayolları Düzenle',
                  onClick: () => {
                    window.dispatchEvent(new CustomEvent('k7_open_settings', { detail: { tab: 'quick_services' } }));
                  }
                }}
                action={{
                  label: 'Tüm Servisler',
                  href: '/campus',
                  icon: ChevronRight
                }}
              />

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5">
                {visibleServices.map((service) => {
                  const colors = getColorClasses(service.colorName);

                  if (service.isModal) {
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setIsScheduleManagerOpen(true)}
                        className={`group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 ${colors.border} hover:shadow-md transition-all active:scale-95 cursor-pointer`}
                      >
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2`}>
                          {getQuickIcon(service.iconName)}
                        </div>
                        <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight truncate max-w-full">
                          {service.title}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40 truncate max-w-full">
                          {service.subtitle}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={service.id}
                      to={service.to}
                      className={`group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 ${colors.border} hover:shadow-md transition-all active:scale-95`}
                    >
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2`}>
                        {getQuickIcon(service.iconName)}
                      </div>
                      <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight truncate max-w-full">
                        {service.title}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40 truncate max-w-full">
                        {service.subtitle}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        );
      }

      case 'menu':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <section className="space-y-4">
              <SectionHeader
                icon={ChefHat}
                theme="amber"
                title="Yemek Menüsü"
                subtitle="Günün 4 Çeşit Sıcak Öğle & Akşam Menüsü"
                action={{
                  label: 'Aylık Menü',
                  href: '/menu',
                  icon: ChevronRight
                }}
              />

              {todayMenuInfo?.menu ? (
                <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#e6e2d6] dark:border-white/10 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white tabular-nums">
                        {todayMenuInfo.menu.date}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        todayMenuInfo.isToday
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {todayMenuInfo.badgeLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-white/5 border border-amber-500/20">
                      <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider mb-1">
                        1. Ana Yemek
                      </div>
                      <div className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                        {todayMenuInfo.menu.mainDish}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
                      <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-white/50 tracking-wider mb-1">
                        2. Yardımcı Yemek
                      </div>
                      <div className="font-semibold text-sm sm:text-base text-stone-800 dark:text-white/90">
                        {todayMenuInfo.menu.sideDish}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
                      <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-white/50 tracking-wider mb-1">
                        3. Çorba
                      </div>
                      <div className="font-semibold text-sm sm:text-base text-stone-800 dark:text-white/90">
                        {todayMenuInfo.menu.soup}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
                      <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-white/50 tracking-wider mb-1">
                        4. Tatlı / Meyve / İçecek
                      </div>
                      <div className="font-semibold text-sm sm:text-base text-stone-800 dark:text-white/90">
                        {todayMenuInfo.menu.dessertOrFruit}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-end">
                    <Link
                      to="/menu"
                      className="text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Aylık Menüyü Gör</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6 text-center text-stone-500 text-sm">
                  Bugün için menü bulunamadı veya tablo okunamadı.
                </div>
              )}
            </section>
          </div>
        );

      case 'student_schedule':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <TodayScheduleWidget onOpenManager={() => setIsScheduleManagerOpen(true)} />
          </div>
        );

      case 'news':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <section className="space-y-4">
              <SectionHeader
                icon={Newspaper}
                theme="amber"
                title="Haberler"
                subtitle="Kilis 7 Aralık Üniversitesi Gündemi"
                secondaryAction={{
                  label: 'Bölüm Haberleri',
                  href: '/news?tab=department'
                }}
                action={{
                  label: 'Tümünü Gör',
                  href: '/news',
                  icon: ChevronRight
                }}
              />

              <div className="space-y-3">
                {filteredNews.map((n) => (
                  <motion.button
                    key={n.id}
                    whileHover={{ y: -2, scale: 1.004 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    onClick={() =>
                      setSelectedItem({
                        url: n.url || '',
                        title: n.title,
                        date: n.date,
                        category: n.category,
                        content: n.content,
                        attachments: (n as any).attachments || [],
                        imageUrl: (n as any).imageUrl || (n as any).img
                      })
                    }
                    className="w-full text-left block bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 sm:p-5 hover:bg-[#f4f1ea] dark:hover:bg-white/10 hover:border-amber-500/40 hover:shadow-xs transition-all focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                        {n.category || 'Haber'}
                      </span>
                      {n.date && !n.date.includes('T') && (
                        <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-white/50 tabular-nums">
                          {n.date}
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-snug">
                      {n.title}
                    </h4>
                  </motion.button>
                ))}
                {filteredNews.length === 0 && (
                  <div className="text-stone-500 italic text-sm px-2">Güncel haber bulunamadı.</div>
                )}
              </div>
            </section>
          </div>
        );

      case 'announcements':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <section className="space-y-4">
              <SectionHeader
                icon={Megaphone}
                theme="amber"
                title="Duyurular"
                subtitle="Rektörlük ve Birim Bildirimleri"
                secondaryAction={{
                  label: 'Bölüm Duyuruları',
                  href: '/announcements?tab=department'
                }}
                action={{
                  label: 'Tümünü Gör',
                  href: '/announcements',
                  icon: ChevronRight
                }}
              />

              <div className="space-y-3">
                {filteredAnnouncements.map((announcement) => (
                  <motion.button
                    key={announcement.id}
                    whileHover={{ y: -2, scale: 1.004 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    onClick={() =>
                      setSelectedItem({
                        url: announcement.url || '',
                        title: announcement.title,
                        date: announcement.date,
                        category: announcement.category,
                        content: announcement.content,
                        attachments: (announcement as any).attachments || []
                      })
                    }
                    className="w-full text-left block bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 sm:p-5 hover:bg-[#f4f1ea] dark:hover:bg-white/10 hover:border-amber-500/40 hover:shadow-xs transition-all focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                        {announcement.category || 'Duyuru'}
                      </span>
                      {announcement.date && !announcement.date.includes('T') && (
                        <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-white/50 tabular-nums">
                          {announcement.date}
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-snug">
                      {announcement.title}
                    </h4>
                  </motion.button>
                ))}
                {filteredAnnouncements.length === 0 && (
                  <div className="text-stone-500 italic text-sm px-2">Güncel duyuru bulunamadı.</div>
                )}
              </div>
            </section>
          </div>
        );

      case 'events':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <section className="space-y-4">
              <SectionHeader
                icon={Calendar}
                theme="rose"
                title="Etkinlikler"
                subtitle="Kampüs Kültür, Sanat ve Konferansları"
                action={{
                  label: 'Tümünü Gör',
                  href: '/campus?tab=events',
                  icon: ChevronRight
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredEvents.map((ev) => (
                  <motion.button
                    key={ev.id}
                    whileHover={{ y: -3, scale: 1.006 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    onClick={() =>
                      setSelectedItem({
                        url: ev.url || '',
                        title: ev.title,
                        date: ev.date,
                        category: ev.category,
                        content: ev.content,
                        attachments: (ev as any).attachments || [],
                        imageUrl: ev.img
                      })
                    }
                    className="w-full text-left block bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-md hover:border-rose-500/40 transition-all focus:outline-none group cursor-pointer"
                  >
                    {ev.img && (
                      <div className="h-32 w-full bg-stone-200 dark:bg-stone-800 overflow-hidden relative">
                        <img
                          src={ev.img}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-semibold text-white tracking-wider uppercase">
                          {ev.category || 'Etkinlik'}
                        </div>
                      </div>
                    )}
                    <div className="p-3.5 sm:p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <Clock className="w-3 h-3" />
                        <span className="tabular-nums">{ev.date || '02 Ekim 2026'}</span>
                      </div>
                      <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {cleanDuplicateTitle(ev.title)}
                      </h4>
                    </div>
                  </motion.button>
                ))}
                {filteredEvents.length === 0 && (
                  <div className="text-stone-500 italic text-sm px-2 sm:col-span-3">Güncel etkinlik bulunamadı.</div>
                )}
              </div>
            </section>
          </div>
        );

      case 'academic_highlight':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <section className="space-y-3">
              <SectionHeader
                icon={GraduationCap}
                theme="purple"
                title="Akademik Takvim Özeti"
                subtitle={
                  academicSummary.hasOngoing
                    ? 'Şu An Devam Eden ve Sıradaki Süreçler'
                    : 'Yaklaşan Sınavlar ve Önemli Tarihler'
                }
                action={{
                  label: 'Tüm Takvimi Gör',
                  href: '/calendar',
                  icon: ChevronRight
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {academicSummary.items.map(({ event, isOngoing, isTodayDeadline, dateBadgeText, dateRangeText }) => {
                  const isExam = event.type === 'exam';
                  const isHoliday = event.type === 'holiday';
                  const isRegistration = event.type === 'registration';

                  // Badge theme colors for term / type
                  const typePillClass = isHoliday
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25'
                    : isExam
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25'
                    : isRegistration
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/25'
                    : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/25';

                  return (
                    <motion.div
                      key={event.id}
                      whileHover={{ y: -2, scale: 1.008 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                      className="h-full"
                    >
                      <Link
                        to="/calendar"
                        className={`p-4 rounded-2xl flex flex-col justify-between h-full transition-all group relative overflow-hidden ${
                          isOngoing
                            ? 'bg-gradient-to-br from-emerald-500/[0.08] via-[#fcfbf9] to-[#fcfbf9] dark:from-emerald-500/[0.14] dark:via-[#264653] dark:to-[#264653] border-2 border-emerald-500/40 dark:border-emerald-400/40 shadow-sm hover:border-emerald-500/70 hover:shadow-md'
                            : isTodayDeadline
                            ? 'bg-gradient-to-br from-rose-500/[0.08] via-[#fcfbf9] to-[#fcfbf9] dark:from-rose-500/[0.14] dark:via-[#264653] dark:to-[#264653] border-2 border-rose-500/40 dark:border-rose-400/40 shadow-sm hover:border-rose-500/70 hover:shadow-md'
                            : 'bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-purple-500/50 hover:shadow-md'
                        }`}
                      >
                        {/* Header Row: Status badge / Category pill */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          {isOngoing ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              Devam Eden Süreç
                            </span>
                          ) : isTodayDeadline ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30">
                              <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                              Son Gün!
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typePillClass}`}>
                              {event.term || 'Akademik Takvim'}
                            </span>
                          )}

                          {/* Countdown / remaining time pill */}
                          <span
                            className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full ${
                              isOngoing
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : isTodayDeadline
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                                : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/80'
                            }`}
                          >
                            {dateBadgeText}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="my-auto py-1">
                          <h4
                            className={`font-semibold text-xs sm:text-sm leading-snug line-clamp-2 transition-colors ${
                              isOngoing
                                ? 'text-stone-900 dark:text-white font-bold group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                                : 'text-stone-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400'
                            }`}
                          >
                            {event.title}
                          </h4>
                        </div>

                        {/* Footer: Date Range + Category tag */}
                        <div className="pt-2.5 mt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-stone-500 dark:text-white/60 font-medium">
                            <Clock
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isOngoing
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isTodayDeadline
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-stone-400 dark:text-white/40'
                              }`}
                            />
                            <span className="tabular-nums font-semibold text-[11px] sm:text-xs text-stone-700 dark:text-white/80">
                              {dateRangeText}
                            </span>
                          </div>

                          {isOngoing && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${typePillClass}`}>
                              {event.term || 'Akademik'}
                            </span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {academicSummary.items.length === 0 && (
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-500 text-sm">
                  Akademik takvim verileri güncelleniyor...
                </div>
              )}
            </section>
          </div>
        );

      case 'campus_emergency':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <section className="space-y-3">
              <SectionHeader
                icon={PhoneCall}
                theme="rose"
                title="Kampüs Acil & Hızlı İletişim"
                subtitle="7/24 Güvenlik ve Sağlık Destek Hatları"
                action={{
                  label: 'Tüm Rehber',
                  href: '/campus?tab=directory',
                  icon: ChevronRight
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href="tel:03488142666"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 hover:bg-red-500/20 transition-all text-stone-900 dark:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div>
                      <div className="text-xs font-bold">Kampüs Güvenlik</div>
                      <div className="text-[10px] text-stone-500 dark:text-white/60">7/24 Nöbetçi Amirliği</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-700 dark:text-red-300 bg-white/70 dark:bg-black/40 px-2 py-1 rounded">
                    Ara
                  </span>
                </a>

                <a
                  href="tel:03488142666"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all text-stone-900 dark:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold">Sağlık & Revir</div>
                      <div className="text-[10px] text-stone-500 dark:text-white/60">Mediko-Sosyal Merkezi</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white/70 dark:bg-black/40 px-2 py-1 rounded">
                    Ara
                  </span>
                </a>

                <a
                  href="tel:03488142666"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/20 transition-all text-stone-900 dark:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <div>
                      <div className="text-xs font-bold">Santral & Öğrenci İşleri</div>
                      <div className="text-[10px] text-stone-500 dark:text-white/60">Danışma Hattı</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-white/70 dark:bg-black/40 px-2 py-1 rounded">
                    Ara
                  </span>
                </a>
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  const visibleCount = visibleWidgets.length;
  const totalCount = widgetConfigs.length;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 sm:space-y-8"
      >
        {/* Dynamic Widgets Stream */}
        {visibleWidgets.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {visibleWidgets.map((widget, index) => renderWidget(widget, index))}
          </div>
        ) : (
          /* Empty state if user hid all widgets */
          <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-dashed border-stone-300 dark:border-white/20 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Görünür Widget Kalmadı
            </h3>
            <p className="text-xs text-stone-500 dark:text-white/60 max-w-sm mx-auto">
              Ana sayfanızdaki tüm modülleri gizlediniz. Yukarıdaki ayarlar simgesinden widget'ları yeniden aktifleştirebilirsiniz.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleResetWidgets}
                className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Varsayılanı Yükle
              </button>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('k7_open_settings', { detail: { tab: 'widgets' } }));
                }}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-white/10 text-stone-800 dark:text-white font-semibold text-xs cursor-pointer"
              >
                Widget Ayarlarını Aç
              </button>
            </div>
          </div>
        )}

        {/* Detail Modal Component */}
        <DetailModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />

        {/* Schedule & Exam Manager Modal */}
        <ScheduleManagerModal
          isOpen={isScheduleManagerOpen}
          onClose={() => setIsScheduleManagerOpen(false)}
        />
      </motion.div>
    </PullToRefresh>
  );
}
