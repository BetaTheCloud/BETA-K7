import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deduplicates doubled/repeated titles and cleans trailing noise.
 * Fixes titles that have been concatenated twice by CMS or scrapers (e.g., "Başlık Başlık" or "BaşlıkBaşlık").
 */
export function cleanDuplicateTitle(raw?: string | null): string {
  if (!raw) return '';
  let s = raw.trim().replace(/\s+/g, ' ');

  // 1. Remove trailing dates first so date suffix doesn't prevent title deduplication
  s = s.replace(/\s*\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4}\s*$/i, '').trim();
  s = s.replace(/\s*\d{1,2}[./-]\d{1,2}[./-]\d{4}\s*$/i, '').trim();

  // 2. Remove delimiter-separated duplicate: e.g. "Başlık - Başlık" or "Başlık | Başlık"
  const separators = [' - ', ' – ', ' — ', ' | ', ' / ', ' : ', ' • '];
  for (const sep of separators) {
    if (s.includes(sep)) {
      const parts = s.split(sep);
      if (parts.length === 2 && parts[0].trim().toLowerCase() === parts[1].trim().toLowerCase()) {
        s = parts[0].trim();
        break;
      }
    }
  }

  // 3. Remove exact word-sequence duplicate: e.g. "Bahar Şenliği Programı Bahar Şenliği Programı"
  const words = s.split(' ');
  if (words.length >= 2) {
    const halfWords = Math.floor(words.length / 2);
    for (let h = halfWords; h >= 1; h--) {
      if (h * 2 === words.length) {
        const part1 = words.slice(0, h).join(' ').trim().toLowerCase();
        const part2 = words.slice(h, h * 2).join(' ').trim().toLowerCase();
        if (part1 && part1 === part2) {
          s = words.slice(0, h).join(' ');
          break;
        }
      }
    }
  }

  // 4. Remove exact duplicate without spaces: e.g. "ABCABC"
  const len = s.length;
  if (len >= 6 && len % 2 === 0) {
    const half = len / 2;
    if (s.slice(0, half).toLowerCase() === s.slice(half).toLowerCase()) {
      s = s.slice(0, half).trim();
    }
  }

  return s;
}

const TURKISH_MONTHS: Record<string, number> = {
  ocak: 0, oca: 0,
  subat: 1, şubat: 1, sub: 1, şub: 1,
  mart: 2, mar: 2,
  nisan: 3, nis: 3,
  mayis: 4, mayıs: 4, may: 4,
  haziran: 5, haz: 5,
  temmuz: 6, tem: 6,
  agustos: 7, ağustos: 7, agu: 7, ağu: 7,
  eylul: 8, eylül: 8, eyl: 8,
  ekim: 9, eki: 9,
  kasim: 10, kasım: 10, kas: 10,
  aralik: 11, aralık: 11, ara: 11,
};

/**
 * Robust date parser converting any date string (DD.MM.YYYY, YYYY-MM-DD, ISO, "30 Eylül 2026", "07 Ekim")
 * into a comparable epoch millisecond timestamp.
 */
