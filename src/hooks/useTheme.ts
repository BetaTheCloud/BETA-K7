/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi Tema & Renk Paleti Yönetimi
 */

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'k7au' | 'heritage' | 'sapphire' | 'amber' | 'minimal';

export interface ThemePaletteColors {
  primary: string;       // Ana marka rengi
  primaryHover: string;  // Vurgu hover
  secondary: string;     // İkincil kurumsal renk
  accent: string;        // Parlak vurgu
  gradient: string;      // Kurumsal degrade
  badgeBg: string;       // Rozet arka planı
  badgeText: string;     // Rozet yazı rengi
  ringColor: string;     // Seçim halkası rengi
  darkBg: string;        // Koyu mod sayfa arka planı
  darkCard: string;      // Koyu mod kart arka planı
  lightBg: string;       // Açık mod sayfa arka planı
  lightCard: string;     // Açık mod kart arka planı
}

export interface ThemePaletteInfo {
  id: ThemePalette;
  name: string;
  tagline: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  previewBgLight: string;
  previewBgDark: string;
  colorSwatches: string[];
  colors: ThemePaletteColors;
}

export const THEME_PALETTES: ThemePaletteInfo[] = [
  {
    id: 'k7au',
    name: 'K7AÜ Logo Kurumsal',
    tagline: 'Resmi K7AÜ Logo Renkleri: Kurumsal Bordo (#8A2A43) & Koyu Füme/Slate (#363D50)',
    badge: 'Resmi Logo',
    primaryColor: '#8a2a43',
    secondaryColor: '#363d50',
    accentColor: '#8a2a43',
    previewBgLight: '#f6f7f9',
    previewBgDark: '#1e2330',
    colorSwatches: ['#8a2a43', '#363d50', '#a83856', '#262b39'],
    colors: {
      primary: '#8a2a43',
      primaryHover: '#732236',
      secondary: '#363d50',
      accent: '#8a2a43',
      gradient: 'linear-gradient(135deg, #8a2a43 0%, #363d50 100%)',
      badgeBg: 'rgba(138, 42, 67, 0.15)',
      badgeText: '#8a2a43',
      ringColor: 'rgba(138, 42, 67, 0.35)',
      darkBg: '#1a1f2b',
      darkCard: '#262d3d',
      lightBg: '#f6f7f9',
      lightCard: '#ffffff'
    }
  },
  {
    id: 'heritage',
    name: 'Klasik Kampüs',
    tagline: 'Kilis\'in Zeytin Yeşili, Petrol Mavisi & Sıcak Taş Dokusu',
    badge: 'Kampüs',
    primaryColor: '#264653',
    secondaryColor: '#2a9d8f',
    accentColor: '#e9c46a',
    previewBgLight: '#fcfbf9',
    previewBgDark: '#172930',
    colorSwatches: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261'],
    colors: {
      primary: '#264653',
      primaryHover: '#1d3540',
      secondary: '#2a9d8f',
      accent: '#e9c46a',
      gradient: 'linear-gradient(135deg, #264653 0%, #2a9d8f 100%)',
      badgeBg: 'rgba(42, 157, 143, 0.15)',
      badgeText: '#2a9d8f',
      ringColor: 'rgba(38, 70, 83, 0.35)',
      darkBg: '#172930',
      darkCard: '#203640',
      lightBg: '#fcfbf9',
      lightCard: '#ffffff'
    }
  },
  {
    id: 'sapphire',
    name: 'Gece Safiri',
    tagline: 'Derin Üniversite Laciverti & Kristal Safir Işıltısı',
    badge: 'Akademik',
    primaryColor: '#1e3a8a',
    secondaryColor: '#0f172a',
    accentColor: '#3b82f6',
    previewBgLight: '#f8fafc',
    previewBgDark: '#0b1222',
    colorSwatches: ['#1e3a8a', '#3b82f6', '#0f172a', '#60a5fa'],
    colors: {
      primary: '#1e3a8a',
      primaryHover: '#172554',
      secondary: '#0f172a',
      accent: '#3b82f6',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      badgeBg: 'rgba(59, 130, 246, 0.15)',
      badgeText: '#2563eb',
      ringColor: 'rgba(30, 58, 138, 0.35)',
      darkBg: '#0b1222',
      darkCard: '#131d35',
      lightBg: '#f8fafc',
      lightCard: '#ffffff'
    }
  },
  {
    id: 'amber',
    name: 'Güneş & Kehribar',
    tagline: 'Sıcak Mezopotamya Güneşi, Bal Sarısı & Canlı Enerji',
    badge: 'Dinamik',
    primaryColor: '#b45309',
    secondaryColor: '#1c1917',
    accentColor: '#f59e0b',
    previewBgLight: '#fffdfa',
    previewBgDark: '#17130e',
    colorSwatches: ['#b45309', '#f59e0b', '#78350f', '#fde68a'],
    colors: {
      primary: '#b45309',
      primaryHover: '#92400e',
      secondary: '#1c1917',
      accent: '#f59e0b',
      gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeText: '#b45309',
      ringColor: 'rgba(180, 83, 9, 0.35)',
      darkBg: '#17130e',
      darkCard: '#241d15',
      lightBg: '#fffdfa',
      lightCard: '#ffffff'
    }
  },
  {
    id: 'minimal',
    name: 'Modern Minimalist',
    tagline: 'Apple & Vercel Saf Nötr Titanyum & Grafit Estetiği',
    badge: 'Minimal',
    primaryColor: '#18181b',
    secondaryColor: '#27272a',
    accentColor: '#71717a',
    previewBgLight: '#ffffff',
    previewBgDark: '#09090b',
    colorSwatches: ['#09090b', '#18181b', '#71717a', '#e4e4e7'],
    colors: {
      primary: '#18181b',
      primaryHover: '#09090b',
      secondary: '#27272a',
      accent: '#71717a',
      gradient: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)',
      badgeBg: 'rgba(113, 113, 122, 0.15)',
      badgeText: '#3f3f46',
      ringColor: 'rgba(24, 24, 27, 0.35)',
      darkBg: '#09090b',
      darkCard: '#18181b',
      lightBg: '#ffffff',
      lightCard: '#ffffff'
    }
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
  if (typeof window === 'undefined') return 'heritage';
  const saved = localStorage.getItem(THEME_PALETTE_STORAGE_KEY) as ThemePalette;
  if (THEME_PALETTES.some((p) => p.id === saved)) return saved;
  return 'heritage'; // Varsayılan Klasik Kampüs
}

