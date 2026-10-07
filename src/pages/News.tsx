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
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(() => {
    return searchParams.get('dept') || 'all';
  });
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

  // Pinned unit object (Supports both Faculty/Upper Unit and Specific Department)
  const pinnedUnitInfo = useMemo(() => {
    if (!pinnedDeptId) return null;
    // 1. Is it a faculty group?
    const facGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === pinnedDeptId);
    if (facGroup) {
      return {
        type: 'faculty' as const,
        id: facGroup.facultyId,
        name: facGroup.facultyName,
        facultyId: facGroup.facultyId,
        facultyName: facGroup.facultyName,
        category: facGroup.category,
        newsUrl: facGroup.facultyNewsUrl,
        announcementUrl: facGroup.facultyNewsUrl.replace('/news-all', '/announcements-all'),
        websiteUrl: facGroup.facultyNewsUrl.split('/tr')[0],
        description: `${facGroup.facultyName} genel duyuru ve haber akışı.`
      };
    }
    // 2. Is it a specific department?
    const deptMatch = allFlatDepartments.find(item => item.dept.id === pinnedDeptId || item.dept.slug === pinnedDeptId);
    if (deptMatch) {
      return {
        type: 'department' as const,
        id: deptMatch.dept.id,
        name: deptMatch.dept.name,
        facultyId: deptMatch.facultyId,
        facultyName: deptMatch.facultyName,
        category: deptMatch.category,
        newsUrl: deptMatch.dept.newsUrl,
        announcementUrl: deptMatch.dept.announcementUrl || (deptMatch.dept.websiteUrl ? `${deptMatch.dept.websiteUrl}/tr/announcements-all` : undefined),
        websiteUrl: deptMatch.dept.websiteUrl,
        description: deptMatch.dept.description
      };
    }
    return null;
  }, [pinnedDeptId, allFlatDepartments]);

  // Toggle Pin Unit (Department or Faculty)
  const handleTogglePinUnit = (unitId: string) => {
    if (pinnedDeptId === unitId) {
      setPinnedDeptId(null);
      localStorage.removeItem('k7_pinned_department');
    } else {
      setPinnedDeptId(unitId);
      localStorage.setItem('k7_pinned_department', unitId);
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
      for (const grp of ACADEMIC_UNITS_WITH_DEPARTMENTS) {
        if (grp.facultyId === deptParam) {
          setSelectedFacultyId(grp.facultyId);
          setSelectedDepartmentId('all');
          break;
        }
        if (grp.departments.some(d => d.id === deptParam || d.slug === deptParam)) {
          setSelectedFacultyId(grp.facultyId);
          setSelectedDepartmentId(deptParam);
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

  // Load Department / Faculty News & Announcements
  const loadDeptFeed = async (force = false) => {
    if (force) setDeptLoading(true);
    
    const currentGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === selectedFacultyId) || ACADEMIC_UNITS_WITH_DEPARTMENTS[0];
    const isGeneral = !selectedDepartmentId || selectedDepartmentId === 'all';
    const currentDept = !isGeneral
      ? currentGroup?.departments.find(d => d.id === selectedDepartmentId || d.slug === selectedDepartmentId)
      : null;

    let newsUrl: string | undefined;
    let annUrl: string | undefined;
    let queryDeptId: string | undefined;

    if (isGeneral || !currentDept) {
      newsUrl = currentGroup?.facultyNewsUrl;
      annUrl = currentGroup?.facultyNewsUrl ? currentGroup.facultyNewsUrl.replace('/news-all', '/announcements-all') : undefined;
      queryDeptId = currentGroup?.facultyId;
    } else {
      newsUrl = currentDept.newsUrl;
      annUrl = currentDept.announcementUrl || (currentDept.websiteUrl ? `${currentDept.websiteUrl}/tr/announcements-all` : undefined);
      queryDeptId = currentDept.id;
    }

    const [newsData, annData] = await Promise.all([
      getDepartmentNews(newsUrl, queryDeptId, selectedFacultyId, force),
      getDepartmentAnnouncements(annUrl, queryDeptId, selectedFacultyId, force)
    ]);

    if (newsData && newsData.length > 0) {
      setDepartmentNews(newsData);
    }
    if (annData && annData.length > 0) {
      setDepartmentAnnouncements(annData);
    }
    setDeptLoading(false);
  };

  // Load Pinned Unit Feed
  useEffect(() => {
    if (pinnedUnitInfo) {
      getDepartmentNews(pinnedUnitInfo.newsUrl, pinnedUnitInfo.id, pinnedUnitInfo.facultyId, false).then(res => {
        if (res) setPinnedNews(res);
      });
      getDepartmentAnnouncements(pinnedUnitInfo.announcementUrl, pinnedUnitInfo.id, pinnedUnitInfo.facultyId, false).then(res => {
        if (res) setPinnedAnnouncements(res);
      });
    }
  }, [pinnedDeptId, pinnedUnitInfo]);

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

  // Active faculty group object
  const activeFacultyGroup = useMemo(() => {
    return ACADEMIC_UNITS_WITH_DEPARTMENTS.find(u => u.facultyId === selectedFacultyId) || ACADEMIC_UNITS_WITH_DEPARTMENTS[0];
  }, [selectedFacultyId]);

  // Active specific department object (null if faculty-general is selected)
  const isFacultyGeneral = selectedDepartmentId === 'all' || !selectedDepartmentId;
  const activeDepartment = useMemo(() => {
    if (!activeFacultyGroup || isFacultyGeneral) return null;
    return activeFacultyGroup.departments.find(d => d.id === selectedDepartmentId || d.slug === selectedDepartmentId) || null;
  }, [activeFacultyGroup, selectedDepartmentId, isFacultyGeneral]);

  // Unified Current Active Unit (Department OR Faculty)
  const currentActiveUnit = useMemo(() => {
    if (!activeFacultyGroup) return null;
    if (activeDepartment) {
      return {
        type: 'department' as const,
        id: activeDepartment.id,
        name: activeDepartment.name,
        facultyId: activeFacultyGroup.facultyId,
        facultyName: activeFacultyGroup.facultyName,
        category: activeFacultyGroup.category,
        websiteUrl: activeDepartment.websiteUrl,
        newsUrl: activeDepartment.newsUrl,
        announcementUrl: activeDepartment.announcementUrl || (activeDepartment.websiteUrl ? `${activeDepartment.websiteUrl}/tr/announcements-all` : undefined),
        description: activeDepartment.description
      };
    }
    return {
      type: 'faculty' as const,
      id: activeFacultyGroup.facultyId,
      name: activeFacultyGroup.facultyName,
      facultyId: activeFacultyGroup.facultyId,
      facultyName: activeFacultyGroup.facultyName,
      category: activeFacultyGroup.category,
      websiteUrl: activeFacultyGroup.facultyNewsUrl.split('/tr')[0],
      newsUrl: activeFacultyGroup.facultyNewsUrl,
      announcementUrl: activeFacultyGroup.facultyNewsUrl.replace('/news-all', '/announcements-all'),
      description: `${activeFacultyGroup.facultyName} bünyesindeki tüm bölümlere ait duyuru ve haber akışı.`
    };
  }, [activeFacultyGroup, activeDepartment]);

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
          departmentName: item.departmentName || currentActiveUnit?.name || '',
          facultyName: item.facultyName || activeFacultyGroup?.facultyName || '',
          departmentId: item.departmentId || currentActiveUnit?.id || '',
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
          departmentName: item.departmentName || currentActiveUnit?.name || '',
          facultyName: item.facultyName || activeFacultyGroup?.facultyName || '',
          departmentId: item.departmentId || currentActiveUnit?.id || '',
          facultyId: item.facultyId || activeFacultyGroup?.facultyId || '',
          sourceUrl: item.sourceUrl
        });
      });
    }

    // Filter by department if specific department selected
    let filtered = feed;
    if (activeDepartment) {
      filtered = filtered.filter(item => {
        if (!item.departmentId) return true;
        return item.departmentId === activeDepartment.id ||
               item.departmentName.toLowerCase().includes(activeDepartment.name.toLowerCase());
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
  }, [departmentAnnouncements, departmentNews, deptFeedType, currentActiveUnit, activeDepartment, activeFacultyGroup, searchQuery]);

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
            {/* Pinned Unit Sleek & Minimalist Ribbon (Faculty or Department) */}
            {pinnedUnitInfo ? (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 dark:border-amber-500/20 rounded-2xl px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                    <Pin className="w-4 h-4 fill-amber-500 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        {pinnedUnitInfo.type === 'faculty' ? 'Sabitlenen Fakültem / Birimim' : 'Sabitlenen Bölümüm'}
                      </span>
                      {pinnedUnitInfo.type === 'department' && (
                        <span className="text-[11px] text-stone-400 dark:text-white/40 hidden sm:inline truncate">
                          ({pinnedUnitInfo.facultyName})
                        </span>
                      )}
                    </div>
                    <p className="font-display font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate mt-0.5">
                      {pinnedUnitInfo.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Segmented quick tab switch */}
                  <div className="flex items-center p-0.5 bg-white/90 dark:bg-black/20 rounded-xl border border-stone-200/60 dark:border-white/10 text-xs font-semibold shadow-xs">
                    <button
                      onClick={() => setPinnedQuickTab('announcements')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px]",
                        pinnedQuickTab === 'announcements'
                          ? "bg-amber-500 text-white font-bold shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <Bell className="w-3 h-3" />
                      <span>Duyurular</span>
                      <span className="text-[10px] px-1 py-0.2 rounded-full bg-black/15 font-mono">{pinnedAnnouncements.length}</span>
                    </button>
                    <button
                      onClick={() => setPinnedQuickTab('news')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[11px]",
                        pinnedQuickTab === 'news'
                          ? "bg-amber-500 text-white font-bold shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <Newspaper className="w-3 h-3" />
                      <span>Haberler</span>
                      <span className="text-[10px] px-1 py-0.2 rounded-full bg-black/15 font-mono">{pinnedNews.length}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedFacultyId(pinnedUnitInfo.facultyId);
                      setSelectedDepartmentId(pinnedUnitInfo.type === 'department' ? pinnedUnitInfo.id : 'all');
                      handleTabChange('department');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>Masada Aç</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleTogglePinUnit(pinnedUnitInfo.id)}
                    title="Sabitlemeyi Kaldır"
                    className="p-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-stone-400 hover:text-rose-600 transition-colors border border-stone-200/60 dark:border-white/10 cursor-pointer"
                  >
                    <PinOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Non-intrusive banner inviting user to pin faculty or department */
              <div className="bg-[#fcfbf9] dark:bg-[#1f3741] border border-emerald-500/20 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                      Fakülte veya Bölümünüzün Akışını Sabitleyin
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-white/60">
                      Birim ya da bölümünüzü 1 kez sabitleyerek güncel duyuru ve haberlere tek tıkla ulaşın.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('department')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#264653] dark:bg-emerald-600 text-white text-xs font-bold hover:bg-[#1a343f] dark:hover:bg-emerald-700 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Birim / Bölüm Sabitle</span>
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
          <div className="space-y-4">
            {/* Compact Control Card: Search, Category Filter, and Dual Cascading Selectors */}
            <div className="p-4 bg-white dark:bg-[#1a3038] border border-stone-200 dark:border-white/10 rounded-2xl shadow-xs space-y-3">
              {/* Category Switcher Mini-Chips */}
              <HorizontalScrollWrapper>
                <div className="flex items-center gap-1.5 pb-0.5">
                  {[
                    { key: 'all' as const, label: 'Tümü' },
                    { key: 'fakulte' as const, label: 'Fakülteler' },
                    { key: 'enstitu' as const, label: 'Enstitü' },
                    { key: 'yuksekokul' as const, label: 'Yüksekokul' },
                    { key: 'myo' as const, label: 'Meslek YO' },
                    { key: 'konservatuvar' as const, label: 'Konservatuvar' },
                    { key: 'daire' as const, label: 'Daire Bşk.' },
                    { key: 'koordinatorluk' as const, label: 'Koordinatörlük' },
                  ].map((chip) => {
                    const isSelected = selectedUnitCategory === chip.key;
                    return (
                      <button
                        key={chip.key}
                        onClick={() => setSelectedUnitCategory(chip.key)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer',
                          isSelected
                            ? 'bg-[#264653] dark:bg-amber-600 text-white border-transparent shadow-xs'
                            : 'bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-stone-300 border-stone-200/80 dark:border-white/5 hover:bg-stone-100'
                        )}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </HorizontalScrollWrapper>

              {/* Spotlight Search + Faculty & Department Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                {/* Spotlight Search (4 cols) */}
                <div className="md:col-span-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Bölüm ara... (örn: Bilgisayar, Aşçılık)"
                    value={spotlightQuery}
                    onChange={(e) => setSpotlightQuery(e.target.value)}
                    className="w-full pl-9 pr-7 py-2 bg-stone-50 dark:bg-black/20 border border-stone-200 dark:border-white/10 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                  {spotlightQuery && (
                    <button
                      onClick={() => setSpotlightQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Spotlight Dropdown */}
                  {spotlightResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white dark:bg-[#1a3038] border border-stone-200 dark:border-white/15 rounded-xl shadow-xl overflow-hidden divide-y divide-stone-100 dark:divide-white/5">
                      {spotlightResults.map((item) => (
                        <div
                          key={item.dept.id}
                          onClick={() => handleSelectFromSpotlight(item)}
                          className="px-3 py-2 hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-stone-900 dark:text-white truncate">
                              {item.dept.name}
                            </h4>
                            <p className="text-[10px] text-stone-400 dark:text-white/50 truncate">
                              {item.facultyName}
                            </p>
                          </div>
                          <span className="text-[11px] text-amber-600 font-semibold shrink-0">Seç →</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Faculty Select (4 cols) */}
                <div className="md:col-span-4 relative">
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => {
                      const newFacId = e.target.value;
                      setSelectedFacultyId(newFacId);
                      setSelectedDepartmentId('all'); // Do not force select a sub-department
                    }}
                    className="w-full pl-3 pr-8 py-2 bg-stone-50 dark:bg-black/20 border border-stone-200 dark:border-white/10 rounded-xl text-stone-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer appearance-none truncate"
                  >
                    {filteredAcademicUnits.map((g) => (
                      <option key={g.facultyId} value={g.facultyId}>
                        {g.facultyName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                </div>

                {/* Department Select (4 cols) - Optional! */}
                <div className="md:col-span-4 relative">
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-stone-50 dark:bg-black/20 border border-stone-200 dark:border-white/10 rounded-xl text-stone-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer appearance-none truncate"
                  >
                    <option value="all">
                      🏛️ {activeFacultyGroup.shortName || activeFacultyGroup.facultyName} Genel (Bölüm Seçmeden)
                    </option>
                    {activeFacultyGroup?.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Compact Active Unit Showcase & Control Bar */}
            {currentActiveUnit && (
              <div className="bg-gradient-to-r from-amber-500/10 via-stone-100/40 dark:via-white/5 to-transparent border border-amber-500/20 dark:border-white/10 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.2 rounded-md border",
                      getUnitCategoryMeta(activeFacultyGroup.category).badgeClass
                    )}>
                      {currentActiveUnit.type === 'faculty' ? 'Fakülte / Birim Genel' : activeFacultyGroup.facultyName}
                    </span>
                    {pinnedDeptId === currentActiveUnit.id && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Pin className="w-3 h-3 fill-amber-500" />
                        <span>Sabitlendi</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-display font-extrabold text-stone-900 dark:text-white truncate mt-0.5">
                    {currentActiveUnit.name}
                  </h3>
                  {currentActiveUnit.description && (
                    <p className="text-[11px] text-stone-500 dark:text-white/60 truncate max-w-xl">
                      {currentActiveUnit.description}
                    </p>
                  )}
                </div>

                {/* Actions & 3-Way Feed Filter */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {/* Pin Unit Button (Faculty or Department) */}
                  <button
                    onClick={() => handleTogglePinUnit(currentActiveUnit.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shadow-xs active:scale-95",
                      pinnedDeptId === currentActiveUnit.id
                        ? "bg-amber-500 text-white border-amber-600"
                        : "bg-white dark:bg-[#1a3038] text-stone-700 dark:text-white border-stone-200 dark:border-white/10 hover:border-amber-500/50"
                    )}
                  >
                    <Pin className={cn("w-3.5 h-3.5", pinnedDeptId === currentActiveUnit.id && "fill-white")} />
                    <span>{pinnedDeptId === currentActiveUnit.id ? 'Sabitlendi' : currentActiveUnit.type === 'faculty' ? 'Birimi Sabitle' : 'Bölümü Sabitle'}</span>
                  </button>

                  {/* Official Website */}
                  {currentActiveUnit.websiteUrl && (
                    <a
                      href={currentActiveUnit.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1a3038] hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-white text-xs font-medium transition-all border border-stone-200 dark:border-white/10 shadow-xs"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span>Web</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  {/* 3-Way Feed Toggle */}
                  <div className="flex items-center p-0.5 bg-white dark:bg-black/20 rounded-xl border border-stone-200/80 dark:border-white/10 text-xs font-semibold shadow-xs">
                    <button
                      onClick={() => setDeptFeedType('all')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px]",
                        deptFeedType === 'all'
                          ? "bg-[#264653] dark:bg-emerald-600 text-white font-bold shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <span>Tümü</span>
                      <span className="ml-1 text-[10px] opacity-80 font-mono">
                        {departmentAnnouncements.length + departmentNews.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setDeptFeedType('announcements')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px]",
                        deptFeedType === 'announcements'
                          ? "bg-amber-600 text-white font-bold shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <span>Duyurular</span>
                      <span className="ml-1 text-[10px] opacity-80 font-mono">
                        {departmentAnnouncements.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setDeptFeedType('news')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px]",
                        deptFeedType === 'news'
                          ? "bg-emerald-600 text-white font-bold shadow-xs"
                          : "text-stone-600 dark:text-white/60 hover:text-stone-900 dark:hover:text-white"
                      )}
                    >
                      <span>Haberler</span>
                      <span className="ml-1 text-[10px] opacity-80 font-mono">
                        {departmentNews.length}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Department Feed Stream Grid */}
            {deptLoading ? (
              <LoadingState message="Bölüm Akışı Yükleniyor..." subtitle="Duyuru ve haberler güncelleniyor" />
            ) : combinedDepartmentFeed.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 dark:bg-white/5 rounded-2xl border border-stone-200 dark:border-white/10">
                <Layers className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-60" />
                <p className="text-stone-600 dark:text-stone-300 font-semibold text-sm">Bu birim için henüz içerik bulunamadı.</p>
                <p className="text-stone-400 text-xs mt-0.5">Lütfen diğer sekmeleri kontrol edin veya resmi web sayfasını ziyaret edin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                      sourceName: item.departmentName || currentActiveUnit?.name
                    })}
                    className={cn(
                      "group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md",
                      item.type === 'announcement'
                        ? "bg-white dark:bg-[#1a3038] border-amber-500/25 hover:border-amber-500/60"
                        : "bg-white dark:bg-[#1a3038] border-emerald-500/25 hover:border-emerald-500/60"
                    )}
                  >
                    <div>
                      {item.imageUrl && (
                        <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-stone-100 dark:bg-black/20">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                          item.type === 'announcement'
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                        )}>
                          {item.type === 'announcement' ? '📢 Duyuru' : '📰 Haber'}
                        </span>
                        <span className="text-xs font-mono text-stone-400 dark:text-white/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                        {item.title}
                      </h4>

                      {item.content && (
                        <p className="text-xs text-stone-500 dark:text-white/60 mt-1.5 line-clamp-2">
                          {item.content}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-white/60">
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
