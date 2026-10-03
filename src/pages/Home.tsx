import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  getAnnouncements,
  getNews,
  getMenu,
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_NEWS,
  FALLBACK_MENU
} from '../mockData';
import { Announcement, MenuItem } from '../types';
import { Megaphone, Newspaper, ChefHat, ChevronRight, Search, PhoneCall, Calendar, Bus, FileText, BookOpen, Trophy, Hotel, Wifi, MapPin, LayoutGrid, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import DetailModal from '../components/DetailModal';
import WeatherWidget from '../components/WeatherWidget';
import WeatherBackground from '../components/WeatherBackground';
import PullToRefresh from '../components/PullToRefresh';
import LoadingState from '../components/LoadingState';

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const cached = localStorage.getItem('k7_cached_announcements');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return FALLBACK_ANNOUNCEMENTS;
  });

  const [news, setNews] = useState<Announcement[]>(() => {
    try {
      const cached = localStorage.getItem('k7_cached_news');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return FALLBACK_NEWS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [todayMenu, setTodayMenu] = useState<MenuItem | null>(() => {
    try {
      const cached = localStorage.getItem('k7_cached_menu');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {}
    return FALLBACK_MENU[0] || null;
  });

  const [weatherInfo, setWeatherInfo] = useState<{ code: number; isDay: number } | null>(null);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<{url: string, title: string} | null>(null);

  const handleRefresh = async () => {
    try {
      const [announcementsData, newsData, menuData] = await Promise.all([
        getAnnouncements(true),
        getNews(true),
        getMenu()
      ]);
      if (announcementsData?.length) setAnnouncements(announcementsData);
      if (newsData?.length) setNews(newsData);
      const menu = menuData.length > 0 ? menuData[0] : null;
      if (menu) setTodayMenu(menu);
    } catch (error) {
      console.error("Yenileme hatası", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [announcementsData, newsData, menuData] = await Promise.all([
          getAnnouncements(),
          getNews(),
          getMenu()
        ]);
        
        if (!isMounted) return;
        if (announcementsData?.length) setAnnouncements(announcementsData);
        if (newsData?.length) setNews(newsData);
        
        const menu = menuData.length > 0 ? menuData[0] : null;
        if (menu) setTodayMenu(menu);
      } catch (error) {
        console.warn("Veri güncellenirken bildirim:", error);
      }
    }
    
    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  const filteredAnnouncements = searchQuery 
    ? announcements.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : announcements.slice(0, 3);

  const filteredNews = searchQuery
    ? news.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : news.slice(0, 3);

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
            to="/campus?tab=transport"
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-blue-500/50 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Bus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-white text-center">Ulaşım</span>
            <span className="text-[10px] text-stone-400 dark:text-white/40">Dolmuş & Hat</span>
          </Link>

          <Link
            to="/campus?tab=forms"
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-500/50 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
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

          <Link
            to="/campus?tab=map"
            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-red-500/50 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 dark:text-white text-center">Harita</span>
            <span className="text-[10px] text-stone-400 dark:text-white/40">Yerleşkeler</span>
          </Link>
        </div>
      </section>

      {/* Main Announcements */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-[#e6e2d6] dark:border-white/10 pb-2">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            Duyurular
          </h3>
          <Link to="/announcements" className="text-sm text-stone-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center gap-1 font-medium tracking-wide">
            Tümünü Gör <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {filteredAnnouncements.map((announcement) => (
            <button 
              key={announcement.id} 
              onClick={() => setSelectedItem({ url: announcement.url || '', title: announcement.title })}
              className="w-full text-left block bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-lg p-5 hover:bg-[#f4f1ea] dark:hover:bg-white/10 transition-colors focus:outline-none"
            >
              {announcement.date && !announcement.date.includes('T') && (
                <div className="w-full text-right mb-1.5">
                  <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-stone-400 dark:text-white/40">
                    {announcement.date}
                  </span>
                </div>
              )}
              <h4 className="font-display font-bold text-lg text-stone-900 dark:text-white leading-snug">
                {announcement.title}
              </h4>
            </button>
          ))}
          {filteredAnnouncements.length === 0 && (
            <div className="text-stone-500 italic text-sm px-2">Güncel duyuru bulunamadı.</div>
          )}
        </div>
      </section>

      {/* News Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-[#e6e2d6] dark:border-white/10 pb-2">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            Haberler
          </h3>
          <Link to="/news" className="text-sm text-stone-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center gap-1 font-medium tracking-wide">
            Tümünü Gör <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {filteredNews.map((n) => (
            <button 
              key={n.id} 
              onClick={() => setSelectedItem({ url: n.url || '', title: n.title })}
              className="w-full text-left block bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-lg p-5 hover:bg-[#f4f1ea] dark:hover:bg-white/10 transition-colors focus:outline-none"
            >
              {n.date && !n.date.includes('T') && (
                <div className="w-full text-right mb-1.5">
                  <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-stone-400 dark:text-white/40">
                    {n.date}
                  </span>
                </div>
              )}
              <h4 className="font-display font-bold text-lg text-stone-900 dark:text-white leading-snug">
                {n.title}
              </h4>
            </button>
          ))}
          {filteredNews.length === 0 && (
            <div className="text-stone-500 italic text-sm px-2">Güncel haber bulunamadı.</div>
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
            Tümünü Gör <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
          </Link>
        </div>
        
        {todayMenu ? (
          <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-lg p-6">
            <div className="text-xs font-semibold tracking-widest uppercase text-amber-600 dark:text-amber-500 mb-4">{todayMenu.date}</div>
            <ul className="space-y-3 text-stone-700 dark:text-white/80">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-[#fcfbf9]"></div>
                <span className="font-display font-bold text-lg text-stone-900 dark:text-white">{todayMenu.mainDish}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600"></div>
                <span>{todayMenu.sideDish}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600"></div>
                <span>{todayMenu.soup}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600"></div>
                <span>{todayMenu.dessertOrFruit}</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-lg p-6 text-center text-stone-500 text-sm">
            Bugün için menü bulunamadı veya tablo okunamadı.
          </div>
        )}
      </section>

      {/* Detail Modal Component */}
      <DetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        url={selectedItem?.url || ''}
        title={selectedItem?.title || ''}
      />
      </motion.div>
    </PullToRefresh>
  );
}
