/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { CourseItem, CourseNoteItem } from '../types/schedule';
import { registerTurkishFonts } from './pdfFonts';

export interface MergedCourseGroup {
  key: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  grade: number;
  gradeLabel: string;
  department?: string;
  instructor?: string;
  classroom?: string;
  notes: CourseNoteItem[];
}

/**
 * Normalizes text for PDF typography while preserving full Turkish Unicode characters
 * (ç, Ç, ğ, Ğ, ı, İ, ö, Ö, ş, Ş, ü, Ü) supported by the embedded LiberationSans font.
 */
export function formatPdfText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/**
 * Backward compatibility alias for formatPdfText
 */
export function sanitizeForPdf(text: string | null | undefined): string {
  return formatPdfText(text);
}

/**
 * Formats a YYYY-MM-DD date string into a friendly Turkish date format (e.g. "30 Ekim 2026")
 */
export function formatTurkishDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }
  } catch {}
  return dateStr;
}

/**
 * Truncates text with ellipsis if it exceeds the specified maximum width in mm.
 */
export function truncateTextToWidth(doc: jsPDF, text: string, maxWidth: number): string {
  const currentWidth = doc.getTextWidth(text);
  if (currentWidth <= maxWidth) {
    return text;
  }
  const ellipsis = '...';
  const ellipsisWidth = doc.getTextWidth(ellipsis);
  const targetWidth = maxWidth - ellipsisWidth;
  if (targetWidth <= 0) return ellipsis;

  let truncated = text;
  while (truncated.length > 0 && doc.getTextWidth(truncated) > targetWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated.trim() + ellipsis;
}

/**
 * Draws an aesthetic rounded badge with custom fill, border, and text.
 * Perfect for badging lecture dates, times, and tags.
 */
export function drawPillBadge(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  variant: 'amber' | 'emerald' | 'burgundy' | 'gray' | 'teal',
  alignRight: boolean = false
): { width: number; height: number } {
  const cleanText = formatPdfText(text);
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(7.5);
  const textWidth = doc.getTextWidth(cleanText);
  const badgeWidth = textWidth + 6.5;
  const badgeHeight = 5.2;
  const startX = alignRight ? x - badgeWidth : x;

  if (variant === 'amber') {
    // Warm amber badge for Lecture Date (Ders Tarihi)
    doc.setFillColor(254, 243, 199); // #fef3c7
    doc.setDrawColor(245, 158, 11); // #f59e0b
    doc.setTextColor(180, 83, 9); // #b45309
  } else if (variant === 'emerald') {
    // Soft emerald badge for Day/Hour or Completed
    doc.setFillColor(236, 253, 245); // #ecfdf5
    doc.setDrawColor(52, 211, 153); // #34d399
    doc.setTextColor(4, 120, 87); // #047857
  } else if (variant === 'teal') {
    doc.setFillColor(240, 253, 250); // #f0fdfa
    doc.setDrawColor(45, 212, 191); // #2dd4bf
    doc.setTextColor(15, 118, 110); // #0f766e
  } else if (variant === 'burgundy') {
    // Brand burgundy badge
    doc.setFillColor(253, 242, 244); // #fdf2f4
    doc.setDrawColor(244, 162, 97); // #f4a261
    doc.setTextColor(138, 42, 67); // #8a2a43
  } else {
    // Neutral gray badge
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(209, 213, 219);
    doc.setTextColor(75, 85, 99);
  }

  doc.setLineWidth(0.25);
  doc.roundedRect(startX, y, badgeWidth, badgeHeight, 1.4, 1.4, 'FD');
  doc.text(cleanText, startX + 3.25, y + 3.8);

  return { width: badgeWidth, height: badgeHeight };
}

/**
 * Groups a collection of notes by their respective course and grade.
 * Cross-references with the courses list to ensure accurate grade association.
 */
export function groupNotesByCourseAndGrade(
  notes: CourseNoteItem[],
  courses: CourseItem[] = []
): MergedCourseGroup[] {
  const courseMap = new Map<string, CourseItem>();
  courses.forEach((c) => {
    courseMap.set(c.id, c);
    if (c.courseCode) {
      courseMap.set(c.courseCode.trim().toUpperCase(), c);
    }
  });

  const groupMap = new Map<string, MergedCourseGroup>();

  notes.forEach((note) => {
    const matchedCourse =
      courseMap.get(note.courseId) ||
      (note.courseCode ? courseMap.get(note.courseCode.trim().toUpperCase()) : undefined);

    const grade = note.grade ?? matchedCourse?.grade ?? 1;
    const gradeLabel =
      note.gradeLabel ||
      matchedCourse?.gradeLabel ||
      (grade > 0 ? `${grade}. Sınıf` : 'Genel / Ortak');

    const cleanCode = (note.courseCode || matchedCourse?.courseCode || 'DERS')
      .trim()
      .toUpperCase();
    const cleanName = (note.courseName || matchedCourse?.courseName || 'Ders Notu').trim();

    const groupKey = `${cleanCode || cleanName}__G${grade}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        key: groupKey,
        courseId: note.courseId || matchedCourse?.id || '',
        courseCode: cleanCode,
        courseName: cleanName,
        grade,
        gradeLabel,
        department: matchedCourse?.department || 'Kilis 7 Aralık Üniversitesi',
        instructor: note.instructor || matchedCourse?.instructor || 'Öğretim Elemanı',
        classroom: note.classroom || matchedCourse?.classroom || '',
        notes: []
      });
    }

    groupMap.get(groupKey)!.notes.push(note);
  });

  const groups = Array.from(groupMap.values());
  groups.forEach((g) => {
    g.notes.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt);
  });

  return groups.sort((a, b) => a.grade - b.grade || a.courseName.localeCompare(b.courseName));
}

/**
 * Dispatches the generated PDF either through native Capacitor Filesystem + Share on Android APK,
 * or direct browser file download on web platforms.
 */
export async function deliverPdf(
  doc: jsPDF,
  filename: string
): Promise<{ success: boolean; method: 'native-share' | 'browser-download'; message: string }> {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  if (Capacitor.isNativePlatform()) {
    try {
      const dataUri = doc.output('datauristring');
      const base64Data = dataUri.split(',')[1];

      const fileResult = await Filesystem.writeFile({
        path: safeFilename,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: safeFilename,
        text: 'K7AÜ Kampüs Dijital Ders Notları PDF Raporu',
        url: fileResult.uri,
        dialogTitle: 'Ders Notları PDF Dosyasını Kaydet / Aç'
      });

      return {
        success: true,
        method: 'native-share',
        message: 'PDF Android paylaşım menüsüne aktarıldı. Dilediğiniz uygulama ile açabilir veya kaydedebilirsiniz.'
      };
    } catch (err: any) {
      console.warn('Capacitor native share failed, attempting fallback download:', err);
    }
  }

  // Web Browser Download fallback
  try {
    doc.save(safeFilename);
    return {
      success: true,
      method: 'browser-download',
      message: 'PDF belgesi başarıyla indirildi.'
    };
  } catch (err: any) {
    console.error('Failed to trigger PDF browser download:', err);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);

    return {
      success: true,
      method: 'browser-download',
      message: 'PDF belgesi başarıyla indirildi.'
    };
  }
}

/**
 * Generates the raw jsPDF document for course notes (single or merged).
 * Keeps currentY strictly tracked in a single scope to guarantee lines never overlap or reset.
 */
export function buildCourseNotesPdfDoc(options: {
  notes: CourseNoteItem[];
  courseGroup?: MergedCourseGroup;
  titleOverride?: string;
  subtitleOverride?: string;
}): { doc: jsPDF; filename: string } | null {
  const { notes, courseGroup, titleOverride, subtitleOverride } = options;
  if (!notes || notes.length === 0) {
    return null;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  registerTurkishFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  const bottomMargin = 16;

  let currentY = 12;

  const dateStr = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const primaryNote = notes[0];
  const courseCode = courseGroup?.courseCode || primaryNote.courseCode || 'DERS';
  const courseName = courseGroup?.courseName || primaryNote.courseName || 'Ders Notları';
  const gradeLabel =
    courseGroup?.gradeLabel ||
    (primaryNote.grade ? `${primaryNote.grade}. Sınıf` : 'Akademik Dönem');
  const instructor = courseGroup?.instructor || primaryNote.instructor || 'Öğretim Elemanı';
  const department = courseGroup?.department || 'Kilis 7 Aralık Üniversitesi';

  const drawPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFillColor(138, 42, 67);
      doc.rect(marginX, currentY, contentWidth, 3, 'F');
      currentY += 7;

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(138, 42, 67);
      doc.text('K7AÜ KAMPÜS DİJİTAL', marginX, currentY);

      const reportDateText = `Rapor Tarihi: ${dateStr}`;
      drawPillBadge(doc, reportDateText, pageWidth - marginX, currentY - 4.2, 'gray', true);

      currentY += 6;

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(38, 70, 83);
      const subtitle =
        subtitleOverride ||
        (notes.length > 1
          ? `${gradeLabel} - Birleştirilmiş Ders & Çalışma Notları Dosyası`
          : `${gradeLabel} - Ders Notu Kaydı`);
      doc.text(formatPdfText(subtitle), marginX, currentY);

      currentY += 4.5;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(marginX, currentY, pageWidth - marginX, currentY);
      currentY += 6;
    } else {
      doc.setFillColor(138, 42, 67);
      doc.rect(marginX, currentY, contentWidth, 2, 'F');
      currentY += 5.5;

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(138, 42, 67);
      const runningTitle = `${courseCode} - ${courseName} • Ders Notları`;
      doc.text(truncateTextToWidth(doc, runningTitle, contentWidth - 55), marginX, currentY);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('K7AÜ Kampüs Dijital', pageWidth - marginX, currentY, { align: 'right' });

      currentY += 3.5;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, currentY, pageWidth - marginX, currentY);
      currentY += 5.5;
    }
  };

  const drawPageFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 9;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'K7AÜ Kampüs Dijital • Öğrenci Ders ve Çalışma Notları Arşivi',
      marginX,
      footerY
    );
    doc.text(
      `Sayfa ${pageNum} / ${totalPages}`,
      pageWidth - marginX,
      footerY,
      { align: 'right' }
    );
  };

  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = 12;
      drawPageHeader(false);
    }
  };

  // 1. Initial Page Header
  drawPageHeader(true);

  // 2. Course Meta Card
  const metaCardX = marginX;
  const metaCardWidth = contentWidth;
  const col1X = metaCardX + 5;
  const col2X = metaCardX + 94;
  const colWidth = 83;

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11);
  const fullCourseTitle = formatPdfText(`${courseCode ? courseCode + ' - ' : ''}${courseName}`);
  const wrappedTitleLines = doc.splitTextToSize(fullCourseTitle, metaCardWidth - 10);
  const titleHeight = wrappedTitleLines.length * 5.2;

  const metaRowsCount = 3;
  const metaRowHeight = 5.2;
  const metaBoxHeight = 8 + titleHeight + (metaRowsCount * metaRowHeight) + 4;

  ensureSpace(metaBoxHeight + 6);

  doc.setFillColor(250, 250, 249);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.roundedRect(metaCardX, currentY, metaCardWidth, metaBoxHeight, 2, 2, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  let titleCursorY = currentY + 6.5;
  wrappedTitleLines.forEach((tLine: string) => {
    doc.text(tLine, col1X, titleCursorY);
    titleCursorY += 5.2;
  });

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);

  let metaY = titleCursorY + 1.5;

  const r1Col1 = `Sınıf / Düzey: ${gradeLabel}`;
  const r1Col2 = `Fakülte / Bölüm: ${department}`;
  doc.text(truncateTextToWidth(doc, r1Col1, colWidth), col1X, metaY);
  doc.text(truncateTextToWidth(doc, r1Col2, colWidth), col2X, metaY);
  metaY += metaRowHeight;

  const timeStr = primaryNote.day ? `${primaryNote.day} ${primaryNote.startTime || ''}` : 'Belirtilmedi';
  const r2Col1 = `Öğretim Elemanı: ${instructor}`;
  const r2Col2 = `Ders Saati: ${timeStr}`;
  doc.text(truncateTextToWidth(doc, r2Col1, colWidth), col1X, metaY);
  doc.text(truncateTextToWidth(doc, r2Col2, colWidth), col2X, metaY);
  metaY += metaRowHeight;

  const classroomStr = courseGroup?.classroom || primaryNote.classroom || 'Belirtilmedi';
  const r3Col1 = `Derslik / Lab: ${classroomStr}`;
  const r3Col2 = `Toplam Not: ${notes.length} Adet Kayıt`;
  doc.text(truncateTextToWidth(doc, r3Col1, colWidth), col1X, metaY);
  doc.text(truncateTextToWidth(doc, r3Col2, colWidth), col2X, metaY);

  currentY += metaBoxHeight + 7;

  // 3. Table of Contents (when notes > 1)
  if (notes.length > 1) {
    const tocEntryHeight = 7.2;
    const tocTotalHeight = 18 + notes.length * tocEntryHeight;
    ensureSpace(Math.min(tocTotalHeight, 50));

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(138, 42, 67);
    doc.text('DERS NOTLARI İÇİNDEKİLER VE İŞLENEN KONULAR', marginX, currentY);
    currentY += 4.5;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 5.5;

    notes.forEach((item, idx) => {
      ensureSpace(tocEntryHeight + 1);

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${idx + 1}.`, marginX + 2, currentY + 3.8);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(30, 41, 59);
      const rawTitle = formatPdfText(item.title || 'Ders Notu');
      const maxTitleWidth = contentWidth - 62;
      const cleanTitle = truncateTextToWidth(doc, rawTitle, maxTitleWidth);
      doc.text(cleanTitle, marginX + 8, currentY + 3.8);

      const itemDateFormatted = formatTurkishDate(item.date);
      if (itemDateFormatted) {
        drawPillBadge(doc, itemDateFormatted, pageWidth - marginX - 2, currentY, 'amber', true);
      }

      currentY += tocEntryHeight;
    });

    currentY += 6;
  }

  // 4. Render Note Entries
  for (let index = 0; index < notes.length; index++) {
    const note = notes[index];
    const noteNum = index + 1;
    const noteTitle = note.title ? `${noteNum}. ${note.title}` : `${noteNum}. Ders Notu`;

    ensureSpace(32);

    const headerBoxHeight = 9.5;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, currentY, contentWidth, headerBoxHeight, 1.5, 1.5, 'FD');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(138, 42, 67);
    const maxTitleW = contentWidth - 64;
    const cleanHeaderTitle = truncateTextToWidth(doc, formatPdfText(noteTitle), maxTitleW);
    doc.text(cleanHeaderTitle, marginX + 3.5, currentY + 6.2);

    const noteDateStr = formatTurkishDate(note.date);
    const dateBadgeLabel = noteDateStr ? `Ders Tarihi: ${noteDateStr}` : 'Ders Notu Kaydı';
    drawPillBadge(doc, dateBadgeLabel, pageWidth - marginX - 2.5, currentY + 2.15, 'amber', true);

    currentY += headerBoxHeight + 3.5;

    // Sub-info Bar
    let badgeCursorX = marginX + 2;
    let hasDrawnPills = false;

    if (note.day || note.startTime) {
      const timeStr = `${note.day || ''} ${note.startTime ? `${note.startTime} - ${note.endTime || ''}` : ''}`.trim();
      if (timeStr) {
        const badgeRes = drawPillBadge(doc, `Saat: ${timeStr}`, badgeCursorX, currentY, 'teal', false);
        badgeCursorX += badgeRes.width + 2.5;
        hasDrawnPills = true;
      }
    }

    if (note.classroom) {
      const badgeRes = drawPillBadge(doc, `Derslik: ${note.classroom}`, badgeCursorX, currentY, 'gray', false);
      badgeCursorX += badgeRes.width + 2.5;
      hasDrawnPills = true;
    }

    if (note.tags && note.tags.length > 0) {
      for (const tag of note.tags.slice(0, 3)) {
        if (badgeCursorX + 25 < pageWidth - marginX) {
          const badgeRes = drawPillBadge(doc, `#${tag}`, badgeCursorX, currentY, 'burgundy', false);
          badgeCursorX += badgeRes.width + 2;
          hasDrawnPills = true;
        }
      }
    }

    if (hasDrawnPills) {
      currentY += 8.2;
    } else {
      currentY += 1.5;
    }

    // Body content line by line using currentY
    const fontSize = 9;
    const lineHeight = 5.3;
    const paragraphGap = 2.8;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(30, 41, 59);

    const cleanContent = formatPdfText(note.content || 'Not içeriği bulunmuyor.');
    const paragraphs = cleanContent.split('\n');

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const p = paragraphs[pIdx];

      if (!p.trim()) {
        currentY += paragraphGap;
        continue;
      }

      const isBullet = /^(\s*[-*•]|\s*\d+[\.\)])\s+/.test(p);
      const lineIndent = isBullet ? 2.5 : 0;
      const effectiveWidth = contentWidth - 5 - lineIndent;

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(fontSize);
      const wrappedLines = doc.splitTextToSize(p, effectiveWidth);

      for (let lIdx = 0; lIdx < wrappedLines.length; lIdx++) {
        ensureSpace(lineHeight + 1.5);

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(30, 41, 59);

        const lineX = marginX + 2.5 + (lIdx === 0 ? 0 : lineIndent);
        doc.text(wrappedLines[lIdx], lineX, currentY);
        currentY += lineHeight;
      }
    }

    currentY += 4;

    if (index < notes.length - 1) {
      ensureSpace(14);
      currentY += 2;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, currentY, pageWidth - marginX, currentY);
      currentY += 8;
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(p, totalPages);
  }

  const cleanDocName = `${courseCode || 'Ders'}_${gradeLabel.replace(/\s+/g, '')}_Notlari`
    .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]/g, '_');
  const filename = `${cleanDocName}.pdf`;

  return { doc, filename };
}

