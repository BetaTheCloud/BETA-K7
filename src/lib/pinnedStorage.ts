/**
 * Pinned Unit Storage & Management
 * Allows students and staff to pin/bookmark their favorite faculty or department
 */

export interface PinnedUnit {
  id: string;
  name: string;
  type?: 'faculty' | 'institute' | 'school' | 'myo' | 'department';
  url?: string;
  shortName?: string;
}

export const PINNED_UNIT_STORAGE_KEY = 'k7_pinned_unit';

/**
 * Returns the currently pinned unit ID or name as a string (or null if none)
 */
export function getPinnedUnit(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PINNED_UNIT_STORAGE_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'string') return parsed;
      return parsed.name || parsed.id || null;
    } catch {
      return stored;
    }
  } catch {
    return null;
  }
}

/**
 * Returns the currently pinned unit as a full PinnedUnit object (or null if none)
 */
export function getPinnedUnitObject(): PinnedUnit | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PINNED_UNIT_STORAGE_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          id: parsed.id || parsed.name || '',
          name: parsed.name || parsed.id || '',
          type: parsed.type,
          url: parsed.url,
          shortName: parsed.shortName
        };
      }
      return { id: String(stored), name: String(stored) };
    } catch {
      return { id: stored, name: stored };
    }
  } catch {
    return null;
  }
}

/**
 * Sets or updates the pinned unit in localStorage
 */
export function setPinnedUnit(unit: string | PinnedUnit | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!unit) {
      localStorage.removeItem(PINNED_UNIT_STORAGE_KEY);
    } else if (typeof unit === 'string') {
      localStorage.setItem(PINNED_UNIT_STORAGE_KEY, unit);
    } else {
      localStorage.setItem(PINNED_UNIT_STORAGE_KEY, JSON.stringify(unit));
    }
    window.dispatchEvent(new CustomEvent('k7_pinned_unit_changed', { detail: unit }));
  } catch (err) {
    console.warn('[PinnedStorage] Failed to save pinned unit:', err);
  }
}

/**
 * Checks if a specific unit is currently pinned
 */
export function isUnitPinned(unitIdOrName: string): boolean {
  if (!unitIdOrName) return false;
  const current = getPinnedUnit();
  if (!current) return false;
  return current.trim().toLowerCase() === unitIdOrName.trim().toLowerCase();
}

/**
 * Removes the currently pinned unit
 */
export function clearPinnedUnit(): void {
  setPinnedUnit(null);
}

export default {
  getPinnedUnit,
  getPinnedUnitObject,
  setPinnedUnit,
  isUnitPinned,
  clearPinnedUnit,
  PINNED_UNIT_STORAGE_KEY
};
