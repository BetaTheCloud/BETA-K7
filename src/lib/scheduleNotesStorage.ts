import { CourseNoteItem, CourseItem, DayOfWeek } from '../types/schedule';

export const COURSE_NOTES_STORAGE_KEY = 'k7_course_notes_v1';
export const COURSE_NOTES_CHANGED_EVENT = 'k7_course_notes_changed';

const TURKISH_DAYS: DayOfWeek[] = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi'
];

export const INITIAL_COURSE_NOTES_SEED: CourseNoteItem[] = [
  {
    id: 'note-sample-1',
    courseId: 'k7-crs-201',
    courseName: 'Veri Yapıları',
    courseCode: 'BLG201',
    grade: 2,
    gradeLabel: '2. Sınıf',
    instructor: 'Doç. Dr. Alper Çetin',
    classroom: 'Müh. Fak. Bilgisayar Lab 2',
    day: 'Pazartesi',
    startTime: '08:30',
    endTime: '10:15',
    title: 'Bağlı Listeler (Linked Lists) ve Dinamik Bellek Yönetimi',
    content:
      'Bugünkü derste işlenen kritik konular ve sınav ipuçları:\n' +
      '1. Tek Yönlü (Singly) ve Çift Yönlü (Doubly) Bağlı Liste Yapıları:\n' +
      '   - Düğüm (Node) tanımı: Data ve Next işaretçisi (Pointer).\n' +
      '   - Listenin başına ekleme (O(1)) vs. Araya veya sona ekleme (O(n)).\n' +
      '2. Bellek Yönetimi:\n' +
      '   - Dinamik bellek tahsisi (malloc/free & new/delete).\n' +
      '   - Bellek sızıntılarının (Memory Leak) önlenmesi için her düğümün kontrollü serbest bırakılması gerekir.\n' +
      '3. Vize Sınavı İpucu:\n' +
      '   - Hoca vizede "Bağlı Listeyi Ters Çevirme (Reverse Linked List)" algoritmasının kodlanmasını kesin soracağını belirtti!\n' +
      '4. Gelecek Hafta:\n' +
      '   - Yığın (Stack) ve Kuyruk (Queue) veri yapılarına geçilecek.',
    date: new Date().toISOString().split('T')[0],
    tags: ['Bağlı Liste', 'Vize Notu', 'Önemli'],
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'note-sample-1b',
    courseId: 'k7-crs-201',
    courseName: 'Veri Yapıları',
    courseCode: 'BLG201',
    grade: 2,
    gradeLabel: '2. Sınıf',
    instructor: 'Doç. Dr. Alper Çetin',
    classroom: 'Müh. Fak. Bilgisayar Lab 2',
    day: 'Pazartesi',
    startTime: '08:30',
    endTime: '10:15',
    title: 'Yığın (Stack) ve Kuyruk (Queue) Uygulama Pratiği',
    content:
      'Laboratuvar ve Teorik Özet Notları:\n' +
      '1. LIFO (Last In First Out) Prensibi ile Yığın İşlemleri: Push, Pop, Peek (O(1)).\n' +
      '2. FIFO (First In First Out) Prensibi ile Kuyruk Yapısı: Enqueue ve Dequeue.\n' +
      '3. Aritmetik İfadelerin Dönüştürülmesi: Infix to Postfix dönüşümü ve parantez dengeleme kontrolü.\n' +
      '4. Dairesel Kuyruk (Circular Queue) avantajları ve dizi taşma sınırları incelendi.',
    date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    tags: ['Stack', 'Queue', 'Veri Yapıları'],
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'note-sample-2',
    courseId: 'k7-crs-102',
    courseName: 'Matematik I (Calculus)',
    courseCode: 'MAT101',
    grade: 1,
    gradeLabel: '1. Sınıf',
    instructor: 'Doç. Dr. Selin Korkmaz',
    classroom: 'Merkezi Derslik Amfi-1',
    day: 'Salı',
    startTime: '08:30',
    endTime: '10:15',
    title: 'Türev Uygulamaları ve L\'Hopital Kuralı Özeti',
    content:
      'Ders Özeti ve Ödev Hatırlatması:\n' +
      '- Belirsizlik Durumları: [0/0] ve [∞/∞] biçimindeki limitlerde pay ve paydanın ayrı ayrı türevi alınır (Bölüm türevi değil!).\n' +
      '- Rolle Teoremi ve Ortalama Değer Teoremi (MVT) koşulları ve geometrik anlamı incelendi.\n' +
      '- Ödev: Thomas Calculus kitabı Sayfa 184\'teki 15-32 arası alıştırmalar haftaya Salı ders başlangıcında toplanacak.',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    tags: ['Türev', 'LHopital', 'Ödev'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'note-sample-3',
    courseId: 'k7-crs-104',
    courseName: 'Algoritmalar ve Programlama I',
    courseCode: 'BLG103',
    grade: 1,
    gradeLabel: '1. Sınıf',
    instructor: 'Dr. Öğr. Üyesi Burak Demir',
    classroom: 'Bilgisayar Lab 3',
    day: 'Perşembe',
    startTime: '08:30',
    endTime: '10:15',
    title: 'Özyineleme (Recursion) ve Fonksiyon Çağrı Yığını',
    content:
      'Laboratuvar Notları:\n' +
      '- Temel Durum (Base Case): Özyinelemenin durma koşulu eksik olursa Stack Overflow hatası oluşur.\n' +
      '- Örnek: Fibonacci dizisi ve Faktöriyel hesaplamanın yinelemeli (iterative) vs özyinelemeli (recursive) karmaşıklık analizi.\n' +
      '- Laboratuvar ödevi sisteme yüklendi, teslim Cuma 23:59.',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    tags: ['Algoritma', 'Recursion', 'Lab'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'note-sample-4',
    courseId: 'k7-crs-301',
    courseName: 'Veritabanı Yönetim Sistemleri',
    courseCode: 'BLG301',
    grade: 3,
    gradeLabel: '3. Sınıf',
    instructor: 'Prof. Dr. Murat Kaplan',
    classroom: 'Müh. Fak. Bilgisayar Lab 4',
    day: 'Pazartesi',
    startTime: '08:30',
    endTime: '10:15',
    title: 'SQL JOIN Çeşitleri ve Normalizasyon Prensipleri',
    content:
      'Ders Notları:\n' +
      '- INNER JOIN, LEFT OUTER JOIN ve RIGHT JOIN arasındaki farklar ve performans kriterleri.\n' +
      '- 1NF, 2NF, 3NF ve BCNF kuralları detaylı incelendi.\n' +
      '- Dönem projesi için 3-4 kişilik gruplar belirlenecek ve veri tabanı ER diyagramı teslim edilecek.',
    date: new Date().toISOString().split('T')[0],
    tags: ['SQL', 'Veritabanı', 'Normalizasyon'],
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000,
  },
];

/**
 * Retrieves all stored course notes from localStorage.
 * Initializes with sample seed notes if empty.
 */
export function getStoredCourseNotes(): CourseNoteItem[] {
  if (typeof window === 'undefined') return INITIAL_COURSE_NOTES_SEED;
  try {
    const raw = localStorage.getItem(COURSE_NOTES_STORAGE_KEY);
    if (!raw) {
      // Seed initial sample notes so student can test immediately
      localStorage.setItem(COURSE_NOTES_STORAGE_KEY, JSON.stringify(INITIAL_COURSE_NOTES_SEED));
      return INITIAL_COURSE_NOTES_SEED;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) {
        // Also seed if empty array
        localStorage.setItem(COURSE_NOTES_STORAGE_KEY, JSON.stringify(INITIAL_COURSE_NOTES_SEED));
        return INITIAL_COURSE_NOTES_SEED;
      }
      return parsed.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt);
    }
  } catch (err) {
    console.warn('Error reading course notes from localStorage:', err);
  }
  return INITIAL_COURSE_NOTES_SEED;
}

