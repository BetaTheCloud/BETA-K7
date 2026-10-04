import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  Calendar,
  Bus,
  FileText,
  BookOpen,
  Trophy,
  Hotel,
  Wifi,
  MapPin,
  Search,
  Copy,
  Mail,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Clock,
  Compass,
  Check,
  Download,
  AlertCircle,
  GraduationCap,
  Landmark,
  Share2,
  X,
  FileCheck,
  School,
  Building2,
  Filter,
  Users,
  UserCheck,
  Award,
  Globe,
  Music,
  Info,
  Layers,
  Smartphone,
  TabletSmartphone,
  ArrowLeft,
  Maximize2
} from 'lucide-react';
import { FACULTIES_FILTER_LIST, AUTHENTIC_FORMS_DATA } from '../data/formsData';
import { STAFF_FACULTIES_LIST, ACADEMIC_STAFF_DATA } from '../data/staffData';
import {
  getPhonebook,
  getEvents,
  getForms,
  getStaff,
  getTransportInfo,
  getLibraryInfo,
  getSportsInfo,
  getHotelInfo,
  getItHelpInfo,
  getCampusMapLocations,
  FALLBACK_PHONEBOOK,
  FALLBACK_EVENTS,
  FALLBACK_FORMS,
  FALLBACK_STAFF,
  FALLBACK_TRANSPORT,
  FALLBACK_LIBRARY,
  FALLBACK_SPORTS,
  FALLBACK_HOTEL,
  FALLBACK_IT_HELP,
  FALLBACK_CAMPUS_MAP
} from '../mockData';
import { PhonebookEntry, AcademicStaffMember, StaffUnitCategory, CampusEvent, CampusForm, CampusBuilding } from '../types';
import LoadingState from '../components/LoadingState';
import DetailModal from '../components/DetailModal';
import HorizontalScrollWrapper from '../components/HorizontalScrollWrapper';
import toast from 'react-hot-toast';

type TabKey = 'all' | 'directory' | 'events' | 'transport' | 'forms' | 'library' | 'sports' | 'hotel' | 'map';

