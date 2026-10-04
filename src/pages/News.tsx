import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getNews, FALLBACK_NEWS } from '../mockData';
import { Announcement } from '../types';
import {
  Search,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  Newspaper,
  Filter,
  X,
  Sparkles,
  Calendar,
  Building2,
  Trophy,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';
import DetailModal from '../components/DetailModal';
import PullToRefresh from '../components/PullToRefresh';
import LoadingState from '../components/LoadingState';
import HorizontalScrollWrapper from '../components/HorizontalScrollWrapper';

const NEWS_FILTERS = [
  { id: 'all', name: 'Tümü' },
  { id: 'Üniversite Haberleri', name: 'Üniversite Haberleri' },
  { id: 'Mühendislik-Mimarlık Fakültesi', name: 'Mühendislik' },
  { id: 'İktisadi ve İdari Bilimler Fakültesi', name: 'İİBF' },
  { id: 'Sağlık Bilimleri Fakültesi', name: 'Sağlık Bilimleri' },
  { id: 'Kültür & Sanat', name: 'Kültür & Sanat' },
  { id: 'Akademik & AR-GE', name: 'Akademik & AR-GE' },
  { id: 'İş Birlikleri', name: 'İş Birlikleri' },
  { id: 'Başarılar', name: 'Başarılar' }
];

export default function News() {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ url: string; title: string } | null>(null);

  const load = async (force = false) => {
    const data = await getNews(force);
    if (data && data.length > 0) {
      setNews(data);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    await load(true);
  };

  // Filtered news items
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // 1. Filter by category / faculty
      if (selectedFilter !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        const selFilter = selectedFilter.toLowerCase();
        const matchCat = itemCat.includes(selFilter) || selFilter.includes(itemCat);
        const matchTitle = (item.title || '').toLowerCase().includes(selFilter);
        if (!matchCat && !matchTitle) return false;
      }

      // 2. Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchContent = (item.content || '').toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchCat) return false;
      }

      return true;
    });
  }, [news, selectedFilter, searchQuery]);

  // Group filtered news by category
  const groupedCategories = useMemo(() => {
    const groups: Record<string, Announcement[]> = {};
    filteredNews.forEach((item) => {
      const cat = item.category || 'Üniversite Haberleri';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredNews]);

  if (loading) {
    return <LoadingState message="Haberler Yükleniyor..." subtitle="Üniversite haberleri güncelleniyor" />;
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-5xl mx-auto pb-12"
      >
        {/* Header with Back Button */}
        <header className="border-b border-[#e6e2d6] dark:border-white/10 pb-4">
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold mb-3 transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
            <span>Geri Menüye Dön</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight">
                Kampüs ve Üniversite Haberleri
              </h2>
              <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 font-medium">
                Üniversitemizdeki bilimsel başarılar, etkinlikler ve fakülte faaliyetleri.
              </p>
            </div>
            <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              {filteredNews.length} Haber
            </span>
          </div>
        </header>

        {/* Search & Customization Bar */}
        <div className="space-y-3">
          {/* Live Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" strokeWidth={2} />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400 shadow-sm"
              placeholder="Haber başlığı, fakülte veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Horizontal Scrollable Categories Filter */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-stone-500 dark:text-white/60">
              <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Kategori & Fakülteye Göre Filtrele:</span>
            </div>
            <HorizontalScrollWrapper>
              {NEWS_FILTERS.map((filter) => {
                const isActive = selectedFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      "shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 border cursor-pointer",
                      isActive
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/30"
                        : "bg-[#fcfbf9] dark:bg-[#264653] text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border-[#e6e2d6] dark:border-white/10"
                    )}
                  >
                    {filter.name}
                  </button>
                );
              })}
            </HorizontalScrollWrapper>
          </div>
        </div>

        {/* Active Filter Clear Info */}
        {(selectedFilter !== 'all' || searchQuery.trim()) && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
            <span>
              Filtre: <strong>{selectedFilter !== 'all' ? selectedFilter : 'Tümü'}</strong>
              {searchQuery && <> • Arama: &quot;<strong>{searchQuery}</strong>&quot;</>}
              {' '}({filteredNews.length} sonuç bulundu)
            </span>
            <button
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="text-amber-700 dark:text-amber-300 hover:underline font-bold"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}

        {/* News List Grouped */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6">
            <Newspaper className="w-10 h-10 text-stone-400 mx-auto mb-3 opacity-60" />
            <h3 className="font-display font-bold text-stone-800 dark:text-white text-base">
              Aramanıza Uygun Haber Bulunamadı
            </h3>
            <p className="text-stone-500 dark:text-white/60 text-xs mt-1 max-w-sm mx-auto">
              Farklı bir kategori seçebilir veya arama sözcüklerinizi değiştirebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors shadow-sm"
            >
              Tüm Haberleri Göster
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {(Object.entries(groupedCategories) as [string, Announcement[]][]).map(([category, items]) => {
              const isExpanded = activeCategory === category || activeCategory === null;
              return (
                <div
                  key={category}
                  className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setActiveCategory(activeCategory === category ? '' : category)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 bg-[#f4f1ea]/60 dark:bg-[#264653]/60 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <Newspaper className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white tracking-wide">
                        {category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        {items.length}
                      </span>
                    </div>
                    <ChevronDown
                      strokeWidth={2}
                      className={cn(
                        "w-4 h-4 text-stone-400 transition-transform duration-300",
                        isExpanded ? "rotate-180 text-amber-600 dark:text-amber-500" : "rotate-0"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653]"
                      >
                        <div className="p-4 sm:p-5 space-y-4 divide-y divide-stone-100 dark:divide-white/10">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="pt-4 first:pt-0 group hover:bg-stone-50/50 dark:hover:bg-white/5 rounded-xl transition-all"
                            >
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {/* Category Badge */}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                                  {item.category || category}
                                </span>
                                {item.date && !item.date.includes('T') && (
                                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-white/50 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {item.date}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-display font-bold text-[0.95rem] sm:text-[1.05rem] leading-snug text-stone-800 dark:text-white/90 mb-2">
                                {item.title}
                              </h4>

                              {item.content && (
                                <p className="text-xs sm:text-sm text-stone-600 dark:text-white/70 line-clamp-2 leading-relaxed mb-3">
                                  {item.content}
                                </p>
                              )}

                              {item.url && (
                                <button
                                  onClick={() =>
                                    setSelectedItem({
                                      url: item.url || '',
                                      title: item.title
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors focus:outline-none"
                                >
                                  <span>Haberi Oku & Detaylar</span>
                                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

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
