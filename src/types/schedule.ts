/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DayOfWeek =
  | 'Pazartesi'
  | 'Salı'
  | 'Çarşamba'
  | 'Perşembe'
  | 'Cuma'
  | 'Cumartesi'
  | 'Pazar';

export type ExamType =
  | 'vize'
  | 'final'
  | 'butunleme'
  | 'mazeret'
  | 'diger'
  | 'Vize'
  | 'Final'
  | 'Bütünleme'
  | 'Mazeret'
  | 'Quiz';

export interface CourseItem {
  id: string;
  grade: number; // 1, 2, 3, 4 or 0 (Ortak/Genel)
  gradeLabel: string; // e.g. "1. Sınıf", "2. Sınıf"
  department?: string; // e.g. "Bilgisayar Müh.", "İnşaat Müh.", "İlahiyat", "İİBF"
  category?: string; // e.g. "Zorunlu", "Seçmeli", "Ortak"
  day: DayOfWeek;
  startTime: string; // "08:30"
  endTime: string; // "10:15"
  courseCode: string; // "BİL101"
  courseName: string; // "Programlama Temelleri"
  classroom: string; // "D-203" or "Bilgisayar Lab 1"
  instructor: string; // "Dr. Öğr. Üyesi Ahmet Yılmaz"
  branch?: string; // "A Şubesi" or "1. Öğretim"
  isEnrolled: boolean; // Has student selected this as their own course?
  notes?: string;
  color?: string; // Hex or theme color key for calendar block
}

export interface ExamItem {
  id: string;
  grade: number; // 1, 2, 3, 4 or 0
  gradeLabel: string;
  department?: string;
  category?: string;
  examType: ExamType;
  courseCode: string;
  courseName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "10:00"
  time?: string; // mirror for startTime
  endTime?: string; // "11:30"
  classroom: string; // "D-101, D-102"
  instructor: string;
  supervisor?: string; // Gözetmen
  isEnrolled: boolean;
  notes?: string;
}

export interface DetectedGradeSummary {
  grade: number;
  label: string;
  courseCount: number;
  examCount: number;
}

export interface ParsedDocumentResult {
  detectedType: 'course' | 'exam' | 'mixed';
  fileName: string;
  detectedGrades: DetectedGradeSummary[];
  courses: CourseItem[];
  exams: ExamItem[];
  warnings?: string[];
}
