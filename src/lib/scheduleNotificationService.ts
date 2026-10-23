/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { CourseItem, ExamItem, DayOfWeek } from '../types/schedule';
import { getStoredCourses, getStoredExams } from './scheduleStorage';

export interface ScheduleNotificationConfig {
  enabled: boolean;
  notifyAt10Min: boolean;
  notifyAt5Min: boolean;
  sound: boolean;
  vibrate: boolean;
  excludedItemIds: string[]; // List of course/exam IDs that are muted
}

const STORAGE_KEY = 'k7_schedule_notification_config_v1';
const SENT_LOG_KEY = 'k7_schedule_sent_notifications_log_v1';
export const NOTIFICATIONS_CONFIG_CHANGED_EVENT = 'k7_schedule_notifications_config_changed';

const DEFAULT_CONFIG: ScheduleNotificationConfig = {
  enabled: true,
  notifyAt10Min: true,
  notifyAt5Min: true,
  sound: true,
  vibrate: true,
  excludedItemIds: []
};

// Day mapping: JS Date getDay() -> 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
const DAY_MAP_JS: Record<number, DayOfWeek> = {
  0: 'Pazar',
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi'
};

const DAY_TO_JS: Record<DayOfWeek, number> = {
  'Pazar': 0,
  'Pazartesi': 1,
  'Salı': 2,
  'Çarşamba': 3,
  'Perşembe': 4,
  'Cuma': 5,
  'Cumartesi': 6
};

// Retrieve saved config
export function getNotificationConfig(): ScheduleNotificationConfig {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    }
  } catch {}
  return { ...DEFAULT_CONFIG };
}

// Save config and notify listeners
export function saveNotificationConfig(config: ScheduleNotificationConfig): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CONFIG_CHANGED_EVENT, { detail: config }));
    }
  } catch {}
  syncScheduledNotifications();
}

// Check if a specific course or exam is enabled for notifications
export function isItemNotificationEnabled(id: string): boolean {
  const config = getNotificationConfig();
  if (!config.enabled) return false;
  return !config.excludedItemIds.includes(id);
}

// Toggle notification for an individual course/exam
export function toggleItemNotification(id: string, forceState?: boolean): boolean {
  const config = getNotificationConfig();
  const isExcluded = config.excludedItemIds.includes(id);
  const targetEnabled = forceState !== undefined ? forceState : isExcluded;

  let newExcluded: string[];
  if (targetEnabled) {
    // Enable -> remove from excluded
    newExcluded = config.excludedItemIds.filter(itemId => itemId !== id);
  } else {
    // Disable -> add to excluded
    newExcluded = isExcluded ? config.excludedItemIds : [...config.excludedItemIds, id];
  }

  saveNotificationConfig({
    ...config,
    excludedItemIds: newExcluded
  });

  return targetEnabled;
}

// Enable all notifications
export function enableAllItemNotifications(): void {
  const config = getNotificationConfig();
  saveNotificationConfig({
    ...config,
    excludedItemIds: []
  });
}

// Disable all notifications
export function disableAllItemNotifications(): void {
  const config = getNotificationConfig();
  const allCourses = getStoredCourses();
  const allExams = getStoredExams();
  const allIds = [...allCourses.map(c => c.id), ...allExams.map(e => e.id)];
  saveNotificationConfig({
    ...config,
    excludedItemIds: allIds
  });
}

// Permission checking
export async function getNotificationPermissionStatus(): Promise<NotificationPermission | 'prompt'> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted' ? 'granted' : status.display === 'denied' ? 'denied' : 'default';
    } catch {
      return 'default';
    }
  }
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

// Request permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted';
    } catch {
      return false;
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

// Play pleasant web audio chime
export function playNotificationSound(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.15);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.45);
  } catch {}
}

// Show local or system notification immediately
export async function dispatchNotification(
  title: string,
  body: string,
  tag: string,
  options?: { sound?: boolean; vibrate?: boolean }
): Promise<boolean> {
  const config = getNotificationConfig();
  const shouldSound = options?.sound ?? config.sound;
  const shouldVibrate = options?.vibrate ?? config.vibrate;

  // 1. If running as native Capacitor on Android
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 1000000) + 1,
            title,
            body,
            schedule: { at: new Date(Date.now() + 100) },
            channelId: 'k7_schedule_channel',
            smallIcon: 'ic_stat_icon',
            sound: shouldSound ? 'beep.wav' : undefined
          }
        ]
      });
      return true;
    } catch (e) {
      console.warn('Capacitor LocalNotification dispatch error:', e);
    }
  }

  // 2. If running in Web Browser / PWA
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if (shouldSound) {
        playNotificationSound();
      }

      // Try Service Worker registration first (creates system native notification on Android Chrome)
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            icon: '/notification-icon-192.png',
            badge: '/notification-badge-96.png',
            tag,
            vibrate: shouldVibrate ? [200, 100, 200] : undefined,
            renotify: true,
            data: { url: '/schedule' }
          } as any);
          return true;
        }
      }

      // Fallback to standard window Notification
      new Notification(title, {
        body,
        icon: '/notification-icon-192.png',
        badge: '/notification-badge-96.png',
        tag
      } as any);
      return true;
    } catch (e) {
      console.warn('Web notification dispatch error:', e);
    }
  }

  return false;
}