export function parseDateToTimestamp(dateStr?: string | null): number {
  if (!dateStr) return 0;
  const str = dateStr.trim();
  if (!str) return 0;

  // 'Güncel' means freshly published or live, treat as recent
  if (str.toLowerCase() === 'güncel' || str.toLowerCase() === 'guncel') {
    return Date.now() - 3600000;
  }

  // 1. ISO format with 'T' (e.g. 2026-10-04T12:00:00Z)
  if (str.includes('T')) {
    const t = Date.parse(str);
    if (!isNaN(t)) return t;
  }

  // 2. Format: DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY (e.g. '30.09.2026' or '01.10.2026 14:00')
  const dmyMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 12;
    const min = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    return new Date(year, month, day, hour, min).getTime();
  }

  // 3. Format: YYYY-MM-DD or YYYY.MM.DD
  const ymdMatch = str.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}))?/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const hour = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 12;
    const min = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
    return new Date(year, month, day, hour, min).getTime();
  }

  // 4. Format with Turkish month name and year: "30 Eylül 2026" or "2 Ekim 2026"
  const trWithYear = str.match(/^(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/i);
  if (trWithYear) {
    const day = parseInt(trWithYear[1], 10);
    const rawMonth = trWithYear[2].toLowerCase();
    const cleanMonth = rawMonth
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    const month = TURKISH_MONTHS[cleanMonth] ?? TURKISH_MONTHS[rawMonth] ?? 0;
    const year = parseInt(trWithYear[3], 10);
    const hour = trWithYear[4] ? parseInt(trWithYear[4], 10) : 12;
    const min = trWithYear[5] ? parseInt(trWithYear[5], 10) : 0;
    return new Date(year, month, day, hour, min).getTime();
  }

  // 5. Format with Turkish month WITHOUT year: "07 Ekim", "6 Ekim", "27 Eylül" -> defaults to 2026
  const trNoYear = str.match(/^(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)/i);
  if (trNoYear) {
    const day = parseInt(trNoYear[1], 10);
    const rawMonth = trNoYear[2].toLowerCase();
    const cleanMonth = rawMonth
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    const month = TURKISH_MONTHS[cleanMonth] ?? TURKISH_MONTHS[rawMonth];
    if (month !== undefined) {
      const year = 2026;
      return new Date(year, month, day, 12, 0).getTime();
    }
  }

  const parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Cleans messy scraped feed headlines:
 * - Strips leading category badges ('HABER', 'DUYURU')
 * - Strips trailing attached dates ('... 01.10.2026')
 * - Detects repeated phrases/sentences (where headline was printed repeatedly)
 * - Collapses repeated n-grams and removes appended excerpt snippets
 */
export function cleanFeedTitle(rawTitle?: string | null): string {
  if (!rawTitle) return '';
  let str = rawTitle.replace(/\s+/g, ' ').trim();

  // 1. Remove leading category badges
  str = str.replace(/^(HABER|DUYURU|Haber|Duyuru|ETKİNLİK|Etkinlik)\s*[:\-–—]?\s*/i, '');

  // 2. Remove trailing attached dates like ' 01.10.2026' or ' 30.09.2026'
  str = str.replace(/\s+\d{1,2}[./-]\d{1,2}[./-]\d{4}\s*$/, '');

  // 3. Handle cases where snippet had ' ... ' followed by repeating full title
  const ellIndex = str.indexOf(' ... ');
  if (ellIndex > 8) {
    const beforeEll = str.slice(0, ellIndex).trim();
    const afterEll = str.slice(ellIndex + 5).trim();
    const beforeWords = beforeEll.split(' ');
    if (beforeWords.length >= 2) {
      const matchPrefix = beforeWords.slice(0, 2).join(' ').toLowerCase();
      if (afterEll.toLowerCase().startsWith(matchPrefix)) {
        str = afterEll;
      }
    }
  }

  // 4. Word repetition: check if initial sequence of N words repeats immediately (N >= 3)
  const words = str.split(' ');
  for (let n = 3; n <= Math.floor(words.length / 2); n++) {
    const chunk1 = words.slice(0, n).join(' ').toLowerCase();
    const chunk2 = words.slice(n, 2 * n).join(' ').toLowerCase();
    if (chunk1 === chunk2) {
      str = words.slice(0, n).join(' ').trim();
      break;
    }
  }

  // 5. Character substring repetition (e.g. 'Abc Def Abc Def')
  const half = Math.floor(str.length / 2);
  for (let len = 10; len <= half; len++) {
    const sub1 = str.slice(0, len).trim().toLowerCase();
    const sub2 = str.slice(len, 2 * len).trim().toLowerCase();
    if (sub1 === sub2 && sub1.length >= 10) {
      str = str.slice(0, len).trim();
      break;
    }
  }

  // 6. Strip excerpt if appended after title with rector / official credentials
  const profMatch = str.match(/(.*?)\s+(Rektörümüz\s+Prof\.\s+Dr\..*)/i);
  if (profMatch && profMatch[1].trim().length > 15) {
    str = profMatch[1].trim();
  }

  // 7. Clean trailing ellipses, dashes or whitespace
  str = str.replace(/\s*[\-–—\.]*\.{2,}\s*$/, '').trim();
  return str;
}

/**
 * Normalizes date string:
 * - If date was empty or 'Güncel' but title had a date, extracts it
 * - Appends year '2026' if date was '07 Ekim'
 */
export function normalizeFeedDate(rawDate?: string | null, title?: string | null): string {
  let date = (rawDate || '').trim();
  if ((!date || date.toLowerCase() === 'güncel') && title) {
    const dMatch = title.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{4})/);
    if (dMatch) date = dMatch[1];
  }
  if (!date || date.toLowerCase() === 'güncel') {
    date = '07 Ekim 2026';
  }
  // Append 2026 if missing year: e.g. '07 Ekim' -> '07 Ekim 2026'
  if (date.match(/^\d{1,2}\s+[a-zA-ZçğıöşüÇĞİÖŞÜ]+$/)) {
    date = `${date} 2026`;
  }
  return date;
}

/**
 * Normalizes feed item attributes
 */
export function normalizeFeedItem<T extends { id?: string; title?: string; url?: string; date?: string; content?: string; category?: string }>(item: T): T | null {
  if (!item || !item.title) return null;
  const cleanTitle = cleanFeedTitle(item.title);
  if (!cleanTitle || cleanTitle.length < 3) return null;
  const normDate = normalizeFeedDate(item.date, item.title);
  return {
    ...item,
    title: cleanTitle,
    date: normDate
  };
}

/**
 * Deduplicates and sorts feed items by clean headline title and real chronological date.
 * Guarantees no repeating headlines and newest items appear on top.
 */
