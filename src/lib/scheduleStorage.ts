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

// Sample course schedule for Kilis 7 Aralık Üniversitesi (Mühendislik-Mimarlık Fakültesi / Bilgisayar Mühendisliği)
export const INITIAL_COURSES_SEED: CourseItem[] = [
  // --- 1. Sınıf ---
  {
    id: 'k7-crs-101',
    grade: 1,
    gradeLabel: '1. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Pazartesi',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG101',
    courseName: 'Bilgisayar Mühendisliğine Giriş',
    classroom: 'D-201',
    instructor: 'Dr. Öğr. Üyesi Ahmet Yılmaz',
    isEnrolled: true,
    color: '#0284c7',
    notes: 'Kariyer ve mühendislik etiği seminerleri dahildir.',
  },
  {
    id: 'k7-crs-102',
    grade: 1,
    gradeLabel: '1. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Salı',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'MAT101',
    courseName: 'Matematik I (Calculus)',
    classroom: 'Merkezi Derslik Amfi-1',
    instructor: 'Doç. Dr. Selin Korkmaz',
    isEnrolled: true,
    color: '#059669',
    notes: 'Ödev ve problem çözümü her hafta toplanır.',
  },
  {
    id: 'k7-crs-103',
    grade: 1,
    gradeLabel: '1. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Çarşamba',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'FİZ101',
    courseName: 'Fizik I (Mekanik)',
    classroom: 'Fizik Lab 1',
    instructor: 'Dr. Öğr. Üyesi Mehmet Öz',
    isEnrolled: true,
    color: '#d97706',
    notes: 'Laboratuvar föyleri dersten önce doldurulmalı.',
  },
  {
    id: 'k7-crs-104',
    grade: 1,
    gradeLabel: '1. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Perşembe',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG103',
    courseName: 'Algoritmalar ve Programlama I',
    classroom: 'Bilgisayar Lab 3',
    instructor: 'Dr. Öğr. Üyesi Burak Demir',
    isEnrolled: true,
    color: '#8b5cf6',
    notes: 'C ve Python diliyle temel algoritma tasarımı.',
  },
  {
    id: 'k7-crs-105',
    grade: 1,
    gradeLabel: '1. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Cuma',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'YDİ101',
    courseName: 'Yabancı Dil I (İngilizce)',
    classroom: 'D-105',
    instructor: 'Öğr. Gör. Zeynep Kaya',
    isEnrolled: true,
    color: '#0284c7',
  },
  {
    id: 'k7-crs-106',
    grade: 1,
    gradeLabel: '1. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Pazartesi',
    startTime: '13:30',
    endTime: '15:15',
    courseCode: 'TÜR101',
    courseName: 'Türk Dili I',
    classroom: 'D-203',
    instructor: 'Öğr. Gör. Hakan Çelik',
    isEnrolled: true,
    color: '#059669',
  },

  // --- 2. Sınıf (Tamamlanmış ve Ders Notu Eklenmiş Dersler) ---
  {
    id: 'k7-crs-201',
    grade: 2,
    gradeLabel: '2. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Pazartesi',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG201',
    courseName: 'Veri Yapıları',
    classroom: 'Müh. Fak. Bilgisayar Lab 2',
    instructor: 'Doç. Dr. Alper Çetin',
    isEnrolled: true,
    color: '#8a2a43',
    notes: 'Bağlı listeler, yığınlar, kuyruklar ve ağaç yapıları. Ders notu eklendi!',
  },
  {
    id: 'k7-crs-202',
    grade: 2,
    gradeLabel: '2. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Salı',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG203',
    courseName: 'Nesneye Yönelik Programlama',
    classroom: 'Bilgisayar Lab 1',
    instructor: 'Dr. Öğr. Üyesi Gamze Arslan',
    isEnrolled: true,
    color: '#0284c7',
    notes: 'Java & OOP prensipleri, kalıtım, soyutlama ve tasarım kalıpları.',
  },
  {
    id: 'k7-crs-203',
    grade: 2,
    gradeLabel: '2. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Çarşamba',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'MAT201',
    courseName: 'Ayrık Matematik',
    classroom: 'D-302',
    instructor: 'Prof. Dr. Kerem Aydın',
    isEnrolled: true,
    color: '#059669',
  },
  {
    id: 'k7-crs-204',
    grade: 2,
    gradeLabel: '2. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Perşembe',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG205',
    courseName: 'Mantıksal Devre Tasarımı',
    classroom: 'Elektronik Lab',
    instructor: 'Dr. Öğr. Üyesi Hasan Polat',
    isEnrolled: true,
    color: '#d97706',
  },
  {
    id: 'k7-crs-205',
    grade: 2,
    gradeLabel: '2. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Cuma',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'MAT203',
    courseName: 'Diferansiyel Denklemler',
    classroom: 'Merkezi Derslik Amfi-2',
    instructor: 'Doç. Dr. Emel Şahin',
    isEnrolled: true,
    color: '#8b5cf6',
  },
  {
    id: 'k7-crs-206',
    grade: 2,
    gradeLabel: '2. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Seçmeli',
    day: 'Salı',
    startTime: '13:30',
    endTime: '15:15',
    courseCode: 'BLG207',
    courseName: 'Web Tasarımı ve Teknolojileri',
    classroom: 'Web Lab',
    instructor: 'Öğr. Gör. Deniz Eren',
    isEnrolled: true,
    color: '#0284c7',
  },

  // --- 3. Sınıf ---
  {
    id: 'k7-crs-301',
    grade: 3,
    gradeLabel: '3. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Pazartesi',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG301',
    courseName: 'Veritabanı Yönetim Sistemleri',
    classroom: 'Müh. Fak. Bilgisayar Lab 4',
    instructor: 'Prof. Dr. Murat Kaplan',
    isEnrolled: true,
    color: '#8a2a43',
    notes: 'İlişkisel veritabanı, SQL sorguları ve optimizasyon.',
  },
  {
    id: 'k7-crs-302',
    grade: 3,
    gradeLabel: '3. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Salı',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG303',
    courseName: 'İşletim Sistemleri',
    classroom: 'D-204',
    instructor: 'Doç. Dr. Serkan Bulut',
    isEnrolled: true,
    color: '#0284c7',
  },
  {
    id: 'k7-crs-303',
    grade: 3,
    gradeLabel: '3. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Çarşamba',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG305',
    courseName: 'Bilgisayar Ağları',
    classroom: 'D-102',
    instructor: 'Dr. Öğr. Üyesi Tarık Öztürk',
    isEnrolled: true,
    color: '#059669',
  },
  {
    id: 'k7-crs-304',
    grade: 3,
    gradeLabel: '3. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Perşembe',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG307',
    courseName: 'Yazılım Mühendisliği',
    classroom: 'D-208',
    instructor: 'Doç. Dr. Nilgün Koç',
    isEnrolled: true,
    color: '#d97706',
  },
  {
    id: 'k7-crs-305',
    grade: 3,
    gradeLabel: '3. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Cuma',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG309',
    courseName: 'Mikroişlemciler ve Assembly',
    classroom: 'Elektronik Lab',
    instructor: 'Dr. Öğr. Üyesi Hasan Polat',
    isEnrolled: true,
    color: '#8b5cf6',
  },

  // --- 4. Sınıf ---
  {
    id: 'k7-crs-401',
    grade: 4,
    gradeLabel: '4. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Pazartesi',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG401',
    courseName: 'Yapay Zekaya Giriş',
    classroom: 'D-301',
    instructor: 'Prof. Dr. Hakan Erdem',
    isEnrolled: true,
    color: '#8a2a43',
    notes: 'Makine öğrenmesi ve sezgisel arama algoritmaları.',
  },
  {
    id: 'k7-crs-402',
    grade: 4,
    gradeLabel: '4. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Salı',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG403',
    courseName: 'Bilgisayar ve Ağ Güvenliği',
    classroom: 'Bilgisayar Lab 2',
    instructor: 'Doç. Dr. Cihan Aksoy',
    isEnrolled: true,
    color: '#0284c7',
  },
  {
    id: 'k7-crs-403',
    grade: 4,
    gradeLabel: '4. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Çarşamba',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG405',
    courseName: 'Mobil Uygulama Geliştirme',
    classroom: 'Mobil Lab',
    instructor: 'Dr. Öğr. Üyesi Elif Çakır',
    isEnrolled: true,
    color: '#059669',
  },
  {
    id: 'k7-crs-404',
    grade: 4,
    gradeLabel: '4. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Perşembe',
    startTime: '08:30',
    endTime: '10:15',
    courseCode: 'BLG407',
    courseName: 'Bulut Bilişim ve Dağıtık Sistemler',
    classroom: 'D-304',
    instructor: 'Doç. Dr. Alper Çetin',
    isEnrolled: true,
    color: '#d97706',
  },
  {
    id: 'k7-crs-405',
    grade: 4,
    gradeLabel: '4. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    day: 'Cuma',
    startTime: '08:30',
    endTime: '11:30',
    courseCode: 'BLG491',
    courseName: 'Mühendislik Tasarımı ve Bitirme Tezi',
    classroom: 'Müh. Seminer Salonu',
    instructor: 'Bölüm Öğretim Üyeleri',
    isEnrolled: true,
    color: '#8b5cf6',
  },
];

