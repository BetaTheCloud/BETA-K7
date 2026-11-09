/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Gelişmiş IndexedDB Depolama Katmanı
 * Yüksek kotalı, yapısal ve çevrimdışı yerel veritabanı yönetimi.
 */

const DB_NAME = 'k7_campus_db';
const DB_VERSION = 1;

export interface StorageQuotaInfo {
  usageBytes: number;
  quotaBytes: number;
  usageFormatted: string;
  quotaFormatted: string;
  usagePercentage: number;
  courseCount: number;
  examCount: number;
  noteCount: number;
  attendanceCount: number;
  isIndexedDbSupported: boolean;
}

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

/**
 * Initializes and returns the persistent IndexedDB connection.
 */
export function getIndexedDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbInitPromise) return dbInitPromise;

  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment.'));
  }

  dbInitPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('exams')) {
        db.createObjectStore('exams', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('courseId', 'courseId', { unique: false });
        noteStore.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains('attendance')) {
        db.createObjectStore('attendance', { keyPath: 'courseId' });
      }
      if (!db.objectStoreNames.contains('gpa_courses')) {
        db.createObjectStore('gpa_courses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('app_meta')) {
        db.createObjectStore('app_meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      
      // Auto-migrate from localStorage if not migrated yet
      migrateFromLocalStorage(dbInstance).catch((err) => {
        console.warn('[IndexedDB] Auto-migration warning:', err);
      });

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('[IndexedDB] Failed to open database:', event);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbInitPromise;
}

/**
 * Automatically copies existing localStorage items into IndexedDB on first run.
 */
async function migrateFromLocalStorage(db: IDBDatabase): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const migrated = localStorage.getItem('k7_idb_migrated_v1');
    if (migrated) return;

    // Migrate courses
    const storedCourses = localStorage.getItem('k7_courses_v1');
    if (storedCourses) {
      const courses = JSON.parse(storedCourses);
      if (Array.isArray(courses)) {
        await idbPutMany('courses', courses);
      }
    }

    // Migrate exams
    const storedExams = localStorage.getItem('k7_exams_v1');
    if (storedExams) {
      const exams = JSON.parse(storedExams);
      if (Array.isArray(exams)) {
        await idbPutMany('exams', exams);
      }
    }

    // Migrate notes
    const storedNotes = localStorage.getItem('k7_course_notes_v1');
    if (storedNotes) {
      const notes = JSON.parse(storedNotes);
      if (Array.isArray(notes)) {
        await idbPutMany('notes', notes);
      }
    }

    // Migrate attendance
    const storedAttendance = localStorage.getItem('k7_attendance_v1');
    if (storedAttendance) {
      const att = JSON.parse(storedAttendance);
      const attList = Array.isArray(att) ? att : (typeof att === 'object' && att !== null ? Object.values(att) : []);
      if (attList.length > 0) {
        await idbPutMany('attendance', attList);
      }
    }

    // Migrate GPA courses
    const storedGpa = localStorage.getItem('k7_gpa_courses_v1');
    if (storedGpa) {
      const gpa = JSON.parse(storedGpa);
      if (Array.isArray(gpa) && gpa.length > 0) {
        await idbPutMany('gpa_courses', gpa);
      }
    }

    localStorage.setItem('k7_idb_migrated_v1', 'true');
  } catch (e) {
    console.warn('[IndexedDB] Migration error:', e);
  }
}

/**
 * Manually forces synchronization of all localStorage models into IndexedDB.
 */
export async function forceSyncAllToIndexedDb(): Promise<{
  courses: number;
  exams: number;
  notes: number;
  attendance: number;
  gpa: number;
}> {
  let coursesCount = 0;
  let examsCount = 0;
  let notesCount = 0;
  let attCount = 0;
  let gpaCount = 0;

  try {
    const rawCourses = localStorage.getItem('k7_courses_v1');
    if (rawCourses) {
      const list = JSON.parse(rawCourses);
      if (Array.isArray(list)) {
        await idbPutMany('courses', list);
        coursesCount = list.length;
      }
    }

    const rawExams = localStorage.getItem('k7_exams_v1');
    if (rawExams) {
      const list = JSON.parse(rawExams);
      if (Array.isArray(list)) {
        await idbPutMany('exams', list);
        examsCount = list.length;
      }
    }

    const rawNotes = localStorage.getItem('k7_course_notes_v1');
    if (rawNotes) {
      const list = JSON.parse(rawNotes);
      if (Array.isArray(list)) {
        await idbPutMany('notes', list);
        notesCount = list.length;
      }
    }

    const rawAtt = localStorage.getItem('k7_attendance_v1');
    if (rawAtt) {
      const parsed = JSON.parse(rawAtt);
      const list = Array.isArray(parsed) ? parsed : (typeof parsed === 'object' && parsed !== null ? Object.values(parsed) : []);
      if (list.length > 0) {
        await idbPutMany('attendance', list);
        attCount = list.length;
      }
    }

    const rawGpa = localStorage.getItem('k7_gpa_courses_v1');
    if (rawGpa) {
      const list = JSON.parse(rawGpa);
      if (Array.isArray(list)) {
        await idbPutMany('gpa_courses', list);
        gpaCount = list.length;
      }
    }
  } catch (e) {
    console.warn('[IndexedDB] Force sync error:', e);
  }

  return { courses: coursesCount, exams: examsCount, notes: notesCount, attendance: attCount, gpa: gpaCount };
}

/**
 * Generic Put Item into IndexedDB
 */
export async function idbPutItem<T>(storeName: string, item: T): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Graceful fallback to noop if IDB not available
  }
}

/**
 * Generic Put Many Items into IndexedDB
 */
export async function idbPutMany<T>(storeName: string, items: T[]): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // fallback
  }
}

/**
 * Generic Get All Items from IndexedDB
 */
export async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Generic Delete Item from IndexedDB
 */
export async function idbDeleteItem(storeName: string, key: IDBValidKey): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // fallback
  }
}

/**
 * Clear a specific store in IndexedDB
 */
export async function idbClearStore(storeName: string): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // fallback
  }
}

/**
 * Formats byte counts into human readable strings (KB, MB, GB)
 */
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Returns storage usage and quota estimate for the student / device.
 */
export async function getStorageQuotaInfo(): Promise<StorageQuotaInfo> {
  let usageBytes = 0;
  let quotaBytes = 0;
  let isIndexedDbSupported = false;

  if (typeof window !== 'undefined' && window.indexedDB) {
    isIndexedDbSupported = true;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        usageBytes = est.usage || 0;
        quotaBytes = est.quota || 0;
      } catch {}
    }
  }

  // Count items
  const courses = await idbGetAll('courses');
  const exams = await idbGetAll('exams');
  const notes = await idbGetAll('notes');
  const attendance = await idbGetAll('attendance');

  const usagePercentage = quotaBytes > 0 ? (usageBytes / quotaBytes) * 100 : 0;

  return {
    usageBytes,
    quotaBytes,
    usageFormatted: formatBytes(usageBytes),
    quotaFormatted: formatBytes(quotaBytes || 1024 * 1024 * 1024), // default fallback 1 GB
    usagePercentage: Number(usagePercentage.toFixed(2)),
    courseCount: courses.length,
    examCount: exams.length,
    noteCount: notes.length,
    attendanceCount: attendance.length,
    isIndexedDbSupported
  };
}
