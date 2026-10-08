import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getAnnouncements, getCachedOrFallback, FALLBACK_ANNOUNCEMENTS } from '../mockData';
import { Announcement } from '../types';
import {
  Search,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  Building2,
  Filter,
  X,
  Calendar
} from 'lucide-react';
import { cn, parseDateToTimestamp } from '../lib/utils';
import DetailModal, { DetailModalItem } from '../components/DetailModal';
import PullToRefresh from '../components/PullToRefresh';
import LoadingState from '../components/LoadingState';
import HorizontalScrollWrapper from '../components/HorizontalScrollWrapper';

export default function Announcements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_announcements_v6', FALLBACK_ANNOUNCEMENTS);
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<DetailModalItem | null>(null);

  const load = async (force = false) => {
    if (force) setLoading(true);
    const data = await getAnnouncements(force);
    if (data && data.length > 0) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    await load(true);
  };

  const isMainAnnouncementCategory = (name: string) => {
    const n = name.toLowerCase().trim();
    return (
      n === 'ana duyurular' ||
      n === 'ana duyuru' ||
      n.startsWith('ana duyuru') ||
      n.includes('ana duyuru') ||
      n.includes('genel duyuru') ||
      n.includes('rektörlük') ||
      n.includes('universite') ||
      n.includes('üniversite') ||
      n === 'genel'
    );
  };

  // Dynamically extract and sort all available categories: Ana Duyurular first, then by date
  const sortedFilterChips = useMemo(() => {
    const catStats: Record<string, { latestDate: number; count: number }> = {};
    
    announcements.forEach((a) => {
      const cat = a.category?.trim() || 'Ana Duyurular';
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
      const isMainA = isMainAnnouncementCategory(a);
      const isMainB = isMainAnnouncementCategory(b);
      // 1. Ana Duyurular / Main category priority
      if (isMainA && !isMainB) return -1;
      if (!isMainA && isMainB) return 1;
      // 2. Sort by freshest announcement date
      if (catStats[b].latestDate !== catStats[a].latestDate) {
        return catStats[b].latestDate - catStats[a].latestDate;
      }
      // 3. Tie breaker: announcement count
      return catStats[b].count - catStats[a].count;
    });

    const chips: { id: string; name: string }[] = [{ id: 'all', name: 'Tümü' }];
    sortedCats.forEach((cat) => {
      chips.push({ id: cat, name: cat });
    });

    return chips;
  }, [announcements]);

  // Filter announcements by category chip and search query
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // 1. Faculty / Category filter
      if (selectedFilter !== 'all') {
        const itemCat = (item.category || '').toLowerCase().trim();
        const selFilter = selectedFilter.toLowerCase().trim();
        if (itemCat !== selFilter && !itemCat.includes(selFilter) && !selFilter.includes(itemCat)) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchContent = (item.content || '').toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchCat) return false;
      }

      return true;
    });
  }, [announcements, selectedFilter, searchQuery]);

  // Group and sort categories: Ana Duyurular first, then by newest announcement date
  const sortedGroupedCategories = useMemo(() => {
    const groups: Record<string, Announcement[]> = {};
    filteredAnnouncements.forEach((item) => {
      const cat = item.category?.trim() || 'Ana Duyurular';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Sort items within each category from newest to oldest
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));
    });

    // Sort category entries: Ana Duyurular first, then by freshest date
    const entries = Object.entries(groups) as [string, Announcement[]][];
    entries.sort((a, b) => {
      const isMainA = isMainAnnouncementCategory(a[0]);
      const isMainB = isMainAnnouncementCategory(b[0]);
      // 1. Ana Duyurular priority
      if (isMainA && !isMainB) return -1;
      if (!isMainA && isMainB) return 1;

      // 2. Recency of newest announcement
      const latestA = a[1].length > 0 ? parseDateToTimestamp(a[1][0].date) : 0;
      const latestB = b[1].length > 0 ? parseDateToTimestamp(b[1][0].date) : 0;
      if (latestB !== latestA) {
        return latestB - latestA;
      }
      return b[1].length - a[1].length;
    });

    return entries;
  }, [filteredAnnouncements]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (loading) {
    return <LoadingState message="Duyurular Yükleniyor..." subtitle="Üniversite duyuruları güncelleniyor" />;
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
                Üniversite Duyuruları
              </h2>
              <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 font-medium">
                Rektörlük, fakülteler, enstitüler ve idari birimlerden resmi duyurular.
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
              placeholder="Fakülte, birim veya duyuru başlığı ara..."
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

          {/* Horizontal Scrollable Faculty & Unit Filter Pills (Sorted by latest announcement date) */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-stone-500 dark:text-white/60">
              <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Kategori & Birimler (En Yakın Tarihe Göre Sıralı):</span>
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
              {' '}({filteredAnnouncements.length} sonuç bulundu)
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

        {/* Announcements List Grouped & Sorted by Recency */}
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6">
            <Building2 className="w-10 h-10 text-stone-400 mx-auto mb-3 opacity-60" />
            <h3 className="font-display font-bold text-stone-800 dark:text-white text-base">
              Aramanıza Uygun Duyuru Bulunamadı
            </h3>
            <p className="text-stone-500 dark:text-white/60 text-xs mt-1 max-w-sm mx-auto">
              Farklı bir kategori seçebilir veya arama teriminizi değiştirerek tekrar deneyebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
            >
              Tüm Duyuruları Göster
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
                      <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
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
                        <div className="p-4 sm:p-5 space-y-4 divide-y divide-stone-100 dark:divide-white/10">
                          {items.map((announcement) => (
                            <div
                              key={announcement.id}
                              className="pt-4 first:pt-0 group hover:bg-stone-50/50 dark:hover:bg-white/5 rounded-xl transition-all"
                            >
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {/* Faculty / Category Badge */}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                                  {announcement.category || category}
                                </span>
                                {announcement.date && !announcement.date.includes('T') && (
                                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-white/50 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {announcement.date}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-display font-bold text-[0.95rem] sm:text-[1.05rem] leading-snug text-stone-800 dark:text-white/90 mb-2">
                                {announcement.title}
                              </h4>

                              {announcement.content && (
                                <p className="text-xs sm:text-sm text-stone-600 dark:text-white/70 line-clamp-2 leading-relaxed mb-3">
                                  {announcement.content}
                                </p>
                              )}

                              {announcement.url && (
                                <button
                                  onClick={() =>
                                    setSelectedItem({
                                      url: announcement.url || '',
                                      title: announcement.title,
                                      date: announcement.date,
                                      category: announcement.category || category,
                                      content: announcement.content
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors focus:outline-none cursor-pointer"
                                >
                                  <span>Duyuru Detayını Görüntüle</span>
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
          item={selectedItem}
          url={selectedItem?.url || ''}
          title={selectedItem?.title || ''}
        />
      </motion.div>
    </PullToRefresh>
  );
}