export function deduplicateFeedList<T extends { id?: string; title?: string; url?: string; date?: string; content?: string; category?: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  const seenTitles = new Set<string>();
  const result: T[] = [];

  for (const rawItem of items) {
    const item = normalizeFeedItem(rawItem);
    if (!item || !item.title) continue;

    // Simplified comparison key: lowercase alphanumeric only
    const key = item.title.toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, '');
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    result.push(item);
  }

  // Sort descending: newest dates first
  result.sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));
  return result;
}

export interface GenericMenuItem {
  id?: string;
  date: string;
  mainDish: string;
  sideDish: string;
  soup: string;
  dessertOrFruit: string;
  calories?: number;
}

export interface TodayMenuInfo<T extends GenericMenuItem> {
  menu: T | null;
  isToday: boolean;
  isWeekend: boolean;
  badgeLabel: string;
}

/**
 * Finds the exact menu item corresponding to today's date, or the closest upcoming serving day.
 */
export function findTodayMenu<T extends GenericMenuItem>(menuList: T[]): T | null {
  const info = getTodayMenuInfo(menuList);
  return info.menu;
}

export function getTodayMenuInfo<T extends GenericMenuItem>(menuList: T[]): TodayMenuInfo<T> {
  if (!menuList || menuList.length === 0) {
    return { menu: null, isToday: false, isWeekend: false, badgeLabel: 'Menü Bulunamadı' };
  }
  const today = new Date();
  const dayNum = today.getDate();
  const monthIdx = today.getMonth();
  const year = today.getFullYear();
  const dayOfWeek = today.getDay(); // 0 = Pazar, 6 = Cumartesi
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const weekdayName = today.toLocaleDateString('tr-TR', { weekday: 'long' }).toLowerCase();
  const fullTr = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase();
  const monthNameKey = Object.keys(TURKISH_MONTHS).find(k => TURKISH_MONTHS[k] === monthIdx) || '';
  const dayMonthTr = `${dayNum} ${monthNameKey}`;
  const padDay = String(dayNum).padStart(2, '0');
  const padMonth = String(monthIdx + 1).padStart(2, '0');
  const dotDate1 = `${padDay}.${padMonth}.${year}`;
  const dotDate2 = `${dayNum}.${monthIdx + 1}.${year}`;
  const dotShort = `${padDay}.${padMonth}`;

  // 1. Direct exact date match in date string (today)
  let exactMatch = menuList.find(item => {
    const d = (item.date || '').toLowerCase();
    return d.includes(fullTr) || d.includes(dotDate1) || d.includes(dotDate2) || d.includes(dotShort) || (monthNameKey && d.includes(dayMonthTr));
  });

  // 2. Match by Day number + Month name / number
  if (!exactMatch) {
    exactMatch = menuList.find(item => {
      const parts = (item.date || '').toLowerCase().split(/[\s./-]+/);
      if (parts.length >= 2) {
        const itemDay = parseInt(parts[0], 10);
        const itemMonth = parts[1];
        if (!isNaN(itemDay) && itemDay === dayNum) {
          if (TURKISH_MONTHS[itemMonth] === monthIdx || parseInt(itemMonth, 10) === (monthIdx + 1)) {
            return true;
          }
        }
      }
      return false;
    });
  }

  if (exactMatch) {
    return {
      menu: exactMatch,
      isToday: true,
      isWeekend: false,
      badgeLabel: 'Günün Menüsü'
    };
  }

  // 3. If no exact match (e.g. weekend or holiday), find the closest upcoming serving day
  const todayTime = new Date(year, monthIdx, dayNum).getTime();
  let upcomingMatch: T | null = null;
  let minDiff = Infinity;

  for (const item of menuList) {
    const parts = (item.date || '').toLowerCase().split(/[\s./-]+/);
    if (parts.length >= 2) {
      const itemDay = parseInt(parts[0], 10);
      const itemMonth = parts[1];
      const mIdx = TURKISH_MONTHS[itemMonth] ?? (parseInt(itemMonth, 10) - 1);
      if (!isNaN(itemDay) && mIdx !== undefined && !isNaN(mIdx)) {
        const itemTime = new Date(year, mIdx, itemDay).getTime();
        const diff = itemTime - todayTime;
        if (diff >= 0 && diff < minDiff) {
          minDiff = diff;
          upcomingMatch = item;
        }
      }
    }
  }

  if (upcomingMatch) {
    return {
      menu: upcomingMatch,
      isToday: false,
      isWeekend,
      badgeLabel: isWeekend ? 'Hafta Sonu (Sıradaki Menü)' : 'Sıradaki Menü'
    };
  }

  // 4. Weekday index fallback (1=Mon..5=Fri)
  if (dayOfWeek >= 1 && dayOfWeek <= 5 && menuList[dayOfWeek - 1]) {
    return {
      menu: menuList[dayOfWeek - 1],
      isToday: false,
      isWeekend: false,
      badgeLabel: 'Menü'
    };
  }

  return {
    menu: menuList[0] || null,
    isToday: false,
    isWeekend,
    badgeLabel: 'Menü'
  };
}
