export interface FeedFavoriteItem {
  id: string;
  type: 'news' | 'announcement';
  title: string;
  date: string;
  url: string;
  category?: string;
  content?: string;
  imageUrl?: string;
  departmentName?: string;
  facultyName?: string;
  savedAt: number;
}

const STORAGE_KEY = 'k7_saved_feed_items';

export function getFavoriteItems(): FeedFavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse favorites:', e);
    return [];
  }
}

export function isFavoriteItem(id: string): boolean {
  if (!id) return false;
  const list = getFavoriteItems();
  return list.some(item => item.id === id);
}

export function toggleFavoriteItem(item: Omit<FeedFavoriteItem, 'savedAt'>): boolean {
  if (!item || !item.id) return false;
  const list = getFavoriteItems();
  const existsIndex = list.findIndex(x => x.id === item.id);
  let isNowFavorite = false;

  if (existsIndex >= 0) {
    list.splice(existsIndex, 1);
    isNowFavorite = false;
  } else {
    list.unshift({
      ...item,
      savedAt: Date.now()
    });
    isNowFavorite = true;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('k7_favorites_updated', { detail: { id: item.id, isFavorite: isNowFavorite } }));
  } catch (e) {
    console.warn('Failed to save favorites:', e);
  }

  return isNowFavorite;
}
