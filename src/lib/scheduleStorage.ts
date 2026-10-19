/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CourseItem, ExamItem, DayOfWeek, ExamType } from '../types/schedule';

export type { CourseItem, ExamItem, DayOfWeek, ExamType };
export type CourseScheduleItem = CourseItem;
export type ExamScheduleItem = ExamItem & { time?: string };

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

export const SCHEDULE_CHANGED_EVENT = 'k7_schedule_changed';
export const SCHEDULE_UPDATED_EVENT = 'k7_schedule_updated';

const COURSES_STORAGE_KEY = 'k7_schedule_courses_v4';
const EXAMS_STORAGE_KEY = 'k7_schedule_exams_v4';
const ACTIVE_GRADE_STORAGE_KEY = 'k7_schedule_active_grade';

// User explicitly requested mock/sample schedules to be cleared!
export const INITIAL_COURSES_SEED: CourseItem[] = [];
export const INITIAL_EXAMS_SEED: ExamItem[] = [];

// Seed mock IDs that should be purged from older storage versions
const PURGE_MOCK_COURSE_IDS = new Set(['crs-1', 'crs-2', 'crs-3', 'crs-4', 'crs-5']);
const PURGE_MOCK_EXAM_IDS = new Set(['ex-1', 'ex-2']);

function notifyScheduleChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SCHEDULE_CHANGED_EVENT));
    window.dispatchEvent(new CustomEvent(SCHEDULE_UPDATED_EVENT));
  }
}

// Helper to get current DayOfWeek in Turkish
export function getCurrentDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
  const map: Record<number, DayOfWeek> = {
    1: 'Pazartesi',
    2: 'Salı',
    3: 'Çarşamba',
    4: 'Perşembe',
    5: 'Cuma',
    6: 'Cumartesi',
    0: 'Pazar',
  };
  return map[dayIndex] || 'Pazartesi';
}

// --- Active Grade Management ---
export function getActiveGrade(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(ACTIVE_GRADE_STORAGE_KEY);
    if (!raw) return 0;
    const num = parseInt(raw, 10);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

export function setActiveGrade(grade: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_GRADE_STORAGE_KEY, String(grade));
    notifyScheduleChange();
  } catch (err) {
    console.error('Aktif sınıf kaydedilemedi:', err);
  }
}

// --- Courses Management ---
export function getStoredCourses(): CourseItem[] {
  if (typeof window === 'undefined') return [];
  try {
    // Check v4 first, fallback to earlier keys if available
    let raw = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem('k7_schedule_courses_v3') || localStorage.getItem('k7_student_courses_v2');
    }
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out previous hardcoded mock demo data
    const cleaned = parsed.filter((c: any) => c && c.id && !PURGE_MOCK_COURSE_IDS.has(c.id));
    return cleaned;
  } catch (err) {
    console.warn('Dersler okunamadı:', err);
    return [];
  }
}

export const getCourses = getStoredCourses;

export function saveStoredCourses(courses: CourseItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = courses.filter((c) => c && c.id && !PURGE_MOCK_COURSE_IDS.has(c.id));
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(cleaned));
    // Clean up older keys
    localStorage.removeItem('k7_schedule_courses_v3');
    localStorage.removeItem('k7_student_courses_v2');
    notifyScheduleChange();
  } catch (err) {
    console.error('Dersler kaydedilemedi:', err);
  }
}

export const saveCourses = saveStoredCourses;

export function upsertCourse(course: CourseItem): void {
  const current = getStoredCourses();
  const existingIdx = current.findIndex((c) => c.id === course.id);
  let updated: CourseItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = course;
  } else {
    updated = [...current, course];
  }
  saveStoredCourses(updated);
}

