import { CalendarEvent } from '../types';
import { classifyCalendarEvent } from './calendarClassifier';

const MONTH_MAP: Record<string, number> = {
  'ocak': 0, 'şubat': 1, 'subat': 1, 'mart': 2, 'nisan': 3, 'mayıs': 4, 'mayis': 4,
  'haziran': 5, 'temmuz': 6, 'ağustos': 7, 'agustos': 7, 'eylül': 8, 'eylul': 8,
  'ekim': 9, 'kasım': 10, 'kasim': 10, 'aralık': 11, 'aralik': 11
};

export interface FormattedDateInfo {
  dateStr: string;      // e.g. "14 Eylül 2026"
  dayName: string;      // e.g. "Pazartesi"
  dayNumber: string;    // e.g. "14"
  monthName: string;    // e.g. "Eylül"
  year: string;         // e.g. "2026"
  fullDisplay: string;  // e.g. "14 Eylül 2026, Pazartesi"
}

export type EventStatus = 'active' | 'upcoming' | 'today-deadline' | 'past';

export interface ParsedEventInfo {
  startDate: Date | null;
  endDate: Date | null;
  isRange: boolean;
  durationDays: number;
  durationWeeks?: number;
  durationText: string;
  isDeadline: boolean;
  status: EventStatus;
  statusLabel: string;
  daysUntilStart: number;
  daysUntilEnd: number;
  startFormatted: FormattedDateInfo;
  endFormatted: FormattedDateInfo | null;
}

export function parseAnyDate(isoDate?: string, rawText?: string): Date | null {
  if (isoDate && !isNaN(new Date(isoDate).getTime())) {
    const parts = isoDate.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    }
  }

  if (!rawText) return null;
  const cleaned = rawText.replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/gi, ' ').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = MONTH_MAP[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day, 12, 0, 0);
    }
  }

  return null;
}

export function formatDateInfo(d: Date | null, fallbackRaw?: string): FormattedDateInfo {
  if (!d || isNaN(d.getTime())) {
    return {
      dateStr: fallbackRaw || '',
      dayName: '',
      dayNumber: '',
      monthName: '',
      year: '',
      fullDisplay: fallbackRaw || ''
    };
  }

  const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const dayName = d.toLocaleDateString('tr-TR', { weekday: 'long' });
  const dayNumber = d.getDate().toString();
  const monthName = d.toLocaleDateString('tr-TR', { month: 'long' });
  const year = d.getFullYear().toString();

  return {
    dateStr,
    dayName,
    dayNumber,
    monthName,
    year,
    fullDisplay: `${dateStr}, ${dayName}`
  };
}

