/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Not & GNO (Harf Notu ve Ortalama) Hesaplama Motoru
 * Üniversite bağıl/mutlak 4'lük katsayı tablosu ve vize-final hedef simülatörü.
 */

import { GpaCourseItem, LetterGradeScale, CourseItem } from '../types/schedule';
import { idbPutMany, idbGetAll } from './indexedDbStorage';

export const GPA_CHANGED_EVENT = 'k7_gpa_changed';
const GPA_STORAGE_KEY = 'k7_gpa_courses_v1';

/**
 * Standard Kilis 7 Aralık Üniversitesi Letter Grade Scale
 */
export const K7_LETTER_GRADE_SCALE: LetterGradeScale[] = [
  { grade: 'AA', points: 4.0, minScore: 90, maxScore: 100, description: 'Mükemmel (Pekiyi)' },
  { grade: 'BA', points: 3.5, minScore: 85, maxScore: 89, description: 'Çok İyi' },
  { grade: 'BB', points: 3.0, minScore: 80, maxScore: 84, description: 'İyi' },
  { grade: 'CB', points: 2.5, minScore: 75, maxScore: 79, description: 'Orta-İyi' },
  { grade: 'CC', points: 2.0, minScore: 70, maxScore: 74, description: 'Başarılı (Geçer)' },
  { grade: 'DC', points: 1.5, minScore: 60, maxScore: 69, description: 'Koşullu Başarılı' },
  { grade: 'DD', points: 1.0, minScore: 50, maxScore: 59, description: 'Koşullu Başarılı' },
  { grade: 'FD', points: 0.5, minScore: 40, maxScore: 49, description: 'Başarısız' },
  { grade: 'FF', points: 0.0, minScore: 0, maxScore: 39, description: 'Başarısız (Kaldı)' }
];

/**
 * Converts a 100-point total score into a letter grade and point equivalent.
 */
export function scoreToLetterGrade(score: number): LetterGradeScale {
  const rounded = Math.round(score);
  for (const item of K7_LETTER_GRADE_SCALE) {
    if (rounded >= item.minScore) {
      return item;
    }
  }
  return K7_LETTER_GRADE_SCALE[K7_LETTER_GRADE_SCALE.length - 1];
}

/**
 * Calculates weighted course score (e.g. Vize %40 + Final %60).
 */
export function calculateCourseWeightedScore(
  vize: number | null,
  final: number | null,
  vizeWeight = 40,
  finalWeight = 60
): number | null {
  if (vize === null && final === null) return null;
  const v = vize ?? 0;
  const f = final ?? 0;
  return (v * (vizeWeight / 100)) + (f * (finalWeight / 100));
}

/**
 * "Finalden kaç almalıyım?" solver.
 * Calculates minimum required final exam score to achieve target letter grade (e.g. 'CC').
 */
export function calculateRequiredFinalScore(
  vizeScore: number,
  targetGrade = 'CC',
  vizeWeight = 40,
  finalWeight = 60
): {
  requiredScore: number;
  isPossible: boolean;
  message: string;
} {
  const targetScale = K7_LETTER_GRADE_SCALE.find((s) => s.grade === targetGrade) || K7_LETTER_GRADE_SCALE[4];
  const targetMin = targetScale.minScore;

  // targetMin = (vizeScore * (vizeWeight / 100)) + (finalScore * (finalWeight / 100))
  // finalScore = (targetMin - (vizeScore * (vizeWeight / 100))) / (finalWeight / 100)
  const vizeContribution = vizeScore * (vizeWeight / 100);
  const neededFromFinal = targetMin - vizeContribution;
  const requiredFinal = Math.ceil(neededFromFinal / (finalWeight / 100));

  if (requiredFinal <= 0) {
    return {
      requiredScore: 0,
      isPossible: true,
      message: `Tebrikler! Vize notunuz yüksek olduğu için finale girdiğinizde ${targetGrade} harf notunu garantilemiş durumdasınız.`
    };
  }

  if (requiredFinal > 100) {
    return {
      requiredScore: requiredFinal,
      isPossible: false,
      message: `Finalden 100 tam puan alsanız bile ${targetGrade} ortalamasına erişilemiyor. Hedef harf notunu bir alt bareme çekmeyi deneyin.`
    };
  }

  return {
    requiredScore: requiredFinal,
    isPossible: true,
    message: `${targetGrade} (${targetScale.description}) alabilmek için finalden en az ${requiredFinal} almanız gerekmektedir.`
  };
}

