import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
 * Robust date parser converting any date string (DD.MM.YYYY, YYYY-MM-DD, ISO, "30 Eylül 2026")
 * into a comparable epoch millisecond timestamp.
 */
export function parseDateToTimestamp(dateStr?: string | null): number {
  if (!dateStr) return 0;
  const str = dateStr.trim();
  if (!str) return 0;

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

  // 4. Format with Turkish month name: "30 Eylül 2026" or "2 Ekim 2026"
  const trMatch = str.match(/^(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/i);
  if (trMatch) {
    const day = parseInt(trMatch[1], 10);
    const rawMonth = trMatch[2].toLowerCase();
    const cleanMonth = rawMonth
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    const month = TURKISH_MONTHS[cleanMonth] ?? TURKISH_MONTHS[rawMonth] ?? 0;
    const year = parseInt(trMatch[3], 10);
    const hour = trMatch[4] ? parseInt(trMatch[4], 10) : 12;
    const min = trMatch[5] ? parseInt(trMatch[5], 10) : 0;
    return new Date(year, month, day, hour, min).getTime();
  }

  const parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
}