// Send immediate test notification
export async function sendTestNotification(): Promise<{ success: boolean; message: string }> {
  const hasPerm = await getNotificationPermissionStatus();
  if (hasPerm !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      return {
        success: false,
        message: 'Bildirim izni verilmedi. Lütfen telefon ayarlarından bildirimlere izin verin.'
      };
    }
  }

  const sampleTitle = 'K7AÜ Ders Hatırlatıcısı (Test)';
  const sampleBody = 'BİL101 Programlama Temelleri 5 dakika içinde D-203 dersliğinde başlayacak.';

  const dispatched = await dispatchNotification(
    sampleTitle,
    sampleBody,
    'test_' + Date.now(),
    { sound: true, vibrate: true }
  );

  return {
    success: dispatched,
    message: dispatched ? 'Test bildirimi başarıyla gönderildi!' : 'Bildirim oluşturulamadı.'
  };
}

// Calculate upcoming triggers for courses & exams (at T-10m and T-5m)
export interface ScheduledTrigger {
  id: string; // unique trigger id e.g. "course_123_10m_2026-10-19"
  targetId: string; // original course/exam id
  type: 'course' | 'exam';
  name: string;
  classroom: string;
  minutesBefore: number; // 10 or 5
  triggerTime: number; // timestamp in ms
  title: string;
  body: string;
}

export function getUpcomingNotificationTriggers(
  courses: CourseItem[],
  exams: ExamItem[],
  config: ScheduleNotificationConfig
): ScheduledTrigger[] {
  if (!config.enabled) return [];

  const triggers: ScheduledTrigger[] = [];
  const now = new Date();
  const offsets = [];
  if (config.notifyAt10Min) offsets.push(10);
  if (config.notifyAt5Min) offsets.push(5);

  if (offsets.length === 0) return [];

  // Filter only enabled courses and exams
  const activeCourses = courses.filter(c => !config.excludedItemIds.includes(c.id));
  const activeExams = exams.filter(e => !config.excludedItemIds.includes(e.id));

  // 1. Process Courses for the next 7 days
  activeCourses.forEach(course => {
    if (!course.startTime || !course.day) return;
    const targetDayIndex = DAY_TO_JS[course.day];
    if (targetDayIndex === undefined) return;

    const [startH, startM] = course.startTime.split(':').map(Number);
    if (isNaN(startH) || isNaN(startM)) return;

    // Check occurrences for today and the next 7 days
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const candidateDate = new Date(now);
      candidateDate.setDate(now.getDate() + dayOffset);
      if (candidateDate.getDay() === targetDayIndex) {
        candidateDate.setHours(startH, startM, 0, 0);

        offsets.forEach(mins => {
          const triggerTime = candidateDate.getTime() - mins * 60 * 1000;
          const dateStr = candidateDate.toISOString().split('T')[0];
          const triggerId = `course_${course.id}_${mins}m_${dateStr}`;

          // Format classroom text cleanly to match requested "XXX 5 dakika içinde AAA derslikde başlayacak"
          const roomText = course.classroom
            ? (course.classroom.toLowerCase().includes('derslik') ? course.classroom : `${course.classroom} dersliğinde`)
            : 'belirtilen derslikte';
          const codePrefix = course.courseCode ? `${course.courseCode} ` : '';

          triggers.push({
            id: triggerId,
            targetId: course.id,
            type: 'course',
            name: `${codePrefix}${course.courseName}`,
            classroom: course.classroom,
            minutesBefore: mins,
            triggerTime,
            title: `Ders Hatırlatıcısı (${mins} Dakika Kaldı)`,
            body: `${codePrefix}${course.courseName} ${mins} dakika içinde ${roomText} başlayacak.`
          });
        });
      }
    }
  });

  // 2. Process Exams
  activeExams.forEach(exam => {
    if (!exam.date || !exam.startTime) return;
    const [startH, startM] = exam.startTime.split(':').map(Number);
    if (isNaN(startH) || isNaN(startM)) return;

    const examDate = new Date(`${exam.date}T00:00:00`);
    if (isNaN(examDate.getTime())) return;
    examDate.setHours(startH, startM, 0, 0);

    offsets.forEach(mins => {
      const triggerTime = examDate.getTime() - mins * 60 * 1000;
      const triggerId = `exam_${exam.id}_${mins}m_${exam.date}`;

      const roomText = exam.classroom
        ? (exam.classroom.toLowerCase().includes('salon') || exam.classroom.toLowerCase().includes('derslik') ? exam.classroom : `${exam.classroom} salonunda`)
        : 'belirtilen sınav salonunda';
      const codePrefix = exam.courseCode ? `${exam.courseCode} ` : '';
      const typeText = exam.examType ? ` ${exam.examType}` : '';

      triggers.push({
        id: triggerId,
        targetId: exam.id,
        type: 'exam',
        name: `${codePrefix}${exam.courseName}${typeText}`,
        classroom: exam.classroom,
        minutesBefore: mins,
        triggerTime,
        title: `Sınav Hatırlatıcısı (${mins} Dakika Kaldı)`,
        body: `${codePrefix}${exam.courseName}${typeText} sınavı ${mins} dakika içinde ${roomText} başlayacak.`
      });
    });
  });

  return triggers;
}

