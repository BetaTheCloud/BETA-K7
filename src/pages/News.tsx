import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  getNews,
  getDepartmentNews,
  getDepartmentAnnouncements,
  getCachedOrFallback,
  FALLBACK_NEWS,
  FALLBACK_DEPARTMENT_NEWS,
  FALLBACK_DEPARTMENT_ANNOUNCEMENTS
} from '../mockData';
import { Announcement, DepartmentNewsItem, DepartmentAnnouncementItem, StaffUnitCategory } from '../types';
import {
  ACADEMIC_UNITS_WITH_DEPARTMENTS,
  DepartmentGroup
} from '../data/departmentNewsData';
import {
  Search,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  Newspaper,
  Bell,
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
  Music,
  Landmark,
  Compass,
  Pin,
  PinOff,
  ChevronRight,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { cn, parseDateToTimestamp } from '../lib/utils';
import DetailModal, { DetailModalItem } from '../components/DetailModal';
import PullToRefresh from '../components/PullToRefresh';
import LoadingState from '../components/LoadingState';
import HorizontalScrollWrapper from '../components/HorizontalScrollWrapper';

export default function News() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab: 'main' (Üniversite Gündemi) or 'department' (Bölüm Masası)
  const [activeTab, setActiveTab] = useState<'main' | 'department'>(() => {
    return searchParams.get('tab') === 'department' ? 'department' : 'main';
  });

  // Pinned Department state
  const [pinnedDeptId, setPinnedDeptId] = useState<string | null>(() => {
    return localStorage.getItem('k7_pinned_department') || null;
  });

  // Main news state
  const [news, setNews] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_news_v6', FALLBACK_NEWS);
  });

  // Department news state
  const [departmentNews, setDepartmentNews] = useState<DepartmentNewsItem[]>(() => {
    return getCachedOrFallback<DepartmentNewsItem[]>('k7_cached_dept_news_all', FALLBACK_DEPARTMENT_NEWS);
  });

  // Department announcements state
  const [departmentAnnouncements, setDepartmentAnnouncements] = useState<DepartmentAnnouncementItem[]>(() => {
    return getCachedOrFallback<DepartmentAnnouncementItem[]>('k7_cached_dept_ann_all', FALLBACK_DEPARTMENT_ANNOUNCEMENTS);
  });

  // Pinned department quick feed state
  const [pinnedNews, setPinnedNews] = useState<DepartmentNewsItem[]>([]);
  const [pinnedAnnouncements, setPinnedAnnouncements] = useState<DepartmentAnnouncementItem[]>([]);
  const [pinnedQuickTab, setPinnedQuickTab] = useState<'announcements' | 'news'>('announcements');

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
  const [deptFeedType, setDeptFeedType] = useState<'all' | 'announcements' | 'news'>('all');

  // Spotlight search in Department Hub
  const [spotlightQuery, setSpotlightQuery] = useState('');

  // All flat departments list for instant search
  const allFlatDepartments = useMemo(() => {
    const list: {
      dept: any;
      facultyId: string;
      facultyName: string;
      category: StaffUnitCategory;
    }[] = [];
    ACADEMIC_UNITS_WITH_DEPARTMENTS.forEach(g => {
      g.departments.forEach(d => {
        list.push({
          dept: d,
          facultyId: g.facultyId,
          facultyName: g.facultyName,
          category: g.category
        });
      });
    });
    return list;
  }, []);

  // Filtered flat departments for spotlight
  const spotlightResults = useMemo(() => {
    if (!spotlightQuery.trim()) return [];
    const q = spotlightQuery.toLowerCase().trim();
    return allFlatDepartments.filter(item => {
      return item.dept.name.toLowerCase().includes(q) ||
             item.facultyName.toLowerCase().includes(q) ||
             (item.dept.description && item.dept.description.toLowerCase().includes(q));
    }).slice(0, 8);
  }, [spotlightQuery, allFlatDepartments]);

  // Pinned department object
  const pinnedDepartmentInfo = useMemo(() => {
    if (!pinnedDeptId) return null;
    return allFlatDepartments.find(item => item.dept.id === pinnedDeptId || item.dept.slug === pinnedDeptId) || null;
  }, [pinnedDeptId, allFlatDepartments]);

  // Toggle Pin Department
  const handleTogglePinDepartment = (deptId: string) => {
    if (pinnedDeptId === deptId) {
      setPinnedDeptId(null);
      localStorage.removeItem('k7_pinned_department');
    } else {
      setPinnedDeptId(deptId);
      localStorage.setItem('k7_pinned_department', deptId);
    }
  };

  // Sync state with URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'department') {
      setActiveTab('department');
    }
    const deptParam = searchParams.get('dept');
    if (deptParam) {
      setSelectedDepartmentId(deptParam);
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

  // Load Department News & Announcements
  const loadDeptFeed = async (force = false) => {
    if (force) setDeptLoading(true);
    
    const currentGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === selectedFacultyId);
    const currentDept = currentGroup?.departments.find(d => d.id === selectedDepartmentId);
    const newsUrl = currentDept?.newsUrl;
    const annUrl = currentDept?.announcementUrl || (currentDept?.websiteUrl ? `${currentDept.websiteUrl}/tr/announcement-all` : undefined);

    const [newsData, annData] = await Promise.all([
      getDepartmentNews(newsUrl, selectedDepartmentId, selectedFacultyId, force),
      getDepartmentAnnouncements(annUrl, selectedDepartmentId, selectedFacultyId, force)
    ]);

    if (newsData && newsData.length > 0) {
      setDepartmentNews(newsData);
    }
    if (annData && annData.length > 0) {
      setDepartmentAnnouncements(annData);
    }
    setDeptLoading(false);
  };

  // Load Pinned Department Feed
  useEffect(() => {
    if (pinnedDepartmentInfo) {
      const pDept = pinnedDepartmentInfo.dept;
      const newsUrl = pDept.newsUrl;
      const annUrl = pDept.announcementUrl || (pDept.websiteUrl ? `${pDept.websiteUrl}/tr/announcement-all` : undefined);

      getDepartmentNews(newsUrl, pDept.id, pinnedDepartmentInfo.facultyId, false).then(res => {
        if (res) setPinnedNews(res);
      });
      getDepartmentAnnouncements(annUrl, pDept.id, pinnedDepartmentInfo.facultyId, false).then(res => {
        if (res) setPinnedAnnouncements(res);
      });
    }
  }, [pinnedDeptId, pinnedDepartmentInfo]);

  useEffect(() => {
    loadMainNews();
  }, []);

  useEffect(() => {
    if (activeTab === 'department') {
      loadDeptFeed(false);
    }
  }, [activeTab, selectedFacultyId, selectedDepartmentId]);

  const handleRefresh = async () => {
    if (activeTab === 'main') {
      await loadMainNews(true);
    } else {
      await loadDeptFeed(true);
    }
  };

  const handleTabChange = (tab: 'main' | 'department') => {
    setActiveTab(tab);
    setSearchQuery('');
    setSpotlightQuery('');
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

  // Combined Department Feed Items (Announcements + News)
  const combinedDepartmentFeed = useMemo(() => {
    const feed: {
      id: string;
      type: 'announcement' | 'news';
      title: string;
      date: string;
      content?: string;
      url: string;
      imageUrl?: string;
      departmentName: string;
      facultyName: string;
      departmentId: string;
      facultyId: string;
      sourceUrl?: string;
    }[] = [];

    if (deptFeedType === 'all' || deptFeedType === 'announcements') {
      departmentAnnouncements.forEach(item => {
        feed.push({
          id: item.id,
          type: 'announcement',
          title: item.title,
          date: item.date,
          content: item.content,
          url: item.url,
          imageUrl: item.imageUrl,
          departmentName: item.departmentName || activeDepartment?.name || '',
          facultyName: item.facultyName || activeFacultyGroup?.facultyName || '',
          departmentId: item.departmentId || activeDepartment?.id || '',
          facultyId: item.facultyId || activeFacultyGroup?.facultyId || '',
          sourceUrl: item.sourceUrl
        });
      });
    }

    if (deptFeedType === 'all' || deptFeedType === 'news') {
      departmentNews.forEach(item => {
        feed.push({
          id: item.id,
          type: 'news',
          title: item.title,
          date: item.date,
          content: item.content,
          url: item.url,
          imageUrl: item.imageUrl,
          departmentName: item.departmentName || activeDepartment?.name || '',
          facultyName: item.facultyName || activeFacultyGroup?.facultyName || '',
          departmentId: item.departmentId || activeDepartment?.id || '',
          facultyId: item.facultyId || activeFacultyGroup?.facultyId || '',
          sourceUrl: item.sourceUrl
        });
      });
    }

    // Filter by department if needed and search
    let filtered = feed;
    if (selectedDepartmentId && selectedDepartmentId !== 'all') {
      filtered = filtered.filter(item => {
        if (!item.departmentId) return true;
        return item.departmentId === selectedDepartmentId ||
               item.departmentName.toLowerCase().includes(activeDepartment?.name.toLowerCase() || '');
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return item.title.toLowerCase().includes(q) ||
               (item.content && item.content.toLowerCase().includes(q)) ||
               item.departmentName.toLowerCase().includes(q);
      });
    }

    // Sort by freshest date
    return filtered.sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));
  }, [departmentAnnouncements, departmentNews, deptFeedType, selectedDepartmentId, activeDepartment, activeFacultyGroup, searchQuery]);

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

  const handleSelectFromSpotlight = (item: { dept: any; facultyId: string }) => {
    setSelectedFacultyId(item.facultyId);
    setSelectedDepartmentId(item.dept.id);
    setSpotlightQuery('');
    // Auto switch to department view if not already there
    setActiveTab('department');
  };

  const getUnitCategoryMeta = (cat: StaffUnitCategory) => {
    switch (cat) {
      case 'fakulte':
        return { label: 'Fakülteler', icon: GraduationCap, badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
      case 'enstitu':
        return { label: 'Enstitü', icon: BookOpen, badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' };
      case 'yuksekokul':
        return { label: 'Yüksekokul', icon: School, badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' };
      case 'myo':
        return { label: 'MYO', icon: Building2, badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' };
      case 'konservatuvar':
        return { label: 'Konservatuvar', icon: Music, badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' };
      case 'daire':
        return { label: 'Daire Bşk.', icon: Landmark, badgeClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20' };
      case 'koordinatorluk':
        return { label: 'Koordinatörlük', icon: Compass, badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20' };
      default:
        return { label: 'Birim', icon: Layers, badgeClass: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20' };
    }
  };

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
                <span>Haberler & Bölüm Masası</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                  Canlı Akış
                </span>
              </h2>
              <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 font-medium">
                Üniversite ana gündemi, fakülteler ve tüm bölümlerimizin duyuru & haber akışı tek merkezde.
              </p>
            </div>
          </div>

          {/* High-level View Switcher Tabs: Üniversite Gündemi vs Bölüm Masası */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1.5 bg-stone-100 dark:bg-[#1a3038] rounded-2xl border border-stone-200/80 dark:border-white/10">
            <button
              onClick={() => handleTabChange('main')}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
                activeTab === 'main'
                  ? "bg-white dark:bg-[#264653] text-[#264653] dark:text-white shadow-sm border border-stone-200/60 dark:border-white/10"
                  : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
              )}
            >
              <Newspaper className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Üniversite Gündemi</span>
            </button>
            <button
              onClick={() => handleTabChange('department')}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
                activeTab === 'department'
                  ? "bg-white dark:bg-[#264653] text-[#264653] dark:text-white shadow-sm border border-stone-200/60 dark:border-white/10"
                  : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
              )}
            >
              <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Bölüm Masası (Duyuru & Haber)</span>
              {pinnedDeptId && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Sabitlenmiş Bölüm Mevcut" />
              )}
            </button>
          </div>
        </header>

        {/* ================= VIEW 1: ÜNİVERSİTE GÜNDEMİ ================= */}
        {activeTab === 'main' && (
          <div className="space-y-6">
            {/* Pinned Department Smart Card (If User Pinned A Department) */}
            {pinnedDepartmentInfo ? (
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                      <Pin className="w-5 h-5 fill-amber-500 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300">
                          Sabitlenen Bölümüm
                        </span>
                        <span className="text-xs text-stone-500 dark:text-white/50 font-medium">
                          {pinnedDepartmentInfo.facultyName}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white mt-0.5">
                        {pinnedDepartmentInfo.dept.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleTogglePinDepartment(pinnedDepartmentInfo.dept.id)}
                      title="Sabitlemeyi Kaldır"
                      className="p-2 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-stone-600 dark:text-stone-300 hover:text-rose-600 transition-colors border border-stone-200/80 dark:border-white/10 text-xs font-medium cursor-pointer"
                    >
                      <PinOff className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFacultyId(pinnedDepartmentInfo.facultyId);
                        setSelectedDepartmentId(pinnedDepartmentInfo.dept.id);
                        handleTabChange('department');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>Bölüm Masası'nı Aç</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Toggle between Announcements & News of Pinned Department */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 p-1 bg-white/70 dark:bg-black/20 rounded-xl border border-stone-200/60 dark:border-white/10 w-fit">
                    <button
                      onClick={() => setPinnedQuickTab('announcements')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        pinnedQuickTab === 'announcements'
                          ? "bg-amber-500 text-white shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Duyurular</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                        {pinnedAnnouncements.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setPinnedQuickTab('news')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        pinnedQuickTab === 'news'
                          ? "bg-amber-500 text-white shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>Haberler</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                        {pinnedNews.length}
                      </span>
                    </button>
                  </div>
                  <span className="text-[11px] text-stone-400 dark:text-white/40 hidden sm:inline">
                    Bölümünüze ait en son paylaşımlar
                  </span>
                </div>

                {/* Quick Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pinnedQuickTab === 'announcements' ? (
                    pinnedAnnouncements.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem({
                          title: item.title,
                          date: item.date,
                          category: 'Bölüm Duyurusu',
                          url: item.url,
                          content: item.content,
                          sourceName: pinnedDepartmentInfo.dept.name
                        })}
                        className="bg-white/90 dark:bg-[#1a3038]/90 border border-stone-200/80 dark:border-white/10 rounded-2xl p-3.5 hover:border-amber-500/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                              Duyuru
                            </span>
                            <span className="text-[11px] text-stone-400 dark:text-white/40 font-mono">
                              {item.date}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-stone-800 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-[11px] text-stone-400 dark:text-white/40">
                          <span>İncele & Oku</span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))
                  ) : (
                    pinnedNews.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem({
                          title: item.title,
                          date: item.date,
                          category: 'Bölüm Haberi',
                          url: item.url,
                          content: item.content,
                          imageUrl: item.imageUrl,
                          sourceName: pinnedDepartmentInfo.dept.name
                        })}
                        className="bg-white/90 dark:bg-[#1a3038]/90 border border-stone-200/80 dark:border-white/10 rounded-2xl p-3.5 hover:border-amber-500/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                              Haber
                            </span>
                            <span className="text-[11px] text-stone-400 dark:text-white/40 font-mono">
                              {item.date}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-stone-800 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-[11px] text-stone-400 dark:text-white/40">
                          <span>Detayları Gör</span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Non-intrusive banner inviting user to pin their department */
              <div className="bg-[#fcfbf9] dark:bg-[#1f3741] border border-emerald-500/20 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                      Kendi Bölümünün Duyuru ve Haberlerini Sabitle
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-white/60 mt-0.5">
                      Fakülte ve bölümünü 1 kez sabitle; her girişte tek tıkla sana özel akışı gör.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('department')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#264653] dark:bg-emerald-600 text-white text-xs font-bold hover:bg-[#1a343f] dark:hover:bg-emerald-700 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Bölüm Seç & Sabitle</span>
                </button>
              </div>
            )}

            {/* Search and Category Filter Section */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Üniversite haberlerinde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white dark:bg-[#1a3038] border border-stone-200 dark:border-white/10 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <HorizontalScrollWrapper>
                <div className="flex items-center gap-2 py-1">
                  {sortedFilterChips.map((chip) => {
                    const isSelected = selectedFilter === chip.id;
                    const isMain = isMainNewsCategory(chip.name);
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setSelectedFilter(chip.id)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer',
                          isSelected
                            ? 'bg-[#264653] dark:bg-emerald-600 text-white border-transparent shadow-sm scale-105'
                            : isMain
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                            : 'bg-white dark:bg-[#1a3038] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-white/10 hover:bg-stone-50'
                        )}
                      >
                        {chip.name}
                      </button>
                    );
                  })}
                </div>
              </HorizontalScrollWrapper>
            </div>

            {/* Main News List / Category Sections */}
            {loading ? (
              <LoadingState message="Haberler Yükleniyor..." subtitle="Üniversite haberleri güncelleniyor" />
            ) : sortedGroupedCategories.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 dark:bg-white/5 rounded-3xl border border-stone-200 dark:border-white/10">
                <Newspaper className="w-12 h-12 text-stone-400 mx-auto mb-3 opacity-60" />
                <p className="text-stone-600 dark:text-stone-300 font-semibold text-base">Aradığınız kriterlere uygun haber bulunamadı.</p>
                <p className="text-stone-400 text-xs mt-1">Lütfen arama terimini değiştirin veya kategori filtresini temizleyin.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedGroupedCategories.map(([category, items]) => {
                  const isCollapsed = collapsedCategories[category];
                  const isMainCat = isMainNewsCategory(category);
                  return (
                    <div
                      key={category}
                      className={cn(
                        "rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs",
                        isMainCat
                          ? "bg-white dark:bg-[#1a3038] border-emerald-500/30"
                          : "bg-white dark:bg-[#1a3038] border-stone-200 dark:border-white/10"
                      )}
                    >
                      <div
                        onClick={() => toggleCategory(category)}
                        className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-stone-50/70 dark:bg-white/5 border-b border-stone-200/60 dark:border-white/5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            isMainCat ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                          <h3 className="font-display font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                            {category}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-stone-300 font-mono font-bold">
                            {items.length}
                          </span>
                        </div>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-stone-400 transition-transform duration-300",
                          isCollapsed ? "-rotate-90" : "rotate-0"
                        )} />
                      </div>

                      {!isCollapsed && (
                        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedItem({
                                title: item.title,
                                date: item.date,
                                category: item.category || category,
                                url: item.url,
                                content: item.content,
                                sourceName: 'Kilis 7 Aralık Üniversitesi'
                              })}
                              className="group p-4 rounded-2xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="text-[11px] font-mono text-stone-400 dark:text-white/40 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {item.date}
                                  </span>
                                  {isMainCat && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                                      Resmi Bülten
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                  {item.title}
                                </h4>
                                {item.content && (
                                  <p className="text-xs text-stone-500 dark:text-white/60 mt-2 line-clamp-2">
                                    {item.content}
                                  </p>
                                )}
                              </div>
                              <div className="mt-3 pt-2.5 border-t border-stone-200/50 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <span>Haberi Oku</span>
                                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 2: BÖLÜM MASASI (DUYURU & HABER TEK MERKEZDE) ================= */}
        {activeTab === 'department' && (
          <div className="space-y-6">
            {/* Spotlight Fast Search Bar for 80+ Departments */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 dark:text-amber-400" />
                <input
                  type="text"
                  placeholder="Bölüm veya program ara... (örn: Bilgisayar, Türk Dili, Hemşirelik, Aşçılık)"
                  value={spotlightQuery}
                  onChange={(e) => setSpotlightQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-[#1a3038] border-2 border-amber-500/30 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 text-sm font-medium focus:outline-none focus:border-amber-500 shadow-sm"
                />
                {spotlightQuery && (
                  <button
                    onClick={() => setSpotlightQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Spotlight Live Search Dropdown */}
              {spotlightResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-40 mt-2 bg-white dark:bg-[#1a3038] border border-stone-200 dark:border-white/15 rounded-2xl shadow-xl overflow-hidden divide-y divide-stone-100 dark:divide-white/5">
                  <div className="px-4 py-2 bg-stone-50 dark:bg-white/5 text-[11px] font-bold text-stone-500 dark:text-white/50 uppercase tracking-wider">
                    Eşleşen Bölümler & Birimler ({spotlightResults.length})
                  </div>
                  {spotlightResults.map((item) => (
                    <div
                      key={item.dept.id}
                      onClick={() => handleSelectFromSpotlight(item)}
                      className="px-4 py-3 hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white group-hover:text-amber-600 transition-colors">
                          {item.dept.name}
                        </h4>
                        <p className="text-[11px] text-stone-400 dark:text-white/50 mt-0.5">
                          {item.facultyName}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 font-semibold group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0">
                        Bölümü Aç →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Structured Browsing: Category Switcher */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-500 dark:text-white/50 uppercase tracking-wider">
                Birim Türüne Göre Filtrele:
              </span>
              <HorizontalScrollWrapper>
                <div className="flex items-center gap-2 py-1">
                  {[
                    { key: 'all' as const, label: 'Tümü' },
                    { key: 'fakulte' as const, label: 'Fakülteler (12)' },
                    { key: 'enstitu' as const, label: 'Enstitü' },
                    { key: 'yuksekokul' as const, label: 'Yüksekokul' },
                    { key: 'myo' as const, label: 'Meslek Yüksekokulları (4)' },
                    { key: 'konservatuvar' as const, label: 'Konservatuvar' },
                    { key: 'daire' as const, label: 'Daire Başkanlıkları (8)' },
                    { key: 'koordinatorluk' as const, label: 'Koordinatörlükler (10)' },
                  ].map((chip) => {
                    const isSelected = selectedUnitCategory === chip.key;
                    return (
                      <button
                        key={chip.key}
                        onClick={() => setSelectedUnitCategory(chip.key)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer',
                          isSelected
                            ? 'bg-[#264653] dark:bg-amber-600 text-white border-transparent shadow-sm'
                            : 'bg-white dark:bg-[#1a3038] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-white/10 hover:bg-stone-50'
                        )}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </HorizontalScrollWrapper>
            </div>

            {/* Dual Clean Cascading Selectors: Faculty & Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 bg-[#fcfbf9] dark:bg-[#1f3741] border border-stone-200 dark:border-white/10 rounded-3xl shadow-xs">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  1. Fakülte / Üst Birim Seçimi:
                </label>
                <div className="relative">
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => {
                      const newFacId = e.target.value;
                      setSelectedFacultyId(newFacId);
                      const targetGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === newFacId);
                      if (targetGroup && targetGroup.departments.length > 0) {
                        setSelectedDepartmentId(targetGroup.departments[0].id);
                      }
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-[#1a3038] border border-stone-200 dark:border-white/10 rounded-xl text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer appearance-none"
                  >
                    {filteredAcademicUnits.map((g) => (
                      <option key={g.facultyId} value={g.facultyId}>
                        {g.facultyName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  2. Bölüm / Program Seçimi:
                </label>
                <div className="relative">
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-[#1a3038] border border-stone-200 dark:border-white/10 rounded-xl text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer appearance-none"
                  >
                    {activeFacultyGroup?.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Department Showcase Header Card */}
            {activeDepartment && (
              <div className="bg-gradient-to-br from-[#264653]/10 via-[#264653]/5 to-transparent border-2 border-[#264653]/20 dark:border-white/15 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                        getUnitCategoryMeta(activeFacultyGroup.category).badgeClass
                      )}>
                        {activeFacultyGroup.facultyName}
                      </span>
                      {pinnedDeptId === activeDepartment.id && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-amber-500" />
                          <span>Sabitlenmiş Bölümünüz</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-2xl font-display font-extrabold text-stone-900 dark:text-white mt-1">
                      {activeDepartment.name}
                    </h3>
                    {activeDepartment.description && (
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-white/70 mt-1 max-w-2xl">
                        {activeDepartment.description}
                      </p>
                    )}
                  </div>

                  {/* Actions: Pin / Web Link / Copy */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      onClick={() => handleTogglePinDepartment(activeDepartment.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shadow-xs active:scale-95",
                        pinnedDeptId === activeDepartment.id
                          ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                          : "bg-white dark:bg-[#1a3038] text-stone-700 dark:text-white border-stone-200 dark:border-white/10 hover:border-amber-500/50"
                      )}
                    >
                      <Pin className={cn("w-3.5 h-3.5", pinnedDeptId === activeDepartment.id && "fill-white")} />
                      <span>{pinnedDeptId === activeDepartment.id ? 'Sabitlendi' : 'Bölümümü Sabitle'}</span>
                    </button>

                    {activeDepartment.websiteUrl && (
                      <a
                        href={activeDepartment.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1a3038] hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-white text-xs font-bold transition-all border border-stone-200 dark:border-white/10 shadow-xs"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                        <span>Resmi Web</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}

                    <button
                      onClick={() => copyDepartmentLink(window.location.href)}
                      className="p-2 rounded-xl bg-white dark:bg-[#1a3038] hover:bg-stone-100 dark:hover:bg-white/10 text-stone-600 dark:text-white/70 transition-all border border-stone-200 dark:border-white/10 text-xs font-semibold cursor-pointer shadow-xs"
                      title="Bölüm Bağlantısını Kopyala"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3-Way Feed Filter: Duyurular vs Haberler vs Tümü */}
                <div className="pt-3 border-t border-stone-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-black/20 rounded-2xl border border-stone-200/80 dark:border-white/10 w-fit">
                    <button
                      onClick={() => setDeptFeedType('all')}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        deptFeedType === 'all'
                          ? "bg-[#264653] dark:bg-emerald-600 text-white shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Tümü</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                        {departmentAnnouncements.length + departmentNews.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setDeptFeedType('announcements')}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        deptFeedType === 'announcements'
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Bölüm Duyuruları</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                        {departmentAnnouncements.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setDeptFeedType('news')}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        deptFeedType === 'news'
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>Bölüm Haberleri</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                        {departmentNews.length}
                      </span>
                    </button>
                  </div>

                  <span className="text-xs text-stone-500 dark:text-white/50 font-medium">
                    {combinedDepartmentFeed.length} içerik listeleniyor
                  </span>
                </div>
              </div>
            )}

            {/* Department Feed Stream Grid */}
            {deptLoading ? (
              <LoadingState message="Bölüm Akışı Yükleniyor..." subtitle="Bölüm duyuru ve haberleri güncelleniyor" />
            ) : combinedDepartmentFeed.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 dark:bg-white/5 rounded-3xl border border-stone-200 dark:border-white/10">
                <Layers className="w-12 h-12 text-stone-400 mx-auto mb-3 opacity-60" />
                <p className="text-stone-600 dark:text-stone-300 font-semibold text-base">Bu bölüm için henüz içerik bulunamadı.</p>
                <p className="text-stone-400 text-xs mt-1">Lütfen diğer sekmeleri kontrol edin veya resmi web sayfasını ziyaret edin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {combinedDepartmentFeed.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem({
                      title: item.title,
                      date: item.date,
                      category: item.type === 'announcement' ? 'Bölüm Duyurusu' : 'Bölüm Haberi',
                      url: item.url,
                      content: item.content,
                      imageUrl: item.imageUrl,
                      sourceName: item.departmentName || activeDepartment?.name
                    })}
                    className={cn(
                      "group p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md",
                      item.type === 'announcement'
                        ? "bg-white dark:bg-[#1a3038] border-amber-500/25 hover:border-amber-500/60"
                        : "bg-white dark:bg-[#1a3038] border-emerald-500/25 hover:border-emerald-500/60"
                    )}
                  >
                    <div>
                      {item.imageUrl && (
                        <div className="w-full h-40 rounded-2xl overflow-hidden mb-3.5 bg-stone-100 dark:bg-black/20">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider",
                          item.type === 'announcement'
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                        )}>
                          {item.type === 'announcement' ? '📢 Bölüm Duyurusu' : '📰 Bölüm Haberi'}
                        </span>
                        <span className="text-xs font-mono text-stone-400 dark:text-white/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                        {item.title}
                      </h4>

                      {item.content && (
                        <p className="text-xs text-stone-500 dark:text-white/60 mt-2 line-clamp-3">
                          {item.content}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-stone-600 dark:text-white/70">
                      <span className="group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Detayları İncele
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Global Detail Modal for Announcements and News */}
        <DetailModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      </motion.div>
    </PullToRefresh>
  );
}
