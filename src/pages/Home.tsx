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
  HeartHandshake
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DetailModal, { DetailModalItem } from '../components/DetailModal';
import WeatherWidget from '../components/WeatherWidget';
import WeatherBackground from '../components/WeatherBackground';
import PullToRefresh from '../components/PullToRefresh';
import TodayScheduleWidget from '../components/TodayScheduleWidget';
import ScheduleManagerModal from '../components/ScheduleManagerModal';
import SectionHeader from '../components/SectionHeader';
import {
  getHomeWidgetConfigs,
  saveHomeWidgetConfigs,
  moveWidget,
  toggleWidgetVisibility,
  resetHomeWidgetConfigs,
  WidgetConfig,
  WidgetId,
  WIDGETS_CHANGED_EVENT
} from '../lib/widgetStorage';
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

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [todayMenuInfo, setTodayMenuInfo] = useState<TodayMenuInfo<MenuItem>>(() => {
    const menuList = getCachedOrFallback<MenuItem[]>('k7_cached_menu_v6', FALLBACK_MENU);
    return getTodayMenuInfo(menuList);
  });

  const [weatherInfo, setWeatherInfo] = useState<{ code: number; isDay: number } | null>(null);

  // Widget Customization State
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(() => getHomeWidgetConfigs());
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
    } catch (error) {
      console.error('Yenileme hatası', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [announcementsData, newsData, eventsData, menuData, calendarData] = await Promise.all([
          getAnnouncements(),
          getNews(),
          getEvents(),
          getMenu(),
          getCalendarEvents()
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

  useEffect(() => {
    const handleOpenSchedule = () => setIsScheduleManagerOpen(true);
    window.addEventListener('k7_open_schedule', handleOpenSchedule);
    return () => {
      window.removeEventListener('k7_open_schedule', handleOpenSchedule);
    };
  }, []);

  const handleInlineMove = (id: WidgetId, direction: 'up' | 'down') => {
    const updated = moveWidget(widgetConfigs, id, direction);
    setWidgetConfigs(updated);
    saveHomeWidgetConfigs(updated);
  };

  const handleInlineHide = (id: WidgetId, title: string) => {
    const visibleCount = widgetConfigs.filter((c) => c.visible).length;
    if (visibleCount <= 1) {
      toast.error('En az bir widget görünür kalmalıdır!');
      return;
    }
    const updated = toggleWidgetVisibility(widgetConfigs, id);
    setWidgetConfigs(updated);
    saveHomeWidgetConfigs(updated);
    toast.success(`"${title}" widget'ı gizlendi`);
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

  // Academic highlight items
  const upcomingCalendarItems = useMemo(() => {
    const list = calendarEvents.length > 0 ? calendarEvents : [
      { id: 'g9', title: 'Güz Yarıyılı Ara Sınavları (Vize)', date: '2026-10-31', endDate: '2026-11-08', term: 'Güz Yarıyılı', type: 'exam' as const },
      { id: 't1', title: 'Cumhuriyet Bayramı Tatili', date: '2026-10-29', term: 'Resmi Tatiller', type: 'holiday' as const },
      { id: 'g10', title: 'Yarıyıl Sonu Sınavları (Final)', date: '2026-12-26', endDate: '2027-01-03', term: 'Güz Yarıyılı', type: 'exam' as const }
    ];
    return list.slice(0, 3);
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

      case 'quick_services':
        return (
          <div key={widget.id} className="relative">
            {inlineHeader}
            <section className="space-y-3">
              <SectionHeader
                icon={LayoutGrid}
                theme="amber"
                title="Hızlı Kampüs Servisleri"
                subtitle="En Çok Kullanılan 8 Kısayol"
                action={{
                  label: 'Tüm Servisler',
                  href: '/campus',
                  icon: ChevronRight
                }}
              />

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleManagerOpen(true)}
                  className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-500/50 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight">Derslerim</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40">Ajandam</span>
                </button>

                <Link
                  to="/campus?tab=directory"
                  className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-emerald-500/50 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight">Personel</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40">Akademi&İdari</span>
                </Link>

                <Link
                  to="/campus?tab=events"
                  className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-rose-500/50 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight">Etkinlikler</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40">Kültür & Sanat</span>
                </Link>

                <Link
                  to="/campus?tab=map"
                  className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-red-500/50 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight">Harita</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40">Yerleşkeler</span>
                </Link>

                <Link
                  to="/campus?tab=sports"
                  className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-green-500/50 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight">Spor</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40">Tesisler</span>
                </Link>

                <Link
                  to="/menu"
                  className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-500/50 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight">Yemekhane</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40">Günün Menüsü</span>
                </Link>

                <Link
                  to="/campus?tab=forms"
                  className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-orange-500/50 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight">Dilekçeler</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40">Matbu Form</span>
                </Link>

                <Link
                  to="/campus?tab=library"
                  className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-indigo-500/50 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5 sm:mb-2">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-white text-center leading-tight">Kütüphane</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-white/40">Kitap & Saatler</span>
                </Link>
              </div>
            </section>
          </div>
        );

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
                        content: announcement.content
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
                subtitle="Dönem Sınavları & Resmi Tatiller"
                action={{
                  label: 'Tüm Takvimi Gör',
                  href: '/calendar',
                  icon: ChevronRight
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {upcomingCalendarItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2, scale: 1.008 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  >
                    <Link
                      to="/calendar"
                      className="p-4 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-purple-500/50 hover:shadow-md transition-all block group h-full"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          {item.term || 'Akademik Takvim'}
                        </span>
                        <span className="text-[11px] font-semibold text-stone-500 dark:text-white/60 tabular-nums">
                          {item.date}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h4>
                    </Link>
                  </motion.div>
                ))}
              </div>
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