export function analyzeEvent(event: CalendarEvent): ParsedEventInfo {
  const start = parseAnyDate(event.date, event.rawStart);
  let end = parseAnyDate(event.endDate, event.rawEnd);

  // If end is identical to start (same day), treat it as a single date
  if (start && end && start.getTime() === end.getTime()) {
    end = null;
  }

  const isRange = Boolean(start && end && end.getTime() > start.getTime());
  
  // Calculate duration
  let durationDays = 1;
  let durationWeeks = 0;
  let durationText = '1 gün';
  
  if (isRange && start && end) {
    const diffMs = end.getTime() - start.getTime();
    durationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
    if (durationDays >= 14) {
      durationWeeks = Math.round(durationDays / 7);
      durationText = `${durationDays} gün (~${durationWeeks} hafta)`;
    } else {
      durationText = `${durationDays} gün sürecek`;
    }
  }

  const titleLower = (event.title || '').toLowerCase();
  const isDeadline = titleLower.includes('son gün') || 
                     titleLower.includes('son başvuru') || 
                     titleLower.includes('son teslim') ||
                     titleLower.includes('sonu');

  // Temporal status calculation relative to today
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

  let status: EventStatus = 'upcoming';
  let statusLabel = 'Yaklaşıyor';
  let daysUntilStart = 0;
  let daysUntilEnd = 0;

  if (start) {
    daysUntilStart = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (end) {
    daysUntilEnd = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } else if (start) {
    daysUntilEnd = daysUntilStart;
  }

  if (start) {
    if (isRange && end) {
      if (today >= start && today <= end) {
        status = 'active';
        if (daysUntilEnd === 0) {
          statusLabel = 'Bugün Bitiyor!';
        } else {
          statusLabel = `Devam Ediyor (${daysUntilEnd} gün kaldı)`;
        }
      } else if (today > end) {
        status = 'past';
        statusLabel = 'Tamamlandı';
      } else {
        status = 'upcoming';
        if (daysUntilStart === 1) {
          statusLabel = 'Yarın Başlıyor';
        } else if (daysUntilStart <= 30) {
          statusLabel = `${daysUntilStart} gün sonra`;
        } else {
          statusLabel = 'Planlandı';
        }
      }
    } else {
      // Single date
      if (daysUntilStart === 0) {
        status = isDeadline ? 'today-deadline' : 'active';
        statusLabel = isDeadline ? 'Bugün Son Gün!' : 'Bugün';
      } else if (daysUntilStart < 0) {
        status = 'past';
        statusLabel = 'Tamamlandı';
      } else {
        status = 'upcoming';
        if (daysUntilStart === 1) {
          statusLabel = 'Yarın';
        } else if (daysUntilStart <= 30) {
          statusLabel = `${daysUntilStart} gün kaldı`;
        } else {
          statusLabel = 'Planlandı';
        }
      }
    }
  }

  return {
    startDate: start,
    endDate: end,
    isRange,
    durationDays,
    durationWeeks,
    durationText,
    isDeadline,
    status,
    statusLabel,
    daysUntilStart,
    daysUntilEnd,
    startFormatted: formatDateInfo(start, event.rawStart),
    endFormatted: end ? formatDateInfo(end, event.rawEnd) : null
  };
}

export interface AcademicSummaryItem {
  event: CalendarEvent;
  info: ParsedEventInfo;
  isOngoing: boolean;
  isTodayDeadline: boolean;
  dateBadgeText: string;
  dateRangeText: string;
}

/**
 * Formats a clean compact range string, e.g. "14 Eyl - 25 Ara 2026" or "29 Eki 2026"
 */
export function formatCompactRange(
  startDate: Date | null,
  endDate: Date | null,
  isRange: boolean,
  fallback: string
): string {
  if (!startDate) return fallback || '';
  const sm = startDate.toLocaleDateString('tr-TR', { month: 'short' });
  const sy = startDate.getFullYear();
  if (!endDate || !isRange) {
    return `${startDate.getDate()} ${sm} ${sy}`;
  }
  const em = endDate.toLocaleDateString('tr-TR', { month: 'short' });
  const ey = endDate.getFullYear();
  if (sy === ey) {
    if (sm === em) {
      return `${startDate.getDate()} - ${endDate.getDate()} ${sm} ${sy}`;
    }
    return `${startDate.getDate()} ${sm} - ${endDate.getDate()} ${em} ${sy}`;
  }
  return `${startDate.getDate()} ${sm} ${sy} - ${endDate.getDate()} ${em} ${ey}`;
}

/**
 * Computes the academic summary events for the Home page dashboard.
 * Selects the currently active/ongoing process (or processes) first,
 * followed by the immediate upcoming events in chronological order.
 */
export function getAcademicSummaryEvents(
  events: CalendarEvent[],
  limit: number = 3
): { items: AcademicSummaryItem[]; hasOngoing: boolean } {
  if (!events || events.length === 0) {
    return { items: [], hasOngoing: false };
  }

  const analyzed = events.map((e) => {
    const classified = classifyCalendarEvent(e);
    return {
      event: classified,
      info: analyzeEvent(classified)
    };
  });

  // Filter active / today-deadline events
  const activeList = analyzed
    .filter((a) => a.info.status === 'active' || a.info.status === 'today-deadline')
    .sort((a, b) => {
      // Prioritize today-deadline, then shorter events (focused exams/deadlines) before semester duration
      if (a.info.status === 'today-deadline' && b.info.status !== 'today-deadline') return -1;
      if (b.info.status === 'today-deadline' && a.info.status !== 'today-deadline') return 1;
      return a.info.durationDays - b.info.durationDays;
    });

  // Filter upcoming events (chronological order)
  const upcomingList = analyzed
    .filter((a) => a.info.status === 'upcoming' && a.info.daysUntilStart >= 0)
    .sort((a, b) => a.info.daysUntilStart - b.info.daysUntilStart);

  const selected: { event: CalendarEvent; info: ParsedEventInfo }[] = [];

  if (activeList.length > 0) {
    // Take up to 2 active events, then fill remainder with upcoming
    const activeToTake = Math.min(activeList.length, 2);
    selected.push(...activeList.slice(0, activeToTake));
    const remainder = Math.max(0, limit - selected.length);
    selected.push(...upcomingList.slice(0, remainder));
  } else {
    // If no active events exist: take top upcoming events
    selected.push(...upcomingList.slice(0, limit));
  }

  // Graceful fallback if both active and upcoming are empty
  if (selected.length === 0) {
    selected.push(...analyzed.slice(-limit));
  }

  const items: AcademicSummaryItem[] = selected.map(({ event, info }) => {
    const isOngoing = info.status === 'active';
    const isTodayDeadline = info.status === 'today-deadline';

    let dateBadgeText = '';
    if (isTodayDeadline) {
      dateBadgeText = 'Bugün Son Gün!';
    } else if (isOngoing) {
      if (info.daysUntilEnd === 0) {
        dateBadgeText = 'Bugün Bitiyor!';
      } else {
        dateBadgeText = `${info.daysUntilEnd} gün kaldı`;
      }
    } else {
      if (info.daysUntilStart === 0) {
        dateBadgeText = 'Bugün';
      } else if (info.daysUntilStart === 1) {
        dateBadgeText = 'Yarın';
      } else if (info.daysUntilStart <= 7) {
        dateBadgeText = `${info.daysUntilStart} gün kaldı`;
      } else if (info.daysUntilStart <= 30) {
        dateBadgeText = `${info.daysUntilStart} gün sonra`;
      } else {
        dateBadgeText = `${info.daysUntilStart} gün sonra`;
      }
    }

    const dateRangeText = formatCompactRange(
      info.startDate,
      info.endDate,
      info.isRange,
      info.startFormatted.dateStr
    );

    return {
      event,
      info,
      isOngoing,
      isTodayDeadline,
      dateBadgeText,
      dateRangeText
    };
  });

  return {
    items,
    hasOngoing: activeList.length > 0
  };
}

/**
 * Generate Google Calendar URL for one-click add
 */
export function getGoogleCalendarUrl(event: CalendarEvent, info: ParsedEventInfo): string {
  if (!info.startDate) return '#';

  const formatGoogleDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  const startStr = formatGoogleDate(info.startDate);
  // In Google Calendar, whole day end date is exclusive (day + 1)
  const endDateObj = info.endDate ? new Date(info.endDate) : new Date(info.startDate);
  endDateObj.setDate(endDateObj.getDate() + 1);
  const endStr = formatGoogleDate(endDateObj);

  const title = encodeURIComponent(`K7AÜ: ${event.title}`);
  const details = encodeURIComponent(
    `Kilis 7 Aralık Üniversitesi Akademik Takvim Etkinliği\n` +
    `Dönem: ${event.term || 'Genel'}\n` +
    (info.isRange 
      ? `Süre: ${info.startFormatted.fullDisplay} - ${info.endFormatted?.fullDisplay} (${info.durationText})` 
      : `Tarih: ${info.startFormatted.fullDisplay}`)
  );
  const location = encodeURIComponent('Kilis 7 Aralık Üniversitesi, Kilis');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
}

/**
 * Generate .ics calendar download for a single event
 */
export function downloadEventIcs(event: CalendarEvent, info: ParsedEventInfo): void {
  if (!info.startDate) return;

  const toIcsDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  const startStr = toIcsDate(info.startDate);
  const endDateObj = info.endDate ? new Date(info.endDate) : new Date(info.startDate);
  endDateObj.setDate(endDateObj.getDate() + 1);
  const endStr = toIcsDate(endDateObj);

  const safeTitle = (event.title || 'K7AU Etkinlik').replace(/[\r\n]+/g, ' ');
  const safeDesc = `Kilis 7 Aralık Üniversitesi Akademik Takvimi - ${event.term || 'Akademik Takvim'}`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kilis 7 Aralik Universitesi//Akademik Takvim//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:K7AÜ Akademik Takvim',
    'BEGIN:VEVENT',
    `UID:k7au-event-${event.id}-${startStr}@kilis.edu.tr`,
    `DTSTAMP:${toIcsDate(new Date())}T000000Z`,
    `DTSTART;VALUE=DATE:${startStr}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `SUMMARY:K7AÜ: ${safeTitle}`,
    `DESCRIPTION:${safeDesc}`,
    'LOCATION:Kilis 7 Aralık Üniversitesi',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `K7AU_${safeTitle.slice(0, 25).replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export all calendar events to an .ics file
 */
export function downloadAllCalendarIcs(events: CalendarEvent[]): void {
  if (!events || events.length === 0) return;

  const toIcsDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  const eventsBlocks: string[] = [];

  events.forEach((event, idx) => {
    const info = analyzeEvent(event);
    if (!info.startDate) return;

    const startStr = toIcsDate(info.startDate);
    const endDateObj = info.endDate ? new Date(info.endDate) : new Date(info.startDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const endStr = toIcsDate(endDateObj);

    const safeTitle = (event.title || 'Akademik Etkinlik').replace(/[\r\n]+/g, ' ');
    const safeDesc = `Kilis 7 Aralık Üniversitesi: ${event.term || 'Akademik Takvim'}`;

    eventsBlocks.push(
      'BEGIN:VEVENT\r\n' +
      `UID:k7au-full-${idx}-${event.id}@kilis.edu.tr\r\n` +
      `DTSTAMP:${toIcsDate(new Date())}T000000Z\r\n` +
      `DTSTART;VALUE=DATE:${startStr}\r\n` +
      `DTEND;VALUE=DATE:${endStr}\r\n` +
      `SUMMARY:K7AÜ: ${safeTitle}\r\n` +
      `DESCRIPTION:${safeDesc}\r\n` +
      'LOCATION:Kilis 7 Aralık Üniversitesi\r\n' +
      'STATUS:CONFIRMED\r\n' +
      'END:VEVENT'
    );
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kilis 7 Aralik Universitesi//Akademik Takvim//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:K7AÜ Akademik Takvimi',
    'X-WR-TIMEZONE:Europe/Istanbul',
    ...eventsBlocks,
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `K7AU_Akademik_Takvim_Tum_Etkinlikler.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
