/**
 * Utility for managing feed item favorites in localStorage
 */

const FAVORITES_KEY = 'k7_feed_favorites';

export interface FavoriteItem {
  id: string;
  title: string;
  category?: string;
  date?: string;
  url?: string;
  type?: 'announcement' | 'news' | 'event';
  timestamp?: number;
}

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().some(item => item.id === id);
}

export function toggleFavorite(item: FavoriteItem): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getFavorites();
    const index = current.findIndex(f => f.id === item.id);
    let updated: FavoriteItem[];
    let added = false;
    if (index >= 0) {
      updated = current.filter(f => f.id !== item.id);
    } else {
      updated = [{ ...item, timestamp: Date.now() }, ...current];
      added = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return added;
  } catch {
    return false;
  }
}
