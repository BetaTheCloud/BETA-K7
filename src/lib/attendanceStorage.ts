/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Ders Devamsızlık Takip Sistemi
 * 14 Haftalık akademik dönem & %30 Teorik / %20 Uygulama devamsızlık kuralı yöneticisi.
 */

import { AttendanceRecord, CourseItem, WeekAttendanceStatus } from '../types/schedule';
import { idbPutItem, idbDeleteItem, idbGetAll } from './indexedDbStorage';

export const ATTENDANCE_CHANGED_EVENT = 'k7_attendance_changed';
const ATTENDANCE_STORAGE_KEY = 'k7_attendance_v1';

/**
 * Notifies all listeners that attendance data has been updated.
 */
export function notifyAttendanceChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ATTENDANCE_CHANGED_EVENT));
  }
}

/**
 * Retrieves all attendance records from localStorage cache.
 */
export function getAllAttendanceRecords(): Record<string, AttendanceRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Returns or initializes the attendance record for a specific course.
 */
/**
 * Returns or initializes the attendance record for a specific course.
 */
export function getCourseAttendance(
  courseId: string,
  courseName: string,
  course?: CourseItem
): AttendanceRecord {
  const all = getAllAttendanceRecords();
  if (all[courseId]) {
    const existing = all[courseId];
    // Ensure weekStatuses is populated (weeks 1 to 14)
    if (!existing.weekStatuses || Object.keys(existing.weekStatuses).length === 0) {
      const ws: Record<number, WeekAttendanceStatus> = {};
      const totalW = existing.totalWeeks || 14;
      for (let w = 1; w <= totalW; w++) {
        if (w <= existing.absenceCount) {
          ws[w] = 'absent';
        } else {
          ws[w] = 'unmarked';
        }
      }
      existing.weekStatuses = ws;
    }
    return existing;
  }

  // Initialize fresh record with standard Turkish academic 14-week baseline
  const isLabOrPractice =
    courseName.toLowerCase().includes('lab') ||
    courseName.toLowerCase().includes('uygulama') ||
    (course?.classroom && course.classroom.toLowerCase().includes('lab'));

  // %30 theoretical = max 4 weeks out of 14
  // %20 practical/lab = max 3 weeks out of 14
  const maxAllowed = isLabOrPractice ? 3 : 4;

  const defaultStatuses: Record<number, WeekAttendanceStatus> = {};
  for (let w = 1; w <= 14; w++) {
    defaultStatuses[w] = 'unmarked';
  }

  const defaultRecord: AttendanceRecord = {
    courseId,
    courseName: course?.courseName || courseName,
    courseCode: course?.courseCode || '',
    instructor: course?.instructor || '',
    day: course?.day,
    startTime: course?.startTime,
    classroom: course?.classroom,
    totalWeeks: 14,
    maxAllowedAbsenceWeeks: maxAllowed,
    absenceCount: 0,
    absentDates: [],
    presentCount: 0,
    weekStatuses: defaultStatuses,
    isExempt: false,
    lastUpdated: Date.now()
  };

  return defaultRecord;
}

/**
 * Persists an attendance record into both localStorage and IndexedDB.
 */
export function saveAttendanceRecord(record: AttendanceRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllAttendanceRecords();
    all[record.courseId] = {
      ...record,
      lastUpdated: Date.now()
    };
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(all));
    
    // Asynchronous dual-layer save to IndexedDB
    idbPutItem('attendance', all[record.courseId]);

    notifyAttendanceChanged();
  } catch (err) {
    console.error('Devamsızlık kaydedilemedi:', err);
  }
}

/**
 * Toggles a week's status: unmarked -> absent (🔴) -> present (🟢) -> unmarked (⚪).
 */
