/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { CourseItem, ExamItem, ParsedDocumentResult, DetectedGradeSummary, DayOfWeek, ExamType } from '../types/schedule';

// Configure PDF.js worker fallback for browser Vite environment
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
}

const PALETTE = [
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#e11d48', // Rose
  '#059669', // Emerald
  '#ea580c', // Orange
  '#4f46e5', // Indigo
];

function getRandomColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % PALETTE.length;
  return PALETTE[idx];
}

/**
 * Infer grade from Turkish course code (Bologna convention)
 * e.g. MAT101 -> 1, BLG203 -> 2, BIL305 -> 3, CSE492 -> 4
 */
export function extractGradeFromCourseCode(code: string): number {
  if (!code) return 0;
  // Match course code like MAT101, BLG-201, TDL 101, FIZ 1001, etc.
  const m = code.match(/\b[A-Za-zÇĞİÖŞÜçğıöşü]{2,6}\s*[-_]?\s*([1-4])\d{2,3}\b/);
  if (m) {
    const digit = parseInt(m[1], 10);
    if (digit >= 1 && digit <= 4) return digit;
  }
  return 0;
}

/**
 * Advanced Grade detection from text snippets, table cells, sheet names, or headings.
 * Handles:
 * - Unicode Roman numerals: Ⅰ, Ⅱ, Ⅲ, Ⅳ (U+2160 - U+2163) and ⅰ, ⅱ, ⅲ, ⅳ (U+2170 - U+2173)
 * - ASCII Roman numerals: I, II, III, IV (case-insensitive)
 * - Standalone numbers: "1", "2", "3", "4", "1.", "2.", "3.", "4."
 * - Formats: "1. Sınıf", "1.SINIF", "I. Sınıf", "Ⅰ. Sınıf", "1. Yarıyıl", "3. Yarıyıl", "Sınıf: 2", "Snf: I", "Bölüm Ⅲ"
 * - Words: "Birinci Sınıf", "İkinci Sınıf", "Üçüncü Sınıf", "Dördüncü Sınıf"
 */
let idCounter = 0;
export function generateUniqueId(prefix: string = 'item'): string {
  idCounter++;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Detect Grade from file name (e.g. "1_sinif_program.docx", "Sinif_II.pdf", "Ⅲ.sınıf.xlsx")
 */
export function detectGradeFromFileName(fileName: string): number {
  if (!fileName) return 0;
  const clean = fileName.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[_-]/g, ' ');
  return detectGradeFromText(clean);
}

/**
 * Advanced Grade detection from text snippets, table cells, sheet names, or headings.
 * Handles:
 * - Unicode Roman numerals: Ⅰ, Ⅱ, Ⅲ, Ⅳ (U+2160 - U+2163) and ⅰ, ⅱ, ⅲ, ⅳ (U+2170 - U+2173)
 * - ASCII Roman numerals: I, II, III, IV (case-insensitive)
 * - Standalone numbers: "1", "2", "3", "4", "1.", "2.", "3.", "4."
 * - Isolated numerals: "sadece Ⅰ", "sadece Ⅱ", "sadece Ⅲ", "sadece Ⅳ"
 * - Formats: "1. Sınıf", "1.SINIF", "1. Sınıflar", "I. Sınıf", "Ⅰ. Sınıf", "1. Yarıyıl", "Sınıf: 2", "Snf: I", "Bölüm Ⅲ"
 * - Words: "Birinci Sınıf", "İkinci Sınıf", "Üçüncü Sınıf", "Dördüncü Sınıf"
 */