/**
 * Builds and exports a single or merged multi-note PDF document.
 */
export async function generateCourseNotesPdf(options: {
  notes: CourseNoteItem[];
  courseGroup?: MergedCourseGroup;
  titleOverride?: string;
  subtitleOverride?: string;
}): Promise<{ success: boolean; message: string }> {
  const built = buildCourseNotesPdfDoc(options);
  if (!built) {
    return { success: false, message: 'Dışa aktarılacak ders notu bulunamadı.' };
  }
  const deliveryResult = await deliverPdf(built.doc, built.filename);
  return {
    success: deliveryResult.success,
    message: deliveryResult.message
  };
}

/**
 * Generates the raw jsPDF document for the Master Study Booklet.
 */
export function buildMasterBookletPdfDoc(
  allNotes: CourseNoteItem[],
  courses: CourseItem[] = []
): { doc: jsPDF; filename: string } | null {
  if (allNotes.length === 0) {
    return null;
  }

  const groups = groupNotesByCourseAndGrade(allNotes, courses);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  registerTurkishFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const bottomMargin = 16;

  let currentY = 12;
  const dateStr = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const drawPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFillColor(138, 42, 67);
      doc.rect(marginX, currentY, contentWidth, 3, 'F');
      currentY += 7;

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(138, 42, 67);
      doc.text('K7AÜ KAMPÜS DİJİTAL', marginX, currentY);

      const reportDateText = `Rapor Tarihi: ${dateStr}`;
      drawPillBadge(doc, reportDateText, pageWidth - marginX, currentY - 4.2, 'gray', true);

      currentY += 6;

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(38, 70, 83);
      doc.text('TÜM DERSLER ÇALIŞMA VE DERS NOTLARI KİTAPÇIĞI', marginX, currentY);

      currentY += 4.5;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(marginX, currentY, pageWidth - marginX, currentY);
      currentY += 6;
    } else {
      doc.setFillColor(138, 42, 67);
      doc.rect(marginX, currentY, contentWidth, 2, 'F');
      currentY += 5.5;

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(138, 42, 67);
      doc.text('K7AÜ KAMPÜS DİJİTAL • TÜM DERSLER NOT KİTAPÇIĞI', marginX, currentY);

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Rapor: ${dateStr}`, pageWidth - marginX, currentY, { align: 'right' });

      currentY += 3.5;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, currentY, pageWidth - marginX, currentY);
      currentY += 5.5;
    }
  };

  const drawPageFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 9;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'K7AÜ Kampüs Dijital • Genel Ders Notları Kitapçığı',
      marginX,
      footerY
    );
    doc.text(
      `Sayfa ${pageNum} / ${totalPages}`,
      pageWidth - marginX,
      footerY,
      { align: 'right' }
    );
  };

  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = 12;
      drawPageHeader(false);
    }
  };

  // 1. Initial Page
  drawPageHeader(true);

  // Overview box
  ensureSpace(25);
  doc.setFillColor(250, 250, 249);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.35);
  doc.roundedRect(marginX, currentY, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(38, 70, 83);
  doc.text('GENEL AKADEMİK NOT RAPORU', marginX + 5, currentY + 6.5);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(71, 85, 105);
  doc.text(
    formatPdfText(`Farklı Ders Grubu: ${groups.length} Ders`),
    marginX + 5,
    currentY + 14
  );
  doc.text(
    formatPdfText(`Toplam Kayıtlı Not: ${allNotes.length} Adet`),
    marginX + 65,
    currentY + 14
  );
  doc.text(
    'Tüm Sınıflar ve İşlenen Konular',
    marginX + 125,
    currentY + 14
  );

  currentY += 27;

  // Process each Course Group
  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    const group = groups[gIdx];
    ensureSpace(35);

    const groupBannerHeight = 8.5;
    doc.setFillColor(138, 42, 67);
    doc.roundedRect(marginX, currentY, contentWidth, groupBannerHeight, 1.2, 1.2, 'F');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    const groupHeaderTitle = `[${group.gradeLabel}] ${group.courseCode} - ${group.courseName}`;
    doc.text(
      truncateTextToWidth(doc, formatPdfText(groupHeaderTitle), contentWidth - 30),
      marginX + 3.5,
      currentY + 5.8
    );

    doc.setFontSize(8);
    doc.text(
      `${group.notes.length} Not`,
      pageWidth - marginX - 3.5,
      currentY + 5.8,
      { align: 'right' }
    );

    currentY += groupBannerHeight + 4;

    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      formatPdfText(`Öğretim Elemanı: ${group.instructor || 'Belirtilmedi'}  |  Derslik: ${group.classroom || 'Belirtilmedi'}`),
      marginX + 2,
      currentY
    );
    currentY += 5.5;

    for (let nIdx = 0; nIdx < group.notes.length; nIdx++) {
      const note = group.notes[nIdx];
      ensureSpace(24);

      doc.setFont('LiberationSans', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(38, 70, 83);
      const noteTitleStr = `${gIdx + 1}.${nIdx + 1} ${note.title || 'Ders Notu'}`;
      doc.text(
        truncateTextToWidth(doc, formatPdfText(noteTitleStr), contentWidth - 62),
        marginX + 3,
        currentY + 3.8
      );

      const noteDateFormatted = formatTurkishDate(note.date);
      if (noteDateFormatted) {
        drawPillBadge(doc, `Ders: ${noteDateFormatted}`, pageWidth - marginX - 3, currentY, 'amber', true);
      }

      currentY += 7.5;

      const fontSize = 8.4;
      const lineHeight = 5.0;
      const paragraphGap = 2.5;

      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(51, 65, 85);

      const cleanContent = formatPdfText(note.content || 'Not içeriği bulunmuyor.');
      const paragraphs = cleanContent.split('\n');

      for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const p = paragraphs[pIdx];

        if (!p.trim()) {
          currentY += paragraphGap;
          continue;
        }

        const isBullet = /^(\s*[-*•]|\s*\d+[\.\)])\s+/.test(p);
        const lineIndent = isBullet ? 2.5 : 0;
        const effectiveWidth = contentWidth - 8 - lineIndent;

        doc.setFont('LiberationSans', 'normal');
        doc.setFontSize(fontSize);
        const wrappedLines = doc.splitTextToSize(p, effectiveWidth);

        for (let lIdx = 0; lIdx < wrappedLines.length; lIdx++) {
          ensureSpace(lineHeight + 1.5);

          doc.setFont('LiberationSans', 'normal');
          doc.setFontSize(fontSize);
          doc.setTextColor(51, 65, 85);

          const lineX = marginX + 4 + (lIdx === 0 ? 0 : lineIndent);
          doc.text(wrappedLines[lIdx], lineX, currentY);
          currentY += lineHeight;
        }
      }

      currentY += 3;

      if (nIdx < group.notes.length - 1) {
        ensureSpace(8);
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.25);
        doc.line(marginX + 3, currentY, pageWidth - marginX - 3, currentY);
        currentY += 5;
      }
    }

    currentY += 7;
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(p, totalPages);
  }

  const filename = `K7AU_Tum_Ders_Notlari_Kitapcigi.pdf`;
  return { doc, filename };
}

/**
 * Merges ALL notes from different courses and grades into a comprehensive Master Study Booklet PDF.
 */
export async function generateMasterBookletPdf(
  allNotes: CourseNoteItem[],
  courses: CourseItem[] = []
): Promise<{ success: boolean; message: string }> {
  const built = buildMasterBookletPdfDoc(allNotes, courses);
  if (!built) {
    return { success: false, message: 'Dışa aktarılacak ders notu bulunamadı.' };
  }
  const deliveryResult = await deliverPdf(built.doc, built.filename);
  return {
    success: deliveryResult.success,
    message: deliveryResult.message
  };
}
