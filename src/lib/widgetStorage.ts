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
    id: 'news',
    title: 'Üniversite & Bölüm Haberleri',
    shortDesc: 'Rektörlük ve fakülte güncel haber akışı',
    iconName: 'Newspaper',
    category: 'sosyal',
    visible: true,
    order: 3
  },
  {
    id: 'announcements',
    title: 'Duyurular & Bildirimler',
    shortDesc: 'Öğrenci işleri, burs ve idari duyurular',
    iconName: 'Megaphone',
    category: 'akademik',
    visible: true,
    order: 4
  },
  {
    id: 'events',
    title: 'Kampüs Etkinlikleri',
    shortDesc: 'Kültür, sanat, sempozyum ve konferans takvimi',
    iconName: 'CalendarDays',
    category: 'sosyal',
    visible: true,
    order: 5
  },
  {
    id: 'student_schedule',
    title: 'Günün Ders & Sınav Programı',
    shortDesc: 'Kişisel ders programınız, derslik, saat, hoca ve yaklaşan sınavlar',
    iconName: 'GraduationCap',
    category: 'akademik',
    visible: true,
    order: 6,
    badge: 'Kişisel Ajanda'
  },
  {
    id: 'academic_highlight',
    title: 'Akademik Takvim Özeti',
    shortDesc: 'Yaklaşan sınavlar, vize-final haftaları ve tatil günleri',
    iconName: 'GraduationCap',
    category: 'akademik',
    visible: true,
    order: 7,
    badge: 'Takvim'
  },
  {
    id: 'menu',
    title: 'Günün Yemek Menüsü',
    shortDesc: 'Öğrenci ve personel yemekhanesi 4 kap yemek ve kalori bilgisi',
    iconName: 'ChefHat',
    category: 'sosyal',
    visible: false,
    order: 8,
    badge: 'Günlük Menü'
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

const STORAGE_KEY = 'k7_home_widgets_v5';
const PREV_STORAGE_KEY = 'k7_home_widgets_v4';
export const WIDGETS_CHANGED_EVENT = 'k7_home_widgets_changed';

export function getHomeWidgetConfigs(): WidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGET_CONFIGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WIDGET_CONFIGS;

    const parsed: Partial<WidgetConfig>[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_WIDGET_CONFIGS;

    const defaultMap = new Map<WidgetId, WidgetConfig>();
    DEFAULT_WIDGET_CONFIGS.forEach((d) => defaultMap.set(d.id, d));

    // If items have explicit numeric order, sort by it; otherwise retain array sequence
    const sortedParsed = [...parsed];
    const hasOrderFields = sortedParsed.some((p) => typeof p.order === 'number');
    if (hasOrderFields) {
      sortedParsed.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999;
        const orderB = typeof b.order === 'number' ? b.order : 999;
        return orderA - orderB;
      });
    }

    const seenIds = new Set<WidgetId>();
    const result: WidgetConfig[] = [];

    // Reconstruct list in the exact saved sequence with full metadata
    for (const item of sortedParsed) {
      if (!item.id || !defaultMap.has(item.id as WidgetId)) continue;
      const widgetId = item.id as WidgetId;
      if (seenIds.has(widgetId)) continue;
      seenIds.add(widgetId);

      const defaultDef = defaultMap.get(widgetId)!;
      result.push({
        ...defaultDef,
        visible: typeof item.visible === 'boolean' ? item.visible : defaultDef.visible,
        order: result.length
      });
    }

    // Append any default widgets not yet present in saved data
    for (const defaultItem of DEFAULT_WIDGET_CONFIGS) {
      if (!seenIds.has(defaultItem.id)) {
        result.push({
          ...defaultItem,
          order: result.length
        });
      }
    }

    return result;
  } catch (err) {
    console.warn('Widget ayarları okunurken hata, varsayılana dönülüyor:', err);
    return DEFAULT_WIDGET_CONFIGS;
  }
}

export function saveHomeWidgetConfigs(configs: WidgetConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Re-index order seamlessly
    const ordered = configs.map((c, i) => ({ ...c, order: i }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordered));
    // Remove older storage versions to prevent legacy fallback pollution
    try {
      localStorage.removeItem(PREV_STORAGE_KEY);
      localStorage.removeItem('k7_home_widgets_v3');
      localStorage.removeItem('k7_home_widgets_v2');
      localStorage.removeItem('k7_home_widgets_v1');
      localStorage.removeItem('k7_home_widgets');
    } catch {}
    window.dispatchEvent(new CustomEvent(WIDGETS_CHANGED_EVENT, { detail: ordered }));
  } catch (err) {
    console.error('Widget ayarları kaydedilemedi:', err);
  }
}

export function resetHomeWidgetConfigs(): WidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGET_CONFIGS;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREV_STORAGE_KEY);
    localStorage.removeItem('k7_home_widgets_v3');
    localStorage.removeItem('k7_home_widgets_v2');
    localStorage.removeItem('k7_home_widgets_v1');
    localStorage.removeItem('k7_home_widgets');
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

export function moveVisibleWidget(
  configs: WidgetConfig[],
  id: WidgetId,
  direction: 'up' | 'down'
): WidgetConfig[] {
  const visible = configs.filter((c) => c.visible);
  const visIndex = visible.findIndex((c) => c.id === id);
  if (visIndex === -1) return configs;

  const targetVisIndex = direction === 'up' ? visIndex - 1 : visIndex + 1;
  if (targetVisIndex < 0 || targetVisIndex >= visible.length) return configs;

  const targetId = visible[targetVisIndex].id;

  const idxA = configs.findIndex((c) => c.id === id);
  const idxB = configs.findIndex((c) => c.id === targetId);
  if (idxA === -1 || idxB === -1) return configs;

  const newConfigs = [...configs];
  const temp = newConfigs[idxA];
  newConfigs[idxA] = newConfigs[idxB];
  newConfigs[idxB] = temp;

  return newConfigs.map((c, i) => ({ ...c, order: i }));
}

export function toggleWidgetVisibility(configs: WidgetConfig[], id: WidgetId): WidgetConfig[] {
  return configs.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c));
}
