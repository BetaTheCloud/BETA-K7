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
  Calendar
} from 'lucide-react';
import { cn, parseDateToTimestamp } from '../lib/utils';
import DetailModal from '../components/DetailModal';
import PullToRefresh from '../components/PullToRefresh';
import LoadingState from '../components/LoadingState';
import HorizontalScrollWrapper from '../components/HorizontalScrollWrapper';

export default function News() {
  const navigate = useNavigate();
  const [news, setNews] = useState<Announcement[]>(() => {
    try {
      const cached = localStorage.getItem('k7_cached_news');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) return parsed.data;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return FALLBACK_NEWS;
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<{ url: string; title: string } | null>(null);

  const load = async (force = false) => {
    if (force) setLoading(true);
    const data = await getNews(force);
    if (data && data.length > 0) {
      setNews(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    await load(true);
  };

  const isMainNewsCategory = (name: string) => {
    const n = name.toLowerCase().trim();
    return (
      n === 'üniversite haberleri' ||
      n === 'universite haberleri' ||
      n.startsWith('üniversite haber') ||
      n.startsWith('universite haber') ||
      n.includes('üniversite haber') ||
      n.includes('universite haber') ||
      n.includes('ana haber') ||
      n.includes('genel haber') ||
      n === 'genel'
    );
  };

  // Dynamically extract and sort all available news categories: Üniversite Haberleri first, then by date
  const sortedFilterChips = useMemo(() => {
    const catStats: Record<string, { latestDate: number; count: number }> = {};
    
    news.forEach((a) => {
      const cat = a.category?.trim() || 'Üniversite Haberleri';
      const ts = parseDateToTimestamp(a.date);
      if (!catStats[cat]) {
        catStats[cat] = { latestDate: ts, count: 1 };
      } else {
        if (ts > catStats[cat].latestDate) {
          catStats[cat].latestDate = ts;
        }
        catStats[cat].count += 1;
      }
    });

    const sortedCats = Object.keys(catStats).sort((a, b) => {
      const isMainA = isMainNewsCategory(a);
      const isMainB = isMainNewsCategory(b);
      // 1. Üniversite Haberleri priority
      if (isMainA && !isMainB) return -1;
      if (!isMainA && isMainB) return 1;
      // 2. Sort by freshest news date
      if (catStats[b].latestDate !== catStats[a].latestDate) {
        return catStats[b].latestDate - catStats[a].latestDate;
      }
      // 3. Tie breaker: count
      return catStats[b].count - catStats[a].count;
    });

    const chips: { id: string; name: string }[] = [{ id: 'all', name: 'Tümü' }];
    sortedCats.forEach((cat) => {
      chips.push({ id: cat, name: cat });
    });

    return chips;
  }, [news]);

  // Filter news items
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // 1. Filter by category
      if (selectedFilter !== 'all') {
        const itemCat = (item.category || '').toLowerCase().trim();
        const selFilter = selectedFilter.toLowerCase().trim();
        if (itemCat !== selFilter && !itemCat.includes(selFilter) && !selFilter.includes(itemCat)) {
          return false;
        }
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

  // Group and sort categories: Üniversite Haberleri first, then by freshest date
  const sortedGroupedCategories = useMemo(() => {
    const groups: Record<string, Announcement[]> = {};
    filteredNews.forEach((item) => {
      const cat = item.category?.trim() || 'Üniversite Haberleri';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Sort items within each category from newest to oldest
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));
    });

    // Sort category entries: Üniversite Haberleri first, then by freshest date
    const entries = Object.entries(groups) as [string, Announcement[]][];
    entries.sort((a, b) => {
      const isMainA = isMainNewsCategory(a[0]);
      const isMainB = isMainNewsCategory(b[0]);
      // 1. Üniversite Haberleri priority
      if (isMainA && !isMainB) return -1;
      if (!isMainA && isMainB) return 1;

      // 2. Recency of newest item
      const latestA = a[1].length > 0 ? parseDateToTimestamp(a[1][0].date) : 0;
      const latestB = b[1].length > 0 ? parseDateToTimestamp(b[1][0].date) : 0;
      if (latestB !== latestA) {
        return latestB - latestA;
      }
      return b[1].length - a[1].length;
    });

    return entries;
  }, [filteredNews]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Horizontal Scrollable Category Filter Pills (Sorted by latest news date) */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-stone-500 dark:text-white/60">
              <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Haber Kategorileri (En Yakın Tarihe Göre Sıralı):</span>
            </div>
            <HorizontalScrollWrapper>
              {sortedFilterChips.map((filter) => {
                const isActive = selectedFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      "shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 border cursor-pointer whitespace-nowrap",
                      isActive
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/30 font-bold"
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
              className="text-amber-700 dark:text-amber-300 hover:underline font-bold cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}

        {/* News List Grouped & Sorted by Recency */}
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
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
            >
              Tüm Haberleri Göster
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedGroupedCategories.map(([category, items]) => {
              const isCollapsed = collapsedCategories[category] === true;
              const isExpanded = !isCollapsed;
              const latestDateStr = items[0]?.date;

              return (
                <div
                  key={category}
                  className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 bg-[#f4f1ea]/60 dark:bg-[#264653]/60 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Newspaper className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white tracking-wide">
                        {category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        {items.length}
                      </span>
                      {latestDateStr && (
                        <span className="text-[10px] text-stone-400 dark:text-white/50 font-normal">
                          (Son: {latestDateStr})
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      strokeWidth={2}
                      className={cn(
                        "w-4 h-4 text-stone-400 transition-transform duration-300 shrink-0",
                        isExpanded ? "rotate-180 text-amber-600 dark:text-amber-500" : "rotate-0"
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653]"
                      >
                        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((newsItem) => (
                            <div
                              key={newsItem.id}
                              className="p-4 bg-white/70 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 rounded-xl hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {/* Category Badge */}
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                    {newsItem.category || category}
                                  </span>
                                  {newsItem.date && !newsItem.date.includes('T') && (
                                    <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 dark:text-white/50 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {newsItem.date}
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug mb-2">
                                  {newsItem.title}
                                </h4>

                                {newsItem.content && (
                                  <p className="text-xs text-stone-600 dark:text-white/70 line-clamp-3 leading-relaxed mb-3">
                                    {newsItem.content}
                                  </p>
                                )}
                              </div>

                              {newsItem.url && (
                                <button
                                  onClick={() =>
                                    setSelectedItem({
                                      url: newsItem.url || '',
                                      title: newsItem.title
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors pt-2 border-t border-stone-100 dark:border-white/10 mt-2 cursor-pointer"
                                >
                                  <span>Haberi Oku</span>
                                  <ExternalLink className="w-3 h-3" />
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