export function detectGradeFromText(text: string): number {
  if (!text) return 0;
  const raw = text.trim();
  if (!raw) return 0;

  // 1. Direct match for standalone single digit or Roman numeral in cell/header
  // Unicode Roman numerals (e.g. Ⅰ, Ⅱ, Ⅲ, Ⅳ)
  if (/^[Ⅰⅰ]\.?$/.test(raw)) return 1;
  if (/^[Ⅱⅱ]\.?$/.test(raw)) return 2;
  if (/^[Ⅲⅲ]\.?$/.test(raw)) return 3;
  if (/^[Ⅳⅳ]\.?$/.test(raw)) return 4;

  // Exact single digit in a grade cell ("1", "2", "3", "4", "1.", "2.", etc.)
  if (/^[1-4]\.?$/.test(raw)) return parseInt(raw, 10);

  // Standalone ASCII Roman numerals: "I", "II", "III", "IV", "I.", "II.", "III.", "IV."
  if (/^(?:I|i)\.?$/.test(raw)) return 1;
  if (/^(?:II|ii)\.?$/.test(raw)) return 2;
  if (/^(?:III|iii)\.?$/.test(raw)) return 3;
  if (/^(?:IV|iv)\.?$/.test(raw)) return 4;

  // Standalone or bounded Unicode Roman numeral anywhere: e.g. "sadece Ⅰ", "Grup Ⅱ", "Dersler (Ⅲ)"
  const unicodeBounded = raw.match(/(?:^|\b|\s|[(\[\-–—])([ⅠⅡⅢⅣⅰⅱⅲⅳ])\.?(?:$|\b|\s|[)\]\-–.:])/);
  if (unicodeBounded) {
    const ch = unicodeBounded[1];
    if (ch === 'Ⅰ' || ch === 'ⅰ') return 1;
    if (ch === 'Ⅱ' || ch === 'ⅱ') return 2;
    if (ch === 'Ⅲ' || ch === 'ⅲ') return 3;
    if (ch === 'Ⅳ' || ch === 'ⅳ') return 4;
  }

  // Parenthesized: "(1)", "(2)", "(3)", "(4)", "(I)", "(II)", "(III)", "(IV)", "(Ⅰ)", "(Ⅱ)", "(Ⅲ)", "(Ⅳ)"
  const parenMatch = raw.match(/^\s*\(\s*([1-4]|IV|III|II|I|iv|iii|ii|i|[ⅠⅡⅢⅣⅰⅱⅲⅳ])\s*\.?\s*\)\s*$/i);
  if (parenMatch) {
    const p = parenMatch[1];
    if (p === '4' || /^iv$/i.test(p) || p === 'Ⅳ' || p === 'ⅳ') return 4;
    if (p === '3' || /^iii$/i.test(p) || p === 'Ⅲ' || p === 'ⅲ') return 3;
    if (p === '2' || /^ii$/i.test(p) || p === 'Ⅱ' || p === 'ⅱ') return 2;
    if (p === '1' || /^i$/i.test(p) || p === 'Ⅰ' || p === 'ⅰ') return 1;
  }

  // 2. Normalize text: replace Unicode Roman Numerals with their standard numbers first
  let norm = raw
    .replace(/[Ⅰⅰ]/g, ' 1 ')
    .replace(/[Ⅱⅱ]/g, ' 2 ')
    .replace(/[Ⅲⅲ]/g, ' 3 ')
    .replace(/[Ⅳⅳ]/g, ' 4 ')
    .replace(/\s+/g, ' ');

  // Standardize Turkish lowercasing for search
  const lower = norm
    .toLocaleLowerCase('tr')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i');

  // Word-based numbers: "birinci sinif", "ikinci sinif", etc.
  if (/d[öo]rd[üu]nc[üu]\s*s[ıi]n[ıi]f(?:lar)?/i.test(lower)) return 4;
  if (/[üu][çc][üu]nc[üu]\s*s[ıi]n[ıi]f(?:lar)?/i.test(lower)) return 3;
  if (/ikinci\s*s[ıi]n[ıi]f(?:lar)?/i.test(lower)) return 2;
  if (/birinci\s*s[ıi]n[ıi]f(?:lar)?/i.test(lower)) return 1;

  // Roman numerals / digits followed by sınıf/snf (supports plural sınıflar): "IV. Sınıf", "III. Sınıflar", "1.Sınıflar"
  if (/(?:^|\b|\s)(?:iv|4)\s*\.?\s*s[ıi]n[ıi]f(?:lar)?/i.test(lower)) return 4;
  if (/(?:^|\b|\s)(?:iii|3)\s*\.?\s*s[ıi]n[ıi]f(?:lar)?/i.test(lower)) return 3;
  if (/(?:^|\b|\s)(?:ii|2)\s*\.?\s*s[ıi]n[ıi]f(?:lar)?/i.test(lower)) return 2;
  if (/(?:^|\b|\s)(?:i|1)\s*\.?\s*s[ıi]n[ıi]f(?:lar)?/i.test(lower)) return 1;

  // Sınıf label followed by Roman numeral or digit: "Sınıf: IV", "Sınıf: III", "Sınıflar: 2", "Sınıf 1", etc.
  const sinifPostRoman = lower.match(/s[ıi]n[ıi]f(?:lar)?\s*[:=\-]?\s*(iv|iii|ii|i|[1-4])\b/i);
  if (sinifPostRoman) {
    const val = sinifPostRoman[1];
    if (val === '4' || val === 'iv') return 4;
    if (val === '3' || val === 'iii') return 3;
    if (val === '2' || val === 'ii') return 2;
    if (val === '1' || val === 'i') return 1;
  }

  // Snf abbreviation: "1.snf", "2.snf", "I.snf", "IV.snf", etc.
  const snfMatch = lower.match(/(iv|iii|ii|i|[1-4])\s*\.?\s*snf\b/i);
  if (snfMatch) {
    const val = snfMatch[1];
    if (val === '4' || val === 'iv') return 4;
    if (val === '3' || val === 'iii') return 3;
    if (val === '2' || val === 'ii') return 2;
    if (val === '1' || val === 'i') return 1;
  }

  // Yarıyıl / Dönem detection (1-2. yarıyıl = 1. sınıf, 3-4 = 2. sınıf, 5-6 = 3. sınıf, 7-8 = 4. sınıf)
  const semesterMatch = lower.match(/\b([1-8]|viii|vii|vi|v|iv|iii|ii|i)\s*\.?\s*(?:yariyil|yaryil|donem|dönem)\b/i);
  if (semesterMatch) {
    const romanMap: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 };
    const sStr = semesterMatch[1].toLowerCase();
    const sem = romanMap[sStr] || parseInt(sStr, 10);
    if (!isNaN(sem) && sem >= 1 && sem <= 8) {
      const g = Math.ceil(sem / 2);
      if (g >= 1 && g <= 4) return g;
    }
  }

  // Generic digit before or after sınıf: "1. Sınıf", "Sınıf 1", etc.
  const genDigit = lower.match(/([1-4])\s*\.?\s*s[ıi]n[ıi]f(?:lar)?/i) || lower.match(/s[ıi]n[ıi]f(?:lar)?\s*[:=\-]?\s*([1-4])/i);
  if (genDigit) {
    const g = parseInt(genDigit[1], 10);
    if (g >= 1 && g <= 4) return g;
  }

  return 0; // 0 means unassigned / general
}

