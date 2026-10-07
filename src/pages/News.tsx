import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  getNews,
  getAnnouncements,
  getDepartmentNews,
  getCachedOrFallback,
  FALLBACK_NEWS,
  FALLBACK_ANNOUNCEMENTS
} from '../mockData';
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
  Megaphone,
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
  Globe,
  Pin,
  Star,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn, parseDateToTimestamp } from '../lib/utils';
import DetailModal, { DetailModalItem } from '../components/DetailModal';
import PullToRefresh from '../components/PullToRefresh';
import LoadingState from '../components/LoadingState';
import HorizontalScrollWrapper from '../components/HorizontalScrollWrapper';
import {
  getPinnedUnit,
  setPinnedUnit,
  removePinnedUnit,
  isUnitPinned,
  getFavoriteFeedItems,
  toggleFavoriteFeedItem,
  isFeedItemFavorited,
  PinnedUnit,
  FavoriteFeedItem,
  PINNED_EVENT_NAME,
  FAVORITES_EVENT_NAME
} from '../lib/pinnedStorage';

type ActiveTabKey = 'all' | 'news' | 'announcements' | 'department' | 'favorites';

interface UnifiedFeedItem {
  id: string;
  type: 'news' | 'announcement';
  title: string;
  date: string;
  content?: string;
  category: string;
  url?: string;
  imageUrl?: string;
  timestamp: number;
  facultyName?: string;
  departmentName?: string;
}