export function toggleWeekAttendance(
  courseId: string,
  weekNumber: number,
  course?: CourseItem
): AttendanceRecord {
  const record = getCourseAttendance(courseId, course?.courseName || 'Ders', course);
  const weekStatuses: Record<number, WeekAttendanceStatus> = { ...(record.weekStatuses || {}) };
  const current = weekStatuses[weekNumber] || 'unmarked';

  let nextStatus: WeekAttendanceStatus = 'absent';
  if (current === 'absent') nextStatus = 'present';
  else if (current === 'present') nextStatus = 'unmarked';
  else nextStatus = 'absent';

  weekStatuses[weekNumber] = nextStatus;

  // Recalculate absenceCount and presentCount from the 14-week statuses
  let absenceCount = 0;
  let presentCount = 0;
  const totalW = record.totalWeeks || 14;
  for (let w = 1; w <= totalW; w++) {
    if (weekStatuses[w] === 'absent') absenceCount++;
    if (weekStatuses[w] === 'present') presentCount++;
  }

  const updated: AttendanceRecord = {
    ...record,
    weekStatuses,
    absenceCount,
    presentCount,
    lastUpdated: Date.now()
  };

  saveAttendanceRecord(updated);
  return updated;
}

/**
 * Directly sets a specific week's attendance status.
 */
export function setWeekStatus(
  courseId: string,
  weekNumber: number,
  status: WeekAttendanceStatus,
  course?: CourseItem
): AttendanceRecord {
  const record = getCourseAttendance(courseId, course?.courseName || 'Ders', course);
  const weekStatuses: Record<number, WeekAttendanceStatus> = { ...(record.weekStatuses || {}) };
  weekStatuses[weekNumber] = status;

  let absenceCount = 0;
  let presentCount = 0;
  const totalW = record.totalWeeks || 14;
  for (let w = 1; w <= totalW; w++) {
    if (weekStatuses[w] === 'absent') absenceCount++;
    if (weekStatuses[w] === 'present') presentCount++;
  }

  const updated: AttendanceRecord = {
    ...record,
    weekStatuses,
    absenceCount,
    presentCount,
    lastUpdated: Date.now()
  };

  saveAttendanceRecord(updated);
  return updated;
}

/**
 * Quick stepper (+): Marks the next available week as absent.
 */
export function incrementAbsence(courseId: string, course?: CourseItem): AttendanceRecord {
  const record = getCourseAttendance(courseId, course?.courseName || 'Ders', course);
  const weekStatuses: Record<number, WeekAttendanceStatus> = { ...(record.weekStatuses || {}) };
  const totalW = record.totalWeeks || 14;

  // Find first week that is not 'absent'
  let targetWeek = -1;
  for (let w = 1; w <= totalW; w++) {
    if (weekStatuses[w] !== 'absent') {
      targetWeek = w;
      break;
    }
  }

  if (targetWeek !== -1) {
    weekStatuses[targetWeek] = 'absent';
  }

  let absenceCount = 0;
  let presentCount = 0;
  for (let w = 1; w <= totalW; w++) {
    if (weekStatuses[w] === 'absent') absenceCount++;
    if (weekStatuses[w] === 'present') presentCount++;
  }

  const updated: AttendanceRecord = {
    ...record,
    weekStatuses,
    absenceCount,
    presentCount,
    lastUpdated: Date.now()
  };

  saveAttendanceRecord(updated);
  return updated;
}

/**
 * Quick stepper (-): Unmarks the latest absent week.
 */
export function decrementAbsence(courseId: string): AttendanceRecord {
  const all = getAllAttendanceRecords();
  const record = all[courseId] || getCourseAttendance(courseId, 'Ders');
  const weekStatuses: Record<number, WeekAttendanceStatus> = { ...(record.weekStatuses || {}) };
  const totalW = record.totalWeeks || 14;

  // Find last week that is 'absent'
  let targetWeek = -1;
  for (let w = totalW; w >= 1; w--) {
    if (weekStatuses[w] === 'absent') {
      targetWeek = w;
      break;
    }
  }

  if (targetWeek !== -1) {
    weekStatuses[targetWeek] = 'unmarked';
  }

  let absenceCount = 0;
  let presentCount = 0;
  for (let w = 1; w <= totalW; w++) {
    if (weekStatuses[w] === 'absent') absenceCount++;
    if (weekStatuses[w] === 'present') presentCount++;
  }

  const updated: AttendanceRecord = {
    ...record,
    weekStatuses,
    absenceCount,
    presentCount,
    lastUpdated: Date.now()
  };

  saveAttendanceRecord(updated);
  return updated;
}