export function addCourse(course: Partial<CourseItem>): CourseItem {
  const gradeNum = typeof course.grade === 'number' ? course.grade : 1;
  const newItem: CourseItem = {
    id: course.id || 'crs-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    grade: gradeNum,
    gradeLabel: course.gradeLabel || (gradeNum === 0 ? 'Genel / Ortak' : `${gradeNum}. Sınıf`),
    department: (course.department || '').trim(),
    category: (course.category || '').trim(),
    day: course.day || 'Pazartesi',
    startTime: course.startTime || '09:00',
    endTime: course.endTime || '10:30',
    courseCode: (course.courseCode || '').trim().toUpperCase(),
    courseName: (course.courseName || '').trim(),
    classroom: (course.classroom || '').trim() || 'Derslik',
    instructor: (course.instructor || '').trim() || 'Ders Sorumlusu',
    isEnrolled: course.isEnrolled !== undefined ? course.isEnrolled : true,
    color: course.color || 'emerald',
    notes: (course.notes || '').trim(),
  };
  upsertCourse(newItem);
  return newItem;
}

export function updateCourse(id: string, updates: Partial<CourseItem>): void {
  const current = getStoredCourses();
  const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveStoredCourses(updated);
}

export function deleteCourse(id: string): void {
  const current = getStoredCourses();
  const updated = current.filter((c) => c.id !== id);
  saveStoredCourses(updated);
}

export function toggleCourseEnrollment(id: string): void {
  const current = getStoredCourses();
  const updated = current.map((c) => (c.id === id ? { ...c, isEnrolled: !c.isEnrolled } : c));
  saveStoredCourses(updated);
}

// --- Exams Management ---
function normalizeExam(e: any): ExamItem {
  const time = e.startTime || e.time || '10:00';
  const gradeNum = typeof e.grade === 'number' ? e.grade : 1;
  return {
    ...e,
    startTime: time,
    time: time,
    grade: gradeNum,
    gradeLabel: e.gradeLabel || (gradeNum === 0 ? 'Genel / Ortak' : `${gradeNum}. Sınıf`),
    department: (e.department || '').trim(),
    category: (e.category || '').trim(),
    isEnrolled: e.isEnrolled !== undefined ? e.isEnrolled : true,
    examType: e.examType || 'vize',
    classroom: (e.classroom || '').trim() || 'Sınav Salonu',
    instructor: (e.instructor || '').trim() || 'Ders Sorumlusu',
  };
}

export function getStoredExams(): ExamItem[] {
  if (typeof window === 'undefined') return [];
  try {
    let raw = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem('k7_schedule_exams_v3') || localStorage.getItem('k7_student_exams_v2');
    }
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out previous hardcoded mock demo data
    const cleaned = parsed
      .filter((e: any) => e && e.id && !PURGE_MOCK_EXAM_IDS.has(e.id))
      .map(normalizeExam);

    return cleaned;
  } catch (err) {
    console.warn('Sınavlar okunamadı:', err);
    return [];
  }
}

export const getExams = getStoredExams;

export function saveStoredExams(exams: ExamItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = exams
      .filter((e) => e && e.id && !PURGE_MOCK_EXAM_IDS.has(e.id))
      .map(normalizeExam);
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(cleaned));
    // Clean up older keys
    localStorage.removeItem('k7_schedule_exams_v3');
    localStorage.removeItem('k7_student_exams_v2');
    notifyScheduleChange();
  } catch (err) {
    console.error('Sınavlar kaydedilemedi:', err);
  }
}

export const saveExams = saveStoredExams;

export function upsertExam(exam: ExamItem): void {
  const current = getStoredExams();
  const norm = normalizeExam(exam);
  const existingIdx = current.findIndex((e) => e.id === norm.id);
  let updated: ExamItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = norm;
  } else {
    updated = [...current, norm];
  }
  saveStoredExams(updated);
}

export function addExam(exam: Partial<ExamItem>): ExamItem {
  const time = exam.startTime || exam.time || '10:00';
  const gradeNum = typeof exam.grade === 'number' ? exam.grade : 1;
  const newItem: ExamItem = normalizeExam({
    id: exam.id || 'ex-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    grade: gradeNum,
    gradeLabel: exam.gradeLabel || (gradeNum === 0 ? 'Genel / Ortak' : `${gradeNum}. Sınıf`),
    department: (exam.department || '').trim(),
    category: (exam.category || '').trim(),
    courseName: (exam.courseName || '').trim() || 'Ders Adı',
    courseCode: (exam.courseCode || '').trim().toUpperCase(),
    examType: exam.examType || 'vize',
    date: exam.date || new Date().toISOString().split('T')[0],
    startTime: time,
    time: time,
    classroom: (exam.classroom || '').trim() || 'Merkezi Derslik',
    instructor: (exam.instructor || '').trim() || 'Ders Hocası',
    isEnrolled: exam.isEnrolled !== undefined ? exam.isEnrolled : true,
    notes: (exam.notes || '').trim(),
  });
  upsertExam(newItem);
  return newItem;
}

