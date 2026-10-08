/**
 * Utility for managing pinned department and items in localStorage
 */

const PINNED_DEPT_KEY = 'k7_pinned_department';
const PINNED_ANNOUNCEMENTS_KEY = 'k7_pinned_announcements';
const PINNED_NEWS_KEY = 'k7_pinned_news';

export function getPinnedDepartmentId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(PINNED_DEPT_KEY) || null;
  } catch {
    return null;
  }
}

export function setPinnedDepartmentId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      localStorage.setItem(PINNED_DEPT_KEY, id);
    } else {
      localStorage.removeItem(PINNED_DEPT_KEY);
    }
  } catch (e) {
    console.warn('Failed to set pinned department', e);
  }
}

export function isDepartmentPinned(id: string): boolean {
  return getPinnedDepartmentId() === id;
}

export function togglePinnedDepartment(id: string): boolean {
  const current = getPinnedDepartmentId();
  if (current === id) {
    setPinnedDepartmentId(null);
    return false;
  } else {
    setPinnedDepartmentId(id);
    return true;
  }
}

export function getPinnedAnnouncements(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PINNED_ANNOUNCEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function togglePinnedAnnouncement(id: string): boolean {
  const list = getPinnedAnnouncements();
  const exists = list.includes(id);
  const updated = exists ? list.filter(item => item !== id) : [...list, id];
  try {
    localStorage.setItem(PINNED_ANNOUNCEMENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to toggle pinned announcement', e);
  }
  return !exists;
}

export function isAnnouncementPinned(id: string): boolean {
  return getPinnedAnnouncements().includes(id);
}

export function getPinnedNews(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PINNED_NEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function togglePinnedNews(id: string): boolean {
  const list = getPinnedNews();
  const exists = list.includes(id);
  const updated = exists ? list.filter(item => item !== id) : [...list, id];
  try {
    localStorage.setItem(PINNED_NEWS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to toggle pinned news', e);
  }
  return !exists;
}

export function isNewsPinned(id: string): boolean {
  return getPinnedNews().includes(id);
}