/**
 * Force reload or reset sample course notes
 */
export function resetSampleCourseNotes(): CourseNoteItem[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COURSE_NOTES_STORAGE_KEY, JSON.stringify(INITIAL_COURSE_NOTES_SEED));
    window.dispatchEvent(new CustomEvent(COURSE_NOTES_CHANGED_EVENT));
  }
  return INITIAL_COURSE_NOTES_SEED;
}

/**
 * Saves or updates a course note.
 */
export function saveCourseNote(
  noteData: Omit<CourseNoteItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): CourseNoteItem {
  const allNotes = getStoredCourseNotes();
  const now = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];

  let savedNote: CourseNoteItem;

  if (noteData.id) {
    // Update existing
    const index = allNotes.findIndex((n) => n.id === noteData.id);
    savedNote = {
      ...noteData,
      id: noteData.id,
      date: noteData.date || todayStr,
      updatedAt: now,
      createdAt: index >= 0 ? allNotes[index].createdAt : now
    } as CourseNoteItem;

    if (index >= 0) {
      allNotes[index] = savedNote;
    } else {
      allNotes.unshift(savedNote);
    }
  } else {
    // Create new
    savedNote = {
      ...noteData,
      id: `note-${now}-${Math.random().toString(36).substring(2, 7)}`,
      date: noteData.date || todayStr,
      createdAt: now,
      updatedAt: now
    } as CourseNoteItem;
    allNotes.unshift(savedNote);
  }

  try {
    localStorage.setItem(COURSE_NOTES_STORAGE_KEY, JSON.stringify(allNotes));
    window.dispatchEvent(new CustomEvent(COURSE_NOTES_CHANGED_EVENT));
  } catch (err) {
    console.warn('Error saving course note to localStorage:', err);
  }

  return savedNote;
}