// Synchronize scheduled notifications with Capacitor native Android AlarmManager & Web Triggers
export async function syncScheduledNotifications(): Promise<void> {
  const config = getNotificationConfig();
  if (!config.enabled) {
    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel(pending);
        }
      } catch {}
    }
    return;
  }

  const courses = getStoredCourses();
  const exams = getStoredExams();
  const triggers = getUpcomingNotificationTriggers(courses, exams, config);
  const now = Date.now();

  // Filter only future triggers
  const futureTriggers = triggers
    .filter(t => t.triggerTime > now && t.triggerTime < now + 7 * 24 * 60 * 60 * 1000)
    .sort((a, b) => a.triggerTime - b.triggerTime)
    .slice(0, 50); // Android limit safety

  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Create High-Priority Notification Channel for Android
      await LocalNotifications.createChannel({
        id: 'k7_schedule_channel',
        name: 'Ders ve Sınav Hatırlatıcıları',
        description: 'Ders ve sınavlara 10 ve 5 dakika kala gelen uyarılar',
        importance: 5, // High / Heads-up notification on Android
        visibility: 1, // Public
        sound: config.sound ? 'beep.wav' : undefined,
        vibration: config.vibrate,
        lights: true,
        lightColor: '#8a2a43'
      });

      // 2. Clear old pending
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      // 3. Schedule all upcoming triggers with allowWhileIdle for Android background/sleep execution
      if (futureTriggers.length > 0) {
        await LocalNotifications.schedule({
          notifications: futureTriggers.map((t, index) => ({
            id: index + 1000,
            title: t.title,
            body: t.body,
            schedule: {
              at: new Date(t.triggerTime),
              allowWhileIdle: true // Essential for Android AlarmManager to fire even when app is closed / phone sleeping
            },
            channelId: 'k7_schedule_channel',
            smallIcon: 'ic_stat_icon'
          }))
        });
      }
    } catch (e) {
      console.warn('Capacitor schedule sync error:', e);
    }
  }

  // Web / PWA Notification Triggers (Chrome on Android)
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showTrigger' in Notification.prototype && typeof (window as any).TimestampTrigger !== 'undefined') {
        for (const t of futureTriggers.slice(0, 20)) {
          try {
            await (reg as any).showNotification(t.title, {
              body: t.body,
              tag: t.id,
              icon: '/notification-icon-192.png',
              badge: '/notification-badge-96.png',
              showTrigger: new (window as any).TimestampTrigger(t.triggerTime),
              data: { url: '/schedule' }
            });
          } catch {}
        }
      }
    } catch {}
  }
}

// Background checker loop for Web / PWA
let backgroundCheckerStarted = false;

export function initScheduleNotificationWatcher(): void {
  if (typeof window === 'undefined' || backgroundCheckerStarted) return;
  backgroundCheckerStarted = true;

  // Run initial sync
  syncScheduledNotifications();

  // Sent log to prevent duplicate notifications
  const getSentLog = (): Record<string, number> => {
    try {
      const s = localStorage.getItem(SENT_LOG_KEY);
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  };

  const markAsSent = (triggerId: string) => {
    try {
      const log = getSentLog();
      log[triggerId] = Date.now();
      // Clean entries older than 3 days
      const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
      Object.keys(log).forEach(k => {
        if (log[k] < cutoff) delete log[k];
      });
      localStorage.setItem(SENT_LOG_KEY, JSON.stringify(log));
    } catch {}
  };

  const checkDueNotifications = async () => {
    const config = getNotificationConfig();
    if (!config.enabled) return;

    const courses = getStoredCourses();
    const exams = getStoredExams();
    const triggers = getUpcomingNotificationTriggers(courses, exams, config);
    const now = Date.now();
    const sentLog = getSentLog();

    // Check triggers that are due within [now - 90s, now + 60s]
    for (const trigger of triggers) {
      const diff = now - trigger.triggerTime;
      // If trigger time was within the last 90 seconds or is coming in the next 15 seconds
      if (diff >= -15000 && diff <= 90000) {
        if (!sentLog[trigger.id]) {
          markAsSent(trigger.id);
          await dispatchNotification(trigger.title, trigger.body, trigger.id, {
            sound: config.sound,
            vibrate: config.vibrate
          });
        }
      }
    }
  };

  // Check every 20 seconds
  setInterval(checkDueNotifications, 20000);
  // Also check immediately
  checkDueNotifications();

  // Check immediately when user returns to app / unlocks screen
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkDueNotifications();
      syncScheduledNotifications();
    }
  });

  window.addEventListener('focus', () => {
    checkDueNotifications();
  });

  // Listen to schedule changes to reschedule
  window.addEventListener('k7_schedule_changed', () => {
    syncScheduledNotifications();
    checkDueNotifications();
  });
}