/**
 * Computes the semester grade point average (Dönemlik GNO / AGNO).
 */
export function calculateSemesterGpa(courses: GpaCourseItem[]): {
  gpa: number;
  totalCredits: number;
  passedCredits: number;
  gradedCourseCount: number;
} {
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  let passedCredits = 0;
  let gradedCourseCount = 0;

  for (const c of courses) {
    const cred = c.credits || 3;
    let pointVal: number | null = null;

    if (c.letterGrade) {
      const match = K7_LETTER_GRADE_SCALE.find((s) => s.grade === c.letterGrade);
      if (match) pointVal = match.points;
    } else if (c.vize !== null && c.final !== null) {
      const totalScore = calculateCourseWeightedScore(c.vize, c.final, c.vizeWeight, c.finalWeight);
      if (totalScore !== null) {
        const gradeObj = scoreToLetterGrade(totalScore);
        pointVal = gradeObj.points;
      }
    }

    if (pointVal !== null) {
      totalWeightedPoints += pointVal * cred;
      totalCredits += cred;
      gradedCourseCount++;
      if (pointVal >= 1.0) {
        passedCredits += cred;
      }
    }
  }

  const gpa = totalCredits > 0 ? Number((totalWeightedPoints / totalCredits).toFixed(2)) : 0.0;

  return {
    gpa,
    totalCredits,
    passedCredits,
    gradedCourseCount
  };
}

/**
 * Computes Cumulative GPA (Genel Not Ortalaması) merging previous transcript with current semester.
 */
export function calculateCumulativeGpa(
  previousGpa: number,
  previousCredits: number,
  currentGpa: number,
  currentCredits: number
): number {
  const totalCredits = previousCredits + currentCredits;
  if (totalCredits <= 0) return 0.0;

  const totalPoints = (previousGpa * previousCredits) + (currentGpa * currentCredits);
  return Number((totalPoints / totalCredits).toFixed(2));
}

/**
 * Retrieves stored GPA course items from cache.
 */
export function getStoredGpaCourses(): GpaCourseItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GPA_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves GPA course items to localStorage and IndexedDB.
 */
export function saveStoredGpaCourses(courses: GpaCourseItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GPA_STORAGE_KEY, JSON.stringify(courses));
    idbPutMany('gpa_courses', courses);
    window.dispatchEvent(new CustomEvent(GPA_CHANGED_EVENT));
  } catch (err) {
    console.error('Gpa verileri kaydedilemedi:', err);
  }
}

/**
 * Synchronizes GPA courses list from enrolled schedule courses.
 * If user already added scores to a course, preserves them.
 */
export function syncGpaCoursesFromSchedule(scheduleCourses: CourseItem[]): GpaCourseItem[] {
  const existing = getStoredGpaCourses();
  const existingMap = new Map<string, GpaCourseItem>();
  existing.forEach((c) => {
    if (c.courseId) existingMap.set(c.courseId, c);
    else existingMap.set(c.id, c);
  });

  const enrolled = scheduleCourses.filter((c) => c.isEnrolled);
  
  // Deduplicate by courseCode or courseName
  const uniqueEnrolled: CourseItem[] = [];
  const seenCodes = new Set<string>();

  for (const c of enrolled) {
    const key = c.courseCode || c.courseName;
    if (!seenCodes.has(key)) {
      seenCodes.add(key);
      uniqueEnrolled.push(c);
    }
  }

  const updated: GpaCourseItem[] = uniqueEnrolled.map((sc) => {
    const prev = existingMap.get(sc.id) || existingMap.get(sc.courseCode);
    if (prev) {
      return {
        ...prev,
        courseName: sc.courseName,
        courseCode: sc.courseCode
      };
    }
    return {
      id: `gpa-${sc.id}`,
      courseId: sc.id,
      courseCode: sc.courseCode || 'DERS',
      courseName: sc.courseName,
      credits: 4, // default 4 AKTS
      vize: null,
      vizeWeight: 40,
      final: null,
      finalWeight: 60
    };
  });

  // Preserve any manually added custom courses
  const customCourses = existing.filter((c) => c.isCustom);
  const combined = [...updated, ...customCourses];

  saveStoredGpaCourses(combined);
  return combined;
}
