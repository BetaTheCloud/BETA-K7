/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Ders & Sınav Programı Paylaşılabilir Şablon Sistemi
 */

import { CourseItem, ExamItem } from '../types/schedule';
import {
  getStoredCourses,
  getStoredExams,
  saveStoredCourses,
  saveStoredExams,
  batchImportItems
} from './scheduleStorage';

export interface ScheduleTemplateMetadata {
  title: string;
  department?: string;
  academicYear?: string;
  term?: string;
  grade?: number;
  gradeLabel?: string;
  description?: string;
  author?: string;
}

export interface ScheduleExportPackage {
  format: 'k7au_schedule_template';
  version: '1.0';
  exportedAt: string;
  metadata: ScheduleTemplateMetadata;
  summary: {
    courseCount: number;
    examCount: number;
  };
  courses: CourseItem[];
  exams: ExamItem[];
}

/** Pre-made ready-to-use university course schedule templates for students */
export const SAMPLE_TEMPLATES: Array<{
  id: string;
  title: string;
  department: string;
  grade: number;
  description: string;
  package: ScheduleExportPackage;
}> = [];

/**
 * Creates an export package using the current stored courses & exams
 */
export function createScheduleExportPackage(options: {
  title?: string;
  department?: string;
  grade?: number;
  description?: string;
  author?: string;
  selectedCourses?: CourseItem[];
  selectedExams?: ExamItem[];
}): ScheduleExportPackage {
  const coursesToExport = options.selectedCourses || getStoredCourses();
  const examsToExport = options.selectedExams || getStoredExams();

  const title = options.title?.trim() || 'K7AÜ Ders ve Sınav Programı Şablonu';
  const department = options.department?.trim() || '';

  return {
    format: 'k7au_schedule_template',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    metadata: {
      title,
      department,
      grade: options.grade ?? 0,
      gradeLabel: options.grade ? `${options.grade}. Sınıf` : 'Tüm Sınıflar / Ortak',
      academicYear: '2025-2026',
      description: options.description?.trim() || '',
      author: options.author?.trim() || 'K7AÜ Öğrencisi'
    },
    summary: {
      courseCount: coursesToExport.length,
      examCount: examsToExport.length
    },
    courses: coursesToExport,
    exams: examsToExport
  };
}

/**
 * Downloads the template as a .k7plan (or .json) file
 */
