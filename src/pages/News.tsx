import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  getNews,
  getAnnouncements,
  getDepartmentNews,
  getDepartmentAnnouncements,
  getCachedOrFallback,
  FALLBACK_NEWS,
  FALLBACK_ANNOUNCEMENTS,
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
  Megaphone,
  Filter,
  X,
  Calendar,
  Building2,
  GraduationCap,
  BookOpen,
  School,
  Layers,
  Star,
  Sparkles,
  Pin,
  PinOff,
  ChevronRight,
  Clock,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Check
} from 'lucide-react';
import { cn, parseDateToTimestamp } from '../lib/utils';
import DetailModal, { DetailModalItem } from '../components/DetailModal';
import PullToRefresh from '../components/PullToRefresh';
import LoadingState from '../components/LoadingState';
import HorizontalScrollWrapper from '../components/HorizontalScrollWrapper';
import FeedCardThumbnail from '../components/FeedCardThumbnail';
import { getFavoriteItems, isFavoriteItem, toggleFavoriteItem, FeedFavoriteItem } from '../lib/feedFavorites';

export type NewsViewTab = 'all' | 'announcements' | 'news' | 'department' | 'favorites';

export default function News() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab from query or state
  const [activeTab, setActiveTab] = useState<NewsViewTab>(() => {
    const tab = searchParams.get('tab') || searchParams.get('view');
    if (tab === 'department' || tab === 'dept') return 'department';
    if (tab === 'announcements' || tab === 'announcement') return 'announcements';
    if (tab === 'news') return 'news';
    if (tab === 'favorites' || tab === 'fav') return 'favorites';
    return 'all';
  });

  // Pinned Department/Faculty state
  const [pinnedUnit, setPinnedUnit] = useState<{ id: string; name: string; facultyId: string; type: 'dept' | 'faculty' } | null>(() => {
    try {
      const raw = localStorage.getItem('k7_pinned_unit_v2');
      if (raw) return JSON.parse(raw);
      // Legacy backward compat
      const legacyId = localStorage.getItem('k7_pinned_department');
      if (legacyId) {
        return { id: legacyId, name: legacyId, facultyId: 'itbf', type: 'dept' };
      }
    } catch {}
    return null;
  });

  // Feeds state
  const [news, setNews] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_news_v6', FALLBACK_NEWS);
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_announcements_v6', FALLBACK_ANNOUNCEMENTS);
  });

  const [departmentNews, setDepartmentNews] = useState<DepartmentNewsItem[]>(() => {
    return getCachedOrFallback<DepartmentNewsItem[]>('k7_cached_dept_news_all', FALLBACK_DEPARTMENT_NEWS);
  });

  const [departmentAnnouncements, setDepartmentAnnouncements] = useState<DepartmentAnnouncementItem[]>(() => {
    return getCachedOrFallback<DepartmentAnnouncementItem[]>('k7_cached_dept_ann_all', FALLBACK_DEPARTMENT_ANNOUNCEMENTS);
  });

  // Favorites state
  const [favoritesList, setFavoritesList] = useState<FeedFavoriteItem[]>(() => getFavoriteItems());

  // UI & Loading States
  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'news' | 'announcements'>('all');
  const [selectedItem, setSelectedItem] = useState<DetailModalItem | null>(null);
  const [showPinSelector, setShowPinSelector] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Department & Faculty Navigation filters
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('itbf');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all'); // 'all' means Tüm Bölümler / Fakülte Geneli!
  const [deptFeedType, setDeptFeedType] = useState<'all' | 'announcements' | 'news'>('all');

  // Flat list of all units for fast lookup
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

  // Listen to favorites updates
  useEffect(() => {
    const handler = () => {
      setFavoritesList(getFavoriteItems());
    };
    window.addEventListener('k7_favorites_updated', handler);
    return () => window.removeEventListener('k7_favorites_updated', handler);
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab') || searchParams.get('view');
    if (tabParam === 'department') setActiveTab('department');
    else if (tabParam === 'announcements') setActiveTab('announcements');
    else if (tabParam === 'news') setActiveTab('news');
    else if (tabParam === 'favorites') setActiveTab('favorites');
    else if (tabParam === 'all') setActiveTab('all');

    const deptParam = searchParams.get('dept');
    const facParam = searchParams.get('faculty') || searchParams.get('fac');

    if (facParam) {
      setSelectedFacultyId(facParam);
    }
    if (deptParam) {
      setSelectedDepartmentId(deptParam);
      if (!facParam) {
        for (const grp of ACADEMIC_UNITS_WITH_DEPARTMENTS) {
          if (grp.departments.some(d => d.id === deptParam || d.slug === deptParam)) {
            setSelectedFacultyId(grp.facultyId);
            break;
          }
        }
      }
    }
  }, [searchParams]);

  // Load General University News & Announcements
  const loadGeneralFeeds = async (force = false) => {
    if (force) setLoading(true);
    try {
      const [newsData, annData] = await Promise.all([
        getNews(force),
        getAnnouncements(force)
      ]);
      if (newsData && newsData.length > 0) setNews(newsData);
      if (annData && annData.length > 0) setAnnouncements(annData);
    } catch (err) {
      console.warn('Feed load notice:', err);
    }
    setLoading(false);
  };

  // Load Department / Faculty Feed
  const loadDeptFeed = async (force = false) => {
    if (force) setDeptLoading(true);
    
    const currentGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === selectedFacultyId) || ACADEMIC_UNITS_WITH_DEPARTMENTS[0];
    const isAllDepartments = selectedDepartmentId === 'all' || !selectedDepartmentId;
    const currentDept = isAllDepartments ? null : currentGroup?.departments.find(d => d.id === selectedDepartmentId);

    const newsUrl = currentDept?.newsUrl || currentGroup?.facultyNewsUrl;
    const annUrl = currentDept?.announcementUrl || (currentDept?.websiteUrl ? `${currentDept.websiteUrl}/tr/announcements-all` : undefined) || (currentGroup?.facultyNewsUrl ? currentGroup.facultyNewsUrl.replace('/news-all', '/announcements-all') : undefined);

    const [newsData, annData] = await Promise.all([
      getDepartmentNews(newsUrl, isAllDepartments ? 'all' : selectedDepartmentId, selectedFacultyId, force),
      getDepartmentAnnouncements(annUrl, isAllDepartments ? 'all' : selectedDepartmentId, selectedFacultyId, force)
    ]);

    if (newsData && newsData.length > 0) {
      setDepartmentNews(newsData);
    }
    if (annData && annData.length > 0) {
      setDepartmentAnnouncements(annData);
    }
    setDeptLoading(false);
  };

  useEffect(() => {
    loadGeneralFeeds(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'department') {
      loadDeptFeed(false);
    }
  }, [activeTab, selectedFacultyId, selectedDepartmentId]);

  const handleRefresh = async () => {
    if (activeTab === 'department') {
      await loadDeptFeed(true);
    } else {
      await loadGeneralFeeds(true);
    }
  };

  const handleTabChange = (tab: NewsViewTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedCategory('all');
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('view', tab);
      return next;
    });
  };

  // Active Faculty & Department objects
  const activeFacultyGroup = useMemo(() => {
    return ACADEMIC_UNITS_WITH_DEPARTMENTS.find(u => u.facultyId === selectedFacultyId) || ACADEMIC_UNITS_WITH_DEPARTMENTS[0];
  }, [selectedFacultyId]);

  const activeDepartment = useMemo(() => {
    if (selectedDepartmentId === 'all') return null;
    return activeFacultyGroup?.departments.find(d => d.id === selectedDepartmentId) || null;
  }, [activeFacultyGroup, selectedDepartmentId]);

  // Toggle Pin for Faculty or Department
  const handleTogglePin = (id: string, name: string, facultyId: string, type: 'dept' | 'faculty') => {
    if (pinnedUnit?.id === id) {
      setPinnedUnit(null);
      localStorage.removeItem('k7_pinned_unit_v2');
      localStorage.removeItem('k7_pinned_department');
    } else {
      const newPin = { id, name, facultyId, type };
      setPinnedUnit(newPin);
      localStorage.setItem('k7_pinned_unit_v2', JSON.stringify(newPin));
      if (type === 'dept') {
        localStorage.setItem('k7_pinned_department', id);
      }
    }
  };

  // Unified General Stream (Combined News & Announcements)
  const unifiedGeneralFeed = useMemo(() => {
    const list: {
      id: string;
      type: 'news' | 'announcement';
      title: string;
      date: string;
      category: string;
      content?: string;
      url?: string;
      imageUrl?: string;
    }[] = [];

    // Add News
    news.forEach(n => {
      list.push({
        id: `news-${n.id}`,
        type: 'news',
        title: n.title,
        date: n.date,
        category: n.category || 'Üniversite Haberi',
        content: n.content,
        url: n.url,
        imageUrl: (n as any).imageUrl || (n as any).img
      });
    });

    // Add Announcements
    announcements.forEach(a => {
      list.push({
        id: `ann-${a.id}`,
        type: 'announcement',
        title: a.title,
        date: a.date,
        category: a.category || 'Resmi Duyuru',
        content: a.content,
        url: a.url,
        imageUrl: (a as any).imageUrl || (a as any).img
      });
    });

    // Sort freshest first
    return list.sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));
  }, [news, announcements]);

  // Scrollable Category Chips
  const categoryChips = useMemo(() => {
    const counts: Record<string, number> = {};
    unifiedGeneralFeed.forEach(item => {
      const cat = item.category || 'Genel';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const sortedCats = Object.keys(counts).sort((a, b) => {
      if (a.includes('Ana') || a.includes('Üniversite') || a.includes('Rektörlük')) return -1;
      if (b.includes('Ana') || b.includes('Üniversite') || b.includes('Rektörlük')) return 1;
      return counts[b] - counts[a];
    });

    return [{ id: 'all', name: 'Tümü' }, ...sortedCats.map(c => ({ id: c, name: c }))];
  }, [unifiedGeneralFeed]);

  // Filtered Items for Main View
  const filteredFeedItems = useMemo(() => {
    let source = unifiedGeneralFeed;

    if (activeTab === 'news') {
      source = source.filter(x => x.type === 'news');
    } else if (activeTab === 'announcements') {
      source = source.filter(x => x.type === 'announcement');
    } else if (activeTab === 'favorites') {
      return favoritesList.map(fav => ({
        id: fav.id,
        type: fav.type,
        title: fav.title,
        date: fav.date,
        category: fav.category || (fav.type === 'news' ? 'Haber' : 'Duyuru'),
        content: fav.content,
        url: fav.url,
        imageUrl: fav.imageUrl
      })).filter(item => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return item.title.toLowerCase().includes(q) || (item.content && item.content.toLowerCase().includes(q));
      });
    }

    if (typeFilter === 'news') {
      source = source.filter(x => x.type === 'news');
    } else if (typeFilter === 'announcements') {
      source = source.filter(x => x.type === 'announcement');
    }

    if (selectedCategory !== 'all') {
      source = source.filter(x => {
        const cat = (x.category || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        return cat === sel || cat.includes(sel) || sel.includes(cat);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      source = source.filter(x => {
        return x.title.toLowerCase().includes(q) ||
               (x.content && x.content.toLowerCase().includes(q)) ||
               (x.category && x.category.toLowerCase().includes(q));
      });
    }

    return source;
  }, [unifiedGeneralFeed, activeTab, typeFilter, selectedCategory, searchQuery, favoritesList]);

  // Department / Faculty Feed Items
  const departmentFeedItems = useMemo(() => {
    const list: {
      id: string;
      type: 'news' | 'announcement';
      title: string;
      date: string;
      category: string;
      content?: string;
      url: string;
      imageUrl?: string;
      departmentName: string;
      facultyName: string;
    }[] = [];

    if (deptFeedType === 'all' || deptFeedType === 'announcements') {
      departmentAnnouncements.forEach(a => {
        list.push({
          id: a.id,
          type: 'announcement',
          title: a.title,
          date: a.date,
          category: a.category || 'Bölüm Duyurusu',
          content: a.content,
          url: a.url,
          imageUrl: a.imageUrl,
          departmentName: a.departmentName || activeDepartment?.name || activeFacultyGroup?.facultyName || '',
          facultyName: a.facultyName || activeFacultyGroup?.facultyName || ''
        });
      });
    }

    if (deptFeedType === 'all' || deptFeedType === 'news') {
      departmentNews.forEach(n => {
        list.push({
          id: n.id,
          type: 'news',
          title: n.title,
          date: n.date,
          category: n.category || 'Bölüm Haberi',
          content: n.content,
          url: n.url,
          imageUrl: n.imageUrl,
          departmentName: n.departmentName || activeDepartment?.name || activeFacultyGroup?.facultyName || '',
          facultyName: n.facultyName || activeFacultyGroup?.facultyName || ''
        });
      });
    }

    let filtered = list;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(x => {
        return x.title.toLowerCase().includes(q) ||
               (x.content && x.content.toLowerCase().includes(q)) ||
               x.departmentName.toLowerCase().includes(q);
      });
    }

    return filtered.sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));
  }, [departmentAnnouncements, departmentNews, deptFeedType, activeDepartment, activeFacultyGroup, searchQuery]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-5xl mx-auto pb-16 px-1 sm:px-2"
      >
        {/* Header with Back Button */}
        <header className="border-b border-[#e6e2d6] dark:border-white/10 pb-4">
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold mb-3 transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
            <span>Ana Menüye Dön</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>Haberler & Duyurular</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/25">
                  Canlı
                </span>
              </h1>
              <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 font-medium">
                Üniversite genel haberleri, resmi duyurular ve tüm fakülte/bölüm akışları tek merkezde.
              </p>
            </div>

            {/* Quick Favorite Counter Pill */}
            {favoritesList.length > 0 && (
              <button
                onClick={() => handleTabChange('favorites')}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-xs font-bold transition-colors cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Favorilerim ({favoritesList.length})</span>
              </button>
            )}
          </div>
        </header>

        {/* Minimal Compact Pinned Unit Header */}
        <section className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-2.5 sm:p-3 shadow-sm">
          {pinnedUnit ? (
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </span>
                <div className="min-w-0">
                  <span className="text-[11px] text-stone-400 dark:text-white/50 block">Sabitlenen Birim:</span>
                  <span className="font-bold text-stone-900 dark:text-white truncate block">
                    {pinnedUnit.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedFacultyId(pinnedUnit.facultyId);
                    setSelectedDepartmentId(pinnedUnit.type === 'dept' ? pinnedUnit.id : 'all');
                    handleTabChange('department');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-stone-900 font-bold hover:bg-amber-400 transition-all text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span>Akışa Git</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleTogglePin(pinnedUnit.id, pinnedUnit.name, pinnedUnit.facultyId, pinnedUnit.type)}
                  className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-white/10 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Sabitlemeyi Kaldır"
                >
                  <PinOff className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-stone-600 dark:text-white/80">
                <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-medium text-xs sm:text-sm">Kendi fakülteni veya bölümünü sabitle, duyuruları anında takip et.</span>
              </div>
              <button
                onClick={() => {
                  handleTabChange('department');
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-white/10 hover:bg-amber-500 hover:text-stone-900 dark:hover:bg-amber-500 dark:hover:text-stone-900 font-bold text-stone-700 dark:text-white transition-all text-xs shrink-0 cursor-pointer"
              >
                Birim Seç & Sabitle
              </button>
            </div>
          )}
        </section>

        {/* Main View Tabs (Tümü / Duyurular / Haberler / Bölüm Masası / Favorilerim) */}
        <nav className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-white/10 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => handleTabChange('all')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer',
              activeTab === 'all'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-sm border border-stone-200/60 dark:border-white/10'
                : 'text-stone-500 dark:text-white/60 hover:text-stone-800 dark:hover:text-white'
            )}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Tümü (Haber & Duyuru)</span>
          </button>

          <button
            onClick={() => handleTabChange('announcements')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer',
              activeTab === 'announcements'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-sm border border-stone-200/60 dark:border-white/10'
                : 'text-stone-500 dark:text-white/60 hover:text-stone-800 dark:hover:text-white'
            )}
          >
            <Megaphone className="w-4 h-4 text-amber-500" />
            <span>Duyurular</span>
          </button>

          <button
            onClick={() => handleTabChange('news')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer',
              activeTab === 'news'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-sm border border-stone-200/60 dark:border-white/10'
                : 'text-stone-500 dark:text-white/60 hover:text-stone-800 dark:hover:text-white'
            )}
          >
            <Newspaper className="w-4 h-4 text-sky-500" />
            <span>Haberler</span>
          </button>

          <button
            onClick={() => handleTabChange('department')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer',
              activeTab === 'department'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-sm border border-stone-200/60 dark:border-white/10'
                : 'text-stone-500 dark:text-white/60 hover:text-stone-800 dark:hover:text-white'
            )}
          >
            <Building2 className="w-4 h-4 text-rose-500" />
            <span>Bölüm & Fakülte Masası</span>
          </button>

          <button
            onClick={() => handleTabChange('favorites')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ml-auto',
              activeTab === 'favorites'
                ? 'bg-white dark:bg-[#264653] text-stone-900 dark:text-white shadow-sm border border-stone-200/60 dark:border-white/10'
                : 'text-stone-500 dark:text-white/60 hover:text-stone-800 dark:hover:text-white'
            )}
          >
            <Star className={cn('w-4 h-4', favoritesList.length > 0 ? 'fill-amber-500 text-amber-500' : 'text-stone-400')} />
            <span>Favorilerim ({favoritesList.length})</span>
          </button>
        </nav>

        {/* Live Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-stone-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2.5 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl text-sm focus:border-amber-500 focus:ring-0 outline-none transition-colors text-stone-900 dark:text-white placeholder-stone-400 shadow-sm"
            placeholder={activeTab === 'department' ? 'Bölüm duyurusu, haber veya konu ara...' : 'Tüm duyuru ve haberlerde ara...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* DEPARTMENT / FACULTY HUB CONTROLS (Compact Minimal Toolbar) */}
        {activeTab === 'department' && (
          <section className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[#e6e2d6] dark:border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">Birim Seçimi & Filtreleme</h3>
              </div>

              {/* Pin Button for Currently Selected Unit */}
              <button
                onClick={() => {
                  const isDept = selectedDepartmentId !== 'all';
                  const pinId = isDept ? selectedDepartmentId : selectedFacultyId;
                  const pinName = isDept ? activeDepartment?.name || selectedDepartmentId : activeFacultyGroup?.facultyName || selectedFacultyId;
                  handleTogglePin(pinId, pinName, selectedFacultyId, isDept ? 'dept' : 'faculty');
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border',
                  pinnedUnit?.id === (selectedDepartmentId !== 'all' ? selectedDepartmentId : selectedFacultyId)
                    ? 'bg-amber-500 text-stone-900 border-amber-600 shadow-sm'
                    : 'bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-white border-stone-200 dark:border-white/10'
                )}
              >
                <Pin className={cn('w-3.5 h-3.5', pinnedUnit?.id === (selectedDepartmentId !== 'all' ? selectedDepartmentId : selectedFacultyId) ? 'fill-current' : '')} />
                <span>
                  {pinnedUnit?.id === (selectedDepartmentId !== 'all' ? selectedDepartmentId : selectedFacultyId)
                    ? 'Sabitlendi'
                    : selectedDepartmentId !== 'all'
                      ? 'Bölümü Sabitle'
                      : 'Fakülteyi Sabitle'}
                </span>
              </button>
            </div>

            {/* Selectors Grid (Faculty + Department [Optional]) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Faculty Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-500 dark:text-white/60">
                  Fakülte / Üst Birim
                </label>
                <div className="relative">
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => {
                      setSelectedFacultyId(e.target.value);
                      setSelectedDepartmentId('all'); // Reset to all departments automatically!
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer truncate"
                  >
                    {ACADEMIC_UNITS_WITH_DEPARTMENTS.map((g) => (
                      <option key={g.facultyId} value={g.facultyId} className="dark:bg-stone-900 text-stone-900 dark:text-white">
                        {g.facultyName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Department Dropdown (OPTIONAL: First option is 'Tüm Bölümler / Fakülte Geneli') */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-500 dark:text-white/60">
                  Bölüm (Opsiyonel)
                </label>
                <div className="relative">
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer truncate"
                  >
                    <option value="all" className="dark:bg-stone-900 text-stone-900 dark:text-white font-bold">
                      ⭐ Tüm Bölümler / Fakülte Geneli
                    </option>
                    {activeFacultyGroup?.departments.map((d) => (
                      <option key={d.id} value={d.id} className="dark:bg-stone-900 text-stone-900 dark:text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Department Feed Type Selector (Tümü / Duyurular / Haberler) */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto custom-scrollbar">
              <span className="text-[11px] font-semibold text-stone-400 shrink-0 mr-1">Akış Türü:</span>
              <button
                onClick={() => setDeptFeedType('all')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0',
                  deptFeedType === 'all'
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                    : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200'
                )}
              >
                Tümü ({departmentAnnouncements.length + departmentNews.length})
              </button>
              <button
                onClick={() => setDeptFeedType('announcements')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1',
                  deptFeedType === 'announcements'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200'
                )}
              >
                <Megaphone className="w-3 h-3 text-amber-500" />
                <span>Duyurular ({departmentAnnouncements.length})</span>
              </button>
              <button
                onClick={() => setDeptFeedType('news')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1',
                  deptFeedType === 'news'
                    ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                    : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200'
                )}
              >
                <Newspaper className="w-3 h-3 text-sky-500" />
                <span>Haberler ({departmentNews.length})</span>
              </button>
            </div>
          </section>
        )}

        {/* Scrollable Category Chips for General Views */}
        {activeTab !== 'department' && activeTab !== 'favorites' && (
          <div className="space-y-2.5">
            {/* Type selector toggle */}
            {activeTab === 'all' && (
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                <span className="text-[11px] font-semibold text-stone-400 shrink-0 mr-1">Filtre:</span>
                <button
                  onClick={() => setTypeFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0',
                    typeFilter === 'all'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200'
                  )}
                >
                  Tümü ({unifiedGeneralFeed.length})
                </button>
                <button
                  onClick={() => setTypeFilter('announcements')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1',
                    typeFilter === 'announcements'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200'
                  )}
                >
                  <Megaphone className="w-3 h-3 text-amber-500" />
                  <span>Yalnızca Duyurular ({announcements.length})</span>
                </button>
                <button
                  onClick={() => setTypeFilter('news')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1',
                    typeFilter === 'news'
                      ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                      : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200'
                  )}
                >
                  <Newspaper className="w-3 h-3 text-sky-500" />
                  <span>Yalnızca Haberler ({news.length})</span>
                </button>
              </div>
            )}

            {/* Horizontal Scrollable Categories */}
            <HorizontalScrollWrapper>
              <div className="flex items-center gap-2 py-1">
                {categoryChips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedCategory(chip.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer',
                      selectedCategory === chip.id
                        ? 'bg-amber-500 text-stone-900 border-amber-600 shadow-sm'
                        : 'bg-[#fcfbf9] dark:bg-[#264653] text-stone-600 dark:text-white/70 border-[#e6e2d6] dark:border-white/10 hover:border-amber-500/40'
                    )}
                  >
                    {chip.name}
                  </button>
                ))}
              </div>
            </HorizontalScrollWrapper>
          </div>
        )}

        {/* FEED CONTENT STREAM */}
        {loading || deptLoading ? (
          <div className="py-12">
            <LoadingState message="Akış ve duyurular canlı yükleniyor..." />
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeTab === 'department' ? (
              /* Department Stream */
              departmentFeedItems.length > 0 ? (
                departmentFeedItems.map((item) => {
                  const isFav = isFavoriteItem(item.id);
                  const isNews = item.type === 'news';

                  return (
                    <div
                      key={item.id}
                      className="w-full text-left bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-3.5 sm:p-4 hover:bg-[#f4f1ea] dark:hover:bg-white/10 transition-all focus:outline-none shadow-sm relative group"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Visual Thumbnail (Never empty or broken!) */}
                        <FeedCardThumbnail
                          imageUrl={item.imageUrl}
                          type={item.type}
                          category={item.category}
                          title={item.title}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Type Badge */}
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border',
                                  isNews
                                    ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25'
                                )}
                              >
                                {isNews ? <Newspaper className="w-3 h-3 text-sky-500" /> : <Megaphone className="w-3 h-3 text-amber-500" />}
                                <span>{isNews ? 'Bölüm Haberi' : 'Bölüm Duyurusu'}</span>
                              </span>

                              {/* Department/Faculty Tag */}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 border border-stone-200 dark:border-white/10 truncate max-w-[180px]">
                                <Building2 className="w-3 h-3 text-stone-400" />
                                <span className="truncate">{item.departmentName}</span>
                              </span>
                            </div>

                            {/* Date & Favorite Actions */}
                            <div className="flex items-center gap-2">
                              {item.date && (
                                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-white/50 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.date}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoriteItem({
                                    id: item.id,
                                    type: item.type,
                                    title: item.title,
                                    date: item.date,
                                    url: item.url,
                                    category: item.category,
                                    content: item.content,
                                    imageUrl: item.imageUrl,
                                    departmentName: item.departmentName,
                                    facultyName: item.facultyName
                                  });
                                }}
                                className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-white/20 text-stone-400 transition-colors cursor-pointer"
                                title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                              >
                                <Star className={cn('w-4 h-4', isFav ? 'fill-amber-500 text-amber-500' : 'text-stone-400')} />
                              </button>
                            </div>
                          </div>

                          <h4
                            onClick={() => setSelectedItem({
                              url: item.url,
                              title: item.title,
                              date: item.date,
                              category: item.category,
                              content: item.content,
                              imageUrl: item.imageUrl,
                              departmentName: item.departmentName,
                              facultyName: item.facultyName
                            })}
                            className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            {item.title}
                          </h4>

                          {item.content && (
                            <p className="text-xs text-stone-500 dark:text-white/60 line-clamp-2">
                              {item.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-8 text-center space-y-2">
                  <Building2 className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="font-bold text-stone-800 dark:text-white text-sm">Bu filtreye uygun içerik bulunamadı.</p>
                  <p className="text-xs text-stone-500 dark:text-white/60">Farklı bir birim seçebilir veya arama kelimenizi değiştirebilirsiniz.</p>
                </div>
              )
            ) : (
              /* General / Favorites Stream */
              filteredFeedItems.length > 0 ? (
                filteredFeedItems.map((item) => {
                  const isFav = isFavoriteItem(item.id);
                  const isNews = item.type === 'news';

                  return (
                    <div
                      key={item.id}
                      className="w-full text-left bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-3.5 sm:p-4 hover:bg-[#f4f1ea] dark:hover:bg-white/10 transition-all focus:outline-none shadow-sm relative group"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Visual Thumbnail (Never empty or broken!) */}
                        <FeedCardThumbnail
                          imageUrl={item.imageUrl}
                          type={item.type}
                          category={item.category}
                          title={item.title}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Distinct Type Badge (Haber vs Duyuru) */}
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border',
                                  isNews
                                    ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25'
                                )}
                              >
                                {isNews ? <Newspaper className="w-3 h-3 text-sky-500" /> : <Megaphone className="w-3 h-3 text-amber-500" />}
                                <span>{isNews ? 'Haber' : 'Duyuru'}</span>
                              </span>

                              {/* Category tag */}
                              {item.category && item.category !== 'Haber' && item.category !== 'Duyuru' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 border border-stone-200 dark:border-white/10 truncate max-w-[170px]">
                                  {item.category}
                                </span>
                              )}
                            </div>

                            {/* Date & Favorite Button */}
                            <div className="flex items-center gap-2">
                              {item.date && (
                                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-white/50 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.date}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoriteItem({
                                    id: item.id,
                                    type: item.type,
                                    title: item.title,
                                    date: item.date,
                                    url: item.url || '',
                                    category: item.category,
                                    content: item.content,
                                    imageUrl: item.imageUrl
                                  });
                                }}
                                className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-white/20 text-stone-400 transition-colors cursor-pointer"
                                title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                              >
                                <Star className={cn('w-4 h-4', isFav ? 'fill-amber-500 text-amber-500' : 'text-stone-400')} />
                              </button>
                            </div>
                          </div>

                          <h4
                            onClick={() => setSelectedItem({
                              url: item.url || '',
                              title: item.title,
                              date: item.date,
                              category: item.category,
                              content: item.content,
                              imageUrl: item.imageUrl
                            })}
                            className={cn(
                              'font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug line-clamp-2 transition-colors cursor-pointer',
                              isNews ? 'hover:text-sky-600 dark:hover:text-sky-400' : 'hover:text-amber-600 dark:hover:text-amber-400'
                            )}
                          >
                            {item.title}
                          </h4>

                          {item.content && (
                            <p className="text-xs text-stone-500 dark:text-white/60 line-clamp-2">
                              {item.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-8 text-center space-y-2">
                  <Megaphone className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="font-bold text-stone-800 dark:text-white text-sm">
                    {activeTab === 'favorites' ? 'Henüz kaydedilmiş favori duyuru veya haberiniz bulunmuyor.' : 'Aramanıza uygun duyuru veya haber bulunamadı.'}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-white/60">
                    {activeTab === 'favorites' ? 'İlgilendiğiniz duyuru veya haberlerdeki yıldız (⭐) butonuna basarak buraya ekleyebilirsiniz.' : 'Farklı bir arama kelimesi deneyebilir veya kategoriyi değiştirebilirsiniz.'}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Global Detail Modal */}
        <DetailModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      </motion.div>
    </PullToRefresh>
  );
}
