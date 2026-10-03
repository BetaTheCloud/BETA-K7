import React, { useState, useEffect } from 'react';
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
  Clock,
  Compass,
  Check,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  getPhonebook,
  getEvents,
  getForms,
  getTransportInfo,
  getLibraryInfo,
  getSportsInfo,
  getHotelInfo,
  getItHelpInfo,
  getCampusMapLocations,
  FALLBACK_PHONEBOOK,
  FALLBACK_EVENTS,
  FALLBACK_FORMS,
  FALLBACK_TRANSPORT,
  FALLBACK_LIBRARY,
  FALLBACK_SPORTS,
  FALLBACK_HOTEL,
  FALLBACK_IT_HELP,
  FALLBACK_CAMPUS_MAP
} from '../mockData';
import { PhonebookEntry, CampusEvent, CampusForm, CampusBuilding } from '../types';
import LoadingState from '../components/LoadingState';
import DetailModal from '../components/DetailModal';
import toast from 'react-hot-toast';

type TabKey = 'all' | 'directory' | 'events' | 'transport' | 'forms' | 'library' | 'sports' | 'hotel' | 'it-help' | 'map';

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
    if (path === 'it-help') return 'it-help';
    if (path === 'campus-map') return 'map';
    return (searchParams.get('tab') as TabKey) || 'all';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getTabFromLocation());

  // Instant fallback-backed states so screen is never blank!
  const [phonebook, setPhonebook] = useState<PhonebookEntry[]>(FALLBACK_PHONEBOOK);
  const [events, setEvents] = useState<CampusEvent[]>(FALLBACK_EVENTS);
  const [forms, setForms] = useState<CampusForm[]>(FALLBACK_FORMS);
  const [transport, setTransport] = useState<any>(FALLBACK_TRANSPORT);
  const [library, setLibrary] = useState<any>(FALLBACK_LIBRARY);
  const [sports, setSports] = useState<any>(FALLBACK_SPORTS);
  const [hotel, setHotel] = useState<any>(FALLBACK_HOTEL);
  const [itHelp, setItHelp] = useState<any>(FALLBACK_IT_HELP);
  const [mapLocations, setMapLocations] = useState<CampusBuilding[]>(FALLBACK_CAMPUS_MAP);

  // Search in Directory
  const [directorySearch, setDirectorySearch] = useState('');
  const [searchingDirectory, setSearchingDirectory] = useState(false);

  // Forms category filter
  const [formCategory, setFormCategory] = useState<'Tümü' | 'Öğrenci' | 'Personel'>('Tümü');

  // Map campus filter
  const [selectedCampus, setSelectedCampus] = useState<'Tümü' | 'Merkez Kampüs' | 'Karataş Kampüsü' | 'Mercidabık Kampüsü'>('Tümü');

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
        const [pb, ev, fm, tr, lib, sp, ht, it, ml] = await Promise.all([
          getPhonebook(''),
          getEvents(),
          getForms(),
          getTransportInfo(),
          getLibraryInfo(),
          getSportsInfo(),
          getHotelInfo(),
          getItHelpInfo(),
          getCampusMapLocations()
        ]);

        if (!isMounted) return;
        if (pb && pb.length > 0) setPhonebook(pb);
        if (ev && ev.length > 0) setEvents(ev);
        if (fm && fm.length > 0) setForms(fm);
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
      duration: 3000,
      icon: '📋'
    });
  };

  const tabs: { key: TabKey; label: string; icon: any; color: string }[] = [
    { key: 'all', label: 'Genel Bakış', icon: Compass, color: 'text-stone-700 dark:text-stone-300' },
    { key: 'directory', label: 'Rehber', icon: PhoneCall, color: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'events', label: 'Etkinlikler', icon: Calendar, color: 'text-rose-600 dark:text-rose-400' },
    { key: 'transport', label: 'Ulaşım', icon: Bus, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'forms', label: 'Dilekçe & Form', icon: FileText, color: 'text-amber-600 dark:text-amber-400' },
    { key: 'library', label: 'Kütüphane', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400' },
    { key: 'sports', label: 'Halı Saha & Spor', icon: Trophy, color: 'text-green-600 dark:text-green-400' },
    { key: 'hotel', label: 'Uygulama Oteli', icon: Hotel, color: 'text-cyan-600 dark:text-cyan-400' },
    { key: 'it-help', label: 'Eduroam Wi-Fi', icon: Wifi, color: 'text-violet-600 dark:text-violet-400' },
    { key: 'map', label: 'Yerleşkeler', icon: MapPin, color: 'text-red-600 dark:text-red-400' },
  ];

  const filteredForms = forms.filter((f) => {
    if (formCategory === 'Tümü') return true;
    return f.category === formCategory;
  });

  const filteredLocations = mapLocations.filter((l) => {
    if (selectedCampus === 'Tümü') return true;
    return l.campus === selectedCampus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-6xl mx-auto pb-10"
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1d3540] via-[#264653] to-[#2a9d8f] rounded-2xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-3 text-amber-200">
            <span>✨</span> Şifresiz Dijital Kampüs Servisleri
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 ${
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
      </div>

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
              {/* 1. Rehber */}
              <div
                onClick={() => handleTabChange('directory')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Telefon Rehberi</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  Akademisyen ve personel dahili no, e-posta ve oda telefonu arama.
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

              {/* 8. Eduroam Wi-Fi */}
              <div
                onClick={() => handleTabChange('it-help')}
                className="cursor-pointer group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-stone-400 dark:text-white/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                    Görüntüle <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">Eduroam & Bilgi İşlem</h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 line-clamp-2">
                  Android & iPhone için Eduroam Wi-Fi kurulumu, e-posta şifre alma ve Office lisansları.
                </p>
              </div>

              {/* 9. Yerleşkeler */}
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

        {/* ================= 1. REHBER (TELEFON REHBERİ) ================= */}
        {activeTab === 'directory' && (
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Search Box */}
            <form onSubmit={handlePhonebookSearch} className="relative">
              <input
                type="text"
                placeholder="Öğretim görevlisi, personel adı veya birim ara..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full pl-11 pr-24 py-3.5 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl text-sm focus:border-amber-500 outline-none text-stone-900 dark:text-white"
              />
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <button
                type="submit"
                disabled={searchingDirectory}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors"
              >
                {searchingDirectory ? 'Aranıyor...' : 'Ara'}
              </button>
            </form>

            <div className="text-xs text-stone-400 dark:text-white/40 flex items-center justify-between px-1">
              <span>Toplam {phonebook.length} kayıt listelendi</span>
              <span>Santral: 0348 814 26 66</span>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {phonebook.map((person) => (
                <div
                  key={person.id}
                  className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                        {person.name}
                      </h4>
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-0.5">
                        {person.title} {person.role ? `• ${person.role}` : ''}
                      </p>
                      <p className="text-[11px] text-stone-400 dark:text-white/40 mt-0.5">
                        {person.department}
                      </p>
                    </div>

                    {person.extension && (
                      <button
                        onClick={() => copyToClipboard(person.extension, 'Dahili No')}
                        title="Dahili numarayı kopyala"
                        className="shrink-0 flex items-center gap-1 text-[11px] font-mono px-2 py-1 bg-stone-100 dark:bg-white/10 rounded text-stone-600 dark:text-white/80 hover:bg-amber-500/20 hover:text-amber-600 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Dahili: {person.extension}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between gap-2 text-xs">
                    <a
                      href={`tel:${person.phone ? person.phone.replace(/\s+/g, '') : '03488142666'}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{person.phone || '0348 814 26 66'}</span>
                    </a>

                    {person.email ? (
                      <a
                        href={`mailto:${person.email}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-500/20 transition-colors truncate max-w-[180px]"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{person.email}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-stone-400">E-posta belirtilmedi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                      <span>{ev.date}</span>
                    </div>

                    <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {ev.title}
                    </h3>

                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-white/60">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{ev.location}</span>
                      </div>
                    )}

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
                      <p className="text-[11px] text-stone-400 dark:text-white/40 italic">
                        💡 {route.notes}
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

            {/* Taksi Durakları */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-amber-500" />
                Taksi Durakları & İletişim
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {transport.taxis?.map((taxi: any, tIdx: number) => (
                  <div
                    key={tIdx}
                    className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-display font-bold text-sm text-stone-900 dark:text-white">
                        {taxi.name}
                      </h5>
                      <span className="text-[11px] text-stone-400">{taxi.location}</span>
                    </div>
                    <a
                      href={`tel:${taxi.phone.replace(/\s+/g, '')}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1 hover:bg-emerald-500/20"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Ara</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 4. MATBU FORMLAR ================= */}
        {activeTab === 'forms' && (
          <motion.div
            key="forms"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Filter Chips */}
            <div className="flex items-center gap-2">
              {(['Tümü', 'Öğrenci', 'Personel'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFormCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    formCategory === cat
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-white/70 hover:bg-stone-300'
                  }`}
                >
                  {cat} Formları
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredForms.map((form) => (
                <div
                  key={form.id}
                  className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/80">
                        {form.category}
                      </span>
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400">
                        .{form.fileType}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                      {form.title}
                    </h4>

                    <p className="text-xs text-stone-500 dark:text-white/60 leading-relaxed">
                      {form.description}
                    </p>
                  </div>

                  <a
                    href={form.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2 bg-stone-100 dark:bg-white/10 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 text-stone-800 dark:text-white rounded-lg text-xs font-semibold tracking-wide transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Dilekçeyi İndir ({form.fileType.toUpperCase()})</span>
                  </a>
                </div>
              ))}
            </div>
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
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-xl text-stone-900 dark:text-white">
                    {library.name}
                  </h3>
                  <span className="text-xs text-stone-400">Danışma: {library.phone}</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold self-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Şu Anda Hizmet Veriyor</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-200/60 dark:border-white/10">
                <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Hafta İçi</span>
                  <span className="font-display font-bold text-base text-stone-800 dark:text-white">{library.hours?.weekday}</span>
                </div>
                <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-3.5">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Hafta Sonu</span>
                  <span className="font-display font-bold text-base text-stone-800 dark:text-white">{library.hours?.weekend}</span>
                </div>
                <div className="bg-amber-500/10 rounded-xl p-3.5 border border-amber-500/20">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">Vize / Final Dönemleri</span>
                  <span className="font-display font-bold text-sm text-amber-800 dark:text-amber-200">{library.hours?.exams}</span>
                </div>
              </div>

              {/* Online Catalog Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={library.catalogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold tracking-wide shadow-md transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Kütüphane Kataloğunda Kitap Ara (Yordam)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  href={library.vetisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-800 dark:text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <span>Kampüs Dışı Veritabanı Erişimi (VETİS)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>

            {/* Borrowing Rules */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                Kitap Ödünç Alma ve Süre Limitleri
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl overflow-hidden">
                  <thead className="bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-white/60 font-semibold border-b border-[#e6e2d6] dark:border-white/10">
                    <tr>
                      <th className="p-3">Kullanıcı Grubu</th>
                      <th className="p-3">Kitap Sayısı</th>
                      <th className="p-3">Ödünç Süresi</th>
                      <th className="p-3">Uzatma Hakkı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6e2d6] dark:divide-white/10">
                    {library.borrowingRules?.map((rule: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-stone-50 dark:hover:bg-white/5">
                        <td className="p-3 font-semibold text-stone-800 dark:text-white">{rule.user}</td>
                        <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{rule.bookCount}</td>
                        <td className="p-3">{rule.duration}</td>
                        <td className="p-3 text-stone-500">{rule.renewCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Databases */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                Abone Olunan Akademik Veritabanları
              </h4>
              <div className="flex flex-wrap gap-2">
                {library.databases?.map((db: string, dIdx: number) => (
                  <span
                    key={dIdx}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-white/10 text-xs font-medium text-stone-700 dark:text-white/80"
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

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                💡 {hotel.pricingNotes}
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

        {/* ================= 8. BİLGİ İŞLEM & EDUROAM ================= */}
        {activeTab === 'it-help' && itHelp && (
          <motion.div
            key="it-help"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Eduroam Guide */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold mb-2">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Kampüs İnterneti</span>
                </div>
                <h3 className="font-display font-bold text-xl text-stone-900 dark:text-white">
                  {itHelp.eduroam?.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1">
                  {itHelp.eduroam?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Android Steps */}
                <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-4 space-y-2.5">
                  <h4 className="font-display font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    📱 Android Cihazlar İçin Ayarlar
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-white/80">
                    {itHelp.eduroam?.androidSteps?.map((st: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {st}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* iOS Steps */}
                <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-4 space-y-2.5">
                  <h4 className="font-display font-bold text-sm text-blue-600 dark:text-blue-400">
                    🍎 iPhone & iPad (iOS) İçin Ayarlar
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-white/80">
                    {itHelp.eduroam?.iosSteps?.map((st: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {st}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Email & Software */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-3">
                <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                  {itHelp.emailPassword?.title}
                </h4>
                <ul className="space-y-2 text-xs text-stone-600 dark:text-white/70">
                  {itHelp.emailPassword?.steps?.map((step: string, sIdx: number) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 space-y-3">
                <h4 className="font-display font-bold text-base text-stone-900 dark:text-white">
                  Ücretsiz Öğrenci Yazılım Lisansları
                </h4>
                <div className="space-y-2">
                  {itHelp.softwareLicenses?.map((lic: any, lIdx: number) => (
                    <div key={lIdx} className="p-2.5 rounded-lg bg-stone-50 dark:bg-white/5">
                      <span className="font-bold text-xs text-stone-800 dark:text-white block">{lic.name}</span>
                      <span className="text-[11px] text-stone-500 dark:text-white/60">{lic.info}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-stone-400">
              {itHelp.supportPhone}
            </div>
          </motion.div>
        )}

        {/* ================= 9. YERLEŞKELER & HARİTA ================= */}
        {activeTab === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Campus Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(['Tümü', 'Merkez Kampüs', 'Karataş Kampüsü', 'Mercidabık Kampüsü'] as const).map((cmp) => (
                <button
                  key={cmp}
                  onClick={() => setSelectedCampus(cmp)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCampus === cmp
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-white/70 hover:bg-stone-300'
                  }`}
                >
                  {cmp}
                </button>
              ))}
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
    </motion.div>
  );
}
