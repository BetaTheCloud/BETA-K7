import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getNews, getDepartmentNews, getCachedOrFallback, FALLBACK_NEWS } from '../mockData';
import { Announcement, DepartmentNewsItem, StaffUnitCategory } from '../types';
import {
  ACADEMIC_UNITS_WITH_DEPARTMENTS,
  FALLBACK_DEPARTMENT_NEWS,
  DepartmentGroup
} from '../data/departmentNewsData';
import {
  Search,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  Newspaper,
  Filter,
  X,
  Calendar,
  Building2,
  GraduationCap,
  BookOpen,
  School,
  Layers,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import { cn, parseDateToTimestamp } from '../lib/utils';
import DetailModal, { DetailModalItem } from '../components/DetailModal';
import PullToRefresh from '../components/PullToRefresh';
import LoadingState from '../components/LoadingState';
import HorizontalScrollWrapper from '../components/HorizontalScrollWrapper';

export default function News() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab: 'main' (Üniversite Haberleri) or 'department' (Bölüm & Birim Haberleri)
  const [activeTab, setActiveTab] = useState<'main' | 'department'>(() => {
    return searchParams.get('tab') === 'department' ? 'department' : 'main';
  });

  // Main news state
  const [news, setNews] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_news', FALLBACK_NEWS);
  });

  // Department news state
  const [departmentNews, setDepartmentNews] = useState<DepartmentNewsItem[]>(() => {
    return getCachedOrFallback<DepartmentNewsItem[]>('k7_cached_dept_news_all', FALLBACK_DEPARTMENT_NEWS);
  });

  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<DetailModalItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Department navigation filters
  const [selectedUnitCategory, setSelectedUnitCategory] = useState<StaffUnitCategory | 'all'>('all');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('itbf'); // Default to İnsan ve Toplum Bilimleri
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('turkdili'); // Default to Türk Dili ve Edebiyatı

  // Sync state with URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'department') {
      setActiveTab('department');
    }
    const deptParam = searchParams.get('dept');
    if (deptParam) {
      setSelectedDepartmentId(deptParam);
      // find faculty for this department
      for (const grp of ACADEMIC_UNITS_WITH_DEPARTMENTS) {
        if (grp.departments.some(d => d.id === deptParam || d.slug === deptParam)) {
          setSelectedFacultyId(grp.facultyId);
          break;
        }
      }
    }
  }, [searchParams]);

  // Load Main News
  const loadMainNews = async (force = false) => {
    if (force) setLoading(true);
    const data = await getNews(force);
    if (data && data.length > 0) {
      setNews(data);
    }
    setLoading(false);
  };

  // Load Department News
  const loadDeptNews = async (force = false) => {
    if (force) setDeptLoading(true);
    
    // Find active department
    const currentGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === selectedFacultyId);
    const currentDept = currentGroup?.departments.find(d => d.id === selectedDepartmentId);
    const deptUrl = currentDept?.newsUrl;

    const data = await getDepartmentNews(deptUrl, selectedDepartmentId, selectedFacultyId, force);
    if (data && data.length > 0) {
      setDepartmentNews(data);
    }
    setDeptLoading(false);
  };

  useEffect(() => {
    loadMainNews();
  }, []);

  useEffect(() => {
    if (activeTab === 'department') {
      loadDeptNews(false);
    }
  }, [activeTab, selectedFacultyId, selectedDepartmentId]);

  const handleRefresh = async () => {
    if (activeTab === 'main') {
      await loadMainNews(true);
    } else {
      await loadDeptNews(true);
    }
  };

  const handleTabChange = (tab: 'main' | 'department') => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
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

  // Main news sorted filter chips
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
      if (isMainA && !isMainB) return -1;
      if (!isMainA && isMainB) return 1;
      if (catStats[b].latestDate !== catStats[a].latestDate) {
        return catStats[b].latestDate - catStats[a].latestDate;
      }
      return catStats[b].count - catStats[a].count;
    });

    const chips: { id: string; name: string }[] = [{ id: 'all', name: 'Tümü' }];
    sortedCats.forEach((cat) => {
      chips.push({ id: cat, name: cat });
    });

    return chips;
  }, [news]);

  // Filter main news items
  const filteredMainNews = useMemo(() => {
    return news.filter((item) => {
      if (selectedFilter !== 'all') {
        const itemCat = (item.category || '').toLowerCase().trim();
        const selFilter = selectedFilter.toLowerCase().trim();
        if (itemCat !== selFilter && !itemCat.includes(selFilter) && !selFilter.includes(itemCat)) {
          return false;
        }
      }

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

  // Group and sort main categories
  const sortedGroupedCategories = useMemo(() => {
    const groups: Record<string, Announcement[]> = {};
    filteredMainNews.forEach((item) => {
      const cat = item.category?.trim() || 'Üniversite Haberleri';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));
    });

    const entries = Object.entries(groups) as [string, Announcement[]][];
    entries.sort((a, b) => {
      const isMainA = isMainNewsCategory(a[0]);
      const isMainB = isMainNewsCategory(b[0]);
      if (isMainA && !isMainB) return -1;
      if (!isMainA && isMainB) return 1;

      const latestA = a[1].length > 0 ? parseDateToTimestamp(a[1][0].date) : 0;
      const latestB = b[1].length > 0 ? parseDateToTimestamp(b[1][0].date) : 0;
      if (latestB !== latestA) {
        return latestB - latestA;
      }
      return b[1].length - a[1].length;
    });

    return entries;
  }, [filteredMainNews]);

  // Filter available academic units based on category
  const filteredAcademicUnits = useMemo(() => {
    if (selectedUnitCategory === 'all') return ACADEMIC_UNITS_WITH_DEPARTMENTS;
    return ACADEMIC_UNITS_WITH_DEPARTMENTS.filter(u => u.category === selectedUnitCategory);
  }, [selectedUnitCategory]);

  // Active faculty group & department object
  const activeFacultyGroup = useMemo(() => {
    return ACADEMIC_UNITS_WITH_DEPARTMENTS.find(u => u.facultyId === selectedFacultyId) || ACADEMIC_UNITS_WITH_DEPARTMENTS[0];
  }, [selectedFacultyId]);

  const activeDepartment = useMemo(() => {
    if (!activeFacultyGroup) return null;
    return activeFacultyGroup.departments.find(d => d.id === selectedDepartmentId) || activeFacultyGroup.departments[0];
  }, [activeFacultyGroup, selectedDepartmentId]);

  // Filter department news items
  const filteredDeptNews = useMemo(() => {
    return departmentNews.filter((item) => {
      // If a specific department is chosen and not 'all'
      if (selectedDepartmentId && selectedDepartmentId !== 'all') {
        const matchesDept = item.departmentId === selectedDepartmentId || 
                            (item.departmentName && item.departmentName.toLowerCase().includes(activeDepartment?.name.toLowerCase() || '')) ||
                            (item.sourceUrl && activeDepartment?.newsUrl && item.sourceUrl === activeDepartment.newsUrl);
        // If not matching specific department, only filter out if dataset contains multiple departments
        if (!matchesDept && item.departmentId && item.departmentId !== selectedDepartmentId) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchContent = (item.content || '').toLowerCase().includes(q);
        const matchDept = (item.departmentName || '').toLowerCase().includes(q);
        const matchFac = (item.facultyName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchDept && !matchFac) return false;
      }

      return true;
    });
  }, [departmentNews, selectedDepartmentId, activeDepartment, searchQuery]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const copyDepartmentLink = (url: string) => {
    try {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    } catch {}
  };

  if (loading && activeTab === 'main') {
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
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>Kampüs ve Bölüm Haberleri</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20">
                  Canlı Akış
                </span>
              </h2>
              <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 font-medium">
                Üniversite ana haberleri, fakülte ve bölümlerimizin (Örn: Türk Dili ve Edebiyatı vb.) tüm güncel duyuru ve haber bültenleri.
              </p>
            </div>
          </div>

          {/* High-level View Switcher Tabs: Genel Haberler vs Bölüm Haberleri */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1.5 bg-stone-100 dark:bg-[#1a3038] rounded-2xl border border-stone-200/80 dark:border-white/10">
            <button
              onClick={() => handleTabChange('main')}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
                activeTab === 'main'
                  ? "bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-sm border border-stone-200/50 dark:border-white/10"
                  : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
              )}
            >
              <Newspaper className={cn("w-4 h-4", activeTab === 'main' ? "text-amber-600 dark:text-amber-400" : "text-stone-400")} />
              <span>Genel Üniversite Haberleri</span>
            </button>

            <button
              onClick={() => handleTabChange('department')}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer relative",
                activeTab === 'department'
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-500"
                  : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
              )}
            >
              <Building2 className={cn("w-4 h-4", activeTab === 'department' ? "text-white" : "text-amber-600 dark:text-amber-400")} />
              <span>Fakülte & Bölüm Haberleri</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] bg-amber-400/30 text-white font-black uppercase tracking-wider">
                Bölüm Web
              </span>
            </button>
          </div>
        </header>

        {/* ======================= TAB 1: MAIN UNIVERSITY NEWS ======================= */}
        {activeTab === 'main' && (
          <div className="space-y-6">
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

              {/* Horizontal Scrollable Category Filter Pills */}
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
                  {' '}({filteredMainNews.length} sonuç bulundu)
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
            {filteredMainNews.length === 0 ? (
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
                                          title: newsItem.title,
                                          date: newsItem.date,
                                          category: newsItem.category || category,
                                          content: newsItem.content,
                                          imageUrl: (newsItem as any).img || (newsItem as any).imageUrl,
                                          images: (newsItem as any).img ? [(newsItem as any).img] : ((newsItem as any).images || [])
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
          </div>
        )}

        {/* ======================= TAB 2: DEPARTMENT & UNIT NEWS ======================= */}
        {activeTab === 'department' && (
          <div className="space-y-6">
            {/* Department Explorer Header & Selector Controls */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/70 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                      Bölüm Haberleri Gezgini
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 dark:text-white/60">
                      Tüm fakülte, enstitü, MYO ve bölümlerin resmi web haberlerini inceleyin.
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 self-start sm:self-auto">
                  {ACADEMIC_UNITS_WITH_DEPARTMENTS.reduce((acc, u) => acc + u.departments.length, 0)} Aktif Bölüm Sayfası
                </span>
              </div>

              {/* 1. Category Switcher Pills */}
              <div>
                <label className="text-[11px] font-bold text-stone-500 dark:text-white/60 mb-2 block uppercase tracking-wider">
                  1. Akademik Birim Türü:
                </label>
                <HorizontalScrollWrapper>
                  {[
                    { key: 'all' as const, label: 'Tümü', icon: Layers },
                    { key: 'fakulte' as const, label: 'Fakülteler', icon: GraduationCap },
                    { key: 'enstitu' as const, label: 'Enstitü', icon: BookOpen },
                    { key: 'myo' as const, label: 'Meslek Yüksekokulları (MYO)', icon: School },
                    { key: 'yuksekokul' as const, label: 'Yüksekokul & Konservatuvar', icon: Building2 },
                    { key: 'koordinatorluk' as const, label: 'Daire & Merkezler', icon: Globe }
                  ].map((cat) => {
                    const isActive = selectedUnitCategory === cat.key;
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setSelectedUnitCategory(cat.key);
                          const firstUnit = cat.key === 'all' 
                            ? ACADEMIC_UNITS_WITH_DEPARTMENTS[0] 
                            : ACADEMIC_UNITS_WITH_DEPARTMENTS.find(u => u.category === cat.key) || ACADEMIC_UNITS_WITH_DEPARTMENTS[0];
                          if (firstUnit) {
                            setSelectedFacultyId(firstUnit.facultyId);
                            if (firstUnit.departments.length > 0) {
                              setSelectedDepartmentId(firstUnit.departments[0].id);
                            }
                          }
                        }}
                        className={cn(
                          "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap",
                          isActive
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/25 font-bold"
                            : "bg-white dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border-stone-200 dark:border-white/10"
                        )}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </HorizontalScrollWrapper>
              </div>

              {/* 2. Faculty / Main Unit Selector Dropdown / Chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-white/60 mb-1.5 block uppercase tracking-wider">
                    2. Fakülte / Enstitü / Yüksekokul:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedFacultyId}
                      onChange={(e) => {
                        const facId = e.target.value;
                        setSelectedFacultyId(facId);
                        const group = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === facId);
                        if (group && group.departments.length > 0) {
                          setSelectedDepartmentId(group.departments[0].id);
                        }
                      }}
                      className="w-full bg-white dark:bg-[#1f3844] border border-stone-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer shadow-sm"
                    >
                      {filteredAcademicUnits.map((unit) => (
                        <option key={unit.facultyId} value={unit.facultyId}>
                          {unit.facultyName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Department Selector */}
                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-white/60 mb-1.5 block uppercase tracking-wider">
                    3. İlgili Bölüm / Program:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) => {
                        setSelectedDepartmentId(e.target.value);
                      }}
                      className="w-full bg-white dark:bg-[#1f3844] border border-stone-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer shadow-sm"
                    >
                      {activeFacultyGroup?.departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Department Shortcut Chips (for fast 1-click switching within selected faculty) */}
              {activeFacultyGroup && activeFacultyGroup.departments.length > 1 && (
                <div className="pt-2 border-t border-stone-200/50 dark:border-white/5">
                  <div className="text-[10px] font-bold text-stone-400 dark:text-white/50 mb-1.5 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-500" />
                    <span>{activeFacultyGroup.shortName} Bölümleri Hızlı Seçim:</span>
                  </div>
                  <HorizontalScrollWrapper>
                    {activeFacultyGroup.departments.map((d) => {
                      const isDeptActive = selectedDepartmentId === d.id;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDepartmentId(d.id)}
                          className={cn(
                            "shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer whitespace-nowrap",
                            isDeptActive
                              ? "bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 font-bold"
                              : "bg-white/60 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border-stone-200/60 dark:border-white/10"
                          )}
                        >
                          {d.name}
                        </button>
                      );
                    })}
                  </HorizontalScrollWrapper>
                </div>
              )}
            </div>

            {/* Selected Department Official Portal Banner & URL Link */}
            {activeDepartment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-600 text-white shadow-sm">
                        {activeFacultyGroup.facultyName}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-stone-500 dark:text-white/60 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {activeDepartment.name}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-lg sm:text-xl text-stone-900 dark:text-white">
                      {activeDepartment.name} Haberleri
                    </h3>

                    {activeDepartment.description && (
                      <p className="text-xs text-stone-600 dark:text-white/70 max-w-2xl leading-relaxed">
                        {activeDepartment.description}
                      </p>
                    )}
                  </div>

                  {/* Direct Link to Official Department News Website (e.g., https://turkdili.kilis.edu.tr/tr/news-all) */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <a
                      href={activeDepartment.newsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 active:scale-95 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Resmi Bölüm Web Sayfası</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </a>

                    <button
                      onClick={() => copyDepartmentLink(activeDepartment.newsUrl)}
                      title="Bölüm haber bağlantısını kopyala"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-stone-100 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 cursor-pointer"
                    >
                      {copiedUrl === activeDepartment.newsUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                          <span>Linki Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Subdomain address indicator */}
                <div className="mt-3 pt-2.5 border-t border-amber-500/15 flex items-center gap-2 text-[11px] text-stone-500 dark:text-white/60">
                  <span className="font-semibold text-amber-700 dark:text-amber-300">Kaynak Portalı:</span>
                  <code className="px-2 py-0.5 bg-white/80 dark:bg-black/20 rounded font-mono text-[10px] text-stone-700 dark:text-stone-300 border border-amber-500/20 select-all">
                    {activeDepartment.newsUrl}
                  </code>
                </div>
              </motion.div>
            )}

            {/* Department Live Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400" strokeWidth={2} />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400 shadow-sm"
                placeholder={`${activeDepartment?.name || 'Bölüm'} haberlerinde ara...`}
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

            {/* Department News Items Feed */}
            {deptLoading ? (
              <LoadingState message="Bölüm Haberleri Çekiliyor..." subtitle="Üniversite bölüm sunucusuna bağlanılıyor" />
            ) : filteredDeptNews.length === 0 ? (
              <div className="text-center py-12 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6">
                <Building2 className="w-10 h-10 text-stone-400 mx-auto mb-3 opacity-60" />
                <h3 className="font-display font-bold text-stone-800 dark:text-white text-base">
                  Bu Bölüme Ait Henüz Haber Listelenmedi
                </h3>
                <p className="text-stone-500 dark:text-white/60 text-xs mt-1 max-w-md mx-auto">
                  İlgili bölümün resmi web sayfasını ziyaret edebilir veya farklı bir fakülte ve bölüm seçebilirsiniz.
                </p>
                {activeDepartment?.newsUrl && (
                  <a
                    href={activeDepartment.newsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Resmi Web Sayfasını Aç ({activeDepartment.name})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDeptNews.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() =>
                      setSelectedItem({
                        url: item.url || '',
                        title: item.title,
                        imageUrl: item.imageUrl,
                        images: item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : []),
                        date: item.date,
                        category: item.category || 'Bölüm Haberi',
                        departmentName: item.departmentName || activeDepartment?.name,
                        facultyName: item.facultyName,
                        content: item.content
                      })
                    }
                    className="p-4 sm:p-5 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Optional Department News Image */}
                      {item.imageUrl && (
                        <div className="w-full h-44 rounded-xl overflow-hidden mb-3 bg-stone-100 dark:bg-black/20 border border-stone-200/60 dark:border-white/10 relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              // Hide broken image gracefully
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Header tags: Department & Date */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          {item.departmentName || activeDepartment?.name || 'Bölüm Haberi'}
                        </span>
                        {item.date && (
                          <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 dark:text-white/50 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h4>

                      {/* Content summary */}
                      {item.content && (
                        <p className="text-xs text-stone-600 dark:text-white/70 line-clamp-3 leading-relaxed mb-3">
                          {item.content}
                        </p>
                      )}
                    </div>

                    {/* Action buttons: Read Detail In-App or Open in Browser */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-stone-200/60 dark:border-white/10 mt-3">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors"
                      >
                        <span>Detayları Oku</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>

                      {item.url && item.url.startsWith('http') && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-medium text-stone-400 hover:text-stone-600 dark:hover:text-white flex items-center gap-1 transition-colors z-10"
                          title="Resmi web sitesinde aç"
                        >
                          <span>Webde Gör</span>
                          <Globe className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Global Detail Reading Modal */}
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
