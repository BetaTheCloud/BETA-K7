/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi Telefon Rehberi Sistemi
 * Kaynak: https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  Search,
  Building2,
  GraduationCap,
  Landmark,
  ShieldAlert,
  Mail,
  Copy,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  Phone,
  ArrowLeft,
  X,
  Info,
  Check,
  Globe,
  SlidersHorizontal,
  BookmarkCheck,
  Building,
  School,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DirectoryUnit, DirectorySection, DirectoryContact } from '../types';
import { getPhoneDirectory, syncPhoneDirectoryUnit, FALLBACK_PHONE_DIRECTORY, CACHE_TTL } from '../mockData';
import { cn } from '../lib/utils';
import { openExternalUrl } from '../lib/openExternal';
import CustomSelectPicker, { SelectOption } from './CustomSelectPicker';

type UnitCategory = 'all' | 'fakulte' | 'enstitu' | 'yuksekokul' | 'konservatuvar' | 'idari' | 'koordinatorluk';

interface CategoryTab {
  key: UnitCategory;
  label: string;
  icon: any;
  badge?: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { key: 'all', label: 'Tüm Birimler', icon: Building2 },
  { key: 'fakulte', label: 'Fakülteler', icon: GraduationCap },
  { key: 'enstitu', label: 'Enstitü & Y.Okullar', icon: School },
  { key: 'idari', label: 'Daire Bşk. & İdari', icon: Landmark },
  { key: 'koordinatorluk', label: 'Koordinatörlükler', icon: SlidersHorizontal }
];

