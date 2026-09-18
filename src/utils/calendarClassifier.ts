import { CalendarEvent } from '../types';

export function classifyCalendarEvent(event: CalendarEvent): CalendarEvent {
  const title = (event.title || '').trim();
  const t = title.toLowerCase();
  let term = (event.term || '').trim();

  // 1. Determine if this belongs to Resmi Tatiller
  const isHolidayKeyword = 
    t.includes('tatil') || 
    t.includes('bayram') || 
    t.includes('yılbaşı') || 
    t.includes('yilbasi') ||
    t.includes('arefe') ||
    t.includes('cumhuriyet') ||
    t.includes('ulusal egemenlik') ||
    t.includes('çocuk bayramı') ||
    t.includes('cocuk bayrami') ||
    t.includes('emek ve dayanışma') ||
    t.includes('emek ve dayanisma') ||
    t.includes('gençlik ve spor') ||
    t.includes('genclik ve spor') ||
    t.includes('kurban') ||
    t.includes('ramazan') ||
    t.includes('milli birlik') ||
    t.includes('zafer bayramı') ||
    t.includes('zafer bayrami') ||
    t.includes('1 mayıs') ||
    t.includes('23 nisan') ||
    t.includes('19 mayıs') ||
    t.includes('15 temmuz') ||
    t.includes('30 ağustos') ||
    t.includes('29 ekim');

  if (term === 'Resmi Tatiller' || isHolidayKeyword) {
    return {
      ...event,
      term: 'Resmi Tatiller',
      type: 'holiday'
    };
  }

  // 2. Registrations & Applications (Kayıt / Başvuru / Danışman / Harç / Muafiyet Başvurusu)
  const isRegistration = 
    t.includes('başvuru') || 
    t.includes('basvuru') || 
    t.includes('kayıt') || 
    t.includes('kayit') || 
    t.includes('katkı payı') || 
    t.includes('öğrenim ücreti') || 
    t.includes('ücreti') || 
    t.includes('ekle-bırak') || 
    t.includes('ekle bırak') || 
    t.includes('danışman onayı') || 
    t.includes('kabul listesi');

  // 3. Exams & Grades (Sınavlar / Vize / Final / Bütünleme / Not Girişi / Mülakat / Muafiyet Sınavı)
  const isExam = 
    t.includes('sınav') || 
    t.includes('sinav') || 
    t.includes('vize') || 
    t.includes('final') || 
    t.includes('bütünleme') || 
    t.includes('mülakat') || 
    t.includes('yeterlilik') || 
    t.includes('notlarının öbs') || 
    t.includes('not girişi') ||
    t.includes('notlar');

  if (isRegistration && !t.includes('ek sınav için')) {
    return {
      ...event,
      type: 'registration'
    };
  }

  if (isExam) {
    return {
      ...event,
      type: 'exam'
    };
  }

  if (isRegistration) {
    return {
      ...event,
      type: 'registration'
    };
  }

  // 4. Default: Academic term / course schedule / internships
  return {
    ...event,
    type: 'other'
  };
}
