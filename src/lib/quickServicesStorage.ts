/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Hızlı Kampüs Servisleri Depolama & Widget Yönetimi
 */

export type QuickServiceId =
  | 'schedule'
  | 'staff'
  | 'events'
  | 'map'
  | 'sports'
  | 'menu'
  | 'forms'
  | 'library'
  | 'transport'
  | 'hotel'
  | 'bologna'
  | 'calendar'
  | 'phonebook';

export interface QuickServiceConfig {
  id: QuickServiceId;
  title: string;
  subtitle: string;
  iconName: string;
  to: string;
  isModal?: boolean;
  colorName: 'amber' | 'emerald' | 'rose' | 'red' | 'green' | 'orange' | 'indigo' | 'blue' | 'cyan' | 'purple' | 'teal';
  visible: boolean;
  order: number;
}

export const DEFAULT_QUICK_SERVICES: QuickServiceConfig[] = [
  {
    id: 'schedule',
    title: 'Derslerim',
    subtitle: 'Ajandam',
    iconName: 'GraduationCap',
    to: '',
    isModal: true,
    colorName: 'amber',
    visible: true,
    order: 0
  },
  {
    id: 'staff',
    title: 'Personel',
    subtitle: 'Akademik Kadro',
    iconName: 'Users',
    to: '/directory',
    colorName: 'emerald',
    visible: true,
    order: 1
  },
  {
    id: 'events',
    title: 'Etkinlikler',
    subtitle: 'Kültür & Sanat',
    iconName: 'Calendar',
    to: '/campus?tab=events',
    colorName: 'rose',
    visible: true,
    order: 2
  },
  {
    id: 'map',
    title: 'Harita',
    subtitle: 'Yerleşkeler',
    iconName: 'MapPin',
    to: '/campus?tab=map',
    colorName: 'red',
    visible: true,
    order: 3
  },
  {
    id: 'sports',
    title: 'Spor',
    subtitle: 'Tesisler',
    iconName: 'Trophy',
    to: '/campus?tab=sports',
    colorName: 'green',
    visible: true,
    order: 4
  },
  {
    id: 'menu',
    title: 'Yemekhane',
    subtitle: 'Günün Menüsü',
    iconName: 'ChefHat',
    to: '/menu',
    colorName: 'amber',
    visible: true,
    order: 5
  },
  {
    id: 'forms',
    title: 'Dilekçeler',
    subtitle: 'Matbu Form',
    iconName: 'FileText',
    to: '/campus?tab=forms',
    colorName: 'orange',
    visible: true,
    order: 6
  },
  {
    id: 'library',
    title: 'Kütüphane',
    subtitle: 'Kitap & Saatler',
    iconName: 'BookOpen',
    to: '/campus?tab=library',
    colorName: 'indigo',
    visible: true,
    order: 7
  },
  // Extra customizable campus shortcuts that users can turn on:
  {
    id: 'transport',
    title: 'Ulaşım',
    subtitle: 'Otobüs & Dolmuş',
    iconName: 'Bus',
    to: '/campus?tab=transport',
    colorName: 'blue',
    visible: false,
    order: 8
  },
  {
    id: 'hotel',
    title: 'Uygulama Oteli',
    subtitle: 'Konukevi',
    iconName: 'Hotel',
    to: '/campus?tab=hotel',
    colorName: 'cyan',
    visible: false,
    order: 9
  },
  {
    id: 'bologna',
    title: 'Bologna',
    subtitle: 'Ders Planları',
    iconName: 'Landmark',
    to: '/bologna',
    colorName: 'purple',
    visible: false,
    order: 10
  },
  {
    id: 'calendar',
    title: 'Akademik Takvim',
    subtitle: 'Sınav & Tatil',
    iconName: 'CalendarClock',
    to: '/calendar',
    colorName: 'teal',
    visible: false,
    order: 11
  },
  {
    id: 'phonebook',
    title: 'Telefon Rehberi',
    subtitle: 'Santral & Dahili',
    iconName: 'PhoneCall',
    to: '/campus?tab=phonebook',
    colorName: 'amber',
    visible: false,
    order: 12
  }
];

const STORAGE_KEY = 'k7_quick_services_v3';
export const QUICK_SERVICES_CHANGED_EVENT = 'k7_quick_services_changed';

export function getQuickServicesConfigs(): QuickServiceConfig[] {
  if (typeof window === 'undefined') return DEFAULT_QUICK_SERVICES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_QUICK_SERVICES;

    const parsed: Partial<QuickServiceConfig>[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_QUICK_SERVICES;

    const defaultMap = new Map<QuickServiceId, QuickServiceConfig>();
    DEFAULT_QUICK_SERVICES.forEach((d) => defaultMap.set(d.id, d));

    const result: QuickServiceConfig[] = [];
    const seenIds = new Set<QuickServiceId>();

    parsed.forEach((item, index) => {
      if (item && item.id && defaultMap.has(item.id)) {
        const def = defaultMap.get(item.id)!;
        seenIds.add(item.id);
        result.push({
          ...def,
          ...item,
          title: def.title,
          subtitle: def.subtitle,
          iconName: def.iconName,
          to: def.to,
          isModal: def.isModal,
          colorName: def.colorName,
          order: typeof item.order === 'number' ? item.order : index,
          visible: typeof item.visible === 'boolean' ? item.visible : def.visible
        });
      }
    });

    // Append any newly added default items that were missing
    DEFAULT_QUICK_SERVICES.forEach((def) => {
      if (!seenIds.has(def.id)) {
        result.push({
          ...def,
          order: result.length
        });
      }
    });

    result.sort((a, b) => a.order - b.order);
    return result;
  } catch (err) {
    console.warn('Quick services parse error, using default:', err);
    return DEFAULT_QUICK_SERVICES;
  }
}

export function saveQuickServicesConfigs(configs: QuickServiceConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = configs.map((c, idx) => ({
      id: c.id,
      visible: c.visible,
      order: idx
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(QUICK_SERVICES_CHANGED_EVENT, { detail: configs }));
  } catch (e) {
    console.warn('Could not save quick services configs:', e);
  }
}

export function moveQuickService(
  configs: QuickServiceConfig[],
  id: QuickServiceId,
  direction: 'up' | 'down'
): QuickServiceConfig[] {
  const index = configs.findIndex((c) => c.id === id);
  if (index === -1) return configs;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= configs.length) return configs;

  const updated = [...configs];
  const [removed] = updated.splice(index, 1);
  updated.splice(targetIndex, 0, removed);

  return updated.map((item, idx) => ({ ...item, order: idx }));
}

export function toggleQuickServiceVisibility(
  configs: QuickServiceConfig[],
  id: QuickServiceId
): QuickServiceConfig[] {
  return configs.map((c) => {
    if (c.id === id) {
      return { ...c, visible: !c.visible };
    }
    return c;
  });
}

export function resetQuickServicesConfigs(): QuickServiceConfig[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(QUICK_SERVICES_CHANGED_EVENT, { detail: DEFAULT_QUICK_SERVICES }));
    } catch {}
  }
  return DEFAULT_QUICK_SERVICES;
}