/**
 * Detect Day from a string
 */
export function detectDayFromText(text: string): DayOfWeek | null {
  if (!text) return null;
  const norm = text.toLowerCase();
  if (norm.includes('pazartesi') || norm.includes('pzt')) return 'Pazartesi';
  if (norm.includes('çarşamba') || norm.includes('carsamba') || norm.includes('çrş') || norm.includes('crs')) return 'Çarşamba';
  if (norm.includes('perşembe') || norm.includes('persembe') || norm.includes('prş') || norm.includes('prs')) return 'Perşembe';
  if (norm.includes('cumartesi') || norm.includes('cmt')) return 'Cumartesi';
  if (norm.includes('cuma')) return 'Cuma';
  if (norm.includes('salı') || norm.includes('sali') || norm.includes('sal')) return 'Salı';
  if (norm.includes('pazar')) return 'Pazar';
  return null;
}

/**
 * Detect Exam Type from text
 */
export function detectExamType(text: string): ExamType {
  const norm = text.toLowerCase();
  if (norm.includes('vize') || norm.includes('ara sınav') || norm.includes('ara sinav')) return 'vize';
  if (norm.includes('final') || norm.includes('yarıyıl sonu') || norm.includes('yariyil sonu')) return 'final';
  if (norm.includes('bütünleme') || norm.includes('butunleme') || norm.includes('büt')) return 'butunleme';
  if (norm.includes('mazeret')) return 'mazeret';
  return 'diger';
}

function standardizeTime(timeStr: string): string {
  const clean = timeStr.replace(/[^\d:]/g, '');
  const parts = clean.split(':');
  if (parts.length === 2) {
    const h = parts[0].padStart(2, '0');
    const m = parts[1].padEnd(2, '0');
    return `${h}:${m}`;
  }
  return timeStr;
}

function extractTimeRange(text: string): { start: string; end: string } | null {
  const norm = text.replace(/\./g, ':');
  const match = norm.match(/(\d{1,2}:\d{2})\s*[-–/]\s*(\d{1,2}:\d{2})/);
  if (match) {
    return {
      start: standardizeTime(match[1]),
      end: standardizeTime(match[2]),
    };
  }
  const single = norm.match(/(\d{1,2}:\d{2})/);
  if (single) {
    const start = standardizeTime(single[1]);
    return { start, end: '' };
  }
  return null;
}