/**
 * Updates the maximum allowed absence weeks or exempt status for a course.
 */
export function updateCourseAttendanceLimit(
  courseId: string,
  maxWeeks: number,
  isExempt: boolean = false
): AttendanceRecord {
  const all = getAllAttendanceRecords();
  const record = all[courseId] || getCourseAttendance(courseId, 'Ders');
  const updated: AttendanceRecord = {
    ...record,
    maxAllowedAbsenceWeeks: Math.max(1, maxWeeks),
    isExempt: !!isExempt,
    lastUpdated: Date.now()
  };
  saveAttendanceRecord(updated);
  return updated;
}

/**
 * Legacy support: Logs an absence for a course.
 */
export function logAbsence(
  courseId: string,
  dateStr?: string,
  course?: CourseItem
): AttendanceRecord {
  return incrementAbsence(courseId, course);
}

/**
 * Legacy support: Removes absence.
 */
export function removeAbsence(courseId: string, dateToRemove?: string): AttendanceRecord {
  return decrementAbsence(courseId);
}

/**
 * Legacy support: Logs presence.
 */
export function logPresence(courseId: string, course?: CourseItem): AttendanceRecord {
  const record = getCourseAttendance(courseId, course?.courseName || 'Ders', course);
  const updated: AttendanceRecord = {
    ...record,
    presentCount: (record.presentCount || 0) + 1,
    lastUpdated: Date.now()
  };
  saveAttendanceRecord(updated);
  return updated;
}

/**
 * Resets attendance records for a specific course to clean state.
 */
export function resetCourseAttendance(courseId: string): void {
  const all = getAllAttendanceRecords();
  if (all[courseId]) {
    const defaultStatuses: Record<number, WeekAttendanceStatus> = {};
    for (let w = 1; w <= (all[courseId].totalWeeks || 14); w++) {
      defaultStatuses[w] = 'unmarked';
    }
    all[courseId] = {
      ...all[courseId],
      absenceCount: 0,
      absentDates: [],
      presentCount: 0,
      weekStatuses: defaultStatuses,
      lastUpdated: Date.now()
    };
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(all));
    idbPutItem('attendance', all[courseId]);
    notifyAttendanceChanged();
  }
}

/**
 * Evaluates the safety status of attendance for badge & warning styling.
 */
export function getAttendanceHealthStatus(record: AttendanceRecord): {
  status: 'safe' | 'warning' | 'danger';
  remainingWeeks: number;
  label: string;
  badgeClass: string;
} {
  if (record.isExempt) {
    return {
      status: 'safe',
      remainingWeeks: 99,
      label: 'Devamsızlık Şartsız (Muaf)',
      badgeClass: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30'
    };
  }

  const remainingWeeks = Math.max(0, record.maxAllowedAbsenceWeeks - record.absenceCount);

  if (record.absenceCount > record.maxAllowedAbsenceWeeks) {
    return {
      status: 'danger',
      remainingWeeks: 0,
      label: 'Sınır Aşıldı (Kaldın)',
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
    };
  }

  if (record.absenceCount === record.maxAllowedAbsenceWeeks) {
    return {
      status: 'danger',
      remainingWeeks: 0,
      label: '0 Hak Kaldı (Son Sınır)',
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
    };
  }

  if (remainingWeeks === 1) {
    return {
      status: 'warning',
      remainingWeeks: 1,
      label: 'Kritik (Son 1 Hafta Hak)',
      badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
    };
  }

  return {
    status: 'safe',
    remainingWeeks,
    label: `${remainingWeeks} Hafta Hak Kaldı`,
    badgeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
  };
}