export function downloadSchedulePackage(pkg: ScheduleExportPackage, filename?: string): void {
  if (typeof window === 'undefined') return;

  const jsonStr = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const cleanName = (filename || pkg.metadata.title || 'k7au_program_sablonu')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_');

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${cleanName}.k7plan`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Copies the template package JSON string to the clipboard
 */
export async function copySchedulePackageToClipboard(pkg: ScheduleExportPackage): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    const jsonStr = JSON.stringify(pkg, null, 2);
    await navigator.clipboard.writeText(jsonStr);
    return true;
  } catch (err) {
    console.error('Pano kopyalama hatası:', err);
    return false;
  }
}

/**
 * Uses Web Share API if supported on device (especially mobile)
 */
export async function shareSchedulePackage(pkg: ScheduleExportPackage): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    const jsonStr = JSON.stringify(pkg, null, 2);
    const file = new File([jsonStr], `${pkg.metadata.title || 'k7au_program'}.k7plan`, {
      type: 'application/json'
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: pkg.metadata.title,
        text: `K7AÜ Kampüs Dijital Ders & Sınav Programı Şablonu (${pkg.summary.courseCount} ders, ${pkg.summary.examCount} sınav)`,
        files: [file]
      });
      return true;
    }

    // Text share fallback
    await navigator.share({
      title: pkg.metadata.title,
      text: jsonStr
    });
    return true;
  } catch (err) {
    if ((err as any)?.name === 'AbortError') return true; // User cancelled share dialog
    console.warn('Paylaşım başarısız:', err);
    return false;
  }
}

/**
 * Validates and parses raw text or JSON object as a ScheduleExportPackage
 */
export function parseAndValidateSchedulePackage(raw: string | object): {
  success: boolean;
  package?: ScheduleExportPackage;
  error?: string;
} {
  try {
    let parsed: any = raw;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) {
        return { success: false, error: 'İçerik boş olamaz.' };
      }
      parsed = JSON.parse(trimmed);
    }

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Geçerli bir şablon formatı bulunamadı.' };
    }

    // Determine if it's our official format or legacy array format
    let courses: CourseItem[] = [];
    let exams: ExamItem[] = [];
    let metadata: ScheduleTemplateMetadata = {
      title: 'İçe Aktarılan Şablon',
      department: '',
      grade: 0
    };

    if (parsed.format === 'k7au_schedule_template' && Array.isArray(parsed.courses)) {
      courses = parsed.courses;
      exams = Array.isArray(parsed.exams) ? parsed.exams : [];
      if (parsed.metadata) {
        metadata = { ...metadata, ...parsed.metadata };
      }
    } else if (Array.isArray(parsed)) {
      // Legacy or array of courses
      courses = parsed.filter((item: any) => item && (item.courseCode || item.courseName));
    } else if (Array.isArray(parsed.courses) || Array.isArray(parsed.exams)) {
      courses = Array.isArray(parsed.courses) ? parsed.courses : [];
      exams = Array.isArray(parsed.exams) ? parsed.exams : [];
    } else {
      return {
        success: false,
        error: 'Şablon dosyası K7AÜ ders veya sınav programı verisi içermiyor.'
      };
    }

    if (courses.length === 0 && exams.length === 0) {
      return {
        success: false,
        error: 'Şablon içinde kayıtlı ders ya da sınav bulunamadı.'
      };
    }

    // Normalize IDs so they do not collide if imported multiple times
    const timestamp = Date.now();
    const normalizedCourses: CourseItem[] = courses.map((c, idx) => ({
      ...c,
      id: c.id ? `crs-${timestamp}-${idx}` : `crs-${timestamp}-${idx}`,
      isEnrolled: c.isEnrolled !== undefined ? c.isEnrolled : true,
      grade: typeof c.grade === 'number' ? c.grade : (metadata.grade || 1),
      gradeLabel: c.gradeLabel || (metadata.grade ? `${metadata.grade}. Sınıf` : 'Ortak')
    }));

    const normalizedExams: ExamItem[] = exams.map((e, idx) => ({
      ...e,
      id: e.id ? `ex-${timestamp}-${idx}` : `ex-${timestamp}-${idx}`,
      isEnrolled: e.isEnrolled !== undefined ? e.isEnrolled : true,
      grade: typeof e.grade === 'number' ? e.grade : (metadata.grade || 1),
      gradeLabel: e.gradeLabel || (metadata.grade ? `${metadata.grade}. Sınıf` : 'Ortak')
    }));

    const finalPkg: ScheduleExportPackage = {
      format: 'k7au_schedule_template',
      version: '1.0',
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      metadata,
      summary: {
        courseCount: normalizedCourses.length,
        examCount: normalizedExams.length
      },
      courses: normalizedCourses,
      exams: normalizedExams
    };

    return { success: true, package: finalPkg };
  } catch (err: any) {
    return {
      success: false,
      error: `Şablon çözümlenemedi: ${err?.message || 'Geçersiz JSON formatı'}`
    };
  }
}

/**
 * Applies a verified schedule package to the app storage
 */
export function applySchedulePackage(
  pkg: ScheduleExportPackage,
  mode: 'replace' | 'merge' = 'replace'
): void {
  if (mode === 'replace') {
    saveStoredCourses(pkg.courses);
    saveStoredExams(pkg.exams);
  } else {
    batchImportItems(pkg.courses, pkg.exams, false);
  }
}
