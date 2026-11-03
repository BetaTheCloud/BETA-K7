/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Dynamic Font Theme Synchronization for PDF Export
 * Supports all application font themes with 100% Turkish Unicode character coverage:
 * - jakarta: Heading: Outfit, Body: Plus Jakarta Sans
 * - inter: Heading: Inter, Body: Inter
 * - outfit: Heading: Outfit, Body: Outfit
 * - lexend: Heading: Lexend, Body: Lexend
 * - urbanist: Heading: Urbanist, Body: Urbanist
 * - fallback: LiberationSans
 */

import { getStoredFontTheme, FontThemeId } from './fontStorage';
import {
  PLUS_JAKARTA_SANS_TTF_BASE64,
  PLUS_JAKARTA_SANS_REGULAR_BASE64,
  PLUS_JAKARTA_SANS_BOLD_BASE64,
  OUTFIT_TTF_BASE64,
  OUTFIT_REGULAR_TTF_BASE64,
  OUTFIT_BOLD_TTF_BASE64,
  INTER_TTF_BASE64,
  INTER_BOLD_TTF_BASE64,
  LEXEND_TTF_BASE64,
  LEXEND_BOLD_TTF_BASE64,
  URBANIST_TTF_BASE64,
  URBANIST_BOLD_TTF_BASE64,
  LIBERATION_SANS_REGULAR_BASE64,
  LIBERATION_SANS_BOLD_BASE64
} from './customPdfFonts';

export {
  LIBERATION_SANS_REGULAR_BASE64,
  LIBERATION_SANS_BOLD_BASE64,
  OUTFIT_BOLD_TTF_BASE64,
  OUTFIT_REGULAR_TTF_BASE64,
  PLUS_JAKARTA_SANS_BOLD_BASE64,
  PLUS_JAKARTA_SANS_REGULAR_BASE64
};

export interface PdfFontThemeConfig {
  id: FontThemeId;
  name: string;
  headingFont: string;
  bodyFont: string;
  description: string;
}

export const PDF_FALLBACK_FONT = 'LiberationSans';

export const PDF_FONT_THEME_MAP: Record<FontThemeId, PdfFontThemeConfig> = {
  jakarta: {
    id: 'jakarta',
    name: 'Modern Kampüs',
    headingFont: 'Outfit',
    bodyFont: 'PlusJakartaSans',
    description: 'Başlıklar Outfit (Bold), gövde metinleri Plus Jakarta Sans.'
  },
  inter: {
    id: 'inter',
    name: 'Akademik & Net',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    description: 'Tüm başlık ve metinler Inter.'
  },
  outfit: {
    id: 'outfit',
    name: 'Geometrik & Ferah',
    headingFont: 'Outfit',
    bodyFont: 'Outfit',
    description: 'Tüm başlık ve metinler Outfit.'
  },
  lexend: {
    id: 'lexend',
    name: 'Akıcı Okuma',
    headingFont: 'Lexend',
    bodyFont: 'Lexend',
    description: 'Tüm başlık ve metinler Lexend.'
  },
  urbanist: {
    id: 'urbanist',
    name: 'Dinamik & Şık',
    headingFont: 'Urbanist',
    bodyFont: 'Urbanist',
    description: 'Tüm başlık ve metinler Urbanist.'
  }
};

// Backward compatibility constants
export const PDF_HEADING_FONT = 'Outfit';
export const PDF_BODY_FONT = 'PlusJakartaSans';

/**
 * Registers font files into jsPDF Virtual File System (VFS).
 * Only embeds the active theme's font files plus the lightweight fallback,
 * ensuring fast generation and minimal PDF document file size.
 */