export default function PhoneDirectoryView() {
  const [units, setUnits] = useState<DirectoryUnit[]>(FALLBACK_PHONE_DIRECTORY);
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(''); // Kullanıcı seçene kadar varsayılan olarak boş gelir
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load from API / Cache on mount
  useEffect(() => {
    let isMounted = true;
    getPhoneDirectory().then((data) => {
      if (isMounted && data && data.length > 0) {
        setUnits(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Units based on category tab
  const filteredUnits = useMemo(() => {
    let list = units;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'enstitu') {
        list = list.filter(u => u.category === 'enstitu' || u.category === 'yuksekokul' || u.category === 'konservatuvar');
      } else {
        list = list.filter(u => u.category === selectedCategory);
      }
    }
    return list;
  }, [units, selectedCategory]);

  // Selected Unit
  const activeUnit = useMemo(() => {
    return units.find(u => u.id === selectedUnitId) || null;
  }, [units, selectedUnitId]);

  const directoryUnitOptions: SelectOption[] = useMemo(() => {
    return filteredUnits.map((u) => {
      return {
        value: u.id,
        label: u.name
      };
    });
  }, [filteredUnits]);

  // Live fetch / sync data for clicked unit with server overload protection
  const handleUnitSelect = async (unitId: string) => {
    setSelectedUnitId(unitId);
    if (unitId) {
      const existing = units.find(u => u.id === unitId);
      const lastSyncKey = `k7_unit_last_sync_${unitId}`;
      const lastSync = typeof window !== 'undefined' ? Number(localStorage.getItem(lastSyncKey) || 0) : 0;
      const isFresh = (Date.now() - lastSync) < CACHE_TTL.PHONEBOOK;

      // Sunucu koruması: Birim zaten yüklüyse ve 7 gün içinde senkronize edilmişse tekrar sunucuyu yorma
      if (existing && existing.sections && existing.sections.length > 0 && isFresh) {
        return;
      }

      try {
        setIsSyncing(true);
        const res = await syncPhoneDirectoryUnit(unitId, false);
        if (res && res.success) {
          const refreshed = await getPhoneDirectory();
          if (refreshed && refreshed.length > 0) {
            setUnits(refreshed);
          }
        }
      } catch (err) {
        console.warn('Live unit sync failed:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // If a unit is selected, update expanded sections when switching unit
  useEffect(() => {
    if (activeUnit) {
      // By default open the first two sections of the selected unit
      const initial = new Set<string>();
      if (activeUnit.sections.length > 0) {
        initial.add(activeUnit.sections[0].id);
        if (activeUnit.sections.length > 1) {
          initial.add(activeUnit.sections[1].id);
        }
      }
      setExpandedSectionIds(initial);
    }
  }, [activeUnit?.id]);

  // Global search across all contacts in all units
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const matches: (DirectoryContact & { unitCategory: string; unitId: string })[] = [];
    for (const unit of units) {
      for (const sec of unit.sections) {
        for (const c of sec.contacts) {
          const matchName = c.name.toLowerCase().includes(q);
          const matchTitle = (c.title || '').toLowerCase().includes(q);
          const matchRole = (c.role || '').toLowerCase().includes(q);
          const matchExt = (c.extension || '').includes(q);
          const matchMail = (c.email || '').toLowerCase().includes(q);
          const matchUnit = c.unitName.toLowerCase().includes(q);
          const matchSec = c.sectionName.toLowerCase().includes(q);
          const matchPhone = c.phone.includes(q);

          if (matchName || matchTitle || matchRole || matchExt || matchMail || matchUnit || matchSec || matchPhone) {
            matches.push({
              ...c,
              unitCategory: unit.category,
              unitId: unit.id
            });
          }
        }
      }
    }
    return matches;
  }, [units, searchQuery]);

  // Toggle single section accordion
  const toggleSection = (secId: string) => {
    setExpandedSectionIds(prev => {
      const next = new Set(prev);
      if (next.has(secId)) {
        next.delete(secId);
      } else {
        next.add(secId);
      }
      return next;
    });
  };

  // Expand all or Collapse all sections of current unit
  const handleToggleAll = (expand: boolean) => {
    if (!activeUnit) return;
    if (expand) {
      setExpandedSectionIds(new Set(activeUnit.sections.map(s => s.id)));
    } else {
      setExpandedSectionIds(new Set());
    }
  };

  // Copy helper
  const handleCopy = (text: string, label: string, keyId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(keyId);
    setTimeout(() => setCopiedId(null), 2500);
    toast.success(`${label} kopyalandı: ${text}`, { duration: 2500 });
  };

  // Sync unit live from web
  const handleSyncUnit = async () => {
    if (!activeUnit || isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await syncPhoneDirectoryUnit(activeUnit.id, true);
      if (res && res.success) {
        toast.success(`${activeUnit.name} rehber bilgileri güncellendi.`);
        const refreshed = await getPhoneDirectory();
        if (refreshed && refreshed.length > 0) {
          setUnits(refreshed);
        }
      } else {
        toast.success(`${activeUnit.name} rehberi güncel.`);
      }
    } catch {
      toast.error('Senkronizasyon sırasında hata oluştu.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Switchboard Card */}
      <div className="bg-gradient-to-br from-[#264653] via-[#2a5b6d] to-[#2a9d8f] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider backdrop-blur-md text-amber-200">
              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
              <span>Resmi Telefon Rehberi Portalı</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight">
              Kilis 7 Aralık Üniversitesi Telefon Rehberi
            </h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Fakülteler, bölümler, daire başkanlıkları ve idari birimlerin tüm dahili numaralarına ve personel iletişim bilgilerine hiyerarşik olarak ulaşabilirsiniz.
            </p>
          </div>

          {/* Quick Santral Action Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 sm:p-4 text-xs shrink-0 space-y-2">
            <div className="flex items-center justify-between gap-3 text-amber-200 font-bold uppercase tracking-wide text-[11px]">
              <span className="flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                Rektörlük Santral
              </span>
              <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px]">
                Dahili: 1000
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:03488142666"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold transition-all text-xs active:scale-95 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                0 (348) 814 26 66
              </a>
              <button
                type="button"
                onClick={() => handleCopy('03488142666', 'Santral Numarası', 'santral-top')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Santral numarasını kopyala"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/70 pt-1 border-t border-white/10">
              <span>Güvenlik: <strong className="text-white">Dahili 1111</strong></span>
              <a
                href="https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => openExternalUrl('https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi', e)}
                className="text-amber-200 hover:underline flex items-center gap-1"
              >
                Web Rehberi <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Search Bar */}
      <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İsim, unvan, bölüm, görev veya dahili no arayın (Örn: 1710, Ebru, Dekan, Mühendislik)..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-stone-100/80 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white text-sm placeholder:text-stone-400 dark:placeholder:text-white/40 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchQuery.trim() && (
          <div className="flex items-center justify-between text-xs px-1 text-stone-500 dark:text-white/60">
            <span>
              <strong>"{searchQuery}"</strong> araması için <strong className="text-amber-600 dark:text-amber-400">{searchResults.length}</strong> personel bulundu.
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-rose-600 dark:text-rose-400 hover:underline font-semibold"
            >
              Aramayı Temizle
            </button>
          </div>
        )}
      </div>

      {/* SEARCH RESULTS VIEW (when typing in search bar) */}
      {searchQuery.trim() ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-500" />
              Arama Sonuçları ({searchResults.length})
            </h3>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-dashed border-stone-300 dark:border-white/10 rounded-2xl p-8 text-center space-y-2">
              <PhoneCall className="w-8 h-8 text-stone-300 dark:text-white/20 mx-auto" />
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                "{searchQuery}" ile eşleşen iletişim kaydı bulunamadı.
              </p>
              <p className="text-xs text-stone-400 dark:text-white/50">
                İsim, dahili numara (örn. 1710, 1021) veya bölüm adı ile tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display font-bold text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                          {contact.title && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300">
                              {contact.title}
                            </span>
                          )}
                          <span>{contact.name}</span>
                        </h4>
                        {contact.role && (
                          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                            {contact.role}
                          </p>
                        )}
                      </div>

                      {contact.extension && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-extrabold font-mono">
                          Dahili: {contact.extension}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-stone-500 dark:text-white/60 space-y-0.5 pt-1 border-t border-stone-100 dark:border-white/5">
                      <p className="font-medium text-stone-700 dark:text-stone-300 truncate">
                        🏛 {contact.unitName}
                      </p>
                      {contact.sectionName && contact.sectionName !== contact.unitName && (
                        <p className="truncate text-stone-500 dark:text-white/50">
                          📂 {contact.sectionName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-white/10 text-xs">
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors text-[11px]"
                      >
                        <Phone className="w-3 h-3 fill-current" />
                        <span>Ara ({contact.phone})</span>
                      </a>
                    )}

                    {contact.extension && (
                      <button
                        type="button"
                        onClick={() => handleCopy(contact.extension!, 'Dahili numara', contact.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 transition-colors text-[11px] cursor-pointer"
                        title="Dahili numarayı kopyala"
                      >
                        {copiedId === contact.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Dahili {contact.extension}</span>
                      </button>
                    )}

                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 transition-colors text-[11px] ml-auto"
                        title={contact.email}
                      >
                        <Mail className="w-3 h-3 text-blue-500" />
                        <span className="hidden sm:inline">E-Posta</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD HIERARCHICAL NAVIGATION (Fakülte -> Bölüm -> Personel İletişim Bilgileri) */
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORY_TABS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    // Do not auto-select any unit! If a unit was already selected, check if it's still in the category
                    const list = cat.key === 'all' 
                      ? units 
                      : (cat.key === 'enstitu' 
                          ? units.filter(u => u.category === 'enstitu' || u.category === 'yuksekokul' || u.category === 'konservatuvar') 
                          : units.filter(u => u.category === cat.key));
                    if (selectedUnitId && !list.some(u => u.id === selectedUnitId)) {
                      setSelectedUnitId('');
                    }
                  }}
                  className={cn(
                    'shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                    isSelected
                      ? 'bg-[#264653] dark:bg-amber-500 text-white dark:text-stone-900 shadow-sm'
                      : 'bg-[#fcfbf9] dark:bg-[#264653] text-stone-600 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 border border-[#e6e2d6] dark:border-white/10'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Unit Selector Strip / Dropdown for easy switching */}
          <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="unit-select" className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-white/60 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Birim / Fakülte Seçimi:</span>
              </label>
              <span className="text-xs text-stone-400 dark:text-white/40">
                Bu kategoride {filteredUnits.length} birim listeleniyor
              </span>
            </div>

            <CustomSelectPicker
              title="Birim veya Fakülte Seçimi"
              options={directoryUnitOptions}
              value={selectedUnitId}
              onChange={(unitId) => handleUnitSelect(unitId)}
              placeholder={`-- Lütfen Birim veya Fakülte Seçiniz (${filteredUnits.length} Birim) --`}
              clearable={!!selectedUnitId}
              onClear={() => handleUnitSelect('')}
            />

            {/* Quick Chips & Reset Selection */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
              <span className="text-[11px] text-stone-400 dark:text-white/40 shrink-0">Hızlı Seç:</span>
              {selectedUnitId && (
                <button
                  type="button"
                  onClick={() => setSelectedUnitId('')}
                  className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Seçimi Temizle</span>
                </button>
              )}
              {filteredUnits.slice(0, 7).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUnitId(u.id)}
                  className={cn(
                    'shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border',
                    selectedUnitId === u.id
                      ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold shadow-2xs'
                      : 'bg-white dark:bg-white/5 text-stone-600 dark:text-white/70 border-stone-200 dark:border-white/10 hover:border-amber-400'
                  )}
                >
                  {u.name.replace(' Fakültesi', '').replace('Kilisli Muallim Rıfat ', '').replace(' Daire Başkanlığı', '')}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE UNIT CONTENT (Departments / Sections & Contacts) */}
          {activeUnit ? (
            <div className="space-y-4">
              {/* Unit Header Card */}
              <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/20">
                        {activeUnit.category === 'fakulte' ? 'Fakülte' : activeUnit.category === 'idari' ? 'İdari Birim' : 'Akademik Birim'}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-white/40">
                        {activeUnit.sections.length} Bölüm / Birim
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-stone-900 dark:text-white">
                      {activeUnit.name}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-white/60 mt-0.5">
                      Toplam <strong>{activeUnit.sections.reduce((acc, s) => acc + s.contacts.length, 0)}</strong> personelin güncel iletişim ve dahili telefon bilgileri.
                    </p>
                  </div>

                  {/* Actions for active unit */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedUnitId('')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 text-xs font-semibold transition-all cursor-pointer border border-amber-500/30 flex items-center gap-1.5"
                      title="Birim listesine geri dön"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Birim Değiştir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleAll(expandedSectionIds.size !== activeUnit.sections.length)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all cursor-pointer border border-stone-200 dark:border-white/10"
                    >
                      {expandedSectionIds.size === activeUnit.sections.length ? 'Tümünü Kapat' : 'Tüm Bölümleri Aç'}
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncUnit}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer disabled:opacity-50"
                      title="Resmi web sitesinden canlı doğrula"
                    >
                      <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                      <span>{isSyncing ? 'Senkron...' : 'Canlı Doğrula'}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-departments Navigation Quick Jump Pills */}
                {activeUnit.sections.length > 1 && (
                  <div className="pt-2 border-t border-stone-100 dark:border-white/5 space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-400 dark:text-white/40 uppercase tracking-wider block">
                      Bölümler / Alt Birimler:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {activeUnit.sections.map((sec) => {
                        const isExpanded = expandedSectionIds.has(sec.id);
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => {
                              toggleSection(sec.id);
                              // Smooth scroll to section element if needed
                              const el = document.getElementById(sec.id);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border',
                              isExpanded
                                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30 font-bold'
                                : 'bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-white/70 border-stone-200/80 dark:border-white/10 hover:border-amber-300'
                            )}
                          >
                            <span>{sec.title}</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-white/60 dark:bg-white/10 text-[10px] text-stone-500 dark:text-white/60">
                              {sec.contacts.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTIONS LIST (ACCORDION CARDS) */}
              <div className="space-y-3">
                {activeUnit.sections.map((section) => {
                  const isExpanded = expandedSectionIds.has(section.id);
                  return (
                    <div
                      key={section.id}
                      id={section.id}
                      className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl overflow-hidden shadow-xs transition-all"
                    >
                      {/* Section Header */}
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-stone-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center transition-transform',
                            isExpanded ? 'bg-amber-500 text-white scale-105' : 'bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-white/60'
                          )}>
                            <School className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                              <span>{section.title}</span>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                                {section.contacts.length} Personel
                              </span>
                            </h4>
                            <p className="text-xs text-stone-400 dark:text-white/40">
                              {section.fullHeader}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-stone-400">
                          <span className="text-xs font-semibold hidden sm:inline text-stone-400 dark:text-white/40">
                            {isExpanded ? 'Kapat' : 'Genişlet'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-amber-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>

                      {/* Section Content: Personnel Cards Grid */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-stone-100 dark:border-white/10 bg-stone-50/50 dark:bg-black/10 p-4 sm:p-5"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {section.contacts.map((contact) => (
                                <div
                                  key={contact.id}
                                  className="bg-white dark:bg-[#1d3540] border border-stone-200 dark:border-white/10 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3"
                                >
                                  {/* Info */}
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <h5 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                          {contact.title && (
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-white/10">
                                              {contact.title}
                                            </span>
                                          )}
                                          <span>{contact.name}</span>
                                        </h5>
                                        {contact.role && (
                                          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                                            {contact.role}
                                          </p>
                                        )}
                                      </div>

                                      {/* Extension Badge */}
                                      {contact.extension && (
                                        <div className="shrink-0 flex flex-col items-end">
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-xs font-extrabold font-mono">
                                            Dahili: {contact.extension}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Direct Details */}
                                    <div className="space-y-1 text-xs pt-1 border-t border-stone-100 dark:border-white/5">
                                      <div className="flex items-center justify-between text-stone-600 dark:text-white/70">
                                        <span className="text-stone-400 dark:text-white/40">Santral / Tel:</span>
                                        <span className="font-medium font-mono">{contact.phone}</span>
                                      </div>

                                      {contact.email && (
                                        <div className="flex items-center justify-between text-stone-600 dark:text-white/70">
                                          <span className="text-stone-400 dark:text-white/40">E-Posta:</span>
                                          <a
                                            href={`mailto:${contact.email}`}
                                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                                          >
                                            {contact.email}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Quick Action Buttons */}
                                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-white/10 text-xs">
                                    {contact.phone && (
                                      <a
                                        href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors text-[11px] active:scale-95 shadow-2xs"
                                        title="Telefonu ara"
                                      >
                                        <Phone className="w-3 h-3 fill-current" />
                                        <span>Ara</span>
                                      </a>
                                    )}

                                    {contact.extension && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(contact.extension!, 'Dahili', contact.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 font-medium transition-colors text-[11px] cursor-pointer"
                                        title="Dahili numarayı kopyala"
                                      >
                                        {copiedId === contact.id ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-500" />
                                            <span className="text-emerald-600 font-bold">Kopyalandı</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>Dahili Kopyala</span>
                                          </>
                                        )}
                                      </button>
                                    )}

                                    {contact.email && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(contact.email!, 'E-posta', `mail-${contact.id}`)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 font-medium transition-colors text-[11px] cursor-pointer ml-auto"
                                        title="E-posta adresini kopyala"
                                      >
                                        {copiedId === `mail-${contact.id}` ? (
                                          <Check className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                          <Mail className="w-3 h-3" />
                                        )}
                                        <span className="hidden sm:inline">E-Posta</span>
                                      </button>
                                    )}

                                    {contact.profileUrl && (
                                      <a
                                        href={contact.profileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => openExternalUrl(contact.profileUrl!, e)}
                                        className="p-1.5 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 transition-colors"
                                        title="CV / Profil Bilgisi"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                  </div>
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
            </div>
          ) : (
            <div className="space-y-4">
              {/* Informative Guidance Banner */}
              <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-5 sm:p-6 text-center space-y-2.5 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900 dark:text-white">
                  Lütfen Birim veya Fakülte Seçiniz
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-white/60 max-w-lg mx-auto">
                  İletişim, dekanlık, daire başkanlığı ve dahili telefon numaralarını görüntülemek için aşağıdaki listeden ilgilendiğiniz birimi seçiniz.
                </p>
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 pt-1">
                  Seçili Kategoride {filteredUnits.length} Birim Bulunuyor
                </div>
              </div>

              {/* Responsive Cards Grid for All Units in Current Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredUnits.map((u) => {
                  const totalContacts = u.sections.reduce((acc, s) => acc + s.contacts.length, 0);
                  const isFaculty = u.category === 'fakulte';
                  const isIdari = u.category === 'idari';
                  const IconComponent = isFaculty ? GraduationCap : isIdari ? Landmark : School;

                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setSelectedUnitId(u.id);
                        window.scrollTo({ top: 320, behavior: 'smooth' });
                      }}
                      className="group bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-500/60 rounded-2xl p-4.5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 text-left relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                            {isFaculty ? 'Fakülte' : isIdari ? 'İdari Daire' : 'Akademik'}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                            {u.name}
                          </h4>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-white/60">
                          <span>{u.sections.length} Bölüm</span>
                          <span>&bull;</span>
                          <span>{totalContacts} Personel</span>
                        </div>

                        <span className="text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Rehberi Aç &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