export function applyThemeToDocument(mode: ThemeMode, palette: ThemePalette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Clear existing palette & mode classes
  root.classList.remove('light', 'dark', 'palette-k7au', 'palette-heritage', 'palette-sapphire', 'palette-amber', 'palette-minimal');

  // Add updated classes
  root.classList.add(mode);
  root.classList.add(`palette-${palette}`);

  // Set data attributes
  root.setAttribute('data-theme-mode', mode);
  root.setAttribute('data-theme-palette', palette);

  // Inject CSS Custom Properties for live styling
  const pInfo = THEME_PALETTES.find((p) => p.id === palette) || THEME_PALETTES[0];
  root.style.setProperty('--brand-primary', pInfo.colors.primary);
  root.style.setProperty('--brand-primary-hover', pInfo.colors.primaryHover);
  root.style.setProperty('--brand-secondary', pInfo.colors.secondary);
  root.style.setProperty('--brand-accent', pInfo.colors.accent);
  root.style.setProperty('--brand-gradient', pInfo.colors.gradient);
  root.style.setProperty('--brand-badge-bg', pInfo.colors.badgeBg);
  root.style.setProperty('--brand-badge-text', pInfo.colors.badgeText);
  root.style.setProperty('--brand-ring', pInfo.colors.ringColor);

  const isDark = mode === 'dark';
  const surfaceBg = isDark ? pInfo.colors.darkBg : pInfo.colors.lightBg;
  const cardBg = isDark ? pInfo.colors.darkCard : pInfo.colors.lightCard;
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.09)' : '#e2e8f0';

  root.style.setProperty('--brand-surface-bg', surfaceBg);
  root.style.setProperty('--brand-card-bg', cardBg);
  root.style.setProperty('--app-bg', surfaceBg);
  root.style.setProperty('--app-card', cardBg);
  root.style.setProperty('--app-border', borderColor);
  root.style.setProperty('--app-header-bg', isDark ? `${cardBg}f0` : `${cardBg}f5`);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialMode);
  const [palette, setPaletteState] = useState<ThemePalette>(getInitialPalette);

  // Apply to DOM & persist
  useEffect(() => {
    applyThemeToDocument(theme, palette);
    localStorage.setItem(THEME_MODE_STORAGE_KEY, theme);
    localStorage.setItem('theme', theme);
    localStorage.setItem(THEME_PALETTE_STORAGE_KEY, palette);

    window.dispatchEvent(
      new CustomEvent(THEME_CHANGED_EVENT, {
        detail: { mode: theme, palette }
      })
    );
  }, [theme, palette]);

  // Listen for changes from other components
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail) {
        if (e.detail.mode && (e.detail.mode === 'light' || e.detail.mode === 'dark')) {
          setThemeState(e.detail.mode);
        }
        if (e.detail.palette && THEME_PALETTES.some((p) => p.id === e.detail.palette)) {
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