function extractDate(text: string): string | null {
  // YYYY-MM-DD
  const iso = text.match(/\b(202\d)-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // DD.MM.YYYY or DD/MM/YYYY
  const tr = text.match(/\b(\d{1,2})[./-](\d{1,2})[./-](202\d)\b/);
  if (tr) {
    const d = tr[1].padStart(2, '0');
    const m = tr[2].padStart(2, '0');
    const y = tr[3];
    return `${y}-${m}-${d}`;
  }

  // Month names in Turkish
  const months: Record<string, string> = {
    ocak: '01', şubat: '02', subat: '02', mart: '03', nisan: '04',
    mayıs: '05', mayis: '05', haziran: '06', temmuz: '07', ağustos: '08',
    agustos: '08', eylül: '09', eylul: '09', ekim: '10', kasım: '11',
    kasim: '11', aralık: '12', aralik: '12',
  };
  const trNamed = text.match(/\b(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\s+(202\d)\b/i);
  if (trNamed) {
    const d = trNamed[1].padStart(2, '0');
    const mName = trNamed[2].toLowerCase();
    const m = months[mName];
    if (m) {
      return `${trNamed[3]}-${m}-${d}`;
    }
  }

  return null;
}

/**
 * Summarize detected grades
 */
export function buildGradeSummary(courses: CourseItem[], exams: ExamItem[]): DetectedGradeSummary[] {
  const grades = [1, 2, 3, 4, 0];
  const summaries: DetectedGradeSummary[] = [];

  grades.forEach((g) => {
    const cCount = courses.filter((c) => c.grade === g).length;
    const eCount = exams.filter((e) => e.grade === g).length;
    if (cCount > 0 || eCount > 0) {
      summaries.push({
        grade: g,
        label: g === 0 ? 'Ortak / Seçmeli' : `${g}. Sınıf`,
        courseCount: cCount,
        examCount: eCount,
      });
    }
  });

  return summaries;
}

/**
 * Extract courses & exams from raw text lines with dynamic grade tracking
 */
/**
 * Extract classroom from text snippet
 */
export function extractClassroomFromText(text: string): string {
  if (!text) return 'Derslik';
  const paren = text.match(/\(([^)]+)\)/);
  if (paren && paren[1].trim().length > 0) {
    return paren[1].trim();
  }
  const kw = text.match(/\b(UZEK|EB-\d+|Lab\s*\d*|Amfi\s*\d*|Derslik\s*\d*|Spor\s*Salonu|Müh\.\s*Fak\.\s*Lab\.)\b/i);
  if (kw) return kw[1].trim();

  return 'Derslik';
}

/**
 * Extract instructor name from text snippet
 */
export function extractInstructorFromText(text: string): string {
  if (!text) return 'Ders Sorumlusu';
  const m = text.match(/(?:Prof\.|Doç\.|Dr\.|Öğr\.\s*Gör\.|Arş\.\s*Gör\.)\s+[A-ZÇĞİÖŞÜa-zçğıöşü\s.]+/i);
  if (m) {
    return m[0].trim();
  }
  return 'Ders Sorumlusu';
}

/**
 * Extract course code from text snippet
 */
export function extractCourseCodeFromText(text: string): string {
  if (!text) return '';
  const m = text.match(/\b([A-Za-zÇĞİÖŞÜ]{2,6}\s*[-_]?\s*\d{3,7}|\d{7})\b/);
  if (m) {
    return m[1].replace(/\s+/g, '');
  }
  return '';
}

/**
 * Clean course name by removing code, instructor, classroom, and paren references
 */
export function cleanCourseName(text: string, courseCode?: string, instructor?: string, classroom?: string): string {
  if (!text) return 'Ders';
  let name = text;

  if (courseCode) name = name.replace(courseCode, ' ');
  if (instructor && instructor !== 'Ders Sorumlusu') name = name.replace(instructor, ' ');
  if (classroom && classroom !== 'Derslik') name = name.replace(classroom, ' ');

  name = name.replace(/\([^)]*\)/g, ' ');
  name = name.replace(/(?:Prof\.|Doç\.|Dr\.|Öğr\.\s*Gör\.|Arş\.\s*Gör\.)/gi, ' ');
  name = name.replace(/\b[A-Za-zÇĞİÖŞÜ]{2,6}\s*[-_]?\s*\d{3,7}\b/g, ' ');
  name = name.replace(/\b\d{7}\b/g, ' ');
  name = name.replace(/\b\d{1,2}[:.]\d{2}\b/g, ' ');
  name = name.replace(/[\t,;:|\-]+/g, ' ').replace(/\s+/g, ' ').trim();

  return name || 'Ders';
}

/**
 * Extract courses & exams from raw text lines with matrix and line parser
 */