/**
 * Deletes a course note by id.
 */
export function deleteCourseNote(noteId: string): void {
  const allNotes = getStoredCourseNotes();
  const filtered = allNotes.filter((n) => n.id !== noteId);
  try {
    localStorage.setItem(COURSE_NOTES_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent(COURSE_NOTES_CHANGED_EVENT));
  } catch (err) {
    console.warn('Error deleting course note:', err);
  }
}

/**
 * Returns notes filtered for a specific courseId or courseName.
 */
export function getNotesForCourse(courseIdOrName: string): CourseNoteItem[] {
  const notes = getStoredCourseNotes();
  const searchKey = courseIdOrName.trim().toLowerCase();
  return notes.filter(
    (n) =>
      n.courseId === courseIdOrName ||
      n.courseName.trim().toLowerCase() === searchKey ||
      n.courseCode.trim().toLowerCase() === searchKey
  );
}

/**
 * Checks whether a given course has finished today based on day of week and endTime.
 */
export function isCourseCompletedToday(course: CourseItem): boolean {
  if (!course || !course.day) return false;
  const now = new Date();
  const currentDayName = TURKISH_DAYS[now.getDay()];

  if (course.day !== currentDayName) {
    return false;
  }

  // Parse course endTime: e.g. "10:15" or "10.15"
  const cleanEnd = (course.endTime || '').replace(/\./g, ':');
  const parts = cleanEnd.split(':');
  if (parts.length < 2) return false;

  const endH = parseInt(parts[0], 10);
  const endM = parseInt(parts[1], 10);
  if (isNaN(endH) || isNaN(endM)) return false;

  const currentH = now.getHours();
  const currentM = now.getMinutes();

  return currentH > endH || (currentH === endH && currentM >= endM);
}


/**
 * Exports course notes as an academic, print-ready genuine PDF document.
 * Operates natively on Android APK (via Capacitor Filesystem & Share) and in modern browsers.
 */
export async function exportCourseNotesAsPdf(
  notes: CourseNoteItem[],
  courseTitle?: string
): Promise<{ success: boolean; message: string }> {
  if (notes.length === 0) {
    return { success: false, message: 'Dışa aktarılacak ders notu bulunamadı.' };
  }
  const { generateCourseNotesPdf } = await import('./schedulePdfService');
  return generateCourseNotesPdf({
    notes,
    titleOverride: courseTitle
  });
}

/**
 * Shares course notes via the Native Web Share API if available, or copies formatted text to clipboard.
 */
export async function shareCourseNotes(notes: CourseNoteItem[], courseTitle?: string): Promise<boolean> {
  if (notes.length === 0) return false;

  const header = `📚 K7AÜ Ders Notları: ${courseTitle || notes[0].courseName}\n\n`;
  const body = notes
    .map(
      (n, i) =>
        `📌 ${i + 1}. ${n.title} (${n.date || 'Ders Notu'})\n` +
        `Ders: ${n.courseName} | ${n.instructor || ''}\n` +
        `Not: ${n.content}\n`
    )
    .join('\n----------------------\n\n');

  const fullShareText = header + body;

  if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
    try {
      await (navigator as any).share({
        title: `${courseTitle || 'Ders'} Notları - K7AÜ`,
        text: fullShareText
      });
      return true;
    } catch (err: any) {
      if (err?.name === 'AbortError') return true;
    }
  }

  // Fallback: clipboard copy
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(fullShareText);
      return true;
    } catch {}
  }

  return false;
}


