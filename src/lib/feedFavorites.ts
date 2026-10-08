/**
 * Feed Favorites Management
 * Allows bookmarking announcements, news and campus items
 */

export const FAVORITES_STORAGE_KEY = 'k7_feed_favorites';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  if (!id) return false;
  const favs = getFavorites();
  return favs.includes(id);
}

export function toggleFavorite(id: string): boolean {
  if (typeof window === 'undefined' || !id) return false;
  try {
    const favs = getFavorites();
    let updated: string[];
    let isNowFav: boolean;
    if (favs.includes(id)) {
      updated = favs.filter(item => item !== id);
      isNowFav = false;
    } else {
      updated = [...favs, id];
      isNowFav = true;
    }
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('k7_favorites_changed', { detail: { id, isFavorite: isNowFav } }));
    return isNowFav;
  } catch {
    return false;
  }
}

export function clearFavorites(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('k7_favorites_changed', { detail: { cleared: true } }));
  } catch {}
}

export default {
  getFavorites,
  isFavorite,
  toggleFavorite,
  clearFavorites
};
