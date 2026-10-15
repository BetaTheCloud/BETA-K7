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
 * Advanced Grade detection from text snippets, table cells, or headings
 * Recognizes: 1. Sınıf, 1.SINIF, I. Sınıf, 1. Yarıyıl, 3. Yarıyıl, Birinci Sınıf, Sınıf: 2, etc.
 */
export function detectGradeFromText(text: string): number {
  if (!text) return 0;
  const raw = text.trim();
  const normalized = raw
    .toLowerCase()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/\s+/g, ' ');

  // Exact single digit in a grade cell ("1", "2", "3", "4")
  if (/^[1-4]$/.test(raw)) {
    return parseInt(raw, 10);
  }

  // Roman Numerals
  if (/\b(?:iv|4)\s*\.?\s*s[ıi]n[ıi]f\b/i.test(normalized) || /\bd[öo]rd[üu]nc[üu]\s*s[ıi]n[ıi]f\b/i.test(normalized)) {
    return 4;
  }
  if (/\b(?:iii|3)\s*\.?\s*s[ıi]n[ıi]f\b/i.test(normalized) || /\b[üu][çc][üu]nc[üu]\s*s[ıi]n[ıi]f\b/i.test(normalized)) {
    return 3;
  }
  if (/\b(?:ii|2)\s*\.?\s*s[ıi]n[ıi]f\b/i.test(normalized) || /\bikinci\s*s[ıi]n[ıi]f\b/i.test(normalized)) {
    return 2;
  }
  if (/\b(?:i|1)\s*\.?\s*s[ıi]n[ıi]f\b/i.test(normalized) || /\bbirinci\s*s[ıi]n[ıi]f\b/i.test(normalized)) {
    return 1;
  }

  // Yarıyıl / Dönem detection (1-2. yarıyıl = 1. sınıf, 3-4 = 2. sınıf, 5-6 = 3. sınıf, 7-8 = 4. sınıf)
  const semesterMatch = normalized.match(/\b([1-8])\s*\.?\s*(?:yary[ıi]l|yarıyıl|d[öo]nem)\b/i);
  if (semesterMatch) {
    const sem = parseInt(semesterMatch[1], 10);
    const g = Math.ceil(sem / 2);
    if (g >= 1 && g <= 4) return g;
  }

  // Snf abbreviation (e.g. 1.Snf, 2.snf)
  const snfMatch = normalized.match(/([1-4])\s*\.?\s*snf\b/i);
  if (snfMatch) {
    return parseInt(snfMatch[1], 10);
  }

  // Explicit label like "Sınıf : 2" or "Sınıf:2"
  const labelMatch = normalized.match(/s[ıi]n[ıi]f\s*[:=\-]?\s*([1-4])/i);
  if (labelMatch) {
    return parseInt(labelMatch[1], 10);
  }

  // General digit before/after sınıf
  const m = normalized.match(/s[ıi]n[ıi]f\s*([1-4])/i) || normalized.match(/([1-4])\s*\.?\s*s[ıi]n[ıi]f/i);
  if (m) {
    const g = parseInt(m[1], 10);
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
export function parseRawTextLines(
  text: string,
  initialGrade: number = 0,
  forcedGrade?: number
): { courses: CourseItem[]; exams: ExamItem[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const courses: CourseItem[] = [];
  const exams: ExamItem[] = [];

  let currentGrade = forcedGrade !== undefined && forcedGrade > 0 ? forcedGrade : initialGrade;
  let currentDay: DayOfWeek = 'Pazartesi';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for grade section change if not strictly forced
    if (!forcedGrade || forcedGrade === 0) {
      const detected = detectGradeFromText(line);
      if (detected > 0) {
        currentGrade = detected;
      }
    }

    // Check for day header
    const day = detectDayFromText(line);
    if (day && line.length < 35 && !line.includes(':')) {
      currentDay = day;
      continue;
    }

    // Check if line looks like an Exam line (contains date and time)
    const dateStr = extractDate(line);
    const timeRange = extractTimeRange(line);

    if (dateStr) {
      const examType = detectExamType(line);
      const parts = line.split(/[\t,|;]/).map((p) => p.trim()).filter(Boolean);

      const roomMatch = line.match(/\b([A-ZÇĞİÖŞÜ]-\d{3}|Amfi\s*\d*|Lab\s*\d*|Derslik\s*\d*)\b/i);
      const classroom = roomMatch ? roomMatch[1] : parts.length > 3 ? parts[parts.length - 1] : 'Belirtilmedi';

      let courseCode = '';
      const codeMatch = line.match(/\b([A-Za-zÇĞİÖŞÜ]{2,5}\s*[-_]?\s*\d{3,4})\b/);
      if (codeMatch) {
        courseCode = codeMatch[1].replace(/\s+/g, '');
      }

      // If current grade is 0, attempt code inference
      let finalGrade = currentGrade;
      if (finalGrade === 0 && courseCode) {
        const inferred = extractGradeFromCourseCode(courseCode);
        if (inferred > 0) finalGrade = inferred;
      }

      let courseName = line
        .replace(dateStr, '')
        .replace(timeRange?.start || '', '')
        .replace(timeRange?.end || '', '')
        .replace(/vize|final|bütünleme|mazeret|ara\s*sınav/gi, '')
        .replace(/\b([A-ZÇĞİÖŞÜ]-\d{3}|Amfi\s*\d*|Lab\s*\d*|Derslik\s*\d*)\b/gi, '')
        .replace(/[,\-:|\t]+/g, ' ')
        .trim();

      if (courseName.length < 3 && parts.length > 1) {
        courseName = parts[1];
      }

      exams.push({
        id: `exam-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        grade: finalGrade,
        gradeLabel: finalGrade === 0 ? 'Genel' : `${finalGrade}. Sınıf`,
        examType,
        courseCode,
        courseName: courseName.slice(0, 80) || 'Ders Sınavı',
        date: dateStr,
        startTime: timeRange?.start || '10:00',
        endTime: timeRange?.end || '11:30',
        classroom,
        instructor: 'Ders Sorumlusu',
        isEnrolled: true,
      });
      continue;
    }

    // Check if line looks like a Course entry (time range present)
    if (timeRange && timeRange.start) {
      const codeMatch = line.match(/\b([A-Za-zÇĞİÖŞÜ]{2,5}\s*[-_]?\s*\d{3,4})\b/);
      const courseCode = codeMatch ? codeMatch[1].replace(/\s+/g, '') : '';

      const roomMatch = line.match(/\b([A-ZÇĞİÖŞÜ]-\d{3}|Amfi\s*\d*|Lab\s*\d*|Derslik\s*\d*)\b/i);
      const classroom = roomMatch ? roomMatch[1] : 'Derslik';

      let courseName = line
        .replace(/(\d{1,2}:\d{2})\s*[-–/]\s*(\d{1,2}:\d{2})/g, '')
        .replace(/(\d{1,2}:\d{2})/g, '')
        .replace(/\b([A-ZÇĞİÖŞÜ]-\d{3}|Amfi\s*\d*|Lab\s*\d*|Derslik\s*\d*)\b/gi, '')
        .replace(courseCode, '')
        .replace(/[,\-:|\t]+/g, ' ')
        .trim();

      if (courseName.length < 3) courseName = 'Ders';

      const instructorMatch = line.match(/(Prof\.|Doç\.|Dr\.|Öğr\.\s*Gör\.)\s+[A-ZÇĞİÖŞÜa-zçğıöşü\s]+/);
      const instructor = instructorMatch ? instructorMatch[0].trim() : 'Öğretim Elemanı';

      // Fallback grade inference from courseCode
      let finalGrade = currentGrade;
      if (finalGrade === 0 && courseCode) {
        const inferred = extractGradeFromCourseCode(courseCode);
        if (inferred > 0) finalGrade = inferred;
      }

      courses.push({
        id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        grade: finalGrade,
        gradeLabel: finalGrade === 0 ? 'Ortak / Seçmeli' : `${finalGrade}. Sınıf`,
        day: currentDay,
        startTime: timeRange.start,
        endTime: timeRange.end || '10:15',
        courseCode,
        courseName: courseName.slice(0, 80),
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
 * Parse Word (.docx) file
 * Enhanced to detect:
 * 1. "Sınıf" column in tables
 * 2. Preceding headers / section titles
 * 3. Mid-table subheaders
 * 4. Course code Bologna-level inference
 */
export async function parseWordFile(file: File, forcedGrade?: number): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  const html = htmlResult.value;

  const courses: CourseItem[] = [];
  const exams: ExamItem[] = [];

  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = Array.from(doc.querySelectorAll('table'));

    tables.forEach((table) => {
      // Find nearest preceding heading for class detection
      let detectedGrade = forcedGrade || 0;
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

          // Check if row itself is a class subheader (e.g. colspan row: "2. SINIF DERS PROGRAMI")
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
              const codeMatch = cellText.match(/\b([A-Za-zÇĞİÖŞÜ]{2,5}\s*[-_]?\s*\d{3,4})\b/);
              const courseCode = codeMatch ? codeMatch[1].replace(/\s+/g, '') : '';

              // Determine grade for this specific course
              let cellGrade = currentTableGrade;
              if (cellGrade === 0 && courseCode) {
                cellGrade = extractGradeFromCourseCode(courseCode);
              }

              courses.push({
                id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                grade: cellGrade,
                gradeLabel: cellGrade === 0 ? 'Ortak / Seçmeli' : `${cellGrade}. Sınıf`,
                day,
                startTime,
                endTime,
                courseCode,
                courseName: cellText.split('\n')[0].replace(courseCode, '').trim() || cellText,
                classroom: (cellText.match(/\b([A-ZÇĞİÖŞÜ]-\d{3}|Amfi\s*\d*|Lab\s*\d*)\b/i) || [])[1] || 'Derslik',
                instructor: (cellText.match(/(Prof\.|Doç\.|Dr\.|Öğr\.\s*Gör\.)\s+[A-ZÇĞİÖŞÜa-zçğıöşü\s]+/) || [])[0] || 'Ders Sorumlusu',
                isEnrolled: true,
                color: getRandomColor(cellText),
              });
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

    // Detect grade from sheet name if not forced
    let sheetGrade = forcedGrade || detectGradeFromText(sheetName);

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

        // Check for inline grade switch (e.g. row says "2. SINIF DERSLERİ")
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
            const codeMatch = cellVal.match(/\b([A-Za-zÇĞİÖŞÜ]{2,5}\s*[-_]?\s*\d{3,4})\b/);
            const courseCode = codeMatch ? codeMatch[1].replace(/\s+/g, '') : '';

            let itemGrade = currentGrade;
            if (itemGrade === 0 && courseCode) {
              itemGrade = extractGradeFromCourseCode(courseCode);
            }

            courses.push({
              id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              grade: itemGrade,
              gradeLabel: itemGrade === 0 ? 'Ortak / Seçmeli' : `${itemGrade}. Sınıf`,
              day,
              startTime,
              endTime,
              courseCode,
              courseName: cellVal.split('\n')[0].replace(courseCode, '').trim() || cellVal,
              classroom: (cellVal.match(/\b([A-ZÇĞİÖŞÜ]-\d{3}|Amfi\s*\d*|Lab\s*\d*)\b/i) || [])[1] || 'Derslik',
              instructor: (cellVal.match(/(Prof\.|Doç\.|Dr\.|Öğr\.\s*Gör\.)\s+[A-ZÇĞİÖŞÜa-zçğıöşü\s]+/) || [])[0] || 'Ders Sorumlusu',
              isEnrolled: true,
              color: getRandomColor(cellVal),
            });
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
 * - Dynamic class-switch tracking down each page
 * - Bologna course code inference
 */
export async function parsePdfFile(file: File, forcedGrade?: number): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const courses: CourseItem[] = [];
  const exams: ExamItem[] = [];

  let currentGrade = forcedGrade || 0;

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

/**
 * Parse plain text or copied clipboard table
 */
export function parsePlainText(text: string, defaultGrade: number = 0, forcedGrade?: number): ParsedDocumentResult {
  const parsed = parseRawTextLines(text, defaultGrade, forcedGrade);
  const detectedGrades = buildGradeSummary(parsed.courses, parsed.exams);
  const detectedType = parsed.exams.length > parsed.courses.length ? 'exam' : parsed.courses.length > 0 ? 'course' : 'mixed';

  return {
    fileName: 'Kopyala-Yapıştır Metni',
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