export function parseRawTextLines(
  text: string,
  initialGrade: number = 0,
  forcedGrade?: number
): { courses: CourseItem[]; exams: ExamItem[] } {
  if (!text || !text.trim()) return { courses: [], exams: [] };

  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const courses: CourseItem[] = [];
  const exams: ExamItem[] = [];

  // Check if text has columnar table structure (day header row with 2+ days)
  let dayColMap: { colIndex: number; day: DayOfWeek }[] = [];
  let headerRowIndex = -1;

  for (let i = 0; i < Math.min(rawLines.length, 25); i++) {
    const line = rawLines[i];
    const parts = line.split(/[\t|]/).map((p) => p.trim());
    const cols: { colIndex: number; day: DayOfWeek }[] = [];

    parts.forEach((part, colIdx) => {
      const day = detectDayFromText(part);
      if (day) {
        cols.push({ colIndex: colIdx, day });
      }
    });

    if (cols.length >= 2) {
      dayColMap = cols;
      headerRowIndex = i;
      break;
    }
  }

  // IF COLUMNAR TABLE DETECTED:
  if (dayColMap.length >= 2) {
    let currentGrade = forcedGrade !== undefined && forcedGrade > 0 ? forcedGrade : initialGrade;
    let currentTimeSlot: { start: string; end: string } | null = null;
    let cellBuffers: Record<number, string[]> = {};

    const flushCellBuffers = () => {
      if (!currentTimeSlot) return;
      dayColMap.forEach(({ colIndex, day }) => {
        const lines = cellBuffers[colIndex];
        if (lines && lines.length > 0) {
          const combined = lines.join('\n').trim();
          if (combined.length > 1 && !combined.includes('---')) {
            const extracted = extractCoursesFromCellText(
              combined,
              day,
              currentTimeSlot!.start,
              currentTimeSlot!.end,
              currentGrade
            );
            courses.push(...extracted);
          }
        }
      });
      cellBuffers = {};
    };

    for (let i = headerRowIndex + 1; i < rawLines.length; i++) {
      const line = rawLines[i];

      // Grade section header check (e.g. "I. SINIF", "II. SINIF", "III. SINIF", "IV. SINIF")
      if (!forcedGrade || forcedGrade === 0) {
        const detected = detectGradeFromText(line);
        if (detected > 0 && (line.toLowerCase().includes('sınıf') || line.toLowerCase().includes('sinif') || line.length < 15)) {
          flushCellBuffers();
          currentGrade = detected;
          currentTimeSlot = null;
          continue;
        }
      }

      // Check if line or line pair is a time slot
      const timeRange = extractTimeRange(line);
      let nextLineTime: string | null = null;

      // Handle split time format: line N = "08:10", line N+1 = "09:00"
      if (!timeRange && /^\d{1,2}[:.]\d{2}$/.test(line) && i + 1 < rawLines.length) {
        const nextLine = rawLines[i + 1].trim();
        if (/^\d{1,2}[:.]\d{2}$/.test(nextLine)) {
          nextLineTime = nextLine;
        }
      }

      if (timeRange || nextLineTime) {
        flushCellBuffers();
        let startTime = '09:00';
        let endTime = '10:00';

        if (timeRange) {
          startTime = timeRange.start;
          endTime = timeRange.end || '10:00';
        } else if (nextLineTime) {
          startTime = standardizeTime(line);
          endTime = standardizeTime(nextLineTime);
          i++; // Skip end time line
        }

        currentTimeSlot = { start: startTime, end: endTime };
        continue;
      }

      // If inside a time slot, parse tabbed cells or vertical block lines
      if (currentTimeSlot) {
        const parts = line.split('\t');
        if (parts.length > 1) {
          parts.forEach((part, colIdx) => {
            const trimmed = part.trim();
            if (trimmed) {
              if (!cellBuffers[colIdx]) cellBuffers[colIdx] = [];
              cellBuffers[colIdx].push(trimmed);
            }
          });
        } else {
          const trimmed = line.trim();
          if (trimmed && dayColMap.length > 0) {
            const activeCol = dayColMap[0].colIndex;
            if (!cellBuffers[activeCol]) cellBuffers[activeCol] = [];
            cellBuffers[activeCol].push(trimmed);
          }
        }
      }
    }

    // Flush any remaining cell buffers
    flushCellBuffers();

    if (courses.length > 0) {
      return { courses, exams };
    }
  }

  // FALLBACK LINE-BY-LINE PARSER
  let currentGrade = forcedGrade !== undefined && forcedGrade > 0 ? forcedGrade : initialGrade;
  let currentDay: DayOfWeek = 'Pazartesi';

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    if (!forcedGrade || forcedGrade === 0) {
      const detected = detectGradeFromText(line);
      if (detected > 0) {
        currentGrade = detected;
      }
    }

    const day = detectDayFromText(line);
    if (day && line.length < 35 && !line.includes(':')) {
      currentDay = day;
      continue;
    }

    const dateStr = extractDate(line);
    const timeRange = extractTimeRange(line);

    if (dateStr) {
      const examType = detectExamType(line);
      const classroom = extractClassroomFromText(line);
      const courseCode = extractCourseCodeFromText(line);

      let finalGrade = currentGrade;
      if (finalGrade === 0 && courseCode) {
        const inferred = extractGradeFromCourseCode(courseCode);
        if (inferred > 0) finalGrade = inferred;
      }

      const instructor = extractInstructorFromText(line);
      const courseName = cleanCourseName(line, courseCode, instructor, classroom);

      exams.push({
        id: generateUniqueId('exam'),
        grade: finalGrade,
        gradeLabel: finalGrade === 0 ? 'Genel' : `${finalGrade}. Sınıf`,
        examType,
        courseCode,
        courseName,
        date: dateStr,
        startTime: timeRange?.start || '10:00',
        endTime: timeRange?.end || '11:30',
        classroom,
        instructor,
        isEnrolled: true,
      });
      continue;
    }

    if (timeRange && timeRange.start) {
      const courseCode = extractCourseCodeFromText(line);
      const classroom = extractClassroomFromText(line);
      const instructor = extractInstructorFromText(line);
      const courseName = cleanCourseName(line, courseCode, instructor, classroom);

      let finalGrade = currentGrade;
      if (finalGrade === 0 && courseCode) {
        const inferred = extractGradeFromCourseCode(courseCode);
        if (inferred > 0) finalGrade = inferred;
      }

      courses.push({
        id: generateUniqueId('course'),
        grade: finalGrade,
        gradeLabel: finalGrade === 0 ? 'Ortak / Seçmeli' : `${finalGrade}. Sınıf`,
        day: currentDay,
        startTime: timeRange.start,
        endTime: timeRange.end || '10:15',
        courseCode,
        courseName,
        classroom,
        instructor,
        isEnrolled: true,
        color: getRandomColor(courseName),
      });
    }
  }

  return { courses, exams };
}

