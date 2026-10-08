import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  getAnnouncements,
  getNews,
  getEvents,
  getMenu,
  getCachedOrFallback,
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_NEWS,
  FALLBACK_EVENTS,
  FALLBACK_MENU,
  CACHE_STORAGE_KEYS,
  deduplicateList
} from '../mockData';
import { Announcement, MenuItem, CampusEvent } from '../types';
import { Megaphone, Newspaper, ChefHat, ChevronRight, Search, Calendar, FileText, BookOpen, Trophy, LayoutGrid, Users, Utensils, Clock, MapPin, Pin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import DetailModal, { DetailModalItem } from '../components/DetailModal';
import WeatherWidget from '../components/WeatherWidget';
import WeatherBackground from '../components/WeatherBackground';
import PullToRefresh from '../components/PullToRefresh';
import { cn, parseDateToTimestamp, getTodayMenuInfo, TodayMenuInfo } from '../lib/utils';
import {
  getPinnedUnit,
  PinnedUnit,
  PINNED_EVENT_NAME,
  getFavoriteFeedItems,
  toggleFavoriteFeedItem,
  isFeedItemFavorited,
  FAVORITES_EVENT_NAME
} from '../lib/pinnedStorage';

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    return deduplicateList(getCachedOrFallback<Announcement[]>(CACHE_STORAGE_KEYS.ANNOUNCEMENTS, FALLBACK_ANNOUNCEMENTS));
  });

  const [news, setNews] = useState<Announcement[]>(() => {
    return deduplicateList(getCachedOrFallback<Announcement[]>(CACHE_STORAGE_KEYS.NEWS, FALLBACK_NEWS));
  });

  const [events, setEvents] = useState<CampusEvent[]>(() => {
    return getCachedOrFallback<CampusEvent[]>(CACHE_STORAGE_KEYS.EVENTS, FALLBACK_EVENTS);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [todayMenuInfo, setTodayMenuInfo] = useState<TodayMenuInfo<MenuItem>>(() => {
    const menuList = getCachedOrFallback<MenuItem[]>('k7_cached_menu_v6', FALLBACK_MENU);
    return getTodayMenuInfo(menuList);
  });

  const [weatherInfo, setWeatherInfo] = useState<{ code: number; isDay: number } | null>(null);

  // Pinned unit & favorites states
  const [pinnedUnit, setPinnedUnit] = useState<PinnedUnit | null>(() => getPinnedUnit());
  const [favoriteItems, setFavoriteItems] = useState<any[]>(() => getFavoriteFeedItems());

  // Modal State
  const [selectedItem, setSelectedItem] = useState<DetailModalItem | null>(null);

  useEffect(() => {
    const handlePinnedChange = (e: any) => {
      setPinnedUnit(e.detail || getPinnedUnit());
    };
    const handleFavoritesChange = (e: any) => {
      setFavoriteItems(e.detail || getFavoriteFeedItems());
    };

    window.addEventListener(PINNED_EVENT_NAME, handlePinnedChange);
    window.addEventListener(FAVORITES_EVENT_NAME, handleFavoritesChange);

    return () => {
      window.removeEventListener(PINNED_EVENT_NAME, handlePinnedChange);
      window.removeEventListener(FAVORITES_EVENT_NAME, handleFavoritesChange);
    };
  }, []);

  const handleRefresh = async () => {
    try {
      const [announcementsData, newsData, eventsData, menuData] = await Promise.all([
        getAnnouncements(true),
        getNews(true),
        getEvents(true),
        getMenu(true)
      ]);
      if (announcementsData?.length) setAnnouncements(announcementsData);
      if (newsData?.length) setNews(newsData);
      if (eventsData?.length) setEvents(eventsData);
      if (menuData?.length) setTodayMenuInfo(getTodayMenuInfo(menuData));
    } catch (error) {
      console.error("Yenileme hatası", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [announcementsData, newsData, eventsData, menuData] = await Promise.all([
          getAnnouncements(),
          getNews(),
          getEvents(),
          getMenu()
        ]);
        
        if (!isMounted) return;
        if (announcementsData?.length) setAnnouncements(announcementsData);
        if (newsData?.length) setNews(newsData);
        if (eventsData?.length) setEvents(eventsData);
        if (menuData?.length) setTodayMenuInfo(getTodayMenuInfo(menuData));
      } catch (error) {
        console.warn("Veri güncellenirken bildirim:", error);
      }
    }
    
    loadDashboardData();

    const onGlobalRefresh = () => {
      setAnnouncements(deduplicateList(getCachedOrFallback<Announcement[]>(CACHE_STORAGE_KEYS.ANNOUNCEMENTS, FALLBACK_ANNOUNCEMENTS)));
      setNews(deduplicateList(getCachedOrFallback<Announcement[]>(CACHE_STORAGE_KEYS.NEWS, FALLBACK_NEWS)));
      loadDashboardData();
    };
    window.addEventListener('k7_force_refreshed', onGlobalRefresh);
    window.addEventListener('k7_sync_status_change', onGlobalRefresh);

    return () => { 
      isMounted = false; 
      window.removeEventListener('k7_force_refreshed', onGlobalRefresh);
      window.removeEventListener('k7_sync_status_change', onGlobalRefresh);
    };
  }, []);

  const isMainAnnouncement = (item: { category?: string }) => {
    const cat = (item.category || '').toLowerCase().trim();
    return cat === 'ana duyurular' || cat === 'ana duyuru' || cat.includes('ana duyuru') || cat.includes('genel') || cat.includes('rektörlük');
  };

  const isMainNews = (item: { category?: string }) => {
    const cat = (item.category || '').toLowerCase().trim();
    return cat === 'üniversite haberleri' || cat === 'universite haberleri' || cat.includes('üniversite haber') || cat.includes('universite haber') || cat.includes('ana haber') || cat.includes('genel');
  };

  const sortedAnnouncements = useMemo(() => {
    const list = deduplicateList(announcements);
    return list.sort((a, b) => {
      const isMainA = isMainAnnouncement(a);
      const isMainB = isMainAnnouncement(b);
      if (isMainA && !isMainB) return -1;
      if (!isMainA && isMainB) return 1;
      return parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date);
    });
  }, [announcements]);

  const sortedNews = useMemo(() => {
    const list = deduplicateList(news);
    return list.sort((a, b) => {
      const isMainA = isMainNews(a);
      const isMainB = isMainNews(b);
      if (isMainA && !isMainB) return -1;
      if (!isMainA && isMainB) return 1;
      return parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date);
    });
  }, [news]);

  const filteredAnnouncements = searchQuery 
    ? sortedAnnouncements.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedAnnouncements.slice(0, 3);

  const filteredNews = searchQuery
    ? sortedNews.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedNews.slice(0, 3);

  const filteredEvents = searchQuery
    ? events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : events.slice(0, 3);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Hero / Welcome */}
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
          <WeatherWidget onWeatherChange={(code, isDay) => setWeatherInfo({ code, isDay })} />
        </div>
      </section>

      {/* Search Bar */}
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

      {/* Hızlı Kampüs Hizmetleri */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-white/60 flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            Hızlı Kampüs Servisleri
          </h3>
          <Link
            to="/campus"
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium flex items-center gap-0.5"
          >
            Tüm Servisler <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          <Link
            to="/campus?tab=directory"
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-emerald-500/50 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-white text-center">Personel</span>
            <span className="text-[10px] text-stone-400 dark:text-white/40">Fakülte & Bölüm</span>
          </Link>

          <Link
            to="/campus?tab=events"
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-rose-500/50 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-white text-center">Etkinlikler</span>
            <span className="text-[10px] text-stone-400 dark:text-white/40">Kültür & Sanat</span>
          </Link>

          <Link
            to="/campus?tab=sports"
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-green-500/50 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-white text-center">Spor & Havuz</span>
            <span className="text-[10px] text-stone-400 dark:text-white/40">Seans & Ücretler</span>
          </Link>

          <Link
            to="/menu"
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-500/50 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <ChefHat className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-white text-center">Yemekhane</span>
            <span className="text-[10px] text-stone-400 dark:text-white/40">Günün Menüsü</span>
          </Link>

          <Link
            to="/campus?tab=forms"
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-orange-500/50 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-white text-center">Dilekçeler</span>
            <span className="text-[10px] text-stone-400 dark:text-white/40">Matbu Form</span>
          </Link>

          <Link
            to="/campus?tab=library"
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-indigo-500/50 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-white text-center">Kütüphane</span>
            <span className="text-[10px] text-stone-400 dark:text-white/40">Kitap & Saatler</span>
          </Link>
        </div>
      </section>

      {/* Pinned Unit Quick Access Banner */}
      {pinnedUnit ? (
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Pin className="w-4.5 h-4.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <span>Sabitlenen Biriminiz</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                  {pinnedUnit.isOnlyFaculty ? 'Fakülte Geneli' : 'Bölüm'}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                {pinnedUnit.isOnlyFaculty
                  ? pinnedUnit.facultyName
                  : `${pinnedUnit.facultyName} • ${pinnedUnit.departmentName}`}
              </div>
            </div>
          </div>
          <Link
            to={`/news?tab=department&faculty=${pinnedUnit.facultyId}${pinnedUnit.departmentId && pinnedUnit.departmentId !== 'all' ? `&dept=${pinnedUnit.departmentId}` : ''}`}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            Birim Masasını Aç
          </Link>
        </section>
      ) : (
        <section className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Pin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                Kendi Bölümünün veya Fakültenin Duyuru & Haberlerini Sabitle
              </div>
              <div className="text-[11px] text-stone-500 dark:text-white/60 truncate">
                Fakülteni veya bölümünü sabitleyip gelişmelerden anında haberdar ol.
              </div>
            </div>
          </div>
          <Link
            to="/news?tab=department"
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 shadow-xs"
          >
            Birim Sabitle
          </Link>
        </section>
      )}

      {/* News Section (Haberler) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-[#e6e2d6] dark:border-white/10 pb-2">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            <span>Haberler</span>
          </h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/news?tab=department"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
            >
              Bölüm Masası
            </Link>
            <Link
              to="/news?tab=all&type=news"
              className="text-sm text-stone-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center gap-1 font-medium tracking-wide"
            >
              Tümünü Gör <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredNews.map((n) => {
            const isFav = isFeedItemFavorited(`news-${n.id}`);

            return (
              <div
                key={n.id}
                onClick={() => setSelectedItem({
                  url: n.url || '',
                  title: n.title,
                  date: n.date,
                  category: n.category || 'Üniversite Haberleri',
                  content: n.content,
                  imageUrl: (n as any).imageUrl || (n as any).img
                })}
                className="w-full text-left block bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 sm:p-5 hover:bg-[#f4f1ea] dark:hover:bg-white/10 hover:border-amber-500/40 transition-colors focus:outline-none cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                      <Newspaper className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Haber</span>
                    </span>
                    {n.category && (
                      <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 border border-stone-200 dark:border-white/10">
                        {n.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {n.date && !n.date.includes('T') && (
                      <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-white/50 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{n.date}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteFeedItem({
                          id: `news-${n.id}`,
                          title: n.title,
                          date: n.date,
                          category: n.category,
                          type: 'news',
                          url: n.url,
                          content: n.content,
                          imageUrl: (n as any).imageUrl || (n as any).img
                        });
                      }}
                      title={isFav ? "Favorilerden Çıkar" : "Favoriye Ekle"}
                      className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-white/10 text-stone-400 hover:text-amber-500 transition-colors cursor-pointer"
                    >
                      <Star className={cn("w-3.5 h-3.5", isFav ? "text-amber-500 fill-amber-500" : "text-stone-400")} />
                    </button>
                  </div>
                </div>

                <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {n.title}
                </h4>
              </div>
            );
          })}
          {filteredNews.length === 0 && (
            <div className="text-stone-500 italic text-sm px-2">Güncel haber bulunamadı.</div>
          )}
        </div>
      </section>

      {/* Main Announcements Section (Duyurular) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-[#e6e2d6] dark:border-white/10 pb-2">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-sky-600 dark:text-sky-500" strokeWidth={1.5} />
            <span>Duyurular</span>
          </h3>
          <Link
            to="/news?tab=all&type=announcements"
            className="text-sm text-stone-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1 font-medium tracking-wide"
          >
            Tümünü Gör <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {filteredAnnouncements.map((announcement) => {
            const isFav = isFeedItemFavorited(`ann-${announcement.id}`);

            return (
              <div 
                key={announcement.id} 
                onClick={() => setSelectedItem({
                  url: announcement.url || '',
                  title: announcement.title,
                  date: announcement.date,
                  category: announcement.category || 'Duyuru',
                  content: announcement.content
                })}
                className="w-full text-left block bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 sm:p-5 hover:bg-[#f4f1ea] dark:hover:bg-white/10 hover:border-sky-500/40 transition-colors focus:outline-none cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25">
                      <Megaphone className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                      <span>Duyuru</span>
                    </span>
                    {announcement.category && (
                      <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 border border-stone-200 dark:border-white/10">
                        {announcement.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {announcement.date && !announcement.date.includes('T') && (
                      <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-white/50 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{announcement.date}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteFeedItem({
                          id: `ann-${announcement.id}`,
                          title: announcement.title,
                          date: announcement.date,
                          category: announcement.category,
                          type: 'announcement',
                          url: announcement.url,
                          content: announcement.content
                        });
                      }}
                      title={isFav ? "Favorilerden Çıkar" : "Favoriye Ekle"}
                      className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-white/10 text-stone-400 hover:text-amber-500 transition-colors cursor-pointer"
                    >
                      <Star className={cn("w-3.5 h-3.5", isFav ? "text-amber-500 fill-amber-500" : "text-stone-400")} />
                    </button>
                  </div>
                </div>

                <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {announcement.title}
                </h4>
              </div>
            );
          })}
          {filteredAnnouncements.length === 0 && (
            <div className="text-stone-500 italic text-sm px-2">Güncel duyuru bulunamadı.</div>
          )}
        </div>
      </section>

      {/* Events Section (Etkinlikler) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-[#e6e2d6] dark:border-white/10 pb-2">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-600 dark:text-rose-500" strokeWidth={1.5} />
            Etkinlikler
          </h3>
          <Link to="/campus?tab=events" className="text-sm text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 font-medium tracking-wide">
            Tümünü Gör <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredEvents.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setSelectedItem({
                url: ev.url || '',
                title: ev.title,
                date: ev.date,
                category: ev.category,
                content: ev.content,
                imageUrl: ev.img
              })}
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
                  <span>{ev.date || '02 Ekim 2026'}</span>
                </div>
                <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {ev.title}
                </h4>
              </div>
            </button>
          ))}
          {filteredEvents.length === 0 && (
            <div className="text-stone-500 italic text-sm px-2 sm:col-span-3">Güncel etkinlik bulunamadı.</div>
          )}
        </div>
      </section>

      {/* Today's Menu Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-[#e6e2d6] dark:border-white/10 pb-2">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            Yemek Menüsü
          </h3>
          <Link to="/menu" className="text-sm text-stone-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center gap-1 font-medium tracking-wide">
            Aylık Menüyü Gör <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
          </Link>
        </div>
        
        {todayMenuInfo?.menu ? (
          <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
            {/* Header with date and status badge */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#e6e2d6] dark:border-white/10 flex-wrap">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                  {todayMenuInfo.menu.date}
                </span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                todayMenuInfo.isToday 
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
              }`}>
                {todayMenuInfo.badgeLabel}
              </span>
            </div>

            {/* Meal Items Grid */}
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

            {/* Bottom link to full menu */}
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

      {/* Detail Modal Component */}
      <DetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
      </motion.div>
    </PullToRefresh>
  );
}