export function registerTurkishFonts(doc: any, themeId?: FontThemeId): PdfFontThemeConfig {
  const activeId = themeId || getStoredFontTheme() || 'jakarta';
  const config = PDF_FONT_THEME_MAP[activeId] || PDF_FONT_THEME_MAP.jakarta;

  // Stash configuration in document instance for typography styling functions
  doc.__activePdfFontConfig = config;

  try {
    // 1. LiberationSans base universal fallback
    if (LIBERATION_SANS_REGULAR_BASE64) {
      doc.addFileToVFS('LiberationSans-Regular.ttf', LIBERATION_SANS_REGULAR_BASE64);
      doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');
    }
    if (LIBERATION_SANS_BOLD_BASE64) {
      doc.addFileToVFS('LiberationSans-Bold.ttf', LIBERATION_SANS_BOLD_BASE64);
      doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');
    }

    // 2. Register required font(s) for the active theme (both Regular and true Bold weights)
    const requiredFonts = new Set<string>([config.headingFont, config.bodyFont]);

    if (requiredFonts.has('Outfit')) {
      if (OUTFIT_REGULAR_TTF_BASE64) {
        doc.addFileToVFS('Outfit-Regular.ttf', OUTFIT_REGULAR_TTF_BASE64);
        doc.addFont('Outfit-Regular.ttf', 'Outfit', 'normal');
      }
      if (OUTFIT_BOLD_TTF_BASE64) {
        doc.addFileToVFS('Outfit-Bold.ttf', OUTFIT_BOLD_TTF_BASE64);
        doc.addFont('Outfit-Bold.ttf', 'Outfit', 'bold');
      } else if (OUTFIT_TTF_BASE64) {
        doc.addFileToVFS('Outfit.ttf', OUTFIT_TTF_BASE64);
        doc.addFont('Outfit.ttf', 'Outfit', 'bold');
      }
    }

    if (requiredFonts.has('PlusJakartaSans')) {
      if (PLUS_JAKARTA_SANS_REGULAR_BASE64) {
        doc.addFileToVFS('PlusJakartaSans-Regular.ttf', PLUS_JAKARTA_SANS_REGULAR_BASE64);
        doc.addFont('PlusJakartaSans-Regular.ttf', 'PlusJakartaSans', 'normal');
      }
      if (PLUS_JAKARTA_SANS_BOLD_BASE64) {
        doc.addFileToVFS('PlusJakartaSans-Bold.ttf', PLUS_JAKARTA_SANS_BOLD_BASE64);
        doc.addFont('PlusJakartaSans-Bold.ttf', 'PlusJakartaSans', 'bold');
      } else if (PLUS_JAKARTA_SANS_TTF_BASE64) {
        doc.addFileToVFS('PlusJakartaSans.ttf', PLUS_JAKARTA_SANS_TTF_BASE64);
        doc.addFont('PlusJakartaSans.ttf', 'PlusJakartaSans', 'bold');
      }
    }

    if (requiredFonts.has('Inter')) {
      if (INTER_TTF_BASE64) {
        doc.addFileToVFS('Inter-Regular.ttf', INTER_TTF_BASE64);
        doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
      }
      if (INTER_BOLD_TTF_BASE64) {
        doc.addFileToVFS('Inter-Bold.ttf', INTER_BOLD_TTF_BASE64);
        doc.addFont('Inter-Bold.ttf', 'Inter', 'bold');
      }
    }

    if (requiredFonts.has('Lexend')) {
      if (LEXEND_TTF_BASE64) {
        doc.addFileToVFS('Lexend-Regular.ttf', LEXEND_TTF_BASE64);
        doc.addFont('Lexend-Regular.ttf', 'Lexend', 'normal');
      }
      if (LEXEND_BOLD_TTF_BASE64) {
        doc.addFileToVFS('Lexend-Bold.ttf', LEXEND_BOLD_TTF_BASE64);
        doc.addFont('Lexend-Bold.ttf', 'Lexend', 'bold');
      }
    }

    if (requiredFonts.has('Urbanist')) {
      if (URBANIST_TTF_BASE64) {
        doc.addFileToVFS('Urbanist-Regular.ttf', URBANIST_TTF_BASE64);
        doc.addFont('Urbanist-Regular.ttf', 'Urbanist', 'normal');
      }
      if (URBANIST_BOLD_TTF_BASE64) {
        doc.addFileToVFS('Urbanist-Bold.ttf', URBANIST_BOLD_TTF_BASE64);
        doc.addFont('Urbanist-Bold.ttf', 'Urbanist', 'bold');
      }
    }

    // Set default base font to active theme body font
    try {
      doc.setFont(config.bodyFont, 'normal');
    } catch {
      doc.setFont(PDF_FALLBACK_FONT, 'normal');
    }
  } catch (err) {
    console.warn('Could not register custom Turkish fonts in jsPDF:', err);
    try {
      doc.setFont(PDF_FALLBACK_FONT, 'normal');
    } catch {
      // standard fallback
    }
  }

  return config;
}

/**
 * Safely applies typography role: headingFont for headings/banners, bodyFont for body/badges/notes.
 * Automatically synchronizes with the active application font theme.
 * Headings default to bold for prominent, punchy contrast.
 */
export function setPdfTypography(
  doc: any,
  role: 'heading' | 'body',
  style: 'normal' | 'bold' = 'normal',
  themeId?: FontThemeId
): void {
  const config: PdfFontThemeConfig =
    (themeId ? PDF_FONT_THEME_MAP[themeId] : null) ||
    doc.__activePdfFontConfig ||
    PDF_FONT_THEME_MAP[getStoredFontTheme()] ||
    PDF_FONT_THEME_MAP.jakarta;

  const targetFont = role === 'heading' ? config.headingFont : config.bodyFont;
  // Headings default to bold weight for crisp, clear visual hierarchy and high-contrast typography
  const targetStyle = role === 'heading' && style === 'normal' ? 'bold' : style;

  try {
    doc.setFont(targetFont, targetStyle);
  } catch {
    try {
      doc.setFont(targetFont, 'normal');
    } catch {
      try {
        doc.setFont(PDF_FALLBACK_FONT, targetStyle);
      } catch {
        // standard fallback
      }
    }
  }
}