/**
 * Extract one or more courses from a timetable cell.
 * Handles parallel courses, multiple sections (şube), and elective courses scheduled in the same cell.
 */
export function extractCoursesFromCellText(
  cellText: string,
  day: DayOfWeek,
  startTime: string,
  endTime: string,
  tableGrade: number
): CourseItem[] {
  if (!cellText || cellText.trim().length < 2 || cellText.includes('---')) return [];

  const raw = cellText.trim();

  const segments = raw
    .split(/(?=(?:\b[A-Za-zÇĞİÖŞÜ]{2,6}\s*[-_]?\s*\d{3,7}\b|\b\d{7}\b))/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && !s.includes('---'));

  const coursesToReturn: CourseItem[] = [];

  const processSegment = (seg: string) => {
    const courseCode = extractCourseCodeFromText(seg);
    const classroom = extractClassroomFromText(seg);
    const instructor = extractInstructorFromText(seg);
    const courseName = cleanCourseName(seg, courseCode, instructor, classroom);

    let cellGrade = tableGrade;
    if (cellGrade === 0 && courseCode) {
      const inferred = extractGradeFromCourseCode(courseCode);
      if (inferred > 0) cellGrade = inferred;
    }
    const detectedInSeg = detectGradeFromText(seg);
    if (detectedInSeg > 0) cellGrade = detectedInSeg;

    if (courseName && courseName.length >= 2) {
      coursesToReturn.push({
        id: generateUniqueId('course'),
        grade: cellGrade,
        gradeLabel: cellGrade === 0 ? 'Ortak / Seçmeli' : `${cellGrade}. Sınıf`,
        day,
        startTime,
        endTime,
        courseCode,
        courseName,
        classroom,
        instructor,
        isEnrolled: true,
        color: getRandomColor(courseName),
      });
    }
  };

  if (segments.length > 1) {
    segments.forEach((seg) => processSegment(seg));
  } else {
    processSegment(raw);
  }

  return coursesToReturn;
}

/**
 * Parse Word (.docx) file
 * Enhanced to detect:
 * 1. File-name grade inference (e.g. 1.sinif.docx, Sinif_II.docx)
 * 2. "Sınıf" column in tables
 * 3. Preceding headers / section titles (supports Roman numerals: Ⅰ, Ⅱ, Ⅲ, Ⅳ)
 * 4. Mid-table subheaders
 * 5. Course code Bologna-level inference
 * 6. Parallel courses in the same time cell
 */
