/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Haftalık Ders Programı Görsel İhracı (PNG & Story)
 * HTML5 Canvas tabanlı, yüksek çözünürlüklü (1080x1920 Story ve 1920x1080 Yatay) kurumsal kart üreticisi.
 */

import { CourseItem, DayOfWeek } from '../types/schedule';

export type ScheduleImageFormat = 'story' | 'landscape';

const DAYS: DayOfWeek[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

/**
 * Draws rounded rectangle on 2D canvas context.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Truncates text with ellipsis if it overflows maxWidth.
 */
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let str = text;
  while (str.length > 0 && ctx.measureText(str + '...').width > maxWidth) {
    str = str.slice(0, -1);
  }
  return str + '...';
}

/**
 * Renders weekly schedule onto an HTML5 canvas and returns a high-resolution Blob / DataURL.
 */
export async function renderScheduleToCanvas(
  courses: CourseItem[],
  format: ScheduleImageFormat = 'story',
  title = 'HAFTALIK DERS PROGRAMI',
  gradeLabel = 'Akademik Dönem'
): Promise<HTMLCanvasElement> {
  const isStory = format === 'story';
  const width = isStory ? 1080 : 1920;
  const height = isStory ? 1920 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context could not be initialized.');

  // High-dpi smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Background: Deep Academic Slate & University Tone
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#192f39');
  bgGradient.addColorStop(0.5, '#1e3845');
  bgGradient.addColorStop(1, '#15262f');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient glow
  const auraGradient = ctx.createRadialGradient(width / 2, 200, 50, width / 2, 350, 700);
  auraGradient.addColorStop(0, 'rgba(138, 42, 67, 0.35)');
  auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = auraGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Header Area
  const marginX = isStory ? 48 : 80;
  const headerY = isStory ? 80 : 60;

  // University Badge Bar
  ctx.fillStyle = '#8a2a43';
  roundRect(ctx, marginX, headerY, 8, isStory ? 74 : 64, 4);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('KİLİS 7 ARALIK ÜNİVERSİTESİ', marginX + 24, headerY + 34);

  ctx.fillStyle = '#f4a261';
  ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(`${title} • ${gradeLabel}`.toUpperCase(), marginX + 24, headerY + 65);

  // Date stamp badge on top right
  const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  const dateWidth = ctx.measureText(dateStr).width;
  const dateBadgeX = width - marginX - dateWidth - 36;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  roundRect(ctx, dateBadgeX, headerY + 12, dateWidth + 36, 42, 21);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(dateStr, dateBadgeX + 18, headerY + 39);

  // 3. Grid Layout
  const contentTop = headerY + (isStory ? 120 : 100);
  const contentBottom = height - (isStory ? 100 : 70);
  const contentHeight = contentBottom - contentTop;
  const contentWidth = width - marginX * 2;

  // Filter only enrolled courses
  const enrolled = courses.filter((c) => c.isEnrolled);

  if (isStory) {
    // STORY FORMAT: Vertical day-by-day feed stack (very clear, easily readable on phone screen)
    const activeDaysWithCourses = DAYS.filter((d) => enrolled.some((c) => c.day === d));
    const renderDays = activeDaysWithCourses.length > 0 ? activeDaysWithCourses : DAYS;
    const dayBlockHeight = (contentHeight - (renderDays.length - 1) * 20) / renderDays.length;

    renderDays.forEach((day, dIdx) => {
      const dayY = contentTop + dIdx * (dayBlockHeight + 20);
      const dayCourses = enrolled
        .filter((c) => c.day === day)
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

      // Day container card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      roundRect(ctx, marginX, dayY, contentWidth, dayBlockHeight, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Day header pill
      ctx.fillStyle = '#8a2a43';
      roundRect(ctx, marginX + 18, dayY + 16, 170, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(day, marginX + 34, dayY + 41);

      // Course count indicator
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(`${dayCourses.length} Ders`, marginX + 204, dayY + 41);

      // Render courses for this day
      if (dayCourses.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'italic 16px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillText('Bu güne planlanmış ders bulunmuyor.', marginX + 28, dayY + 80);
      } else {
        const itemYStart = dayY + 64;
        const availableItemHeight = dayBlockHeight - 74;
        const itemH = Math.min(84, (availableItemHeight - (dayCourses.length - 1) * 10) / dayCourses.length);

        dayCourses.slice(0, 4).forEach((course, cIdx) => {
          const itemY = itemYStart + cIdx * (itemH + 10);

          // Course item card
          ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
          roundRect(ctx, marginX + 18, itemY, contentWidth - 36, itemH, 16);
          ctx.fill();

          // Color strip indicator on left
          ctx.fillStyle = course.color || '#0284c7';
          roundRect(ctx, marginX + 18, itemY, 6, itemH, 3);
          ctx.fill();

          // Time badge
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, monospace';
          const timeText = `${course.startTime} - ${course.endTime}`;
          ctx.fillText(timeText, marginX + 34, itemY + itemH * 0.42);

          // Course Code badge
          ctx.fillStyle = 'rgba(244, 162, 97, 0.9)';
          ctx.font = 'bold 14px "Plus Jakarta Sans", system-ui, sans-serif';
          ctx.fillText(course.courseCode || 'DERS', marginX + 175, itemY + itemH * 0.42);

          // Course Name
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 17px "Plus Jakarta Sans", system-ui, sans-serif';
          const maxCourseNameW = contentWidth - 250;
          const cleanName = truncateText(ctx, course.courseName, maxCourseNameW);
          ctx.fillText(cleanName, marginX + 34, itemY + itemH * 0.82);

          // Classroom & Instructor on right side
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '14px "Plus Jakarta Sans", system-ui, sans-serif';
          const locText = [course.classroom, course.instructor].filter(Boolean).join(' • ');
          const locWidth = ctx.measureText(locText).width;
          if (locWidth < 380) {
            ctx.fillText(locText, width - marginX - locWidth - 36, itemY + itemH * 0.82);
          }
        });
      }
    });
  } else {
    // LANDSCAPE FORMAT: 5-column Weekly Timetable Grid
    const colGap = 16;
    const colWidth = (contentWidth - (DAYS.length - 1) * colGap) / DAYS.length;

    DAYS.forEach((day, dIdx) => {
      const colX = marginX + dIdx * (colWidth + colGap);
      const dayCourses = enrolled
        .filter((c) => c.day === day)
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

      // Column card background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      roundRect(ctx, colX, contentTop, colWidth, contentHeight, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Column Header
      ctx.fillStyle = '#8a2a43';
      roundRect(ctx, colX + 12, contentTop + 14, colWidth - 24, 44, 14);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
      const dayW = ctx.measureText(day).width;
      ctx.fillText(day, colX + (colWidth - dayW) / 2, contentTop + 42);

      // Column courses stack
      let currentItemY = contentTop + 72;
      dayCourses.forEach((course) => {
        const itemH = 120;
        if (currentItemY + itemH > contentTop + contentHeight - 16) return;

        // Course Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        roundRect(ctx, colX + 12, currentItemY, colWidth - 24, itemH, 16);
        ctx.fill();

        // Accent top strip
        ctx.fillStyle = course.color || '#0284c7';
        roundRect(ctx, colX + 12, currentItemY, colWidth - 24, 5, 2);
        ctx.fill();

        // Time pill
        ctx.fillStyle = '#f4a261';
        ctx.font = 'bold 13px "Plus Jakarta Sans", system-ui, monospace';
        ctx.fillText(`${course.startTime} - ${course.endTime}`, colX + 22, currentItemY + 28);

        // Course code
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillText(course.courseCode || 'DERS', colX + 22, currentItemY + 47);

        // Course Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px "Plus Jakarta Sans", system-ui, sans-serif';
        const nameClean = truncateText(ctx, course.courseName, colWidth - 44);
        ctx.fillText(nameClean, colX + 22, currentItemY + 70);

        // Classroom
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '13px "Plus Jakarta Sans", system-ui, sans-serif';
        const roomText = course.classroom ? `🏛️ ${course.classroom}` : '';
        ctx.fillText(truncateText(ctx, roomText, colWidth - 44), colX + 22, currentItemY + 92);

        // Instructor
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Plus Jakarta Sans", system-ui, sans-serif';
        const insText = course.instructor ? `👤 ${course.instructor}` : '';
        ctx.fillText(truncateText(ctx, insText, colWidth - 44), colX + 22, currentItemY + 110);

        currentItemY += itemH + 12;
      });

      if (dayCourses.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.font = 'italic 14px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillText('Ders yok', colX + 24, contentTop + 100);
      }
    });
  }

  // 4. Footer Branding
  const footerY = height - (isStory ? 48 : 34);
  ctx.fillStyle = '#64748b';
  ctx.font = '14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('K7AÜ Kampüs Dijital • ŞAHİN MÜHENDİSLİK', marginX, footerY);

  const footerRight = 'kilis.edu.tr • Öğrenci Ders Takip Portalı';
  const frW = ctx.measureText(footerRight).width;
  ctx.fillText(footerRight, width - marginX - frW, footerY);

  return canvas;
}

/**
 * Downloads the rendered schedule canvas as a PNG file directly to device storage.
 */
export async function downloadScheduleImage(
  courses: CourseItem[],
  format: ScheduleImageFormat = 'story',
  title = 'Ders Programı'
): Promise<void> {
  const canvas = await renderScheduleToCanvas(courses, format, title);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `K7AU_Ders_Programi_${format === 'story' ? 'Story' : 'Yatay'}.png`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve();
    }, 'image/png');
  });
}

/**
 * Shares the rendered schedule image via mobile native share dialog (Instagram, WhatsApp, Files)
 */
export async function shareScheduleImage(
  courses: CourseItem[],
  format: ScheduleImageFormat = 'story',
  title = 'Ders Programı'
): Promise<boolean> {
  const canvas = await renderScheduleToCanvas(courses, format, title);

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return resolve(false);

      const filename = `K7AU_Ders_Programi_${format}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'K7AÜ Ders Programım',
            text: 'Kilis 7 Aralık Üniversitesi haftalık ders programım',
            files: [file]
          });
          resolve(true);
        } catch {
          resolve(false);
        }
      } else {
        // Fallback to direct download
        await downloadScheduleImage(courses, format, title);
        resolve(true);
      }
    }, 'image/png');
  });
}
