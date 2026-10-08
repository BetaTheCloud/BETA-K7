import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  getAnnouncements,
  getDepartmentAnnouncements,
  getCachedOrFallback,
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_DEPARTMENT_ANNOUNCEMENTS
} from '../mockData';
import { Announcement, DepartmentAnnouncementItem, StaffUnitCategory } from '../types';
import {
  ACADEMIC_UNITS_WITH_DEPARTMENTS,
  DepartmentGroup,
  getFacultyAnnouncementUrl,
  getDepartmentAnnouncementUrl
} from '../data/departmentNewsData';
import {
  Search,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  Megaphone,
  Building2,
  GraduationCap,
  BookOpen,
  School,
  Layers,
  Copy,
  Check,
  Globe,
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab: 'main' (Üniversite Genel Duyuruları) or 'department' (Fakülte & Bölüm Duyuruları)
  const [activeTab, setActiveTab] = useState<'main' | 'department'>(() => {
    return searchParams.get('tab') === 'department' ? 'department' : 'main';
  });

  // Main announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    return getCachedOrFallback<Announcement[]>('k7_cached_announcements', FALLBACK_ANNOUNCEMENTS);
  });

  // Department announcements state
  const [deptAnnouncements, setDeptAnnouncements] = useState<DepartmentAnnouncementItem[]>(() => {
    return getCachedOrFallback<DepartmentAnnouncementItem[]>('k7_cached_dept_ann_all', FALLBACK_DEPARTMENT_ANNOUNCEMENTS);
  });

  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<DetailModalItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Department navigation filters (Bölüm seçme zorunluluğu yok!)
  const [selectedUnitCategory, setSelectedUnitCategory] = useState<StaffUnitCategory | 'all'>('all');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('itbf'); // Default: İnsan ve Toplum Bilimleri
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all'); // Default: 'all' (bölüm seçilmedi, genel akış)

  // Sync state with URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'department') {
      setActiveTab('department');
    }
    const deptParam = searchParams.get('dept');
    if (deptParam) {
      setSelectedDepartmentId(deptParam);
      // Find faculty for this department
      for (const grp of ACADEMIC_UNITS_WITH_DEPARTMENTS) {
        if (grp.departments.some(d => d.id === deptParam || d.slug === deptParam)) {
          setSelectedFacultyId(grp.facultyId);
          break;
        }
      }
    }
    const facParam = searchParams.get('fac');
    if (facParam) {
      setSelectedFacultyId(facParam);
    }
  }, [searchParams]);

  // Load Main Announcements
  const loadMainAnnouncements = async (force = false) => {
    if (force) setLoading(true);
    const data = await getAnnouncements(force);
    if (data && data.length > 0) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  // Load Department Announcements
  const loadDeptAnnouncements = async (force = false) => {
    if (force) setDeptLoading(true);

    const currentGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === selectedFacultyId) || ACADEMIC_UNITS_WITH_DEPARTMENTS[0];
    const isAll = !selectedDepartmentId || selectedDepartmentId === 'all';
    const currentDept = isAll ? null : currentGroup?.departments.find(d => d.id === selectedDepartmentId);
    
    // If no department is selected, fetch the faculty's announcements URL
    const deptUrl = isAll 
      ? getFacultyAnnouncementUrl(currentGroup)
      : (currentDept ? getDepartmentAnnouncementUrl(currentDept) : getFacultyAnnouncementUrl(currentGroup));

    const data = await getDepartmentAnnouncements(deptUrl, isAll ? 'all' : selectedDepartmentId, selectedFacultyId, force);
    if (data && data.length > 0) {
      setDeptAnnouncements(data);
    }
    setDeptLoading(false);
  };

  useEffect(() => {
    loadMainAnnouncements();
  }, []);

  useEffect(() => {
    if (activeTab === 'department') {
      loadDeptAnnouncements(false);
    }
  }, [activeTab, selectedFacultyId, selectedDepartmentId]);

  const handleRefresh = async () => {
    if (activeTab === 'main') {
      await loadMainAnnouncements(true);
    } else {
      await loadDeptAnnouncements(true);
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

  // Dynamically extract and sort all available main categories: Ana Duyurular first, then by date
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
  }, [announcements]);

  // Filter announcements by category chip and search query
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
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
  }, [announcements, selectedFilter, searchQuery]);

  // Group and sort categories: Ana Duyurular first, then by newest announcement date
  const sortedGroupedCategories = useMemo(() => {
    const groups: Record<string, Announcement[]> = {};
    filteredAnnouncements.forEach((item) => {
      const cat = item.category?.trim() || 'Ana Duyurular';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));
    });

    const entries = Object.entries(groups) as [string, Announcement[]][];
    entries.sort((a, b) => {
      const isMainA = isMainAnnouncementCategory(a[0]);
      const isMainB = isMainAnnouncementCategory(b[0]);
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
  }, [filteredAnnouncements]);

  // Filter available academic units based on category
  const filteredAcademicUnits = useMemo(() => {
    if (selectedUnitCategory === 'all') return ACADEMIC_UNITS_WITH_DEPARTMENTS;
    return ACADEMIC_UNITS_WITH_DEPARTMENTS.filter(u => u.category === selectedUnitCategory);
  }, [selectedUnitCategory]);

  // Active faculty group & optional department object
  const activeFacultyGroup = useMemo(() => {
    return ACADEMIC_UNITS_WITH_DEPARTMENTS.find(u => u.facultyId === selectedFacultyId) || ACADEMIC_UNITS_WITH_DEPARTMENTS[0];
  }, [selectedFacultyId]);

  const isAllDepartments = !selectedDepartmentId || selectedDepartmentId === 'all';

  const activeDepartment = useMemo(() => {
    if (!activeFacultyGroup || isAllDepartments) return null;
    return activeFacultyGroup.departments.find(d => d.id === selectedDepartmentId) || null;
  }, [activeFacultyGroup, selectedDepartmentId, isAllDepartments]);

  // Filter department announcements items (handles optional department)
  const filteredDeptAnnouncements = useMemo(() => {
    return deptAnnouncements.filter((item) => {
      // If a specific faculty is selected and item has a facultyId, ensure it matches
      if (selectedFacultyId && item.facultyId && item.facultyId !== selectedFacultyId) {
        return false;
      }

      // If a specific department is chosen and not 'all'
      if (selectedDepartmentId && selectedDepartmentId !== 'all') {
        const matchesDept = (item.departmentId && item.departmentId === selectedDepartmentId) || 
                            (item.departmentName && activeDepartment?.name && item.departmentName.toLowerCase().includes(activeDepartment.name.toLowerCase())) ||
                            (item.sourceUrl && activeDepartment && item.sourceUrl.includes(activeDepartment.slug));
        if (!matchesDept && item.departmentId && item.departmentId !== selectedDepartmentId && item.departmentId !== 'general') {
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
  }, [deptAnnouncements, selectedFacultyId, selectedDepartmentId, activeDepartment, searchQuery]);

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
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>Kampüs ve Bölüm Duyuruları</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20">
                  Canlı Akış
                </span>
              </h2>
              <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 font-medium">
                Rektörlük ana duyuruları, fakülte ve bölümlerimizin (Örn: Türk Dili ve Edebiyatı vb.) sınav, ders ve idari ilanları.
              </p>
            </div>
          </div>

          {/* High-level View Switcher Tabs: Genel Duyurular vs Bölüm Duyuruları */}
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
              <Megaphone className={cn("w-4 h-4", activeTab === 'main' ? "text-amber-600 dark:text-amber-400" : "text-stone-400")} />
              <span>Genel Üniversite Duyuruları</span>
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
              <span>Fakülte & Bölüm Duyuruları</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] bg-amber-400/30 text-white font-black uppercase tracking-wider">
                Bölüm Web
              </span>
            </button>
          </div>
        </header>

        {/* ======================= TAB 1: MAIN UNIVERSITY ANNOUNCEMENTS ======================= */}
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

              {/* Category Filter Chips */}
              <div className="pt-1">
                <HorizontalScrollWrapper>
                  {sortedFilterChips.map((chip) => {
                    const isSelected = selectedFilter === chip.id;
                    const isMainChip = isMainAnnouncementCategory(chip.name);
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setSelectedFilter(chip.id)}
                        className={cn(
                          "shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                          isSelected
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/30 font-bold"
                            : isMainChip
                            ? "bg-amber-500/10 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 border-amber-500/30"
                            : "bg-[#fcfbf9] dark:bg-[#264653] text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border-stone-200 dark:border-white/10"
                        )}
                      >
                        {isMainChip && <Megaphone className="w-3 h-3 text-current" />}
                        <span>{chip.name}</span>
                      </button>
                    );
                  })}
                </HorizontalScrollWrapper>
              </div>
            </div>

            {/* Announcements List Grouped by Faculty / Unit */}
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6">
                <Building2 className="w-10 h-10 text-stone-400 mx-auto mb-3 opacity-60" />
                <h3 className="font-display font-bold text-stone-800 dark:text-white text-base">
                  Duyuru Bulunamadı
                </h3>
                <p className="text-stone-500 dark:text-white/60 text-xs mt-1">
                  Arama kriterlerinize uygun duyuru bulunmamaktadır.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilter('all');
                    }}
                    className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-bold underline cursor-pointer"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedGroupedCategories.map(([category, items]) => {
                  const isMainCat = isMainAnnouncementCategory(category);
                  const isExpanded = !collapsedCategories[category];

                  return (
                    <div
                      key={category}
                      className={cn(
                        "rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm",
                        isMainCat
                          ? "border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent dark:border-amber-500/30"
                          : "border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653]"
                      )}
                    >
                      {/* Category Accordion Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                              isMainCat
                                ? "bg-amber-600 text-white shadow-sm"
                                : "bg-stone-200 dark:bg-white/10 text-stone-600 dark:text-white/80"
                            )}
                          >
                            {isMainCat ? (
                              <Megaphone className="w-3.5 h-3.5" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="truncate">
                            <h3 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-2 truncate">
                              <span className="truncate">{category}</span>
                              {isMainCat && (
                                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                                  Resmi
                                </span>
                              )}
                            </h3>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-white/10 text-stone-600 dark:text-white/70 font-semibold shrink-0">
                            {items.length}
                          </span>
                        </div>
                        <ChevronDown
                          strokeWidth={2}
                          className={cn(
                            "w-4 h-4 text-stone-400 transition-transform duration-300 shrink-0",
                            isExpanded ? "rotate-180 text-amber-600 dark:text-amber-500" : "rotate-0"
                          )}
                        />
                      </button>

                      {/* Category Items */}
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
                              {items.map((annItem) => (
                                <div
                                  key={annItem.id}
                                  className="p-4 bg-white/70 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 rounded-xl hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                        {annItem.category || category}
                                      </span>
                                      {annItem.date && !annItem.date.includes('T') && (
                                        <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 dark:text-white/50 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {annItem.date}
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-snug mb-2">
                                      {annItem.title}
                                    </h4>

                                    {annItem.content && (
                                      <p className="text-xs text-stone-600 dark:text-white/70 line-clamp-3 leading-relaxed mb-3">
                                        {annItem.content}
                                      </p>
                                    )}
                                  </div>

                                  {annItem.url && (
                                    <button
                                      onClick={() =>
                                        setSelectedItem({
                                          url: annItem.url || '',
                                          title: annItem.title,
                                          date: annItem.date,
                                          category: annItem.category || category,
                                          content: annItem.content
                                        })
                                      }
                                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors pt-2 border-t border-stone-100 dark:border-white/10 mt-2 cursor-pointer"
                                    >
                                      <span>Duyuruyu Gör</span>
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

        {/* ======================= TAB 2: DEPARTMENT & UNIT ANNOUNCEMENTS ======================= */}
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
                      Bölüm Duyuruları Gezgini
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 dark:text-white/60">
                      Tüm fakülte, enstitü, MYO ve bölümlerin resmi duyurularını ve sınav takvimlerini inceleyin.
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 self-start sm:self-auto">
                  {ACADEMIC_UNITS_WITH_DEPARTMENTS.reduce((acc, u) => acc + u.departments.length, 0)} Aktif Bölüm Portalı
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
                            setSelectedDepartmentId('all'); // Bölüm seçme zorunluluğu yok
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

              {/* 2. Faculty / Main Unit Selector Dropdown */}
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
                        setSelectedDepartmentId('all'); // Bölüm seçme zorunluluğu yok, fakülte geneline geçer
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

                {/* 3. Department Selector (İsteğe Bağlı) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-stone-500 dark:text-white/60 block uppercase tracking-wider">
                      3. İlgili Bölüm / Program:
                    </label>
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      İsteğe Bağlı
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedDepartmentId}
                      onChange={(e) => {
                        setSelectedDepartmentId(e.target.value);
                      }}
                      className="w-full bg-white dark:bg-[#1f3844] border border-stone-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer shadow-sm"
                    >
                      <option value="all">
                        🌟 Fakülte/Birim Geneli (Tüm Bölümler - Bölüm Seçilmedi)
                      </option>
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
              {activeFacultyGroup && (
                <div className="pt-2 border-t border-stone-200/50 dark:border-white/5">
                  <div className="text-[10px] font-bold text-stone-400 dark:text-white/50 mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-500" />
                      <span>{activeFacultyGroup.shortName} Hızlı Seçim:</span>
                    </div>
                    {selectedDepartmentId !== 'all' && (
                      <button
                        onClick={() => setSelectedDepartmentId('all')}
                        className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                      >
                        Bölüm Filtresini Kaldır
                      </button>
                    )}
                  </div>
                  <HorizontalScrollWrapper>
                    {/* All / Faculty General Chip */}
                    <button
                      onClick={() => setSelectedDepartmentId('all')}
                      className={cn(
                        "shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer whitespace-nowrap",
                        selectedDepartmentId === 'all'
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/25 font-bold"
                          : "bg-white/60 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border-stone-200/60 dark:border-white/10"
                      )}
                    >
                      ✨ Fakülte Geneli (Tüm Bölümler)
                    </button>

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

            {/* Selected Faculty or Department Official Portal Banner & URL Link */}
            {activeFacultyGroup && (
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
                      {activeDepartment ? (
                        <span className="text-[10px] sm:text-xs font-semibold text-stone-600 dark:text-white/70 flex items-center gap-1 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/20">
                          <Building2 className="w-3 h-3 text-amber-600" />
                          {activeDepartment.name}
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">
                          🌟 Bölüm Seçilmedi (Fakülte/Birim Geneli)
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-extrabold text-lg sm:text-xl text-stone-900 dark:text-white">
                      {activeDepartment
                        ? `${activeDepartment.name} Duyuruları`
                        : `${activeFacultyGroup.facultyName} Genel ve Bölüm Duyuruları`}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-white/70 max-w-2xl leading-relaxed">
                      {activeDepartment?.description ||
                        `Bölüm seçimi yapılmadığı için ${activeFacultyGroup.facultyName} genel duyuruları ile bünyesindeki tüm bölümlerin güncel duyuru ve sınav ilanları birlikte listelenmektedir.`}
                    </p>
                  </div>

                  {/* Direct Link to Official Department/Faculty Announcements Website */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {activeDepartment ? (
                      <>
                        <button
                          onClick={() => setSelectedDepartmentId('all')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 cursor-pointer"
                        >
                          <span>Fakülte Geneline Dön</span>
                        </button>
                        <a
                          href={getDepartmentAnnouncementUrl(activeDepartment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 active:scale-95 cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Bölüm Duyuru Sayfası</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                        </a>
                      </>
                    ) : (
                      <a
                        href={getFacultyAnnouncementUrl(activeFacultyGroup)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 active:scale-95 cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Fakülte Duyuru Sayfası</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                      </a>
                    )}

                    {(() => {
                      const portalUrl = activeDepartment 
                        ? getDepartmentAnnouncementUrl(activeDepartment) 
                        : getFacultyAnnouncementUrl(activeFacultyGroup);
                      return (
                        <button
                          onClick={() => copyDepartmentLink(portalUrl)}
                          title="Duyuru sayfası bağlantısını kopyala"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-stone-100 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 cursor-pointer"
                        >
                          {copiedUrl === portalUrl ? (
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
                      );
                    })()}
                  </div>
                </div>

                {/* Subdomain address indicator */}
                <div className="mt-3 pt-2.5 border-t border-amber-500/15 flex items-center gap-2 text-[11px] text-stone-500 dark:text-white/60">
                  <span className="font-semibold text-amber-700 dark:text-amber-300">Kaynak Portalı:</span>
                  <code className="px-2 py-0.5 bg-white/80 dark:bg-black/20 rounded font-mono text-[10px] text-stone-700 dark:text-stone-300 border border-amber-500/20 select-all">
                    {activeDepartment ? getDepartmentAnnouncementUrl(activeDepartment) : getFacultyAnnouncementUrl(activeFacultyGroup)}
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
                placeholder={`${activeDepartment ? activeDepartment.name : activeFacultyGroup.shortName} duyurularında ara...`}
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

            {/* Department Announcements Feed */}
            {deptLoading ? (
              <LoadingState message="Bölüm Duyuruları Çekiliyor..." subtitle="Üniversite bölüm sunucusuna bağlanılıyor" />
            ) : filteredDeptAnnouncements.length === 0 ? (
              <div className="text-center py-12 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6">
                <Building2 className="w-10 h-10 text-stone-400 mx-auto mb-3 opacity-60" />
                <h3 className="font-display font-bold text-stone-800 dark:text-white text-base">
                  {activeDepartment ? `${activeDepartment.name} İçin Duyuru Bulunamadı` : `${activeFacultyGroup.facultyName} İçin Duyuru Bulunamadı`}
                </h3>
                <p className="text-stone-500 dark:text-white/60 text-xs mt-1 max-w-md mx-auto">
                  İlgili birimin resmi web sayfasını ziyaret edebilir veya farklı bir fakülte/bölüm seçebilirsiniz.
                </p>
                <a
                  href={activeDepartment ? getDepartmentAnnouncementUrl(activeDepartment) : getFacultyAnnouncementUrl(activeFacultyGroup)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
                >
                  <span>Resmi Web Sayfasını Aç ({activeDepartment ? activeDepartment.name : activeFacultyGroup.shortName})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDeptAnnouncements.map((item) => (
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
                        images: (item as any).images && (item as any).images.length > 0 ? (item as any).images : (item.imageUrl ? [item.imageUrl] : []),
                        date: item.date,
                        category: item.category || 'Bölüm Duyurusu',
                        departmentName: item.departmentName || activeDepartment?.name || activeFacultyGroup.shortName,
                        facultyName: item.facultyName || activeFacultyGroup.facultyName,
                        content: item.content
                      })
                    }
                    className="p-4 sm:p-5 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Optional Department Announcement Image */}
                      {item.imageUrl && (
                        <div className="w-full h-44 rounded-xl overflow-hidden mb-3 bg-stone-100 dark:bg-black/20 border border-stone-200/60 dark:border-white/10 relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Header tags: Department & Date */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          {item.departmentName || activeDepartment?.name || activeFacultyGroup.shortName}
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
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                        <span>Duyuruyu Gör</span>
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
        />
      </motion.div>
    </PullToRefresh>
  );
}