export function updateExam(id: string, updates: Partial<ExamItem>): void {
  const current = getStoredExams();
  const updated = current.map((e) => (e.id === id ? normalizeExam({ ...e, ...updates }) : e));
  saveStoredExams(updated);
}

export function deleteExam(id: string): void {
  const current = getStoredExams();
  const updated = current.filter((e) => e.id !== id);
  saveStoredExams(updated);
}

export function toggleExamEnrollment(id: string): void {
  const current = getStoredExams();
  const updated = current.map((e) => (e.id === id ? { ...e, isEnrolled: !e.isEnrolled } : e));
  saveStoredExams(updated);
}

// Return exams sorted by date and time ascending
export function getSortedExams(): ExamItem[] {
  const list = getStoredExams();
  return [...list].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    const timeA = a.startTime || a.time || '';
    const timeB = b.startTime || b.time || '';
    return timeA.localeCompare(timeB);
  });
}

// Return courses for a specific day sorted by time
export function getCoursesByDay(day: DayOfWeek): CourseItem[] {
  const list = getStoredCourses().filter((c) => c.day === day);
  return list.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// --- Batch Import & Bulk Operations ---
export function batchImportItems(
  newCourses: CourseItem[],
  newExams: ExamItem[],
  replaceExisting: boolean = false
): void {
  let finalCourses: CourseItem[] = [];
  let finalExams: ExamItem[] = [];

  if (replaceExisting) {
    finalCourses = newCourses.filter((c) => c && c.id && !PURGE_MOCK_COURSE_IDS.has(c.id));
    finalExams = newExams.filter((e) => e && e.id && !PURGE_MOCK_EXAM_IDS.has(e.id)).map(normalizeExam);
  } else {
    const existingCourses = getStoredCourses();
    const existingExams = getStoredExams();

    const courseMap = new Map<string, CourseItem>();
    existingCourses.forEach((c) => courseMap.set(c.id, c));
    newCourses.forEach((c) => {
      if (c && c.id && !PURGE_MOCK_COURSE_IDS.has(c.id)) {
        courseMap.set(c.id, c);
      }
    });
    finalCourses = Array.from(courseMap.values());

    const examMap = new Map<string, ExamItem>();
    existingExams.forEach((e) => examMap.set(e.id, normalizeExam(e)));
    newExams.forEach((e) => {
      if (e && e.id && !PURGE_MOCK_EXAM_IDS.has(e.id)) {
        examMap.set(e.id, normalizeExam(e));
      }
    });
    finalExams = Array.from(examMap.values());
  }

  saveStoredCourses(finalCourses);
  saveStoredExams(finalExams);
}

// Helper to check if two time ranges overlap (e.g. "09:00-10:30" and "09:30-11:00")
export function hasTimeOverlap(
  c1: { startTime: string; endTime: string },
  c2: { startTime: string; endTime: string }
): boolean {
  if (!c1.startTime || !c1.endTime || !c2.startTime || !c2.endTime) return false;
  // Standard HH:MM strings compare lexicographically
  return c1.startTime < c2.endTime && c2.startTime < c1.endTime;
}

// Helper to find all courses that conflict with a given course on the same day
export function getOverlappingCourses(course: CourseItem, allCourses: CourseItem[]): CourseItem[] {
  return allCourses.filter(
    (other) =>
      other.id !== course.id &&
      other.day === course.day &&
      hasTimeOverlap(course, other)
  );
}

export function clearAllScheduleData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(COURSES_STORAGE_KEY);
    localStorage.removeItem(EXAMS_STORAGE_KEY);
    localStorage.removeItem('k7_schedule_courses_v3');
    localStorage.removeItem('k7_schedule_exams_v3');
    localStorage.removeItem('k7_student_courses_v2');
    localStorage.removeItem('k7_student_exams_v2');
    notifyScheduleChange();
  } catch (err) {
    console.error('Takvim verileri temizlenemedi:', err);
  }
}