export default function CampusHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromLocation = (): TabKey => {
    const path = location.pathname.replace(/^\//, '');
    if (path === 'directory') return 'directory';
    if (path === 'events') return 'events';
    if (path === 'transport') return 'transport';
    if (path === 'forms') return 'forms';
    if (path === 'library') return 'library';
    if (path === 'sports') return 'sports';
    if (path === 'hotel') return 'hotel';
    if (path === 'campus-map') return 'map';
    return (searchParams.get('tab') as TabKey) || 'all';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getTabFromLocation());

  // Instant fallback-backed states so screen is never blank!
  const [phonebook, setPhonebook] = useState<PhonebookEntry[]>(FALLBACK_PHONEBOOK);
  const [events, setEvents] = useState<CampusEvent[]>(FALLBACK_EVENTS);
  const [forms, setForms] = useState<CampusForm[]>(AUTHENTIC_FORMS_DATA);
  const [staffList, setStaffList] = useState<AcademicStaffMember[]>(FALLBACK_STAFF);
  const [transport, setTransport] = useState<any>(FALLBACK_TRANSPORT);
  const [library, setLibrary] = useState<any>(FALLBACK_LIBRARY);
  const [sports, setSports] = useState<any>(FALLBACK_SPORTS);
  const [hotel, setHotel] = useState<any>(FALLBACK_HOTEL);
  const [itHelp, setItHelp] = useState<any>(FALLBACK_IT_HELP);
  const [mapLocations, setMapLocations] = useState<CampusBuilding[]>(FALLBACK_CAMPUS_MAP);

  // Search in Directory / Phonebook
  const [directorySearch, setDirectorySearch] = useState('');
  const [searchingDirectory, setSearchingDirectory] = useState(false);

  // Staff (Personel) filter state: Unit Category, Unit & Department Categorization
  const [selectedStaffCategory, setSelectedStaffCategory] = useState<StaffUnitCategory>('all');
  const [selectedStaffFaculty, setSelectedStaffFaculty] = useState<string>('');
  const [selectedStaffDepartment, setSelectedStaffDepartment] = useState<string>('Tümü');
  const [staffSearch, setStaffSearch] = useState<string>('');

  // Forms filter state: Pure Faculty Categorization
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [formSearch, setFormSearch] = useState<string>('');

  // Map campus filter
  const [selectedCampus, setSelectedCampus] = useState<'Tümü' | 'Merkez Kampüs' | 'Karataş Kampüsü' | 'Mercidabık Kampüsü'>('Tümü');
  const [mapSearch, setMapSearch] = useState<string>('');

  // Selected staff photo for enlarged modal preview
  const [selectedStaffPhoto, setSelectedStaffPhoto] = useState<AcademicStaffMember | null>(null);

  // Detail Modal for events
  const [selectedDetail, setSelectedDetail] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    setActiveTab(getTabFromLocation());
  }, [location.pathname, searchParams]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (location.pathname !== '/campus') {
      navigate(tab === 'all' ? '/campus' : `/campus?tab=${tab}`);
    } else {
      setSearchParams(tab === 'all' ? {} : { tab });
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadAllData() {
      try {
        const [pb, ev, fm, tr, lib, sp, ht, it, ml, st] = await Promise.all([
          getPhonebook(''),
          getEvents(),
          getForms(),
          getTransportInfo(),
          getLibraryInfo(),
          getSportsInfo(),
          getHotelInfo(),
          getItHelpInfo(),
          getCampusMapLocations(),
          getStaff()
        ]);

        if (!isMounted) return;
        if (pb && pb.length > 0) setPhonebook(pb);
        if (ev && ev.length > 0) setEvents(ev);
        const REQUIRED_FAC = ['fen', 'gsf', 'iibf', 'ilahiyat', 'iletisim', 'itbf', 'egitim', 'mmf', 'spor', 'ubf', 'sbf', 'ziraat'];
        if (fm && Array.isArray(fm) && REQUIRED_FAC.every(fac => fm.some(item => item && item.faculty === fac))) {
          setForms(fm);
        } else {
          setForms(AUTHENTIC_FORMS_DATA);
        }
        if (st && Array.isArray(st) && st.length >= ACADEMIC_STAFF_DATA.length) {
          setStaffList(st);
        } else {
          setStaffList(ACADEMIC_STAFF_DATA);
        }
        if (tr && tr.cityRoutes) setTransport(tr);
        if (lib && lib.name) setLibrary(lib);
        if (sp && sp.facilities) setSports(sp);
        if (ht && ht.name) setHotel(ht);
        if (it && it.eduroam) setItHelp(it);
        if (ml && ml.length > 0) setMapLocations(ml);
      } catch (err) {
        console.warn('Campus hub background sync notice:', err);
      }
    }
    loadAllData();
    return () => { isMounted = false; };
  }, []);

  const handlePhonebookSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSearchingDirectory(true);
      const res = await getPhonebook(directorySearch.trim());
      setPhonebook(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingDirectory(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopyalandı: ${text}`, {
      duration: 3000
    });
  };

  const tabs: { key: TabKey; label: string; icon: any; color: string }[] = [
    { key: 'all', label: 'Genel Bakış', icon: Compass, color: 'text-stone-700 dark:text-stone-300' },
    { key: 'directory', label: 'Personel', icon: Users, color: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'events', label: 'Etkinlikler', icon: Calendar, color: 'text-rose-600 dark:text-rose-400' },
    { key: 'transport', label: 'Ulaşım', icon: Bus, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'forms', label: 'Dilekçe & Form', icon: FileText, color: 'text-amber-600 dark:text-amber-400' },
    { key: 'library', label: 'Kütüphane', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400' },
    { key: 'sports', label: 'Halı Saha & Spor', icon: Trophy, color: 'text-green-600 dark:text-green-400' },
    { key: 'hotel', label: 'Uygulama Oteli', icon: Hotel, color: 'text-cyan-600 dark:text-cyan-400' },
    { key: 'map', label: 'Yerleşkeler', icon: MapPin, color: 'text-red-600 dark:text-red-400' },
  ];

  // Category meta helper
  const getUnitCategoryMeta = (cat?: StaffUnitCategory) => {
    switch (cat) {
      case 'fakulte':
        return { label: 'Fakülte', shortLabel: 'Fakülte', badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
      case 'enstitu':
        return { label: 'Enstitü', shortLabel: 'Enstitü', badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' };
      case 'yuksekokul':
        return { label: 'Yüksekokul', shortLabel: 'Yüksekokul', badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' };
      case 'myo':
        return { label: 'Meslek Yüksekokulu', shortLabel: 'MYO', badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' };
      case 'konservatuvar':
        return { label: 'Konservatuvar', shortLabel: 'Konservatuvar', badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' };
      case 'koordinatorluk':
        return { label: 'Koordinatörlük', shortLabel: 'Koordinatörlük', badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20' };
      default:
        return { label: 'Birim', shortLabel: 'Birim', badgeClass: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20' };
    }
  };

  const getUnitIcon = (cat?: StaffUnitCategory) => {
    switch (cat) {
      case 'fakulte': return GraduationCap;
      case 'enstitu': return BookOpen;
      case 'yuksekokul': return School;
      case 'myo': return Building2;
      case 'konservatuvar': return Music;
      case 'koordinatorluk': return Compass;
      default: return School;
    }
  };

  // Staff (Personel) Active Faculty / Unit Configuration
  const activeStaffFacultyConfig = React.useMemo(() => {
    if (!selectedStaffFaculty) return null;
    return STAFF_FACULTIES_LIST.find((f) => f.id === selectedStaffFaculty) || null;
  }, [selectedStaffFaculty]);

  // Visible units filtered by selected category (excluding 'all' placeholder)
  const visibleStaffUnits = React.useMemo(() => {
    const list = STAFF_FACULTIES_LIST.filter(fac => fac.id !== 'all');
    if (selectedStaffCategory === 'all') {
      return list;
    }
    return list.filter(fac => fac.category === selectedStaffCategory);
  }, [selectedStaffCategory]);

  // Grouped units for clean dropdown selection by category
  const groupedUnits = React.useMemo(() => {
    const list = STAFF_FACULTIES_LIST.filter(f => f.id !== 'all');
    return [
      { key: 'fakulte' as StaffUnitCategory, label: 'Fakülteler', icon: GraduationCap, items: list.filter(f => f.category === 'fakulte') },
      { key: 'enstitu' as StaffUnitCategory, label: 'Enstitü', icon: BookOpen, items: list.filter(f => f.category === 'enstitu') },
      { key: 'yuksekokul' as StaffUnitCategory, label: 'Yüksekokul', icon: School, items: list.filter(f => f.category === 'yuksekokul') },
      { key: 'myo' as StaffUnitCategory, label: 'Meslek Yüksekokulları (MYO)', icon: Building2, items: list.filter(f => f.category === 'myo') },
      { key: 'konservatuvar' as StaffUnitCategory, label: 'Konservatuvar', icon: Music, items: list.filter(f => f.category === 'konservatuvar') },
      { key: 'koordinatorluk' as StaffUnitCategory, label: 'Koordinatörlükler', icon: Compass, items: list.filter(f => f.category === 'koordinatorluk') },
    ];
  }, []);

  // Available departments for the selected staff faculty/unit
  const availableStaffDepartments = React.useMemo(() => {
    if (!selectedStaffFaculty) {
      return ['Tümü'];
    }
    if (activeStaffFacultyConfig && Array.isArray(activeStaffFacultyConfig.departments) && activeStaffFacultyConfig.departments.length > 0) {
      return activeStaffFacultyConfig.departments;
    }
    const depts = Array.from(
      new Set(staffList.filter(s => s.facultyId === selectedStaffFaculty).map(s => s.department).filter(Boolean))
    );
    return ['Tümü', ...depts];
  }, [selectedStaffFaculty, activeStaffFacultyConfig, staffList]);

  const handleStaffCategoryChange = (cat: StaffUnitCategory) => {
    setSelectedStaffCategory(cat);
    // If current selected faculty is not in the new category, reset faculty selection
    if (selectedStaffFaculty) {
      const current = STAFF_FACULTIES_LIST.find(f => f.id === selectedStaffFaculty);
      if (cat !== 'all' && current && current.category !== cat) {
        setSelectedStaffFaculty('');
        setSelectedStaffDepartment('Tümü');
      }
    }
  };

  const handleStaffFacultyChange = (facId: string) => {
    setSelectedStaffFaculty(facId);
    setSelectedStaffDepartment('Tümü');
    if (facId) {
      const target = STAFF_FACULTIES_LIST.find(f => f.id === facId);
      if (target && selectedStaffCategory !== 'all' && target.category !== selectedStaffCategory) {
        setSelectedStaffCategory(target.category);
      }
    }
  };

  // Filtered staff list: when no faculty is selected AND no search query is typed, do NOT preview staff!
  const filteredStaff = React.useMemo(() => {
    if (!selectedStaffFaculty && !staffSearch.trim()) {
      return [];
    }

    return staffList.filter((s) => {
      // 1. If faculty is selected, filter by that faculty
      if (selectedStaffFaculty && s.facultyId !== selectedStaffFaculty) return false;

      // 2. If faculty is not selected but search is active, respect category if not 'all'
      if (!selectedStaffFaculty && selectedStaffCategory !== 'all') {
        if (s.unitCategory !== selectedStaffCategory) return false;
      }

      // 3. Department filter
      if (selectedStaffFaculty && selectedStaffDepartment !== 'Tümü' && s.department !== selectedStaffDepartment) {
        return false;
      }

      // 4. Search query
      if (staffSearch.trim()) {
        const q = staffSearch.toLowerCase().trim();
        const matchName = (s.fullName || s.name || '').toLowerCase().includes(q);
        const matchRole = (s.role || '').toLowerCase().includes(q);
        const matchDep = (s.department || '').toLowerCase().includes(q);
        const matchFac = (s.facultyName || '').toLowerCase().includes(q);
        const matchMail = (s.email || '').toLowerCase().includes(q);
        const matchTitle = (s.title || '').toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchDep && !matchFac && !matchMail && !matchTitle) return false;
      }

      return true;
    });
  }, [staffList, selectedStaffCategory, selectedStaffFaculty, selectedStaffDepartment, staffSearch]);

  // Selected faculty object for forms
  const activeFacultyConfig = React.useMemo(() => {
    return FACULTIES_FILTER_LIST.find((f) => f.id === selectedFaculty);
  }, [selectedFaculty]);

  // Clean faculty-based filtering without confusing department pills
  const filteredForms = React.useMemo(() => {
    return forms.filter((f) => {
      // 1. Faculty filter
      if (selectedFaculty !== 'all' && f.faculty !== selectedFaculty) return false;

      // 2. Search filter
      if (formSearch.trim()) {
        const q = formSearch.toLowerCase().trim();
        const matchTitle = (f.title || '').toLowerCase().includes(q);
        const matchDesc = (f.description || '').toLowerCase().includes(q);
        const matchCat = (f.category || '').toLowerCase().includes(q);
        const matchExt = (f.fileType || '').toLowerCase().includes(q);
        const matchSource = (f.sourceName || '').toLowerCase().includes(q);
        const matchFaculty = (f.faculty || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchExt && !matchSource && !matchFaculty) return false;
      }

      return true;
    });
  }, [forms, selectedFaculty, formSearch]);

  const handleFacultyChange = (facId: string) => {
    setSelectedFaculty(facId);
  };

  const filteredLocations = useMemo(() => {
    return mapLocations.filter((l) => {
      if (selectedCampus !== 'Tümü' && l.campus !== selectedCampus) return false;
      if (mapSearch.trim()) {
        const q = mapSearch.toLowerCase().trim();
        const matchName = (l.name || '').toLowerCase().includes(q);
        const matchDesc = (l.description || '').toLowerCase().includes(q);
        const matchType = (l.type || '').toLowerCase().includes(q);
        const matchCampus = (l.campus || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchType && !matchCampus) return false;
      }
      return true;
    });
  }, [mapLocations, selectedCampus, mapSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-6xl mx-auto pb-10"
    >
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (activeTab !== 'all') {
              handleTabChange('all');
            } else {
              if (window.history.length > 1) navigate(-1);
              else navigate('/');
            }
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
          <span>{activeTab !== 'all' ? 'Tüm Kampüs Menüsüne Dön' : 'Geri Ana Sayfaya Dön'}</span>
        </button>

        {activeTab !== 'all' && (
          <button
            onClick={() => handleTabChange('all')}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
          >
            Tüm Kategoriler
          </button>
        )}
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1d3540] via-[#264653] to-[#2a9d8f] rounded-2xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-3 text-amber-200">
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>Dijital Kampüs Servisleri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            Kampüs Hizmetleri & Rehber
          </h1>
          <p className="text-white/80 text-sm sm:text-base mt-2 leading-relaxed">
            Hoca ve personel rehberi, etkinlikler, kampüs dolmuş saatleri, kütüphane, resmi dilekçeler ve yerleşke haritaları tek ekranda.
          </p>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <HorizontalScrollWrapper>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 font-semibold'
                  : 'bg-[#fcfbf9] dark:bg-[#264653] text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border border-[#e6e2d6] dark:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </HorizontalScrollWrapper>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {/* ================= ALL (OVERVIEW) ================= */}
        {activeTab === 'all' && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Quick Grid of all 9 Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Personel Rehberi */}
              <div
                onClick={() => handleTabChange('directory')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Personel Rehberi</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  12 Fakülte ve tüm bölümlerin güncel akademik kadrosu, unvanları ve doğrudan iletişim adresleri.
                </p>
              </div>

              {/* 2. Etkinlikler */}
              <div
                onClick={() => handleTabChange('events')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Etkinlik Takvimi</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  Konferanslar, sergiler, fuarlar, paneller ve salon bilgileri.
                </p>
              </div>

              {/* 3. Ulaşım */}
              <div
                onClick={() => handleTabChange('transport')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bus className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Ulaşım & Dolmuş</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  Kilis şehir içi dolmuş hatları (1, 2, 3 Nolu), Gaziantep seferleri ve taksi.
                </p>
              </div>

              {/* 4. Dilekçeler */}
              <div
                onClick={() => handleTabChange('forms')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Matbu Formlar</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  Mazeret sınavı, tek ders, kayıt dondurma, yatay geçiş dilekçeleri (DOCX/PDF).
                </p>
              </div>

              {/* 5. Kütüphane */}
              <div
                onClick={() => handleTabChange('library')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Merkez Kütüphane</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  Çalışma saatleri, vize/final 7/24 salonları, kitap arama ve ödünç kuralları.
                </p>
              </div>

              {/* 6. Spor & Halı Saha */}
              <div
                onClick={() => handleTabChange('sports')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Spor & Halı Saha</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  Sentetik halı saha rezervasyon sistemi, kapalı spor salonu ve fitness seansları.
                </p>
              </div>

              {/* 7. Uygulama Oteli */}
              <div
                onClick={() => handleTabChange('hotel')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Hotel className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Uygulama Oteli</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  Kampüs konukevi oda seçenekleri, indirimli tarifeler ve resepsiyon iletişimi.
                </p>
              </div>

              {/* 8. Yerleşkeler */}
              <div
                onClick={() => handleTabChange('map')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Kampüs Yerleşkeleri</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  Merkez, Karataş ve Mercidabık fakülteleri, amfileri ve Google Haritalar rotası.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 1. PERSONEL (FAKÜLTE & BÖLÜM BAZLI AKADEMİK PERSONEL) ================= */}
        {activeTab === 'directory' && (
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            {/* Top Bar: Search Input & Quick Status */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Üniversite Personel Rehberi
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-white/60 mt-0.5">
                    Fakülteler, Enstitü, Yüksekokul, Meslek Yüksekokulları, Konservatuvar ve Koordinatörlük personeli
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {selectedStaffFaculty || staffSearch.trim() ? (
                    <>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                        {filteredStaff.length} Personel Listeleniyor
                      </span>
                      <button
                        onClick={() => {
                          setStaffSearch('');
                          setSelectedStaffCategory('all');
                          setSelectedStaffFaculty('');
                          setSelectedStaffDepartment('Tümü');
                        }}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Filtreleri Temizle
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 font-medium border border-stone-200/80 dark:border-white/10">
                      {staffList.length} Personel &bull; {visibleStaffUnits.length} Birim
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Search Bar positioned at the very top */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Personel adı, akademik unvan (Prof, Doç, Dr), uzmanlık, bölüm veya e-posta ile ara..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-[#1a2e35] border border-stone-300 dark:border-white/10 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-stone-900 dark:text-white placeholder:text-stone-400 transition-all shadow-sm"
                />
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                {staffSearch && (
                  <button
                    onClick={() => setStaffSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sleek Filter Controls: Category Segmented Bar & Dual Dropdowns */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              {/* Category Segmented Tabs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Birim Türü
                  </span>
                  {selectedStaffCategory !== 'all' && (
                    <button
                      onClick={() => handleStaffCategoryChange('all')}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      Tüm Birimleri Göster
                    </button>
                  )}
                </div>

                <HorizontalScrollWrapper>
                  {[
                    { key: 'all' as StaffUnitCategory, label: 'Tüm Birimler', count: STAFF_FACULTIES_LIST.filter(f => f.id !== 'all').length },
                    { key: 'fakulte' as StaffUnitCategory, label: 'Fakülteler', count: STAFF_FACULTIES_LIST.filter(s => s.category === 'fakulte').length },
                    { key: 'enstitu' as StaffUnitCategory, label: 'Enstitü', count: STAFF_FACULTIES_LIST.filter(s => s.category === 'enstitu').length },
                    { key: 'yuksekokul' as StaffUnitCategory, label: 'Yüksekokul', count: STAFF_FACULTIES_LIST.filter(s => s.category === 'yuksekokul').length },
                    { key: 'myo' as StaffUnitCategory, label: 'Meslek Yüksekokulları', count: STAFF_FACULTIES_LIST.filter(s => s.category === 'myo').length },
                    { key: 'konservatuvar' as StaffUnitCategory, label: 'Konservatuvar', count: STAFF_FACULTIES_LIST.filter(s => s.category === 'konservatuvar').length },
                    { key: 'koordinatorluk' as StaffUnitCategory, label: 'Koordinatörlükler', count: STAFF_FACULTIES_LIST.filter(s => s.category === 'koordinatorluk').length },
                  ].map((cat) => {
                    const isCatActive = selectedStaffCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => handleStaffCategoryChange(cat.key)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                          isCatActive
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-1 ring-emerald-500/20'
                            : 'bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-700 dark:text-white/70 hover:bg-stone-50 dark:hover:bg-white/10'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isCatActive ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/60'
                        }`}>
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </HorizontalScrollWrapper>
              </div>

              {/* Dual Clean Selectors: 1) Fakülte / Birim  2) Bölüm / Anabilim Dalı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* 1. Selector: Fakülte / Birim Seçimi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Fakülte / Birim Seçimi
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStaffFaculty}
                      onChange={(e) => handleStaffFacultyChange(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white dark:bg-[#1a2e35] border border-stone-300 dark:border-white/10 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all pr-9 cursor-pointer"
                    >
                      <option value="" className="bg-white dark:bg-[#1a2e35] text-stone-600 dark:text-stone-300 font-medium">
                        -- Lütfen Fakülte veya Birim Seçiniz ({visibleStaffUnits.length} Birim) --
                      </option>
                      {groupedUnits.map((group) => {
                        const filteredItems = selectedStaffCategory === 'all'
                          ? group.items
                          : group.items.filter(i => i.category === selectedStaffCategory);
                        if (filteredItems.length === 0) return null;

                        return (
                          <optgroup key={group.label} label={group.label} className="bg-stone-100 dark:bg-[#15242b] text-stone-900 dark:text-stone-100 font-bold">
                            {filteredItems.map((u) => {
                              const uCount = staffList.filter(s => s.facultyId === u.id).length;
                              return (
                                <option key={u.id} value={u.id} className="bg-white dark:bg-[#1a2e35] text-stone-900 dark:text-stone-100 py-1.5 font-normal">
                                  {u.name} ({uCount} Personel)
                                </option>
                              );
                            })}
                          </optgroup>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 2. Selector: Bölüm / Program / Anabilim Dalı Seçimi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Bölüm / Anabilim Dalı
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStaffDepartment}
                      onChange={(e) => setSelectedStaffDepartment(e.target.value)}
                      disabled={!selectedStaffFaculty}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white dark:bg-[#1a2e35] border border-stone-300 dark:border-white/10 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all pr-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!selectedStaffFaculty ? (
                        <option value="" className="bg-white dark:bg-[#1a2e35] text-stone-500 font-medium">
                          -- Önce Bir Fakülte veya Birim Seçiniz --
                        </option>
                      ) : (
                        <>
                          <option value="Tümü" className="bg-white dark:bg-[#1a2e35] text-stone-900 dark:text-stone-100 font-bold">
                            Tüm Bölümler ({activeStaffFacultyConfig?.shortName}) - {staffList.filter(s => s.facultyId === selectedStaffFaculty).length} Personel
                          </option>
                          {availableStaffDepartments.filter(d => d !== 'Tümü').map((dept) => {
                            const count = staffList.filter(s => s.facultyId === selectedStaffFaculty && s.department === dept).length;
                            return (
                              <option key={dept} value={dept} className="bg-white dark:bg-[#1a2e35] text-stone-800 dark:text-stone-200 py-1.5 font-normal">
                                {dept} ({count} Personel)
                              </option>
                            );
                          })}
                        </>
                      )}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Quick Chips (When a unit is chosen and has departments) */}
              {selectedStaffFaculty && availableStaffDepartments.length > 1 && (
                <div className="space-y-1.5 pt-2 border-t border-stone-200/60 dark:border-white/10">
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-white/60">
                    Hızlı Bölüm Seçimi ({activeStaffFacultyConfig?.shortName}):
                  </span>
                  <HorizontalScrollWrapper>
                    {availableStaffDepartments.map((dept) => {
                      const isDeptActive = selectedStaffDepartment === dept;
                      const deptCount = dept === 'Tümü'
                        ? staffList.filter(s => s.facultyId === selectedStaffFaculty).length
                        : staffList.filter(s => s.facultyId === selectedStaffFaculty && s.department === dept).length;

                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => setSelectedStaffDepartment(dept)}
                          className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            isDeptActive
                              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500/30'
                              : 'bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/15'
                          }`}
                        >
                          <span>{dept}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isDeptActive ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-white/15 text-stone-600 dark:text-white/60'
                          }`}>
                            {deptCount}
                          </span>
                        </button>
                      );
                    })}
                  </HorizontalScrollWrapper>
                </div>
              )}

              {/* Active Unit Bar with Direct Link */}
              {activeStaffFacultyConfig && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-950 dark:text-emerald-200">{activeStaffFacultyConfig.name}</span>
                      {selectedStaffDepartment !== 'Tümü' && (
                        <span className="text-emerald-800 dark:text-emerald-400 ml-1.5">/ {selectedStaffDepartment}</span>
                      )}
                      <span className="text-stone-500 dark:text-white/60 ml-1.5">({filteredStaff.length} personel)</span>
                    </div>
                  </div>
                  {activeStaffFacultyConfig.sourceUrl && (
                    <a
                      href={activeStaffFacultyConfig.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm self-start sm:self-auto"
                    >
                      <span>Resmi Sayfa (academic-staffs)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Content Area: No Selection Made VS Search Results VS Faculty Staff Grid */}
            {!selectedStaffFaculty && !staffSearch.trim() ? (
              /* ================= INITIAL STATE: NO UNIT SELECTED (NO STAFF PREVIEW) ================= */
              <div className="space-y-4">
                <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <School className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                    Personel Listesini Görüntülemek İçin Birim Seçiniz
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-white/60 max-w-xl mx-auto leading-relaxed">
                    Yukarıdaki açılır menüden fakülte/birim seçimi yapabilir veya aşağıdaki birim kartlarından birine tıklayarak ilgili akademik ve idari personele ulaşabilirsiniz.
                  </p>
                </div>

                {/* Visual Unit Directory Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleStaffUnits.map((u) => {
                    const uStaff = staffList.filter((s) => s.facultyId === u.id);
                    const UnitIcon = getUnitIcon(u.category);
                    const catMeta = getUnitCategoryMeta(u.category);

                    return (
                      <div
                        key={u.id}
                        onClick={() => handleStaffFacultyChange(u.id)}
                        className="group cursor-pointer bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <UnitIcon className="w-5 h-5" />
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.badgeClass}`}>
                              {catMeta.shortLabel}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-display font-bold text-sm text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                              {u.name}
                            </h5>
                            <p className="text-[11px] text-stone-400 dark:text-white/50 mt-0.5">
                              {u.shortName}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-200/60 dark:border-white/5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-600 dark:text-white/70 text-[11px]">
                            {uStaff.length} Personel
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Bölümleri & Personeli Gör <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : filteredStaff.length === 0 ? (
              /* ================= NO RESULTS FOUND STATE ================= */
              <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                  Aramanızla Eşleşen Personel Bulunamadı
                </h4>
                <p className="text-xs text-stone-500 dark:text-white/60 max-w-md mx-auto">
                  "{staffSearch || (activeStaffFacultyConfig && activeStaffFacultyConfig.name)}" kriterleri için sonuç bulunamadı. Filtreleri sıfırlayabilirsiniz.
                </p>
                <button
                  onClick={() => {
                    setStaffSearch('');
                    setSelectedStaffCategory('all');
                    setSelectedStaffFaculty('');
                    setSelectedStaffDepartment('Tümü');
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {staffSearch.trim() && !selectedStaffFaculty && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span className="font-semibold text-emerald-950 dark:text-emerald-200">
                      "{staffSearch}" araması için {filteredStaff.length} personel listeleniyor
                    </span>
                    <button
                      onClick={() => setStaffSearch('')}
                      className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                    >
                      Aramayı Temizle
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredStaff.map((person) => {
                    const initials = (person.name || person.fullName || 'K7')
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')
                      .toUpperCase();

                    return (
                    <div
                      key={person.id}
                      className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-emerald-500/40 hover:shadow-md transition-all group"
                    >
                      <div className="space-y-3">
                        {/* Top Avatar & Name Info */}
                        <div className="flex items-start gap-3">
                          {/* Photo / Avatar with fallback & Click to View */}
                          <div
                            onClick={() => setSelectedStaffPhoto(person)}
                            className="relative shrink-0 cursor-pointer group/avatar rounded-xl overflow-hidden"
                            title="Fotoğrafı büyük boyutta görüntüle"
                          >
                            {person.image ? (
                              <img
                                src={person.image}
                                alt={person.fullName}
                                className="w-14 h-14 rounded-xl object-cover object-top border border-stone-200 dark:border-white/10 shadow-sm group-hover/avatar:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const sibling = e.currentTarget.nextElementSibling;
                                  if (sibling) (sibling as HTMLElement).style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-sm flex items-center justify-center shadow-sm ${
                                person.image ? 'hidden' : 'flex'
                              }`}
                            >
                              {initials || 'K7'}
                            </div>

                            {/* Hover Overlay with Zoom Icon */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white">
                              <Maximize2 className="w-4 h-4 drop-shadow" />
                            </div>
                          </div>

                          {/* Names & Titles */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                {person.title}
                              </span>
                              {person.role && person.role !== 'Öğretim Üyesi' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 truncate max-w-[140px]">
                                  {person.role}
                                </span>
                              )}
                            </div>
                            <h4 className="font-display font-bold text-sm text-stone-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-1">
                              {person.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 dark:text-white/60 mt-0.5 line-clamp-1">
                              {person.department}
                            </p>
                          </div>
                        </div>

                        {/* Unit & Category Badge */}
                        <div className="flex items-center justify-between gap-1.5 text-[11px] text-stone-600 dark:text-white/70 bg-stone-100/70 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-stone-200/50 dark:border-white/5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate font-medium">{person.facultyName}</span>
                          </div>
                          {person.unitCategory && (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 border ${getUnitCategoryMeta(person.unitCategory).badgeClass}`}>
                              {getUnitCategoryMeta(person.unitCategory).shortLabel}
                            </span>
                          )}
                        </div>

                        {/* Email Contact */}
                        {person.email ? (
                          <div className="flex items-center justify-between gap-1.5 text-xs bg-stone-50 dark:bg-white/5 p-2 rounded-xl border border-stone-200/50 dark:border-white/5">
                            <a
                              href={`mailto:${person.email}`}
                              className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate font-mono text-[11px]"
                            >
                              <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="truncate">{person.email}</span>
                            </a>
                            <button
                              onClick={() => copyToClipboard(person.email, 'E-posta')}
                              title="E-posta adresini kopyala"
                              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded shrink-0"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-stone-400 dark:text-white/40 italic px-1">
                            E-posta adresi belirtilmemiş
                          </div>
                        )}

                        {/* Academic Profiles & Social Badges */}
                        {(person.yokUrl || person.scholarUrl || person.orcidUrl || person.publonsUrl) && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {person.yokUrl && (
                              <a
                                href={person.yokUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="YÖK Akademik Profili"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                              >
                                <span>YÖK</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {person.scholarUrl && (
                              <a
                                href={person.scholarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Google Scholar Profili"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                              >
                                <span>Scholar</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {person.orcidUrl && (
                              <a
                                href={person.orcidUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="ORCID Profili"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                              >
                                <span>ORCID</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2.5 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between gap-2">
                        {person.email ? (
                          <a
                            href={`mailto:${person.email}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>E-posta Gönder</span>
                          </a>
                        ) : (
                          <div className="flex-1 text-center py-2 text-xs text-stone-400 font-medium">
                            İletişim Bilgisi Yok
                          </div>
                        )}

                        <a
                          href={person.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Resmi Fakülte Personel Sayfasında Gör"
                          className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-600 dark:text-white/80 transition-colors shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

        {/* ================= 2. ETKİNLİKLER ================= */}
        {activeTab === 'events' && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => ev.url && setSelectedDetail({ url: ev.url, title: ev.title })}
                  className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {ev.img && (
                    <div className="h-44 w-full bg-stone-200 dark:bg-stone-800 overflow-hidden relative">
                      <img
                        src={ev.img}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Hide broken image
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-semibold text-white tracking-wider uppercase">
                        {ev.category || 'Etkinlik'}
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ev.date && ev.date.trim() ? ev.date : 'Duyuru Tarihi'}</span>
                    </div>

                    <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {ev.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-white/60">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{ev.location && ev.location.trim() ? ev.location : 'Detaylı konum için bilgi alın'}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        Etkinlik Detayı <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ================= 3. ULAŞIM ================= */}
        {activeTab === 'transport' && transport && (
          <motion.div
            key="transport"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Şehir İçi Dolmuşlar */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white flex items-center gap-2">
                <Bus className="w-5 h-5 text-blue-500" />
                Kilis Kampüs Dolmuş Hatları
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {transport.cityRoutes?.map((route: any) => (
                  <div
                    key={route.id}
                    className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {route.badge}
                      </span>
                      <span className="text-xs font-semibold text-stone-500 dark:text-white/60">
                        {route.frequency}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                      {route.name}
                    </h4>

                    <div className="text-xs text-stone-500 dark:text-white/60 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Çalışma Saatleri: {route.hours}</span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-stone-200/60 dark:border-white/10">
                      <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                        Güzergah Durakları:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {route.route?.map((stop: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-white/80"
                          >
                            {stop}
                          </span>
                        ))}
                      </div>
                    </div>

                    {route.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-white/50 italic flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{route.notes}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Şehirlerarası & Havalimanı */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-500" />
                Gaziantep Seferleri & Havalimanı
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transport.intercityRoutes?.map((ic: any) => (
                  <div
                    key={ic.id}
                    className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-2"
                  >
                    <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                      {ic.title}
                    </h4>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Mesafe: {ic.distance}
                    </p>
                    {ic.frequency && (
                      <p className="text-xs text-stone-600 dark:text-white/70">
                        <strong>Sefer Sıklığı:</strong> {ic.frequency}
                      </p>
                    )}
                    {ic.departure && (
                      <p className="text-xs text-stone-600 dark:text-white/70">
                        <strong>Kalkış Noktası:</strong> {ic.departure}
                      </p>
                    )}
                    {ic.options && (
                      <p className="text-xs text-stone-600 dark:text-white/70 leading-relaxed">
                        {ic.options}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 4. MATBU FORMLAR (REKTÖRLÜK & ÖĞRENCİ İŞLERİ) ================= */}
        {activeTab === 'forms' && (
          <motion.div
            key="forms"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            {/* Official Source Selection Segmented Tabs */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-3 sm:p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    Resmi Matbu, Fakülte ve Öğrenci Dilekçeleri
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-white/60 mt-0.5">
                    K7AÜ Rektörlüğü, Öğrenci İşleri ve 12 Fakülteye ait onaylı güncel matbu form ve dilekçeler.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{filteredForms.length}</span>
                  <span>/ {forms.length} form listeleniyor</span>
                </div>
              </div>

              {/* Faculty Categories Selection */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <School className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Fakülte Seçimi (Kategoriler)
                  </span>
                  {selectedFaculty !== 'all' && (
                    <button
                      onClick={() => handleFacultyChange('all')}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                    >
                      Tüm Fakülteleri Göster
                    </button>
                  )}
                </div>

                {/* Faculty Buttons Grid / Scrollable */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {FACULTIES_FILTER_LIST.map((fac) => {
                    const isSelected = selectedFaculty === fac.id;
                    const count = fac.id === 'all' 
                      ? forms.length 
                      : forms.filter((f) => f.faculty === fac.id).length;

                    return (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => handleFacultyChange(fac.id)}
                        className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/30'
                            : 'bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-800 dark:text-white/80 hover:border-amber-500/50 hover:bg-stone-50 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="text-xs font-bold truncate">
                            {fac.shortName}
                          </div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-stone-400 dark:text-white/40'}`}>
                            {fac.id === 'all' ? 'Tüm Üniversite' : fac.name}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Faculty Details & Direct Portal Link */}
              {activeFacultyConfig && activeFacultyConfig.id !== 'all' && (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <School className="w-4 h-4" />
                      <span>{activeFacultyConfig.name}</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-white/60 mt-0.5">
                      Bu fakülte için sisteme tanımlı {filteredForms.length} resmi matbu dilekçe ve form listelenmektedir.
                    </p>
                  </div>
                  {activeFacultyConfig.sourceUrl && (
                    <a
                      href={activeFacultyConfig.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0 self-start sm:self-auto"
                    >
                      <span>Fakülte Sayfasına Git</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Official Source Portals Banner (Without TDE link) */}
              <div className="bg-stone-100/70 dark:bg-white/5 rounded-xl p-3 text-[11px] text-stone-600 dark:text-white/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-stone-200/60 dark:border-white/5">
                <span className="flex items-center gap-1.5 font-medium shrink-0">
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
                  <span>Resmi Kaynak Portalları:</span>
                </span>
                <div className="flex items-center flex-wrap gap-2.5">
                  {activeFacultyConfig && activeFacultyConfig.sourceUrl && (
                    <a
                      href={activeFacultyConfig.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 dark:text-amber-300 font-semibold hover:underline flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                    >
                      <span>{activeFacultyConfig.shortName} Portalı</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <a
                    href="https://ogrenciisleri.kilis.edu.tr/tr/department-forms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded"
                  >
                    <span>Öğrenci İşleri Portalı</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded"
                  >
                    <span>Rektörlük Matbu Portalı</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Search Bar - Clean Faculty-Focused Form Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Dilekçe adı, konu veya dosya türü ara (örn. Ek Sınav, intibak, kayıt dondurma, mazeret, docx, pdf)..."
                value={formSearch}
                onChange={(e) => setFormSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl text-sm focus:border-amber-500 outline-none text-stone-900 dark:text-white"
              />
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              {formSearch && (
                <button
                  onClick={() => setFormSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Forms Grid */}
            {filteredForms.length === 0 ? (
              <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                  Aramanızla Eşleşen Dilekçe / Form Bulunamadı
                </h4>
                <p className="text-xs text-stone-500 dark:text-white/60 max-w-md mx-auto">
                  "{formSearch || (activeFacultyConfig && activeFacultyConfig.name)}" kriterleri için kayıt bulunamadı. Filtreleri sıfırlayarak tüm belgelere göz atabilirsiniz.
                </p>
                <button
                  onClick={() => {
                    setFormSearch('');
                    setSelectedFaculty('all');
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredForms.map((form) => {
                  const extUpper = (form.fileType || 'DOC').toUpperCase();
                  const isWord = extUpper.includes('DOC');
                  const isExcel = extUpper.includes('XLS') || extUpper.includes('XLT');
                  const isPdf = extUpper.includes('PDF');
                  const facultyObj = FACULTIES_FILTER_LIST.find((f) => f.id === form.faculty);
                  const facultyName = facultyObj?.shortName || form.sourceName || 'Fakülte';

                  return (
                    <div
                      key={form.id}
                      className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-4 flex flex-col justify-between gap-3 hover:border-amber-500/40 hover:shadow-md transition-all group"
                    >
                      <div className="space-y-2">
                        {/* Badges Bar */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Faculty Badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                              <School className="w-3 h-3" />
                              {facultyName}
                            </span>

                            {/* Category Badge if available */}
                            {form.category && form.category !== 'Genel' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70">
                                {form.category}
                              </span>
                            )}
                          </div>

                          {/* File Extension Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isWord
                              ? 'bg-blue-600 text-white'
                              : isExcel
                              ? 'bg-emerald-600 text-white'
                              : isPdf
                              ? 'bg-rose-600 text-white'
                              : 'bg-stone-600 text-white'
                          }`}>
                            .{extUpper}
                          </span>
                        </div>

                        {/* Title - Cleaned Turkish Typography */}
                        <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                          {form.title}
                        </h4>

                        {/* Description */}
                        {form.description && (
                          <p className="text-xs text-stone-500 dark:text-white/60 leading-relaxed line-clamp-2">
                            {form.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2.5 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between gap-2">
                        <a
                          href={form.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm"
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          <span>Belgeyi İndir ({extUpper})</span>
                        </a>

                        <button
                          onClick={() => copyToClipboard(form.downloadUrl, 'Dilekçe indirme bağlantısı')}
                          title="İndirme bağlantısını kopyala"
                          className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-600 dark:text-white/80 transition-colors shrink-0"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <a
                          href={form.sourceUrl || facultyObj?.sourceUrl || 'https://kilis.edu.tr'}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Resmi fakülte web sayfasında görüntüle"
                          className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-600 dark:text-white/80 transition-colors shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ================= 5. KÜTÜPHANE ================= */}
        {activeTab === 'library' && library && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Status & Hours */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-display font-bold text-xl text-stone-900 dark:text-white">
                      {library.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-white/60 mt-1 flex-wrap">
                    <span>Danışma: <strong>{library.phone || '0348 814 26 66'}</strong></span>
                    <span>•</span>
                    <span>Ödünç-İade Bankosu: <strong>Dahili 1338</strong></span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold self-start sm:self-auto border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Şu Anda Hizmet Veriyor</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-200/60 dark:border-white/10">
                <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-3.5 border border-stone-100 dark:border-white/5">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Hafta İçi</span>
                  <span className="font-display font-bold text-base text-stone-800 dark:text-white">{library.hours?.weekday || '08:00 – 22:00'}</span>
                </div>
                <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-3.5 border border-stone-100 dark:border-white/5">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Hafta Sonu</span>
                  <span className="font-display font-bold text-base text-stone-800 dark:text-white">{library.hours?.weekend || '09:00 – 18:00'}</span>
                </div>
                <div className="bg-amber-500/10 rounded-xl p-3.5 border border-amber-500/20">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">Vize / Final Dönemleri</span>
                  <span className="font-display font-bold text-sm text-amber-800 dark:text-amber-200">{library.hours?.exams || '7/24 Kesintisiz Açık (İkramlı)'}</span>
                </div>
              </div>

              {/* Online Catalog & Resource Portals */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href={library.catalogUrl || 'https://yordam.kilis.edu.tr/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Katalogda Kitap Ara (Yordam)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  href={library.accountUrl || 'https://yordam.kilis.edu.tr/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-800 dark:text-white rounded-xl text-xs font-semibold transition-colors border border-stone-200 dark:border-white/10"
                >
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Kütüphane Hesabım / Uzatma</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  href={library.vetisUrl || 'https://yordam.kilis.edu.tr/vetisbt/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-800 dark:text-white rounded-xl text-xs font-semibold transition-colors border border-stone-200 dark:border-white/10"
                >
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Kampüs Dışı Erişim (VETİS)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>

            {/* Official Step-by-Step Borrowing, Return & Extension Guidelines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Kitap Ödünç, İade & Uzatma Yönergeleri
                </h4>
                <a
                  href={library.officialGuideUrl || 'https://kutuphane.kilis.edu.tr/tr/page/4172'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Resmi Yönerge Sayfası</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Ödünç Alma */}
                <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                    <h5 className="font-display font-bold text-sm text-stone-900 dark:text-white">
                      1. Kitap Ödünç Alma İşlemi
                    </h5>
                  </div>
                  <ul className="text-xs text-stone-600 dark:text-white/80 space-y-1.5 list-disc list-inside leading-relaxed">
                    <li>Kütüphane binasının <strong>giriş katında yer alan Ödünç-İade Bankosu</strong>'ndan veya,</li>
                    <li>Giriş katındaki <strong>K-Matik (Self-Check Otomasyon Cihazı)</strong> üzerinden öğrenci/personel kimliğinizle doğrudan alınabilir.</li>
                  </ul>
                </div>

                {/* 2. İade Etme */}
                <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <Clock className="w-4 h-4" />
                    <h5 className="font-display font-bold text-sm text-stone-900 dark:text-white">
                      2. Kitap İade Etme İşlemi (Nerede ve Nasıl?)
                    </h5>
                  </div>
                  <ul className="text-xs text-stone-600 dark:text-white/80 space-y-1.5 list-disc list-inside leading-relaxed">
                    <li>Giriş katındaki <strong>Ödünç-İade Bankosu</strong>'ndan,</li>
                    <li>Giriş katındaki <strong>K-Matik</strong> cihazı üzerinden,</li>
                    <li>Kütüphane bina girişinde bulunan <strong>RFID Akıllı İade Sistemi (7/24 Kesintisiz İade Kutusu)</strong> ile mesai saatleri dışında da iade edilebilir.</li>
                  </ul>
                </div>

                {/* 3. Süre Uzatma */}
                <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Calendar className="w-4 h-4" />
                    <h5 className="font-display font-bold text-sm text-stone-900 dark:text-white">
                      3. Ödünç Süresi Uzatma (En Fazla 2 Defa)
                    </h5>
                  </div>
                  <ul className="text-xs text-stone-600 dark:text-white/80 space-y-1.5 list-disc list-inside leading-relaxed">
                    <li>Ödünç-İade Bankosu'ndan bizzat,</li>
                    <li><strong>0 348 814 26 66 (Dahili: 1338)</strong> banko telefonunu arayarak,</li>
                    <li>Giriş katındaki K-Matik cihazından veya,</li>
                    <li>Online Kütüphane Hesabı (<a href="https://yordam.kilis.edu.tr/" target="_blank" rel="noreferrer" className="text-amber-600 underline">yordam.kilis.edu.tr</a>) üzerinden sürenizi 2 kez uzatabilirsiniz (Başka üye ayırtmadıysa).</li>
                  </ul>
                </div>

                {/* 4. Kitap Ayırtma */}
                <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Users className="w-4 h-4" />
                    <h5 className="font-display font-bold text-sm text-stone-900 dark:text-white">
                      4. Ödünçteki Kitap İçin Ayırtma (Rezervasyon)
                    </h5>
                  </div>
                  <ul className="text-xs text-stone-600 dark:text-white/80 space-y-1.5 list-disc list-inside leading-relaxed">
                    <li>Ödünç-İade Bankosu, Dahili 1338 telefonu veya online kütüphane hesabından ayırtma yapılabilir.</li>
                    <li>Ayırtılan kitap iade edildiğinde okuyucu için <strong>3 iş günü</strong> boyunca ayırtma rafında bekletilir. Teslim alınmazsa genel rafa çıkar.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Official Borrowing Limits Table */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                Üye Gruplarına Göre Kitap Sayıları ve Ödünç Süreleri
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                  <thead className="bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 font-bold border-b border-[#e6e2d6] dark:border-white/10">
                    <tr>
                      <th className="p-3.5">Üye Grubu</th>
                      <th className="p-3.5">Ödünç Kitap Sayısı</th>
                      <th className="p-3.5">Ödünç Süresi</th>
                      <th className="p-3.5">Uzatma Hakkı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6e2d6] dark:divide-white/10">
                    {(library.borrowingRules || []).map((rule: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-semibold text-stone-800 dark:text-white">{rule.user}</td>
                        <td className="p-3.5 text-amber-600 dark:text-amber-400 font-bold">{rule.bookCount}</td>
                        <td className="p-3.5 font-medium">{rule.duration}</td>
                        <td className="p-3.5 text-stone-500 dark:text-white/60">{rule.renewCount || '2 Kez Uzatma'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Floor Placement Plan (Kongre Kütüphanesi Sınıflandırma Sistemi) */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Kat Yerleşim Planı & Kitap Salonları (Kongre Kütüphanesi Sistemi)
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-white/60 mt-0.5">
                    Kitaplar konularına göre 1. ve 2. kat salonlarında yer almaktadır. Her iki katta yer numarası fişi veren Katalog Bilgisayarları mevcuttur.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                {/* 2. Kat */}
                <div className="border border-stone-200 dark:border-white/10 rounded-xl p-4 bg-white/50 dark:bg-white/5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-white/10">
                    <span className="font-display font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      2. Kat Kitap Salonu
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      Referans, Felsefe, Tarih
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5">
                      <strong className="text-amber-600 dark:text-amber-400 font-mono block">Ref.</strong>
                      <span className="text-stone-600 dark:text-white/70">Referans Kitaplar (Ansiklopedi, Sözlük)</span>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5">
                      <strong className="text-amber-600 dark:text-amber-400 font-mono block">A -</strong>
                      <span className="text-stone-600 dark:text-white/70">Genel Eserler</span>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5">
                      <strong className="text-amber-600 dark:text-amber-400 font-mono block">B -</strong>
                      <span className="text-stone-600 dark:text-white/70">Felsefe, Psikoloji, Din</span>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5">
                      <strong className="text-amber-600 dark:text-amber-400 font-mono block">C -</strong>
                      <span className="text-stone-600 dark:text-white/70">Arkeoloji, Nümizmatik, Biyografi</span>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5 sm:col-span-2">
                      <strong className="text-amber-600 dark:text-amber-400 font-mono block">D, E, F -</strong>
                      <span className="text-stone-600 dark:text-white/70">Dünya Tarihi, Avrupa, Asya, Afrika ve Amerika Tarihleri</span>
                    </div>
                  </div>
                </div>

                {/* 1. Kat */}
                <div className="border border-stone-200 dark:border-white/10 rounded-xl p-4 bg-white/50 dark:bg-white/5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-white/10">
                    <span className="font-display font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      1. Kat Kitap Salonu
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      Edebiyat, Sosyal, Fen, Tıp & Teknoloji
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono block">P -</strong>
                      <span className="text-stone-600 dark:text-white/70">Dil ve Edebiyat (Şiir, Hikâye, Roman)</span>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono block">H, J, K -</strong>
                      <span className="text-stone-600 dark:text-white/70">Sosyal Bilimler, Siyaset, Hukuk</span>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono block">Q, R -</strong>
                      <span className="text-stone-600 dark:text-white/70">Fen Bilimleri, Tıp & Sağlık</span>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono block">T, S -</strong>
                      <span className="text-stone-600 dark:text-white/70">Teknoloji (Mühendislikler), Tarım</span>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-white/5 sm:col-span-2">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono block">G, L, M, N, Z -</strong>
                      <span className="text-stone-600 dark:text-white/70">Coğrafya, Eğitim, Müzik, Sanat, Büyük Boy Kitaplar Rafı</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fines, Restrictions & Important Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Cezai Hususlar */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/25 rounded-2xl p-4 sm:p-5 space-y-2.5">
                <h5 className="font-display font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Gecikme Cezası & Önemli Kurallar
                </h5>
                <ul className="text-xs text-amber-800 dark:text-amber-200/90 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Ödünç süresini aşan her gün için <strong>günlük 1 TL</strong> gecikme cezası uygulanır.</li>
                  <li>Gecikme borcu bulunan ve materyali iade etmeyen üyeye yeni kitap verilmez.</li>
                  <li>Bir başka kişi adına kitap ödünç alınamaz ve devredilemez.</li>
                  <li>90 günü aşan gecikmelerde resmi uyarı tebliğ edilir ve yasal/disiplin işlemi başlatılır.</li>
                </ul>
              </div>

              {/* Ödünç Verilemeyecek Materyaller */}
              <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-sm">
                <h5 className="font-display font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-rose-500" />
                  Ödünç Verilemeyecek Materyaller
                </h5>
                <p className="text-xs text-stone-500 dark:text-white/60">
                  Aşağıdaki eserler sadece kütüphane salonları içerisinde incelenebilir:
                </p>
                <ul className="text-xs text-stone-700 dark:text-white/80 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li><strong>Rezerv Kitaplar:</strong> Akademisyenlerin talep ettiği ders kitapları</li>
                  <li>Yayınlanmamış Yüksek Lisans ve Doktora Tezleri</li>
                  <li>Yazma Eserler ve Nadir Matbu Eserler</li>
                  <li>Başvuru Eserleri (Almanak, Dizin, Sözlük, Ansiklopedi vb.)</li>
                </ul>
              </div>
            </div>

            {/* Databases */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-3 shadow-sm">
              <h4 className="font-display font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Abone Olunan Akademik Veritabanları
              </h4>
              <div className="flex flex-wrap gap-2">
                {(library.databases || []).map((db: string, dIdx: number) => (
                  <span
                    key={dIdx}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-white/10 text-xs font-medium text-stone-700 dark:text-white/80 border border-stone-200/50 dark:border-white/10"
                  >
                    {db}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 6. SPOR & HALI SAHA ================= */}
        {activeTab === 'sports' && sports && (
          <motion.div
            key="sports"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Action Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div>
                <h3 className="font-display font-bold text-lg">Sentetik Halı Saha & Spor Tesisleri</h3>
                <p className="text-xs text-white/80 mt-1">
                  Öğrenci ve personel için online seans randevusu alabilir veya salon tahsis edebilirsiniz.
                </p>
              </div>

              <a
                href="https://rezervasyon.kilis.edu.tr/SporRezervasyon/Rezervasyon"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition-colors shadow"
              >
                <span>Halı Saha Rezervasyonu Yap</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Facility Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sports.facilities?.map((f: any) => (
                <div
                  key={f.id}
                  className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                      {f.name}
                    </h4>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{f.specs}</p>
                    <p className="text-xs text-stone-500 dark:text-white/60 leading-relaxed">{f.info}</p>
                    {f.hours && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-white/70 pt-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{f.hours}</span>
                      </div>
                    )}
                  </div>

                  {f.bookingUrl && (
                    <a
                      href={f.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold text-xs rounded-lg transition-colors"
                    >
                      <span>Müsait Saatleri İncele</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* How to reserve steps */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                Rezervasyon Nasıl Yapılır?
              </h4>
              <div className="space-y-2 text-xs text-stone-600 dark:text-white/70">
                {sports.reservationSteps?.map((step: string, sIdx: number) => (
                  <div key={sIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-xs text-stone-400">
                Danışma: {sports.contactPhone}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 7. UYGULAMA OTELİ ================= */}
        {activeTab === 'hotel' && hotel && (
          <motion.div
            key="hotel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Header Card */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-xl text-stone-900 dark:text-white">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-white/60 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{hotel.location}</span>
                  </p>
                </div>

                <a
                  href={`tel:${hotel.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold tracking-wide self-start transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Resepsiyonu Ara (Dahili: {hotel.extension})</span>
                </a>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{hotel.pricingNotes}</span>
              </div>
            </div>

            {/* Room Options */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                Oda Tipleri & Özellikleri
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hotel.roomTypes?.map((room: any, rIdx: number) => (
                  <div
                    key={rIdx}
                    className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-2"
                  >
                    <h5 className="font-display font-bold text-base text-stone-900 dark:text-white">
                      {room.type}
                    </h5>
                    <p className="text-xs text-stone-500 dark:text-white/60 leading-relaxed">
                      {room.features}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dining Services */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                Restoran & Hizmet Saatleri
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {hotel.services?.map((srv: any, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4"
                  >
                    <h6 className="font-bold text-sm text-stone-800 dark:text-white">{srv.name}</h6>
                    <p className="text-xs text-stone-500 dark:text-white/60 mt-1">{srv.hours}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 8. YERLEŞKELER & HARİTA ================= */}
        {activeTab === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Search and Campus Selector */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-stone-400" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2.5 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400 shadow-sm"
                  placeholder="Bina, fakülte veya birim adı ile yerleşkede ara..."
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                />
                {mapSearch && (
                  <button
                    onClick={() => setMapSearch('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Campus Selector */}
              <HorizontalScrollWrapper>
                {(['Tümü', 'Merkez Kampüs', 'Karataş Kampüsü', 'Mercidabık Kampüsü'] as const).map((cmp) => (
                  <button
                    key={cmp}
                    onClick={() => setSelectedCampus(cmp)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedCampus === cmp
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-white/70 hover:bg-stone-300'
                    }`}
                  >
                    {cmp}
                  </button>
                ))}
              </HorizontalScrollWrapper>
            </div>

            <div className="flex items-center justify-between px-1 text-xs text-stone-500 dark:text-white/60 font-medium">
              <span>Toplam <strong>{filteredLocations.length}</strong> yerleşke konumu listeleniyor</span>
              {mapSearch && (
                <button
                  onClick={() => setMapSearch('')}
                  className="text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Aramayı Temizle
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/80">
                        {loc.campus}
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        {loc.type}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                      {loc.name}
                    </h4>

                    <p className="text-xs text-stone-500 dark:text-white/60 leading-relaxed">
                      {loc.description}
                    </p>
                  </div>

                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-stone-100 dark:bg-white/10 hover:bg-red-600 hover:text-white text-stone-800 dark:text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Haritada Göster & Rota Başlat</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal for Events */}
      <DetailModal
        isOpen={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        url={selectedDetail?.url || ''}
        title={selectedDetail?.title || ''}
      />

      {/* Staff Photo Enlarged Modal */}
      <AnimatePresence>
        {selectedStaffPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-md w-full bg-[#fcfbf9] dark:bg-[#264653] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-white/15 p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  Personel Fotoğrafı
                </span>
                <button
                  onClick={() => setSelectedStaffPhoto(null)}
                  className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo View */}
              <div className="relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-white/10 flex items-center justify-center min-h-[260px] max-h-[50vh]">
                {selectedStaffPhoto.image ? (
                  <img
                    src={selectedStaffPhoto.image}
                    alt={selectedStaffPhoto.fullName}
                    className="w-full h-full object-contain max-h-[50vh] rounded-2xl"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-stone-400">
                    <Users className="w-16 h-16 mb-2 opacity-50 text-emerald-600" />
                    <span className="text-sm font-semibold">Resmi Fotoğraf Bulunamadı</span>
                  </div>
                )}
              </div>

              {/* Staff Details */}
              <div className="space-y-1 text-center">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  {selectedStaffPhoto.title}
                </span>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white mt-1">
                  {selectedStaffPhoto.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-white/70">
                  {selectedStaffPhoto.department} • {selectedStaffPhoto.facultyName}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-200/60 dark:border-white/10 gap-2">
                {selectedStaffPhoto.email && (
                  <a
                    href={`mailto:${selectedStaffPhoto.email}`}
                    className="text-xs font-semibold text-stone-700 dark:text-white/80 hover:text-emerald-600 flex items-center gap-1.5 truncate min-w-0"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{selectedStaffPhoto.email}</span>
                  </a>
                )}
                {selectedStaffPhoto.sourceUrl && (
                  <a
                    href={selectedStaffPhoto.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shrink-0 ml-auto"
                  >
                    <span>Resmi Profil</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
