/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WidgetId =
  | 'hero_weather'
  | 'search_bar'
  | 'quick_services'
  | 'menu'
  | 'student_schedule'
  | 'announcements'
  | 'news'
  | 'events'
  | 'academic_highlight'
  | 'campus_emergency';

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  shortDesc: string;
  iconName: string;
  category: 'temel' | 'akademik' | 'sosyal' | 'kampus';
  visible: boolean;
  order: number;
  badge?: string;
}

export const DEFAULT_WIDGET_CONFIGS: WidgetConfig[] = [
  {
    id: 'hero_weather',
    title: 'Hava Durumu & Kampüs Başlığı',
    shortDesc: 'MGM Kilis İstasyonu canlı hava durumu, sıcaklık ve dinamik arka plan',
    iconName: 'CloudSun',
    category: 'temel',
    visible: true,
    order: 0,
    badge: 'MGM Canlı'
  },
  {
    id: 'search_bar',
    title: 'Hızlı Arama Çubuğu',
    shortDesc: 'Duyurular, haberler ve etkinlikler içinde anlık arama',
    iconName: 'Search',
    category: 'temel',
    visible: true,
    order: 1
  },
  {
    id: 'quick_services',
    title: 'Hızlı Kampüs Servisleri',
    shortDesc: 'Personel, Kütüphane, Spor, Dilekçe ve Yemekhane hızlı butonları',
    iconName: 'LayoutGrid',
    category: 'kampus',
    visible: true,
    order: 2,
    badge: '8 Kısayol'
  },
  {
    id: 'menu',
    title: 'Günün Yemek Menüsü',
    shortDesc: 'Öğrenci ve personel yemekhanesi 4 kap yemek ve kalori bilgisi',
    iconName: 'ChefHat',
    category: 'sosyal',
    visible: true,
    order: 3,
    badge: 'Günlük Menü'
  },
  {
    id: 'student_schedule',
    title: 'Günün Ders & Sınav Programı',
    shortDesc: 'Kişisel ders programınız, derslik, saat, hoca ve yaklaşan sınavlar',
    iconName: 'GraduationCap',
    category: 'akademik',
    visible: true,
    order: 4,
    badge: 'Kişisel Ajanda'
  },
  {
    id: 'news',
    title: 'Üniversite & Bölüm Haberleri',
    shortDesc: 'Rektörlük ve fakülte güncel haber akışı',
    iconName: 'Newspaper',
    category: 'sosyal',
    visible: true,
    order: 5
  },
  {
    id: 'announcements',
    title: 'Duyurular & Bildirimler',
    shortDesc: 'Öğrenci işleri, burs ve idari duyurular',
    iconName: 'Megaphone',
    category: 'akademik',
    visible: true,
    order: 6
  },
  {
    id: 'events',
    title: 'Kampüs Etkinlikleri',
    shortDesc: 'Kültür, sanat, sempozyum ve konferans takvimi',
    iconName: 'CalendarDays',
    category: 'sosyal',
    visible: true,
    order: 7
  },
  {
    id: 'academic_highlight',
    title: 'Akademik Takvim Özeti',
    shortDesc: 'Yaklaşan sınavlar, vize-final haftaları ve tatil günleri',
    iconName: 'GraduationCap',
    category: 'akademik',
    visible: true,
    order: 8,
    badge: 'Yeni'
  },
  {
    id: 'campus_emergency',
    title: 'Kampüs Acil & Danışma Hattı',
    shortDesc: 'Güvenlik, Sağlık Merkezi ve Öğrenci İşleri tek tıkla arama',
    iconName: 'PhoneCall',
    category: 'kampus',
    visible: false,
    order: 9,
    badge: 'Acil'
  }
];

const STORAGE_KEY = 'k7_home_widgets_v3';
const PREV_STORAGE_KEY = 'k7_home_widgets_v2';
export const WIDGETS_CHANGED_EVENT = 'k7_home_widgets_changed';

export function getHomeWidgetConfigs(): WidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGET_CONFIGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(PREV_STORAGE_KEY);
    if (!raw) return DEFAULT_WIDGET_CONFIGS;

    const parsed: Partial<WidgetConfig>[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_WIDGET_CONFIGS;

    // Merge with defaults to ensure any new widgets added in updates are included
    const configMap = new Map<WidgetId, Partial<WidgetConfig>>();
    parsed.forEach((item) => {
      if (item.id) configMap.set(item.id as WidgetId, item);
    });

    const merged: WidgetConfig[] = DEFAULT_WIDGET_CONFIGS.map((defaultItem) => {
      const saved = configMap.get(defaultItem.id);
      if (!saved) return defaultItem;
      return {
        ...defaultItem,
        visible: typeof saved.visible === 'boolean' ? saved.visible : defaultItem.visible,
        order: typeof saved.order === 'number' ? saved.order : defaultItem.order
      };
    });

    // Sort by order ascending
    merged.sort((a, b) => a.order - b.order);

    // Re-index order seamlessly [0, 1, 2, ...]
    return merged.map((item, index) => ({ ...item, order: index }));
  } catch (err) {
    console.warn('Widget ayarları okunurken hata, varsayılana dönülüyor:', err);
    return DEFAULT_WIDGET_CONFIGS;
  }
}

export function saveHomeWidgetConfigs(configs: WidgetConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Re-index order
    const ordered = configs.map((c, i) => ({ ...c, order: i }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordered));
    window.dispatchEvent(new CustomEvent(WIDGETS_CHANGED_EVENT, { detail: ordered }));
  } catch (err) {
    console.error('Widget ayarları kaydedilemedi:', err);
  }
}

export function resetHomeWidgetConfigs(): WidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGET_CONFIGS;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(WIDGETS_CHANGED_EVENT, { detail: DEFAULT_WIDGET_CONFIGS }));
  } catch (err) {
    console.error('Widget ayarları sıfırlanamadı:', err);
  }
  return DEFAULT_WIDGET_CONFIGS;
}

export function moveWidget(configs: WidgetConfig[], id: WidgetId, direction: 'up' | 'down'): WidgetConfig[] {
  const index = configs.findIndex((c) => c.id === id);
  if (index === -1) return configs;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= configs.length) return configs;

  const newConfigs = [...configs];
  const [removed] = newConfigs.splice(index, 1);
  newConfigs.splice(targetIndex, 0, removed);

  return newConfigs.map((c, i) => ({ ...c, order: i }));
}

export function toggleWidgetVisibility(configs: WidgetConfig[], id: WidgetId): WidgetConfig[] {
  return configs.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c));
}
