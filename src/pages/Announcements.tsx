import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  getAnnouncements,
  getDepartmentAnnouncements,
  getCachedOrFallback,
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_DEPARTMENT_ANNOUNCEMENTS
} from '../mockData';
import { Announcement, DepartmentAnnouncementItem } from '../types';
import { ACADEMIC_UNITS_WITH_DEPARTMENTS } from '../data/departmentNewsData';
import {
  Search,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  Building2,
  Filter,
  X,
  Calendar,
  Pin,
  PinOff,
  GraduationCap,
  ChevronRight,
  Bookmark,
  Bell
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

  // Pinned Department state
  const [pinnedDeptId, setPinnedDeptId] = useState<string | null>(() => {
    return localStorage.getItem('k7_pinned_department') || null;
  });
  const [pinnedDeptAnnouncements, setPinnedDeptAnnouncements] = useState<DepartmentAnnouncementItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<DetailModalItem | null>(null);

  // All flat departments list
  const allFlatDepartments = useMemo(() => {
    const list: {
      dept: any;
      facultyId: string;
      facultyName: string;
    }[] = [];
    ACADEMIC_UNITS_WITH_DEPARTMENTS.forEach(g => {
      g.departments.forEach(d => {
        list.push({
          dept: d,
          facultyId: g.facultyId,
          facultyName: g.facultyName
        });
      });
    });
    return list;
  }, []);

  // Pinned Unit object (Supports Faculty or Department)
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
        newsUrl: facGroup.facultyNewsUrl,
        announcementUrl: facGroup.facultyNewsUrl.replace('/news-all', '/announcements-all'),
        websiteUrl: facGroup.facultyNewsUrl.split('/tr')[0],
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
        newsUrl: deptMatch.dept.newsUrl,
        announcementUrl: deptMatch.dept.announcementUrl || (deptMatch.dept.websiteUrl ? `${deptMatch.dept.websiteUrl}/tr/announcements-all` : undefined),
        websiteUrl: deptMatch.dept.websiteUrl,
      };
    }
    return null;
  }, [pinnedDeptId, allFlatDepartments]);

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

  // Fetch pinned unit announcements
  useEffect(() => {
    if (pinnedUnitInfo) {
      getDepartmentAnnouncements(pinnedUnitInfo.announcementUrl, pinnedUnitInfo.id, pinnedUnitInfo.facultyId, false).then(res => {
        if (res) setPinnedDeptAnnouncements(res);
      });
    }
  }, [pinnedDeptId, pinnedUnitInfo]);

  const handleRefresh = async () => {
    await load(true);
  };

  const handleTogglePin = (unitId: string) => {
    if (pinnedDeptId === unitId) {
      setPinnedDeptId(null);
      localStorage.removeItem('k7_pinned_department');
    } else {
      setPinnedDeptId(unitId);
      localStorage.setItem('k7_pinned_department', unitId);
    }
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
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>Üniversite Duyuruları</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20">
                  Canlı Akış
                </span>
              </h2>
              <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 font-medium">
                Rektörlük, fakülteler, enstitüler, meslek yüksekokulları ve idari birimlerden resmi duyurular.
              </p>
            </div>

            <button
              onClick={() => navigate('/news?tab=department')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#264653] hover:bg-[#1a343f] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Bölüm Masası'na Git</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Pinned Unit Smart Ribbon (Supports Faculty or Department) */}
        {pinnedUnitInfo ? (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 dark:border-amber-500/20 rounded-2xl p-3.5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Pin className="w-4 h-4 fill-amber-500 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300">
                      {pinnedUnitInfo.type === 'faculty' ? 'Sabitlenen Fakültem' : 'Sabitlenen Bölümüm'}
                    </span>
                    {pinnedUnitInfo.type === 'department' && (
                      <span className="text-[11px] text-stone-400 dark:text-white/40 hidden sm:inline truncate">
                        ({pinnedUnitInfo.facultyName})
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate mt-0.5">
                    {pinnedUnitInfo.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => navigate(`/news?tab=department&dept=${pinnedUnitInfo.id}`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Bölüm Masasında Aç</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleTogglePin(pinnedUnitInfo.id)}
                  title="Sabitlemeyi Kaldır"
                  className="p-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-stone-400 hover:text-rose-600 transition-colors border border-stone-200/60 dark:border-white/10 cursor-pointer"
                >
                  <PinOff className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Preview of Pinned Unit Announcements */}
            {pinnedDeptAnnouncements.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-amber-500/15">
                {pinnedDeptAnnouncements.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem({
                      title: item.title,
                      date: item.date,
                      category: 'Bölüm Duyurusu',
                      url: item.url,
                      content: item.content,
                      sourceName: pinnedUnitInfo.name
                    })}
                    className="bg-white dark:bg-[#1a3038] border border-stone-200/80 dark:border-white/10 rounded-xl p-2.5 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1 text-[10px] text-stone-400 dark:text-white/40 font-mono">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">Duyuru</span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className="font-bold text-xs text-stone-800 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-stone-50 dark:bg-[#1a3038] border border-stone-200 dark:border-white/10 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Bookmark className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900 dark:text-white">
                  Fakülte veya Bölümünüzün Duyurularını Sabitleyin
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-white/60">
                  Bölüm Masası'ndan birim veya bölümünüzü sabitleyerek duyurulara anında ulaşabilirsiniz.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/news?tab=department')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#264653] dark:bg-amber-600 text-white text-xs font-bold hover:opacity-90 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>Bölüm / Birim Sabitle</span>
            </button>
          </div>
        )}

        {/* Search & Category Filter Section */}
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

          {/* Horizontal Scrollable Faculty & Unit Filter Pills */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-stone-500 dark:text-white/60">
              <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Kategori & Birimler (Tarihe Göre Sıralı):</span>
            </div>
            <HorizontalScrollWrapper>
              {sortedFilterChips.map((filter) => {
                const isActive = selectedFilter === filter.id;
                const isMain = isMainAnnouncementCategory(filter.name);
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      "shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 border cursor-pointer whitespace-nowrap",
                      isActive
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/30 font-bold"
                        : isMain
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60 hover:bg-amber-100"
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

        {/* Categories / Announcements List */}
        {sortedGroupedCategories.length === 0 ? (
          <div className="text-center py-12 bg-[#fcfbf9] dark:bg-[#264653] rounded-2xl border border-[#e6e2d6] dark:border-white/10">
            <Building2 className="w-12 h-12 text-stone-300 dark:text-white/20 mx-auto mb-3" />
            <p className="text-stone-600 dark:text-white/70 font-medium">Aramanıza uygun duyuru bulunamadı.</p>
            <p className="text-stone-400 dark:text-white/40 text-xs mt-1">Filtreyi temizleyebilir veya başka bir kelime deneyebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedGroupedCategories.map(([category, items]) => {
              const isCollapsed = collapsedCategories[category];
              const isMain = isMainAnnouncementCategory(category);
              return (
                <div
                  key={category}
                  className={cn(
                    "border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm",
                    isMain
                      ? "bg-white dark:bg-[#264653] border-amber-500/40"
                      : "bg-[#fcfbf9] dark:bg-[#264653] border-[#e6e2d6] dark:border-white/10"
                  )}
                >
                  {/* Category Header */}
                  <div
                    onClick={() => toggleCategory(category)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none bg-stone-50/50 dark:bg-white/5 border-b border-stone-100 dark:border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        isMain ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                      <h3 className="font-display font-bold text-stone-900 dark:text-white text-sm sm:text-base">
                        {category}
                      </h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-white/80">
                        {items.length}
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-stone-400 transition-transform duration-300",
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    )} />
                  </div>

                  {/* Items Grid */}
                  {!isCollapsed && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem({
                            title: item.title,
                            date: item.date,
                            category: item.category || category,
                            url: item.url,
                            content: item.content,
                            sourceName: category
                          })}
                          className="group p-4 rounded-xl bg-white dark:bg-[#1a3038] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-500/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[11px] font-mono text-stone-400 dark:text-white/40 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {item.date}
                              </span>
                              {isMain && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                                  Ana Duyuru
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                              {item.title}
                            </h4>
                            {item.content && (
                              <p className="text-xs text-stone-500 dark:text-white/60 mt-2 line-clamp-2">
                                {item.content}
                              </p>
                            )}
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <span>Duyuruyu İncele</span>
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
