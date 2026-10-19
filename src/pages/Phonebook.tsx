/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  Search,
  Building2,
  Users,
  Copy,
  ExternalLink,
  Mail,
  School,
  Check,
  AlertCircle,
  X,
  Info
} from 'lucide-react';
import { getPhonebook, getStaff, FALLBACK_PHONEBOOK, FALLBACK_STAFF } from '../mockData';
import { PhonebookEntry, AcademicStaffMember } from '../types';
import { openExternalUrl } from '../lib/openExternal';
import HorizontalScrollWrapper from '../components/HorizontalScrollWrapper';
import CustomSelectPicker, { SelectOption } from '../components/CustomSelectPicker';

type PhonebookCategory = 'all' | 'santral' | 'rektorluk' | 'daire' | 'fakulte' | 'tesis';

export default function Phonebook() {
  const [activeTab, setActiveTab] = useState<'units' | 'staff'>('units');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PhonebookCategory>('all');
  const [selectedUnitDepartment, setSelectedUnitDepartment] = useState<string>('all');
  const [selectedStaffFaculty, setSelectedStaffFaculty] = useState<string>('all');
  const [phonebookData, setPhonebookData] = useState<PhonebookEntry[]>(FALLBACK_PHONEBOOK);
  const [staffData, setStaffData] = useState<AcademicStaffMember[]>(FALLBACK_STAFF);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Load Phonebook and Staff data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [pb, st] = await Promise.all([getPhonebook(''), getStaff()]);
        if (!isMounted) return;
        if (pb && pb.length > 0) setPhonebookData(pb);
        if (st && st.length > 0) setStaffData(st);
      } catch (err) {
        console.error('Phonebook data error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setCopiedToast(`${label}: ${text} panoya kopyalandı!`);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedToast(null);
    }, 2500);
  };

  // SelectOption lists for CustomSelectPicker (Personel sayıları kaldırıldı)
  const unitDepartmentOptions: SelectOption[] = useMemo(() => {
    const map = new Map<string, number>();
    phonebookData.forEach((p) => {
      const dept = p.department || 'Genel Kurum';
      map.set(dept, (map.get(dept) || 0) + 1);
    });

    const options: SelectOption[] = [
      { value: 'all', label: 'Tüm Birimler ve Dekanlıklar' }
    ];

    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([dept]) => {
        options.push({
          value: dept,
          label: dept
        });
      });

    return options;
  }, [phonebookData]);

  const staffFacultyOptions: SelectOption[] = useMemo(() => {
    const map = new Map<string, number>();
    staffData.forEach((s) => {
      const fac = s.facultyName || 'Diğer / Rektörlük';
      map.set(fac, (map.get(fac) || 0) + 1);
    });

    const options: SelectOption[] = [
      { value: 'all', label: 'Tüm Fakülte ve İdari Birimler' }
    ];

    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([fac]) => {
        options.push({
          value: fac,
          label: fac
        });
      });

    return options;
  }, [staffData]);

  // Live fetch when department is selected in Phonebook
  const handleUnitDepartmentChange = async (dept: string) => {
    setSelectedUnitDepartment(dept);
    if (dept && dept !== 'all') {
      try {
        const liveData = await getPhonebook(dept);
        if (liveData && liveData.length > 0) {
          setPhonebookData((prev) => {
            const others = prev.filter(p => p.department !== dept);
            return [...others, ...liveData];
          });
        }
      } catch (err) {
        console.warn('Live fetch for phonebook unit failed:', err);
      }
    }
  };

  // Live fetch when faculty is selected in Staff
  const handleStaffFacultyChange = async (fac: string) => {
    setSelectedStaffFaculty(fac);
    if (fac && fac !== 'all') {
      try {
        const liveStaff = await getStaff(fac);
        if (liveStaff && liveStaff.length > 0) {
          setStaffData((prev) => {
            const others = prev.filter(s => (s.facultyName || 'Diğer / Rektörlük') !== fac);
            return [...others, ...liveStaff];
          });
        }
      } catch (err) {
        console.warn('Live fetch for staff faculty failed:', err);
      }
    }
  };

  // Filtered Unit Phonebook
  const filteredUnits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return phonebookData.filter((item) => {
      // CustomSelectPicker Department Filter
      if (selectedUnitDepartment !== 'all' && item.department !== selectedUnitDepartment) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const cat = (item.category || '').toLowerCase();
        const dept = (item.department || '').toLowerCase();
        if (selectedCategory === 'santral' && !cat.includes('santral') && !dept.includes('santral')) return false;
        if (selectedCategory === 'rektorluk' && !dept.includes('rektörlük') && !dept.includes('basın')) return false;
        if (selectedCategory === 'daire' && !dept.includes('daire') && !dept.includes('başkanlığı')) return false;
        if (selectedCategory === 'fakulte' && !dept.includes('fakülte') && !dept.includes('dekanlık')) return false;
        if (selectedCategory === 'tesis' && !dept.includes('sosyal') && !dept.includes('otel') && !dept.includes('revir') && !dept.includes('sks')) return false;
      }

      if (!q) return true;

      const matchName = item.name.toLowerCase().includes(q);
      const matchRole = (item.role || '').toLowerCase().includes(q);
      const matchDept = (item.department || '').toLowerCase().includes(q);
      const matchExt = (item.extension || '').includes(q);
      const matchEmail = (item.email || '').toLowerCase().includes(q);

      return matchName || matchRole || matchDept || matchExt || matchEmail;
    });
  }, [phonebookData, searchQuery, selectedCategory, selectedUnitDepartment]);

  // Filtered Staff Personnel
  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staffData.filter((s) => {
      // CustomSelectPicker Faculty Filter
      if (selectedStaffFaculty !== 'all') {
        const fac = s.facultyName || 'Diğer / Rektörlük';
        if (fac !== selectedStaffFaculty) return false;
      }

      if (!q) return true;

      const matchName = (s.name || s.fullName || '').toLowerCase().includes(q);
      const matchDept = (s.department || '').toLowerCase().includes(q);
      const matchFac = (s.facultyName || '').toLowerCase().includes(q);
      const matchTitle = (s.title || '').toLowerCase().includes(q);
      const matchEmail = (s.email || '').toLowerCase().includes(q);

      return matchName || matchDept || matchFac || matchTitle || matchEmail;
    });
  }, [staffData, searchQuery, selectedStaffFaculty]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Toast Notification for Clipboard Copy */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white dark:bg-emerald-600 dark:text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-semibold border border-stone-800 dark:border-emerald-500"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 dark:bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
            </div>
            <span>{copiedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Title & Hero Banner */}
      <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Resmi Kurumsal Telefon Rehberi</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 dark:text-white tracking-tight">
              Telefon Rehberi & Dahili Numaralar
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-white/70 max-w-2xl leading-relaxed">
              Kilis 7 Aralık Üniversitesi Rektörlüğü, Daire Başkanlıkları, Fakülte Sekreterlikleri, Santral ve Personellerin Dahili Telefon Rehberi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <a
              href="https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => openExternalUrl('https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi', e)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <span>Resmi Web Rehberi Sayfası</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Aramak istediğiniz ad, dahili numara (örn: 1000, 6461, 1313, 5050), birim veya unvan yazın..."
            className="w-full pl-12 pr-10 py-4 bg-white dark:bg-[#1a2e35] border border-stone-300 dark:border-white/10 rounded-2xl text-sm sm:text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-stone-900 dark:text-white placeholder:text-stone-400 transition-all shadow-sm"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main View Tabs (Units Dahilileri vs Staff Personnel) */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80 dark:border-white/10 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              activeTab === 'units'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-white/5 text-stone-700 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Kurum & Birim Dahilileri</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-white/20 text-white">
              {filteredUnits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-white/5 text-stone-700 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personel Telefon Rehberi</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-white/20 text-white">
              {filteredStaff.length}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Instruction Banner */}
      <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 rounded-2xl p-3.5 sm:p-4 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-xs sm:text-sm">
            Dahili Numarayı Üniversite Dışından Nasıl Ararsınız?
          </p>
          <p className="text-[11px] sm:text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            Şehir dışından veya cep telefonundan ararken önce santral numaramız olan <strong>0348 814 26 66</strong> numarasını tuşlayıp ardından sesli komut geldiğinde ilgili 4 haneli <strong>Dahili Numarayı</strong> girebilirsiniz.
          </p>
        </div>
      </div>

      {/* ================= TAB 1: KURUM & BİRİM DAHİLİLERİ ================= */}
      {activeTab === 'units' && (
        <div className="space-y-5">
          {/* CustomSelectPicker for Unit/Department selection */}
          <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-white/60 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Birim / Dekanlık Filtresi Seçin:</span>
              </label>
              {selectedUnitDepartment !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedUnitDepartment('all')}
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Filtreyi Temizle
                </button>
              )}
            </div>
            <CustomSelectPicker
              title="Birim veya Dekanlık Seçimi"
              options={unitDepartmentOptions}
              value={selectedUnitDepartment}
              onChange={(val) => handleUnitDepartmentChange(val)}
              placeholder="-- Tüm Birimler ve Dekanlıklar --"
              clearable={selectedUnitDepartment !== 'all'}
              onClear={() => handleUnitDepartmentChange('all')}
            />
          </div>

          {/* Category Filter Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Birim Kategorisine Göre Filtrele
            </span>
            <HorizontalScrollWrapper>
              {[
                { key: 'all' as PhonebookCategory, label: 'Tüm Birimler', count: phonebookData.length },
                { key: 'santral' as PhonebookCategory, label: 'Santral & İletişim', count: phonebookData.filter(p => (p.category || '').toLowerCase().includes('santral') || p.department.toLowerCase().includes('santral')).length },
                { key: 'rektorluk' as PhonebookCategory, label: 'Rektörlük & Yönetim', count: phonebookData.filter(p => p.department.toLowerCase().includes('rektörlük')).length },
                { key: 'daire' as PhonebookCategory, label: 'Daire Başkanlıkları', count: phonebookData.filter(p => p.department.toLowerCase().includes('daire')).length },
                { key: 'fakulte' as PhonebookCategory, label: 'Fakülteler & Dekanlıklar', count: phonebookData.filter(p => p.department.toLowerCase().includes('fakülte')).length },
                { key: 'tesis' as PhonebookCategory, label: 'Sosyal Tesis, Otel & Sağlık', count: phonebookData.filter(p => p.department.toLowerCase().includes('sosyal') || p.department.toLowerCase().includes('otel') || p.department.toLowerCase().includes('sks')).length },
              ].map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-[#fcfbf9] dark:bg-[#264653] text-stone-700 dark:text-white/80 border-[#e6e2d6] dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-white/15 text-stone-600 dark:text-white/60'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </HorizontalScrollWrapper>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((item) => (
              <div
                key={item.id}
                className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      {item.title || 'Kurumsal Birim'}
                    </span>
                    <span className="text-xs font-semibold text-stone-500 dark:text-white/60 truncate max-w-[160px]">
                      {item.department}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {item.role}
                  </p>

                  {/* High Visibility Dahili Extension Badge */}
                  <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm">
                      <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Dahili Hat:</span>
                      <span className="text-xl font-mono text-emerald-700 dark:text-emerald-300 font-extrabold tracking-wide">
                        {item.extension || '---'}
                      </span>
                    </div>

                    {item.extension && (
                      <button
                        type="button"
                        onClick={() => handleCopy(item.extension, `${item.name} Dahili No`)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-xs cursor-pointer"
                        title="Dahili numarayı kopyala"
                      >
                        {copiedId === item.extension ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between gap-2 text-xs">
                  <a
                    href="tel:03488142666"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-stone-800 dark:text-white font-bold flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                    <span>Santrali Ara</span>
                  </a>

                  {item.email && (
                    <a
                      href={`mailto:${item.email}`}
                      className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      title={item.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-stone-500 dark:text-stone-300" />
                      <span>E-Posta</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredUnits.length === 0 && (
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-3xl p-10 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                Aramanıza Uygun Birim Dahilisi Bulunamadı
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-white/60 max-w-md mx-auto">
                "{searchQuery}" araması için sonuç eşleşmedi. Farklı bir arama terimi veya kategori deneyebilirsiniz.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Aramayı Temizle
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PERSONEL TELEFON REHBERİ ================= */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display font-bold text-lg text-stone-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Akademik & İdari Personel Dahili Telefon Listesi
            </h2>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {filteredStaff.length} Personel
            </span>
          </div>

          {/* CustomSelectPicker for Faculty/Unit selection in Personnel tab */}
          <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-white/60 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Fakülte / İdari Birim Filtresi Seçin:</span>
              </label>
              {selectedStaffFaculty !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedStaffFaculty('all')}
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Filtreyi Temizle
                </button>
              )}
            </div>
            <CustomSelectPicker
              title="Fakülte / İdari Birim Seçimi"
              options={staffFacultyOptions}
              value={selectedStaffFaculty}
              onChange={(val) => handleStaffFacultyChange(val)}
              placeholder="-- Tüm Fakülte ve İdari Birimler --"
              clearable={selectedStaffFaculty !== 'all'}
              onClear={() => handleStaffFacultyChange('all')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4.5 flex flex-col justify-between gap-3 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {/* Person Avatar */}
                      <div
                        className="relative shrink-0 rounded-xl overflow-hidden group/avatar"
                        title="Personel resmi"
                      >
                        {person.image ? (
                          <img
                            src={person.image}
                            alt={person.fullName}
                            className="w-14 h-14 rounded-xl object-cover object-top border border-stone-200 dark:border-white/10 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const next = e.currentTarget.nextElementSibling;
                              if (next) (next as HTMLElement).style.display = 'flex';
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
                      </div>

                      {/* Name & Titles */}
                      <div className="min-w-0 flex-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                          {person.title || 'Akademisyen'}
                        </span>
                        <h3 className="font-display font-bold text-sm text-stone-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-1">
                          {person.name || person.fullName}
                        </h3>
                        <p className="text-[11px] text-stone-500 dark:text-white/60 mt-0.5 line-clamp-1">
                          {person.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-white/70 bg-stone-100/70 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-stone-200/50 dark:border-white/5">
                      <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate font-medium">{person.facultyName || 'Kilis 7 Aralık Üniversitesi'}</span>
                    </div>

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
                          onClick={() => handleCopy(person.email, 'E-posta')}
                          className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded shrink-0 cursor-pointer"
                          title="E-postayı kopyala"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-stone-400 dark:text-white/40 italic px-1">
                        E-posta adresi belirtilmemiş
                      </div>
                    )}
                  </div>

                  {/* Person Card Footer */}
                  <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between gap-2">
                    <a
                      href="tel:03488142666"
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Santralden Ulaş</span>
                    </a>

                    {person.sourceUrl && (
                      <a
                        href={person.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-600 dark:text-white/80 transition-colors shrink-0"
                        title="Resmi Fakülte Personel Profilini Aç"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStaff.length === 0 && (
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-3xl p-10 text-center space-y-3">
              <Users className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white">
                Aramanızla Eşleşen Personel Bulunamadı
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-white/60 max-w-md mx-auto">
                "{searchQuery}" araması için personel kaydı bulunamadı. Lütfen adı veya unvanı kontrol edin.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Aramayı Temizle
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