export const INITIAL_EXAMS_SEED: ExamItem[] = [
  {
    id: 'k7-ex-201',
    grade: 2,
    gradeLabel: '2. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    examType: 'vize',
    courseCode: 'BLG201',
    courseName: 'Veri Yapıları Vize Sınavı',
    date: '2026-11-16',
    startTime: '10:00',
    time: '10:00',
    endTime: '11:30',
    classroom: 'Merkezi Derslik Amfi-1',
    instructor: 'Doç. Dr. Alper Çetin',
    supervisor: 'Arş. Gör. Mehmet Demir',
    isEnrolled: true,
    notes: 'Bağlı listeler, yığınlar ve kuyruklar sınav kapsamındadır.',
  },
  {
    id: 'k7-ex-101',
    grade: 1,
    gradeLabel: '1. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    examType: 'vize',
    courseCode: 'MAT101',
    courseName: 'Matematik I Vize Sınavı',
    date: '2026-11-18',
    startTime: '13:30',
    time: '13:30',
    endTime: '15:00',
    classroom: 'D-201 & D-202',
    instructor: 'Doç. Dr. Selin Korkmaz',
    supervisor: 'Arş. Gör. Ayşe Yılmaz',
    isEnrolled: true,
  },
  {
    id: 'k7-ex-301',
    grade: 3,
    gradeLabel: '3. Sınıf',
    department: 'Bilgisayar Mühendisliği',
    category: 'Zorunlu',
    examType: 'vize',
    courseCode: 'BLG301',
    courseName: 'Veritabanı Yönetim Sistemleri Vize Sınavı',
    date: '2026-11-20',
    startTime: '10:00',
    time: '10:00',
    endTime: '11:30',
    classroom: 'Bilgisayar Lab 2 & Lab 4',
    instructor: 'Prof. Dr. Murat Kaplan',
    isEnrolled: true,
  },
];

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
// Default grade is 1 (1. Sınıf) since "Tümü" category has been removed
export function getActiveGrade(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = localStorage.getItem(ACTIVE_GRADE_STORAGE_KEY);
    if (!raw) return 1;
    const num = parseInt(raw, 10);
    return isNaN(num) || num === 0 ? 1 : num;
  } catch {
    return 1;
  }
}