export async function parseWordFile(file: File, forcedGrade?: number): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  const html = htmlResult.value;

  const courses: CourseItem[] = [];
  const exams: ExamItem[] = [];

  // Default initial grade from filename if available
  const fileNameGrade = detectGradeFromFileName(file.name);

  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = Array.from(doc.querySelectorAll('table'));

    tables.forEach((table) => {
      // Find nearest preceding heading for class detection
      let detectedGrade = forcedGrade || fileNameGrade || 0;
      if (!forcedGrade || forcedGrade === 0) {
        let el: Element | null = table.previousElementSibling;
        let lookbackCount = 0;
        while (el && lookbackCount < 6) {
          const text = el.textContent || '';
          const g = detectGradeFromText(text);
          if (g > 0) {
            detectedGrade = g;
            break;
          }
          el = el.previousElementSibling;
          lookbackCount++;
        }
      }

      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length === 0) return;

      // Check header row
      const headerCells = Array.from(rows[0].querySelectorAll('th, td')).map((c) => (c.textContent || '').trim());
      
      // Look for a dedicated "Sınıf" / "Yarıyıl" column
      let gradeColIndex = -1;
      headerCells.forEach((c, idx) => {
        const norm = c.toLowerCase();
        if (norm.includes('sınıf') || norm.includes('sinif') || norm.includes('yarıyıl') || norm.includes('yariyil') || norm.includes('dönem')) {
          gradeColIndex = idx;
        }
      });

      // Is it a timetable where columns are Days?
      const dayColumns: { colIndex: number; day: DayOfWeek }[] = [];
      headerCells.forEach((c, idx) => {
        const day = detectDayFromText(c);
        if (day) {
          dayColumns.push({ colIndex: idx, day });
        }
      });

      let currentTableGrade = detectedGrade;

      if (dayColumns.length >= 2) {
        // Timetable with Days as columns
        for (let r = 1; r < rows.length; r++) {
          const cells = Array.from(rows[r].querySelectorAll('td')).map((c) => (c.textContent || '').trim());
          if (cells.length === 0) continue;

          // Check if row itself is a class subheader (e.g. colspan row: "2. SINIF DERS PROGRAMI" or "Ⅲ. SINIF")
          const fullRowText = cells.join(' ');
          const rowGrade = detectGradeFromText(fullRowText);
          if (rowGrade > 0 && cells.length <= 2) {
            currentTableGrade = rowGrade;
            continue;
          }

          const timeCell = cells[0] || '';
          const timeRange = extractTimeRange(timeCell);
          const startTime = timeRange?.start || '09:00';
          const endTime = timeRange?.end || '10:00';

          dayColumns.forEach(({ colIndex, day }) => {
            const cellText = cells[colIndex];
            if (cellText && cellText.length > 2 && !cellText.includes('---')) {
              const cellCourses = extractCoursesFromCellText(cellText, day, startTime, endTime, currentTableGrade);
              courses.push(...cellCourses);
            }
          });
        }
      } else {
        // Sequential table (e.g. Exam list or course rows)
        for (let r = 1; r < rows.length; r++) {
          const cells = Array.from(rows[r].querySelectorAll('td')).map((c) => (c.textContent || '').trim());
          const rowText = rows[r].textContent || '';

          // Determine row grade from dedicated column if available
          let rowGrade = currentTableGrade;
          if (gradeColIndex >= 0 && cells[gradeColIndex]) {
            const gFromCell = detectGradeFromText(cells[gradeColIndex]);
            if (gFromCell > 0) rowGrade = gFromCell;
          }

          const { courses: cList, exams: eList } = parseRawTextLines(rowText, rowGrade, forcedGrade);
          courses.push(...cList);
          exams.push(...eList);
        }
      }
    });
  }

  // Fallback to raw text parsing if nothing found in tables
  if (courses.length === 0 && exams.length === 0) {
    const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
    const parsed = parseRawTextLines(rawTextResult.value, 0, forcedGrade);
    courses.push(...parsed.courses);
    exams.push(...parsed.exams);
  }

  const detectedGrades = buildGradeSummary(courses, exams);
  const detectedType = exams.length > courses.length ? 'exam' : courses.length > 0 ? 'course' : 'mixed';

  return {
    fileName: file.name,
    detectedType,
    detectedGrades,
    courses,
    exams,
  };
}

/**
 * Parse Excel (.xlsx, .xls, .csv) file
 * Enhanced multi-grade handling for:
 * - Distinct sheets (e.g. Sheet 1 = 1. Sınıf, Sheet 2 = 2. Sınıf)
 * - Single sheet with dedicated "Sınıf" column
 * - Vertically stacked class tables
 * - Bologna code-level inference
 */
export async function parseExcelFile(file: File, forcedGrade?: number): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const courses: CourseItem[] = [];
  const exams: ExamItem[] = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;

    // Detect grade from filename or sheet name if not forced
    const fileNameGrade = detectGradeFromFileName(file.name);
    let sheetGrade = forcedGrade || detectGradeFromText(sheetName) || fileNameGrade || 0;

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length === 0) return;

    let currentGrade = sheetGrade;

    // Search header row
    let headerRowIdx = -1;
    let dayCols: { colIndex: number; day: DayOfWeek }[] = [];
    let gradeColIndex = -1;

    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const row = rows[r];
      const rowStr = row.join(' ');
      const detected = detectGradeFromText(rowStr);
      if (detected > 0 && (!forcedGrade || forcedGrade === 0)) currentGrade = detected;

      const detectedDays: { colIndex: number; day: DayOfWeek }[] = [];
      row.forEach((cellVal: any, colIdx: number) => {
        const valStr = String(cellVal || '').trim();
        const d = detectDayFromText(valStr);
        if (d) {
          detectedDays.push({ colIndex: colIdx, day: d });
        }
        const norm = valStr.toLowerCase();
        if (norm.includes('sınıf') || norm.includes('sinif') || norm.includes('yarıyıl') || norm.includes('dönem')) {
          gradeColIndex = colIdx;
        }
      });

      if (detectedDays.length >= 2) {
        headerRowIdx = r;
        dayCols = detectedDays;
        break;
      }
    }

    if (dayCols.length >= 2 && headerRowIdx >= 0) {
      // Weekly timetable grid
      for (let r = headerRowIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        // Check for inline grade switch (e.g. row says "2. SINIF DERSLERİ" or "Ⅲ. SINIF")
        const rowStr = row.join(' ');
        const gradeInRow = detectGradeFromText(rowStr);
        if (gradeInRow > 0 && (!forcedGrade || forcedGrade === 0)) {
          currentGrade = gradeInRow;
        }

        const timeCell = String(row[0] || row[1] || '');
        const timeRange = extractTimeRange(timeCell);
        const startTime = timeRange?.start || '09:00';
        const endTime = timeRange?.end || '10:00';

        dayCols.forEach(({ colIndex, day }) => {
          const cellVal = String(row[colIndex] || '').trim();
          if (cellVal.length > 2 && !cellVal.includes('---')) {
            const cellCourses = extractCoursesFromCellText(cellVal, day, startTime, endTime, currentGrade);
            courses.push(...cellCourses);
          }
        });
      }
    } else {
      // Linear / list table
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        let rowGrade = currentGrade;

        if (gradeColIndex >= 0 && row[gradeColIndex]) {
          const gFromCell = detectGradeFromText(String(row[gradeColIndex]));
          if (gFromCell > 0) rowGrade = gFromCell;
        }

        const rowStr = row.join('\t');
        const { courses: cList, exams: eList } = parseRawTextLines(rowStr, rowGrade, forcedGrade);
        courses.push(...cList);
        exams.push(...eList);
      }
    }
  });

  const detectedGrades = buildGradeSummary(courses, exams);
  const detectedType = exams.length > courses.length ? 'exam' : courses.length > 0 ? 'course' : 'mixed';

  return {
    fileName: file.name,
    detectedType,
    detectedGrades,
    courses,
    exams,
  };
}

