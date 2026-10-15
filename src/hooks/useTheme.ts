/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'k7au' | 'minimal' | 'heritage';

export interface ThemePaletteInfo {
  id: ThemePalette;
  name: string;
  tagline: string;
  badge: string;
  accentColor: string;
  previewBgLight: string;
  previewBgDark: string;
}

export const THEME_PALETTES: ThemePaletteInfo[] = [
  {
    id: 'k7au',
    name: 'K7AÜ Prestij',
    tagline: 'Kilis 7 Aralık Üniversitesi Kurumsal (Bordo & Gece Mavisi)',
    badge: 'Kurumsal',
    accentColor: '#991b1b', // rose-800
    previewBgLight: '#f8fafc',
    previewBgDark: '#0b132b'
  },
  {
    id: 'minimal',
    name: 'Modern Minimalist',
    tagline: 'Apple & Vercel Estetiği (Saf Siyah & Nötr Zinc)',
    badge: 'Minimal',
    accentColor: '#18181b', // zinc-900
    previewBgLight: '#ffffff',
    previewBgDark: '#09090b'
  },
  {
    id: 'heritage',
    name: 'Petrol & Sıcak Taş',
    tagline: 'Orijinal Kampüs Dokusu (Sıcak Bej & Petrol Yeşili)',
    badge: 'Klasik',
    accentColor: '#d97706', // amber-600
    previewBgLight: '#f4f1ea',
    previewBgDark: '#1d3540'
  }
];

const THEME_MODE_STORAGE_KEY = 'k7_theme_mode';
const THEME_PALETTE_STORAGE_KEY = 'k7_theme_palette';
export const THEME_CHANGED_EVENT = 'k7_theme_changed';

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY) || localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialPalette(): ThemePalette {
  if (typeof window === 'undefined') return 'k7au';
  const saved = localStorage.getItem(THEME_PALETTE_STORAGE_KEY);
  if (saved === 'k7au' || saved === 'minimal' || saved === 'heritage') return saved;
  return 'k7au'; // Default to K7AÜ Prestij
}

function applyThemeToDocument(mode: ThemeMode, palette: ThemePalette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Clear existing classes
  root.classList.remove('light', 'dark', 'palette-k7au', 'palette-minimal', 'palette-heritage');

  // Add updated classes
  root.classList.add(mode);
  root.classList.add(`palette-${palette}`);

  // Set data attributes for css selector convenience
  root.setAttribute('data-theme-mode', mode);
  root.setAttribute('data-theme-palette', palette);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialMode);
  const [palette, setPaletteState] = useState<ThemePalette>(getInitialPalette);

  // Apply to DOM & persist
  useEffect(() => {
    applyThemeToDocument(theme, palette);
    localStorage.setItem(THEME_MODE_STORAGE_KEY, theme);
    localStorage.setItem('theme', theme); // backward compatibility
    localStorage.setItem(THEME_PALETTE_STORAGE_KEY, palette);

    window.dispatchEvent(
      new CustomEvent(THEME_CHANGED_EVENT, {
        detail: { mode: theme, palette }
      })
    );
  }, [theme, palette]);

  // Listen for changes from other components/windows
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail) {
        if (e.detail.mode && (e.detail.mode === 'light' || e.detail.mode === 'dark')) {
          setThemeState(e.detail.mode);
        }
        if (e.detail.palette && ['k7au', 'minimal', 'heritage'].includes(e.detail.palette)) {
          setPaletteState(e.detail.palette);
        }
      }
    };
    window.addEventListener(THEME_CHANGED_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, handleThemeChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const setPalette = useCallback((p: ThemePalette) => {
    setPaletteState(p);
  }, []);

  return {
    theme,
    palette,
    toggleTheme,
    setTheme,
    setPalette,
    palettes: THEME_PALETTES
  };
}