export function setActiveGrade(grade: number): void {
  if (typeof window === 'undefined') return;
  try {
    const validGrade = grade === 0 ? 1 : grade;
    localStorage.setItem(ACTIVE_GRADE_STORAGE_KEY, String(validGrade));
    notifyScheduleChange();
  } catch (err) {
    console.error('Aktif sınıf kaydedilemedi:', err);
  }
}

// --- Courses Management ---
export function getStoredCourses(): CourseItem[] {
  if (typeof window === 'undefined') return INITIAL_COURSES_SEED;
  try {
    let raw = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!raw) {
      // Seed sample courses so student can immediately test
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(INITIAL_COURSES_SEED));
      return INITIAL_COURSES_SEED;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(INITIAL_COURSES_SEED));
      return INITIAL_COURSES_SEED;
    }

    return parsed;
  } catch (err) {
    console.warn('Dersler okunamadı:', err);
    return INITIAL_COURSES_SEED;
  }
}

export const getCourses = getStoredCourses;

export function resetSampleSchedule(): CourseItem[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(INITIAL_COURSES_SEED));
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(INITIAL_EXAMS_SEED));
    setActiveGrade(1);
    notifyScheduleChange();
  }
  return INITIAL_COURSES_SEED;
}

export function saveStoredCourses(courses: CourseItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = courses.filter((c) => c && c.id);
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
  const gradeNum = typeof course.grade === 'number' && course.grade > 0 ? course.grade : 1;
  const newItem: CourseItem = {
    id: course.id || 'crs-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    grade: gradeNum,
    gradeLabel: course.gradeLabel || `${gradeNum}. Sınıf`,
    department: (course.department || '').trim(),
    category: (course.category || '').trim(),
    day: course.day || 'Pazartesi',
    startTime: course.startTime || '08:30',
    endTime: course.endTime || '10:15',
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
  let time = (e.startTime || e.time || '10:00').trim().replace(/\./g, ':');
  if (time.length === 4 && time.indexOf(':') === 1) {
    time = '0' + time;
  }
  let date = (e.date || new Date().toISOString().split('T')[0]).trim();
  const dotMatch = date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    date = `${dotMatch[3]}-${dotMatch[2].padStart(2, '0')}-${dotMatch[1].padStart(2, '0')}`;
  }
  const gradeNum = typeof e.grade === 'number' && e.grade > 0 ? e.grade : 1;
  return {
    ...e,
    date,
    startTime: time,
    time: time,
    grade: gradeNum,
    gradeLabel: e.gradeLabel || `${gradeNum}. Sınıf`,
    department: (e.department || '').trim(),
    category: (e.category || '').trim(),
    isEnrolled: e.isEnrolled !== undefined ? e.isEnrolled : true,
    examType: e.examType || 'vize',
    classroom: (e.classroom || '').trim() || 'Sınav Salonu',
    instructor: (e.instructor || '').trim() || 'Ders Sorumlusu',
  };
}