/**
 * Parse PDF (.pdf) file
 * Enhanced multi-grade separation:
 * - Line-by-line Y coordinate sorting
 * - Dynamic class-switch tracking down each page (supports Roman numerals Ⅰ Ⅱ Ⅲ Ⅳ)
 * - Bologna course code inference
 */
export async function parsePdfFile(file: File, forcedGrade?: number): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const courses: CourseItem[] = [];
  const exams: ExamItem[] = [];

  const fileNameGrade = detectGradeFromFileName(file.name);
  let currentGrade = forcedGrade || fileNameGrade || 0;

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];
    if (!items || items.length === 0) continue;

    // Group items by line based on vertical Y position
    const linesMap = new Map<number, string[]>();
    items.forEach((item) => {
      const y = Math.round(item.transform[5]);
      if (!linesMap.has(y)) linesMap.set(y, []);
      linesMap.get(y)!.push(item.str);
    });

    // Sort descending by Y (top to bottom)
    const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);
    const pageTextLines = sortedY.map((y) => linesMap.get(y)!.join(' ').trim());

    // Iterate through lines and dynamically update currentGrade
    for (const line of pageTextLines) {
      if (!forcedGrade || forcedGrade === 0) {
        const detected = detectGradeFromText(line);
        if (detected > 0) {
          currentGrade = detected;
        }
      }

      const parsed = parseRawTextLines(line, currentGrade, forcedGrade);
      courses.push(...parsed.courses);
      exams.push(...parsed.exams);
    }
  }

  const detectedGrades = buildGradeSummary(courses, exams);
  const detectedType = exams.length > courses.length ? 'exam' : courses.length > 0 ? 'course' : 'mixed';

  return {
    fileName: file.name,
    detectedType,
    detectedGrades,
    courses,
    exams,
  };
}

// Schedule parsing is 100% client-side (no network or backend dependencies)

/**
 * Parse plain text or copied clipboard table locally without AI
 */
export async function parsePlainText(text: string, defaultGrade: number = 0, forcedGrade?: number): Promise<ParsedDocumentResult> {
  const parsed = parseRawTextLines(text, defaultGrade, forcedGrade);

  const detectedGrades = buildGradeSummary(parsed.courses, parsed.exams);
  const detectedType = parsed.exams.length > parsed.courses.length ? 'exam' : parsed.courses.length > 0 ? 'course' : 'mixed';

  return {
    fileName: 'Metin Listesi',
    detectedType,
    detectedGrades,
    courses: parsed.courses,
    exams: parsed.exams,
  };
}

/**
 * Generate iCalendar (.ics) format file for student's phone calendar
 */
export function generateIcsFile(exams: ExamItem[], calendarName: string = 'Kilis 7 Aralık Sınav Takvimi'): string {
  const formatIcsDate = (dateStr: string, timeStr: string) => {
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = (timeStr || '10:00').replace(/:/g, '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kilis 7 Aralik Universitesi//Ogrenci Takvimi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:Europe/Istanbul',
  ];

  exams.forEach((exam) => {
    const dtStart = formatIcsDate(exam.date, exam.startTime);
    const dtEnd = formatIcsDate(exam.date, exam.endTime || '11:30');
    const typeLabel = exam.examType.toUpperCase();

    lines.push(
      'BEGIN:VEVENT',
      `UID:${exam.id}@kilis.edu.tr`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:[${typeLabel}] ${exam.courseCode ? exam.courseCode + ' - ' : ''}${exam.courseName}`,
      `DESCRIPTION:Ders Sorumlusu: ${exam.instructor || 'Belirtilmedi'}\\nSınıf: ${exam.gradeLabel}\\n${exam.notes || ''}`,
      `LOCATION:${exam.classroom || 'Kilis 7 Aralık Kampüsü'}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT60M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Sınava 1 saat kaldı!',
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Helper to trigger client download of a text/blob file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
