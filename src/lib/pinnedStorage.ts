export interface PinnedUnit {
  facultyId: string;
  facultyName: string;
  departmentId?: string; // empty or 'all' if faculty-wide
  departmentName?: string;
  isOnlyFaculty: boolean;
  pinnedAt: number;
}

export interface FavoriteFeedItem {
  id: string;
  title: string;
  date: string;
  category?: string;
  type: 'news' | 'announcement';
  url?: string;
  content?: string;
  imageUrl?: string;
  sourceUrl?: string;
  facultyName?: string;
  departmentName?: string;
  favoritedAt: number;
}

const PINNED_UNIT_STORAGE_KEY = 'k7_pinned_unit_v2';
const FAVORITES_STORAGE_KEY = 'k7_favorite_feed_items_v2';

export const PINNED_EVENT_NAME = 'k7_pinned_unit_changed';
export const FAVORITES_EVENT_NAME = 'k7_favorites_changed';

export function getPinnedUnit(): PinnedUnit | null {
  try {
    const raw = localStorage.getItem(PINNED_UNIT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading pinned unit:', err);
    return null;
  }
}

export function setPinnedUnit(unit: Omit<PinnedUnit, 'pinnedAt'>): void {
  try {
    const payload: PinnedUnit = {
      ...unit,
      pinnedAt: Date.now()
    };
    localStorage.setItem(PINNED_UNIT_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(PINNED_EVENT_NAME, { detail: payload }));
  } catch (err) {
    console.error('Error saving pinned unit:', err);
  }
}

export function removePinnedUnit(): void {
  try {
    localStorage.removeItem(PINNED_UNIT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PINNED_EVENT_NAME, { detail: null }));
  } catch (err) {
    console.error('Error removing pinned unit:', err);
  }
}

export function isUnitPinned(facultyId: string, departmentId?: string): boolean {
  const current = getPinnedUnit();
  if (!current) return false;
  if (current.facultyId !== facultyId) return false;
  if (!departmentId || departmentId === 'all') {
    return current.isOnlyFaculty || !current.departmentId || current.departmentId === 'all';
  }
  return current.departmentId === departmentId;
}

export function getFavoriteFeedItems(): FavoriteFeedItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading favorites:', err);
    return [];
  }
}

export function isFeedItemFavorited(id: string): boolean {
  const items = getFavoriteFeedItems();
  return items.some((item) => item.id === id);
}

export function toggleFavoriteFeedItem(
  item: Omit<FavoriteFeedItem, 'favoritedAt'>
): boolean {
  try {
    const current = getFavoriteFeedItems();
    const existingIndex = current.findIndex((i) => i.id === item.id);
    let next: FavoriteFeedItem[];
    let isNowFavorited = false;

    if (existingIndex >= 0) {
      next = current.filter((i) => i.id !== item.id);
      isNowFavorited = false;
    } else {
      next = [
        {
          ...item,
          favoritedAt: Date.now()
        },
        ...current
      ];
      isNowFavorited = true;
    }

    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT_NAME, { detail: next }));
    return isNowFavorited;
  } catch (err) {
    console.error('Error toggling favorite:', err);
    return false;
  }
}