export function getStoredExams(): ExamItem[] {
  if (typeof window === 'undefined') return INITIAL_EXAMS_SEED;
  try {
    let raw = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(INITIAL_EXAMS_SEED));
      return INITIAL_EXAMS_SEED;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(INITIAL_EXAMS_SEED));
      return INITIAL_EXAMS_SEED;
    }

    return parsed.map(normalizeExam);
  } catch (err) {
    console.warn('Sınavlar okunamadı:', err);
    return INITIAL_EXAMS_SEED;
  }
}

export const getExams = getStoredExams;

export function saveStoredExams(exams: ExamItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = exams
      .filter((e) => e && e.id)
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
    finalCourses = newCourses.filter((c) => c && c.id);
    finalExams = newExams.filter((e) => e && e.id).map(normalizeExam);
  } else {
    const existingCourses = getStoredCourses();
    const existingExams = getStoredExams();

    const courseMap = new Map<string, CourseItem>();
    existingCourses.forEach((c) => courseMap.set(c.id, c));
    newCourses.forEach((c) => {
      if (c && c.id) {
        courseMap.set(c.id, c);
      }
    });
    finalCourses = Array.from(courseMap.values());

    const examMap = new Map<string, ExamItem>();
    existingExams.forEach((e) => examMap.set(e.id, normalizeExam(e)));
    newExams.forEach((e) => {
      if (e && e.id) {
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

