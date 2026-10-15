/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FontThemeId = 'jakarta' | 'inter' | 'outfit' | 'lexend' | 'urbanist';

export interface FontTheme {
  id: FontThemeId;
  name: string;
  familyLabel: string;
  description: string;
  fontSans: string;
  fontDisplay: string;
  badge?: string;
  previewSample: string;
}

export const FONT_THEMES: FontTheme[] = [
  {
    id: 'jakarta',
    name: 'Modern Kampüs',
    familyLabel: 'Plus Jakarta Sans & Outfit',
    description: 'Ferah, dengeli ve çağdaş üniversite mobil görünümü.',
    fontSans: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontDisplay: '"Outfit", "Plus Jakarta Sans", "Inter", sans-serif',
    badge: 'Varsayılan',
    previewSample: 'Kilis 7 Aralık Üniversitesi 2026'
  },
  {
    id: 'inter',
    name: 'Akademik & Net',
    familyLabel: 'Inter',
    description: 'Yüksek okunabilirlik, klasik kurumsal tipografi ve pürüzsüz netlik.',
    fontSans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontDisplay: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    badge: 'Kurumsal',
    previewSample: 'Mühendislik-Mimarlık Fakültesi D-204'
  },
  {
    id: 'outfit',
    name: 'Geometrik & Ferah',
    familyLabel: 'Outfit',
    description: 'Yumuşak kavisli, yuvarlak hatlı ve canlı mobil uygulama hissiyatı.',
    fontSans: '"Outfit", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    fontDisplay: '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
    badge: 'Yumuşak Hatlı',
    previewSample: 'Günün Yemek Menüsü & Ders Programı'
  },
  {
    id: 'lexend',
    name: 'Akıcı Okuma',
    familyLabel: 'Lexend',
    description: 'Gözü dinlendiren harf aralıkları, hızlı okuma ve üstün erişilebilirlik.',
    fontSans: '"Lexend", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    fontDisplay: '"Lexend", "Outfit", sans-serif',
    badge: 'Erişilebilir',
    previewSample: 'Duyurular, Haberler ve Kampüs Servisleri'
  },
  {
    id: 'urbanist',
    name: 'Dinamik & Şık',
    familyLabel: 'Urbanist',
    description: 'Modernist, temiz ve estetik minimalist tasarım çizgisi.',
    fontSans: '"Urbanist", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    fontDisplay: '"Urbanist", "Outfit", sans-serif',
    badge: 'Minimalist',
    previewSample: 'K7AÜ Dijital Kampüs Bilgi Sistemi'
  }
];

const STORAGE_KEY = 'k7_app_font_theme';
export const FONT_CHANGED_EVENT = 'k7_font_changed';

export function getStoredFontTheme(): FontThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && FONT_THEMES.some((f) => f.id === saved)) {
      return saved as FontThemeId;
    }
  } catch (err) {
    console.warn('Font storage read error:', err);
  }
  return 'jakarta';
}

export function applyFontTheme(fontId: FontThemeId): void {
  const theme = FONT_THEMES.find((f) => f.id === fontId) || FONT_THEMES[0];
  try {
    localStorage.setItem(STORAGE_KEY, fontId);
    
    // Set CSS root custom variables
    document.documentElement.style.setProperty('--font-sans', theme.fontSans);
    document.documentElement.style.setProperty('--font-display', theme.fontDisplay);
    document.body.style.fontFamily = theme.fontSans;

    // Dispatch global event so components can update if needed
    window.dispatchEvent(new CustomEvent(FONT_CHANGED_EVENT, { detail: { fontId } }));
  } catch (err) {
    console.warn('Font apply error:', err);
  }
}