export default function News({ initialTab }: { initialTab?: ActiveTabKey } = {}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab: all | news | announcements | department | favorites
  const [activeTab, setActiveTab] = useState<ActiveTabKey>(() => {
    const tabParam = searchParams.get('tab') || searchParams.get('view');
    if (tabParam === 'department') return 'department';
    if (tabParam === 'announcements') return 'announcements';
    if (tabParam === 'news') return 'news';
    if (tabParam === 'favorites') return 'favorites';
    if (tabParam === 'all') return 'all';

    if (initialTab) return initialTab;

    const typeParam = searchParams.get('type');
    if (typeParam === 'announcements') return 'all';
    if (typeParam === 'news') return 'all';

    return 'all'; // Default to unified view as requested
  });

  // Data states
  const [news, setNews] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_news', FALLBACK_NEWS);
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_announcements', FALLBACK_ANNOUNCEMENTS);
  });
  const [departmentNews, setDepartmentNews] = useState<DepartmentNewsItem[]>(() => {
    return getCachedOrFallback<DepartmentNewsItem[]>('k7_cached_dept_news_all', FALLBACK_DEPARTMENT_NEWS);
  });

  // Pinned unit state
  const [pinnedUnit, setPinnedUnitState] = useState<PinnedUnit | null>(() => getPinnedUnit());
  const [favoriteItems, setFavoriteItems] = useState<FavoriteFeedItem[]>(() => getFavoriteFeedItems());

  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<DetailModalItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Department Desk (Bölüm Masası) navigation filters
  const [selectedUnitCategory, setSelectedUnitCategory] = useState<StaffUnitCategory | 'all'>('all');
  
  // Initialize faculty & department from pinned unit or defaults
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(() => {
    const currentPin = getPinnedUnit();
    return currentPin?.facultyId || 'itbf';
  });

  // Department can be 'all' (Tüm Bölümler - Fakülte Geneli) so department is NOT mandatory!
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(() => {
    const currentPin = getPinnedUnit();
    if (currentPin) {
      return currentPin.isOnlyFaculty || !currentPin.departmentId ? 'all' : currentPin.departmentId;
    }
    return 'all'; // Default: no specific department required!
  });

  // Listen to custom storage events
  useEffect(() => {
    const handlePinnedChange = (e: any) => {
      setPinnedUnitState(e.detail || getPinnedUnit());
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

  // Sync state with URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab') || searchParams.get('view');
    if (tabParam && ['all', 'news', 'announcements', 'department', 'favorites'].includes(tabParam)) {
      setActiveTab(tabParam as ActiveTabKey);
    }

    const typeParam = searchParams.get('type');
    if (typeParam === 'announcements' && !tabParam) {
      setSelectedFilter('type_announcements');
    } else if (typeParam === 'news' && !tabParam) {
      setSelectedFilter('type_news');
    }

    const facParam = searchParams.get('faculty');
    if (facParam) {
      setSelectedFacultyId(facParam);
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

  // Load Main Data
  const loadData = async (force = false) => {
    if (force) setLoading(true);
    try {
      const [newsData, annData] = await Promise.all([
        getNews(force),
        getAnnouncements(force)
      ]);
      if (newsData && newsData.length > 0) setNews(newsData);
      if (annData && annData.length > 0) setAnnouncements(annData);
    } catch (err) {
      console.warn('Veri yüklenirken hata:', err);
    }
    setLoading(false);
  };

  // Load Department / Faculty News
  const loadDeptNews = async (force = false) => {
    if (force) setDeptLoading(true);
    const currentGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === selectedFacultyId);
    
    let targetUrl: string | undefined;
    let deptIdParam: string | undefined = selectedDepartmentId;

    if (selectedDepartmentId === 'all') {
      // User did not select any department: use faculty news URL!
      targetUrl = currentGroup?.facultyNewsUrl;
      deptIdParam = 'all';
    } else {
      const currentDept = currentGroup?.departments.find(d => d.id === selectedDepartmentId);
      targetUrl = currentDept?.newsUrl;
    }

    const data = await getDepartmentNews(targetUrl, deptIdParam, selectedFacultyId, force);
    if (data && data.length > 0) {
      setDepartmentNews(data);
    }
    setDeptLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'department') {
      loadDeptNews(false);
    }
  }, [activeTab, selectedFacultyId, selectedDepartmentId]);

  const handleRefresh = async () => {
    if (activeTab === 'department') {
      await loadDeptNews(true);
    } else {
      await loadData(true);
    }
  };

  const handleTabChange = (tab: ActiveTabKey) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedFilter('all');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      next.delete('type');
      return next;
    });
  };

  // Active academic faculty group
  const activeFacultyGroup = useMemo(() => {
    return (
      ACADEMIC_UNITS_WITH_DEPARTMENTS.find((g) => g.facultyId === selectedFacultyId) ||
      ACADEMIC_UNITS_WITH_DEPARTMENTS[0]
    );
  }, [selectedFacultyId]);

  // Active department (if specific one is selected)
  const activeDepartment = useMemo(() => {
    if (selectedDepartmentId === 'all') return null;
    return activeFacultyGroup?.departments.find((d) => d.id === selectedDepartmentId) || null;
  }, [activeFacultyGroup, selectedDepartmentId]);

  // Filtered academic units by category
  const filteredAcademicUnits = useMemo(() => {
    if (selectedUnitCategory === 'all') return ACADEMIC_UNITS_WITH_DEPARTMENTS;
    return ACADEMIC_UNITS_WITH_DEPARTMENTS.filter((u) => u.category === selectedUnitCategory);
  }, [selectedUnitCategory]);

  // Check if currently selected faculty or department is pinned
  const isCurrentSelectionPinned = useMemo(() => {
    return isUnitPinned(selectedFacultyId, selectedDepartmentId);
  }, [selectedFacultyId, selectedDepartmentId, pinnedUnit]);

  // Handle Pin / Unpin of Faculty or Department
  const handleTogglePin = () => {
    if (isCurrentSelectionPinned) {
      removePinnedUnit();
    } else {
      if (selectedDepartmentId === 'all') {
        // Pin entire Faculty (no department constraint!)
        setPinnedUnit({
          facultyId: activeFacultyGroup.facultyId,
          facultyName: activeFacultyGroup.facultyName,
          departmentId: 'all',
          departmentName: '',
          isOnlyFaculty: true
        });
      } else if (activeDepartment) {
        // Pin specific Department
        setPinnedUnit({
          facultyId: activeFacultyGroup.facultyId,
          facultyName: activeFacultyGroup.facultyName,
          departmentId: activeDepartment.id,
          departmentName: activeDepartment.name,
          isOnlyFaculty: false
        });
      }
    }
  };

  // Build unified feed items (combining announcements and news)
  const allUnifiedItems: UnifiedFeedItem[] = useMemo(() => {
    const list: UnifiedFeedItem[] = [];

    // 1. News items
    news.forEach((item) => {
      list.push({
        id: `news-${item.id}`,
        type: 'news',
        title: item.title,
        date: item.date,
        content: item.content,
        category: item.category || 'Üniversite Haberleri',
        url: item.url,
        imageUrl: (item as any).imageUrl || (item as any).img,
        timestamp: parseDateToTimestamp(item.date)
      });
    });

    // 2. Announcement items
    announcements.forEach((item) => {
      list.push({
        id: `ann-${item.id}`,
        type: 'announcement',
        title: item.title,
        date: item.date,
        content: item.content,
        category: item.category || 'Duyuru',
        url: item.url,
        imageUrl: (item as any).imageUrl,
        timestamp: parseDateToTimestamp(item.date)
      });
    });

    // Sort by timestamp descending
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [news, announcements]);

  // Extract category chips for unified view
  const categoryChips = useMemo(() => {
    const catMap: Record<string, number> = {};

    let sourceItems = allUnifiedItems;
    if (activeTab === 'news') {
      sourceItems = allUnifiedItems.filter((i) => i.type === 'news');
    } else if (activeTab === 'announcements') {
      sourceItems = allUnifiedItems.filter((i) => i.type === 'announcement');
    }

    sourceItems.forEach((item) => {
      const cat = item.category.trim();
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const chips: { id: string; name: string; count?: number }[] = [
      { id: 'all', name: 'Tümü' }
    ];

    if (activeTab === 'all') {
      chips.push({ id: 'type_announcements', name: '📢 Yalnızca Duyurular' });
      chips.push({ id: 'type_news', name: '📰 Yalnızca Haberler' });
    }

    sorted.forEach(([cat, count]) => {
      chips.push({ id: cat, name: cat, count });
    });

    return chips;
  }, [allUnifiedItems, activeTab]);

  // Filter items based on activeTab, category filter, and search query
  const filteredFeedItems = useMemo(() => {
    let baseList = allUnifiedItems;

    if (activeTab === 'news') {
      baseList = baseList.filter((i) => i.type === 'news');
    } else if (activeTab === 'announcements') {
      baseList = baseList.filter((i) => i.type === 'announcement');
    } else if (activeTab === 'favorites') {
      // Map favorites
      return favoriteItems
        .map((fav) => ({
          id: fav.id,
          type: fav.type,
          title: fav.title,
          date: fav.date,
          content: fav.content,
          category: fav.category || (fav.type === 'news' ? 'Haber' : 'Duyuru'),
          url: fav.url,
          imageUrl: fav.imageUrl,
          timestamp: parseDateToTimestamp(fav.date),
          facultyName: fav.facultyName,
          departmentName: fav.departmentName
        }))
        .filter((i) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase().trim();
          return (
            i.title.toLowerCase().includes(q) ||
            (i.content || '').toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q)
          );
        });
    }

    // Apply category / quick type filter
    if (selectedFilter === 'type_announcements') {
      baseList = baseList.filter((i) => i.type === 'announcement');
    } else if (selectedFilter === 'type_news') {
      baseList = baseList.filter((i) => i.type === 'news');
    } else if (selectedFilter !== 'all') {
      const sf = selectedFilter.toLowerCase();
      baseList = baseList.filter((i) => i.category.toLowerCase().includes(sf));
    }

    // Apply live search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      baseList = baseList.filter((i) => {
        return (
          i.title.toLowerCase().includes(q) ||
          (i.content || '').toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
        );
      });
    }

    return baseList;
  }, [allUnifiedItems, activeTab, selectedFilter, searchQuery, favoriteItems]);

  // Filtered department news items
  const filteredDeptNews = useMemo(() => {
    let items = [...departmentNews];

    // Also include any faculty-level announcements from the main announcements list!
    const facultyAnnouncements = announcements
      .filter((a) => {
        const cat = (a.category || '').toLowerCase();
        const fname = activeFacultyGroup.facultyName.toLowerCase();
        const fshort = activeFacultyGroup.shortName.toLowerCase();
        return cat.includes(fname) || cat.includes(fshort);
      })
      .map((a) => ({
        id: `fac-ann-${a.id}`,
        title: a.title,
        date: a.date,
        content: a.content,
        url: a.url || '',
        facultyId: activeFacultyGroup.facultyId,
        facultyName: activeFacultyGroup.facultyName,
        departmentId: 'all',
        departmentName: 'Fakülte Duyurusu',
        category: a.category || `${activeFacultyGroup.shortName} Duyurusu`
      }));

    if (facultyAnnouncements.length > 0 && selectedDepartmentId === 'all') {
      items = [...facultyAnnouncements, ...items];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((n) => {
        return (
          n.title.toLowerCase().includes(q) ||
          (n.content || '').toLowerCase().includes(q) ||
          (n.category || '').toLowerCase().includes(q)
        );
      });
    }

    return items;
  }, [departmentNews, announcements, activeFacultyGroup, selectedDepartmentId, searchQuery]);

  // Copy link helper
  const copyDepartmentLink = (url: string) => {
    try {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    } catch {}
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="space-y-5 max-w-5xl mx-auto pb-12"
      >
        {/* Header with Back Button */}
        <header className="border-b border-[#e6e2d6] dark:border-white/10 pb-4">
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold mb-3 transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
            <span>Ana Menüye Dön</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>Duyuru ve Haberler Portalı</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20">
                  Canlı Akış
                </span>
              </h2>
              <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 font-medium">
                Üniversite genel haberleri, resmi duyuruları ve tüm fakülte & bölümlerin birim masası bültenleri.
              </p>
            </div>
          </div>

          {/* High-level View Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 mt-4 p-1.5 bg-stone-100 dark:bg-[#1a3038] rounded-2xl border border-stone-200/80 dark:border-white/10 text-xs">
            {/* 1. TÜMÜ */}
            <button
              onClick={() => handleTabChange('all')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer",
                activeTab === 'all'
                  ? "bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-xs border border-stone-200/50 dark:border-white/10"
                  : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
              )}
            >
              <Sparkles className={cn("w-3.5 h-3.5", activeTab === 'all' ? "text-amber-500" : "text-stone-400")} />
              <span>Tümü</span>
            </button>

            {/* 2. HABERLER */}
            <button
              onClick={() => handleTabChange('news')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer",
                activeTab === 'news'
                  ? "bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-xs border border-stone-200/50 dark:border-white/10"
                  : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
              )}
            >
              <Newspaper className={cn("w-3.5 h-3.5", activeTab === 'news' ? "text-amber-600 dark:text-amber-400" : "text-stone-400")} />
              <span>Haberler</span>
            </button>

            {/* 3. DUYURULAR */}
            <button
              onClick={() => handleTabChange('announcements')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer",
                activeTab === 'announcements'
                  ? "bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-xs border border-stone-200/50 dark:border-white/10"
                  : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
              )}
            >
              <Megaphone className={cn("w-3.5 h-3.5", activeTab === 'announcements' ? "text-sky-600 dark:text-sky-400" : "text-stone-400")} />
              <span>Duyurular</span>
            </button>

            {/* 4. BÖLÜM MASASI */}
            <button
              onClick={() => handleTabChange('department')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer relative",
                activeTab === 'department'
                  ? "bg-amber-600 text-white shadow-xs shadow-amber-600/30 border border-amber-500"
                  : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
              )}
            >
              <Building2 className={cn("w-3.5 h-3.5", activeTab === 'department' ? "text-white" : "text-amber-600 dark:text-amber-400")} />
              <span>Bölüm Masası</span>
            </button>

            {/* 5. FAVORİLERİM */}
            <button
              onClick={() => handleTabChange('favorites')}
              className={cn(
                "col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer",
                activeTab === 'favorites'
                  ? "bg-amber-500 text-white shadow-xs border border-amber-400"
                  : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
              )}
            >
              <Star className={cn("w-3.5 h-3.5", activeTab === 'favorites' ? "text-white fill-white" : "text-amber-500")} />
              <span>Favoriler ({favoriteItems.length})</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            PINNED UNIT BAR: "Kendi Bölümünün / Fakültenin Duyuru ve Haberlerini Sabitle"
            ========================================================================= */}
        {pinnedUnit ? (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Pin className="w-4 h-4 fill-amber-500 text-amber-600 dark:text-amber-400" />
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

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  handleTabChange('department');
                  setSelectedFacultyId(pinnedUnit.facultyId);
                  setSelectedDepartmentId(pinnedUnit.departmentId || 'all');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Birim Masasını Aç
              </button>
              <button
                onClick={() => removePinnedUnit()}
                title="Sabitlemeyi Kaldır"
                className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-white/10 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Pin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                  Kendi Bölümünün veya Fakültenin Duyuru & Haberlerini Sabitle
                </div>
                <div className="text-[11px] text-stone-500 dark:text-white/60 truncate">
                  Bölüm seçme zorunluluğu olmadan fakülteni veya bölümünü sabitleyip anında takip et.
                </div>
              </div>
            </div>

            <button
              onClick={() => handleTabChange('department')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Birim Sabitle
            </button>
          </div>
        )}

        {/* =========================================================================
            BÖLÜM MASASI TAB: COMPACT & MINIMALIST SELECTOR (SPACE-SAVING REVİZYON)
            ========================================================================= */}
        {activeTab === 'department' && (
          <div className="space-y-4">
            {/* MINIMALIST SELECTION BAR: Takes minimal vertical space */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
              {/* Birim Türü Compact Pills */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-stone-500 dark:text-white/60 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-500" />
                  <span>Birim Türü:</span>
                </span>
                <HorizontalScrollWrapper>
                  {[
                    { key: 'all' as const, label: 'Tümü' },
                    { key: 'fakulte' as const, label: 'Fakülteler' },
                    { key: 'enstitu' as const, label: 'Enstitü' },
                    { key: 'myo' as const, label: 'MYO' },
                    { key: 'yuksekokul' as const, label: 'Yüksekokul' },
                    { key: 'koordinatorluk' as const, label: 'Merkezler' }
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setSelectedUnitCategory(cat.key);
                        const firstUnit = cat.key === 'all'
                          ? ACADEMIC_UNITS_WITH_DEPARTMENTS[0]
                          : ACADEMIC_UNITS_WITH_DEPARTMENTS.find(u => u.category === cat.key) || ACADEMIC_UNITS_WITH_DEPARTMENTS[0];
                        if (firstUnit) {
                          setSelectedFacultyId(firstUnit.facultyId);
                          setSelectedDepartmentId('all'); // Department is optional!
                        }
                      }}
                      className={cn(
                        "shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer whitespace-nowrap",
                        selectedUnitCategory === cat.key
                          ? "bg-amber-600 text-white border-amber-600 font-bold shadow-xs"
                          : "bg-white/80 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border-stone-200 dark:border-white/10"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </HorizontalScrollWrapper>
              </div>

              {/* Responsive 3-Column Inline Control Bar: Faculty Select, Department Select, Pin Button */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-1 border-t border-stone-200/60 dark:border-white/10">
                {/* 1. Fakülte / Üst Birim Select (5 cols) */}
                <div className="md:col-span-5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-white/50 block mb-1 uppercase tracking-wider">
                    Fakülte / Üst Birim:
                  </label>
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => {
                      const facId = e.target.value;
                      setSelectedFacultyId(facId);
                      setSelectedDepartmentId('all'); // Default to all / not mandatory!
                    }}
                    className="w-full bg-white dark:bg-[#1f3844] border border-stone-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer shadow-xs truncate"
                  >
                    {filteredAcademicUnits.map((unit) => (
                      <option key={unit.facultyId} value={unit.facultyId}>
                        {unit.facultyName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Bölüm / Program Select (5 cols) - DEFAULT IS 'all' (Tüm Bölümler - Fakülte Geneli) */}
                <div className="md:col-span-4">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-white/50 block mb-1 uppercase tracking-wider">
                    Bölüm (Zorunlu Değil):
                  </label>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => {
                      setSelectedDepartmentId(e.target.value);
                    }}
                    className="w-full bg-white dark:bg-[#1f3844] border border-stone-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer shadow-xs truncate"
                  >
                    <option value="all">
                      🏢 Tüm Bölümler / Fakülte Geneli
                    </option>
                    {activeFacultyGroup?.departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Pin / Favorite Toggle Button (3 cols) */}
                <div className="md:col-span-3 pt-4 md:pt-0">
                  <button
                    onClick={handleTogglePin}
                    className={cn(
                      "w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border",
                      isCurrentSelectionPinned
                        ? "bg-amber-600 text-white border-amber-600 shadow-amber-600/25"
                        : "bg-white dark:bg-white/10 text-stone-800 dark:text-white hover:bg-amber-50 dark:hover:bg-amber-950/20 border-stone-200 dark:border-white/10"
                    )}
                    title={isCurrentSelectionPinned ? "Sabitlemeyi Kaldır" : "Bu Birimi Sabitle"}
                  >
                    <Pin className={cn("w-3.5 h-3.5", isCurrentSelectionPinned ? "fill-white" : "text-amber-600 dark:text-amber-400")} />
                    <span>
                      {isCurrentSelectionPinned
                        ? 'Sabitlendi (Kaldır)'
                        : selectedDepartmentId === 'all'
                          ? 'Fakülteyi Sabitle'
                          : 'Bölümü Sabitle'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Compact active info strip & official link */}
              <div className="pt-2 border-t border-stone-200/50 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap text-stone-600 dark:text-white/70">
                  <span className="font-bold text-stone-900 dark:text-white">
                    {activeFacultyGroup.facultyName}
                  </span>
                  {selectedDepartmentId !== 'all' && activeDepartment && (
                    <>
                      <span className="text-stone-300 dark:text-white/20">•</span>
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">
                        {activeDepartment.name}
                      </span>
                    </>
                  )}
                  {selectedDepartmentId === 'all' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                      Fakülte Geneli Gösteriliyor
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedDepartmentId === 'all' ? activeFacultyGroup.facultyNewsUrl : (activeDepartment?.newsUrl || activeFacultyGroup.facultyNewsUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Resmi Web Sayfası</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Department Live Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400" strokeWidth={2} />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2.5 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl text-xs sm:text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400 shadow-xs"
                placeholder={selectedDepartmentId === 'all' ? `${activeFacultyGroup.shortName} haber ve duyurularında ara...` : `${activeDepartment?.name || 'Bölüm'} haberlerinde ara...`}
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
              <LoadingState message="Bölüm & Fakülte Haberleri Çekiliyor..." subtitle="Üniversite birim sunucusuna bağlanılıyor" />
            ) : filteredDeptNews.length === 0 ? (
              <div className="text-center py-10 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6">
                <Building2 className="w-8 h-8 text-stone-400 mx-auto mb-2 opacity-60" />
                <h3 className="font-display font-bold text-stone-800 dark:text-white text-base">
                  Haber veya Duyuru Bulunamadı
                </h3>
                <p className="text-stone-500 dark:text-white/60 text-xs mt-1 max-w-md mx-auto">
                  {selectedDepartmentId === 'all'
                    ? `${activeFacultyGroup.facultyName} için henüz arşivlenmiş haber bulunamadı.`
                    : `${activeDepartment?.name} için haber bulunamadı. "Fakülte Geneli" seçeneği ile fakültenin tüm haberlerini görüntüleyebilirsiniz.`}
                </p>
                {selectedDepartmentId !== 'all' && (
                  <button
                    onClick={() => setSelectedDepartmentId('all')}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Fakülte Geneli Haberleri Göster
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredDeptNews.map((item) => {
                  const isFav = isFeedItemFavorited(item.id);
                  const isAnnouncementItem = item.id.startsWith('fac-ann-');

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setSelectedItem({
                          url: item.url || '',
                          title: item.title,
                          date: item.date,
                          category: item.category || (isAnnouncementItem ? 'Duyuru' : 'Haber'),
                          content: item.content,
                          imageUrl: (item as any).imageUrl || (item as any).img
                        })
                      }
                      className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 hover:shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        {/* Header Badges & Favorite Star */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border",
                                isAnnouncementItem
                                  ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25"
                              )}
                            >
                              {isAnnouncementItem ? (
                                <Megaphone className="w-2.5 h-2.5" />
                              ) : (
                                <Newspaper className="w-2.5 h-2.5" />
                              )}
                              <span>{isAnnouncementItem ? 'Duyuru' : 'Haber'}</span>
                            </span>

                            {item.departmentName && item.departmentName !== 'Fakülte Duyurusu' && (
                              <span className="text-[10px] text-stone-500 dark:text-white/60 font-semibold truncate max-w-[150px]">
                                {item.departmentName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {item.date && (
                              <span className="text-[10px] text-stone-400 dark:text-white/50 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{item.date}</span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteFeedItem({
                                  id: item.id,
                                  title: item.title,
                                  date: item.date,
                                  category: item.category,
                                  type: isAnnouncementItem ? 'announcement' : 'news',
                                  url: item.url,
                                  content: item.content,
                                  facultyName: item.facultyName,
                                  departmentName: item.departmentName
                                });
                              }}
                              title={isFav ? "Favorilerden Çıkar" : "Favoriye Ekle"}
                              className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-white/10 text-stone-400 hover:text-amber-500 transition-colors ml-1 cursor-pointer"
                            >
                              <Star className={cn("w-3.5 h-3.5", isFav ? "text-amber-500 fill-amber-500" : "text-stone-400")} />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-2">
                          {item.title}
                        </h4>

                        {/* Snippet */}
                        {item.content && (
                          <p className="text-xs text-stone-600 dark:text-white/70 line-clamp-2 leading-relaxed mb-3">
                            {item.content}
                          </p>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
                        <span>Detayı Oku →</span>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-white"
                          >
                            <span>Orijinal Bağlantı</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            SEARCH & CATEGORY FILTERS (For all, news, announcements, favorites)
            ========================================================================= */}
        {activeTab !== 'department' && (
          <div className="space-y-3">
            {/* Live Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400" strokeWidth={2} />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl text-xs sm:text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400 shadow-xs"
                placeholder={
                  activeTab === 'all'
                    ? 'Haber veya duyurularda ara...'
                    : activeTab === 'news'
                      ? 'Haber başlığı veya kategori ara...'
                      : activeTab === 'announcements'
                        ? 'Duyuru başlığı veya birim ara...'
                        : 'Favorilerinde ara...'
                }
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
            {activeTab !== 'favorites' && categoryChips.length > 1 && (
              <div className="pt-0.5">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-stone-500 dark:text-white/60">
                  <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Kategori Filtresi:</span>
                </div>
                <HorizontalScrollWrapper>
                  {categoryChips.map((chip) => {
                    const isActive = selectedFilter === chip.id;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setSelectedFilter(chip.id)}
                        className={cn(
                          "shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 border cursor-pointer whitespace-nowrap",
                          isActive
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs shadow-amber-600/30 font-bold"
                            : "bg-[#fcfbf9] dark:bg-[#264653] text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border-[#e6e2d6] dark:border-white/10"
                        )}
                      >
                        <span>{chip.name}</span>
                        {typeof chip.count === 'number' && (
                          <span className={cn(
                            "ml-1.5 px-1.5 py-0.2 rounded-full text-[10px]",
                            isActive ? "bg-white/20 text-white" : "bg-stone-200 dark:bg-white/10 text-stone-600 dark:text-white/70"
                          )}>
                            {chip.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </HorizontalScrollWrapper>
              </div>
            )}

            {/* Active Filter Clear Info */}
            {(selectedFilter !== 'all' || searchQuery.trim()) && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                <span>
                  Filtre: <strong>{selectedFilter !== 'all' ? selectedFilter : 'Tümü'}</strong>
                  {searchQuery && <> • Arama: &quot;<strong>{searchQuery}</strong>&quot;</>}
                  {' '}({filteredFeedItems.length} sonuç)
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
          </div>
        )}

        {/* =========================================================================
            FEED ITEMS LIST (Tümü, Haberler, Duyurular, Favoriler)
            ========================================================================= */}
        {activeTab !== 'department' && (
          <div>
            {loading ? (
              <LoadingState message="Akış Yükleniyor..." subtitle="Üniversite duyuru ve haberleri güncelleniyor" />
            ) : filteredFeedItems.length === 0 ? (
              <div className="text-center py-12 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6">
                {activeTab === 'favorites' ? (
                  <>
                    <Star className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-60" />
                    <h3 className="font-display font-bold text-stone-800 dark:text-white text-base">
                      Henüz Favoriye Eklenen Öğe Yok
                    </h3>
                    <p className="text-stone-500 dark:text-white/60 text-xs mt-1 max-w-sm mx-auto">
                      İlgilendiğiniz haber veya duyuruların sağ üstündeki yıldız ikonuna tıklayarak buraya kaydedebilirsiniz.
                    </p>
                    <button
                      onClick={() => handleTabChange('all')}
                      className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
                    >
                      Tüm Akışı Görüntüle
                    </button>
                  </>
                ) : (
                  <>
                    <Newspaper className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-60" />
                    <h3 className="font-display font-bold text-stone-800 dark:text-white text-base">
                      Aramanıza Uygun Öğe Bulunamadı
                    </h3>
                    <p className="text-stone-500 dark:text-white/60 text-xs mt-1 max-w-sm mx-auto">
                      Farklı bir kategori seçebilir veya arama sözcüklerinizi değiştirebilirsiniz.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedFilter('all');
                        setSearchQuery('');
                      }}
                      className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
                    >
                      Tüm Sonuçları Göster
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedItems.map((item) => {
                  const isFav = isFeedItemFavorited(item.id);
                  const isAnn = item.type === 'announcement';

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setSelectedItem({
                          url: item.url || '',
                          title: item.title,
                          date: item.date,
                          category: item.category,
                          content: item.content,
                          imageUrl: item.imageUrl
                        })
                      }
                      className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 sm:p-5 hover:bg-[#f4f1ea] dark:hover:bg-white/10 hover:border-amber-500/40 transition-all cursor-pointer group shadow-xs"
                    >
                      {/* Top Badges & Favorite Star */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Distinct Type Badge (Haber vs Duyuru) */}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border",
                              isAnn
                                ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            )}
                          >
                            {isAnn ? (
                              <Megaphone className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                            ) : (
                              <Newspaper className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            )}
                            <span>{isAnn ? 'Duyuru' : 'Haber'}</span>
                          </span>

                          {/* Category Badge */}
                          {item.category && item.category !== 'Duyuru' && item.category !== 'Haber' && (
                            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 border border-stone-200 dark:border-white/10">
                              {item.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {item.date && (
                            <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 dark:text-white/50 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{item.date}</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteFeedItem({
                                id: item.id,
                                title: item.title,
                                date: item.date,
                                category: item.category,
                                type: item.type,
                                url: item.url,
                                content: item.content,
                                imageUrl: item.imageUrl,
                                facultyName: item.facultyName,
                                departmentName: item.departmentName
                              });
                            }}
                            title={isFav ? "Favorilerden Çıkar" : "Favoriye Ekle"}
                            className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-white/15 text-stone-400 hover:text-amber-500 transition-colors cursor-pointer"
                          >
                            <Star className={cn("w-4 h-4", isFav ? "text-amber-500 fill-amber-500" : "text-stone-400")} />
                          </button>
                        </div>
                      </div>

                      {/* Content & Title */}
                      <div className="flex gap-4 items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </h4>

                          {item.content && (
                            <p className="text-xs sm:text-sm text-stone-600 dark:text-white/70 line-clamp-2 mt-1.5 leading-relaxed">
                              {item.content}
                            </p>
                          )}
                        </div>

                        {/* Thumbnail if available */}
                        {item.imageUrl && (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-white/10 hidden sm:block">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        <DetailModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      </motion.div>
    </PullToRefresh>
  );
}
