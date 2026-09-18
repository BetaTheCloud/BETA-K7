
import { Announcement, MenuItem, CalendarEvent, BolognaFaculty } from './types';
import { getApiUrl, safeFetch } from './config';

export const getAnnouncements = async (force: boolean = false): Promise<Announcement[]> => {
  try {
    const response = await safeFetch(getApiUrl(`/api/announcements${force ? '?force=true' : ''}`));
    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.error("Duyurular çekilemedi:", err);
  }
  return [];
};

export const getNews = async (force: boolean = false): Promise<Announcement[]> => {
  try {
    const response = await safeFetch(getApiUrl(`/api/news${force ? '?force=true' : ''}`));
    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.error("Haberler çekilemedi:", err);
  }
  return [];
};

export const getMenu = async (): Promise<MenuItem[]> => {
  try {
    const response = await safeFetch(getApiUrl('/api/menu'));
    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.error("Yemek listesi çekilemedi:", err);
  }
  return [];
};

export const getCalendarEvents = async (force: boolean = false): Promise<CalendarEvent[]> => {
  try {
    const response = await safeFetch(getApiUrl(`/api/calendar${force ? '?force=true' : ''}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Canlı takvim çekilemedi, yerleşik veriler kullanılıyor:", err);
  }

  // Güvenli Yedek (Fallback)
  return [
    // GÜZ YARIYILI
    { id: 'g1', title: 'Özel Öğrenci Giden/Gelen Başvurusu İçin Son Gün', date: '2026-08-14', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g2', title: 'Ders Muafiyetleri İle İlgili Dekanlık/Müdürlüğe Başvuru İçin Son Gün', date: '2026-08-28', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g3', title: 'Çift Anadal / Yandal Başvuruları', date: '2026-08-24', endDate: '2026-08-28', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g4', title: 'Katkı Payı ve Öğrenim Ücreti Yatırma / Kayıt Yenileme ve Ders Kayıtları', date: '2026-09-07', endDate: '2026-09-11', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g5', title: 'Ders Ekleme-Bırakma ve Danışman Onayı', date: '2026-09-07', endDate: '2026-09-15', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g6', title: 'İlahiyat Fakültesi Hazırlık Sınıfı Muafiyet Sınavı', date: '2026-09-14', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g7', title: 'Yabancı Dil Muafiyeti İçin Yeterlilik Sınavı', date: '2026-09-16', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g8', title: 'Güz Yarıyılı Derslerinin Başlaması ve Sona Ermesi', date: '2026-09-14', endDate: '2026-12-25', term: 'Güz Yarıyılı', type: 'other' },
    { id: 'g9', title: 'Güz Yarıyılı Ara Sınavları (Vize)', date: '2026-10-31', endDate: '2026-11-08', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g10', title: 'Yarıyıl Sonu Sınavları (Final)', date: '2026-12-26', endDate: '2027-01-03', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g11', title: 'Bütünleme Sınavları', date: '2027-01-11', endDate: '2027-01-15', term: 'Güz Yarıyılı', type: 'exam' },
    
    // BAHAR YARIYILI
    { id: 'b1', title: 'Özel Öğrenci Giden/Gelen Başvurusu İçin Son Gün', date: '2027-01-02', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b2', title: 'Çift Anadal / Yandal Başvuruları', date: '2027-01-19', endDate: '2027-01-21', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b3', title: 'Katkı Payı ve Öğrenim Ücreti Yatırma / Kayıt Yenileme ve Ders Kayıtları', date: '2027-02-08', endDate: '2027-02-12', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b4', title: 'Ders Ekleme-Bırakma ve Danışman Onayı', date: '2027-02-08', endDate: '2027-02-16', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b5', title: 'Bahar Yarıyılı Derslerinin Başlaması ve Sona Ermesi', date: '2027-02-15', endDate: '2027-06-11', term: 'Bahar Yarıyılı', type: 'other' },
    { id: 'b6', title: 'Bahar Yarıyılı Ara Sınavları (Vize)', date: '2027-04-10', endDate: '2027-04-18', term: 'Bahar Yarıyılı', type: 'exam' },
    { id: 'b7', title: 'Yarıyıl Sonu Sınavları (Final)', date: '2027-06-12', endDate: '2027-06-20', term: 'Bahar Yarıyılı', type: 'exam' },
    { id: 'b8', title: 'Bütünleme Sınavları', date: '2027-06-24', endDate: '2027-06-27', term: 'Bahar Yarıyılı', type: 'exam' },
    { id: 'b9', title: 'Yaz Stajı', date: '2027-06-28', endDate: '2027-08-27', term: 'Bahar Yarıyılı', type: 'other' },

    // RESMİ TATİLLER
    { id: 't1', title: 'Cumhuriyet Bayramı', date: '2026-10-29', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't2', title: 'Yılbaşı Tatili', date: '2027-01-01', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't3', title: 'Ramazan Bayramı', date: '2027-03-09', endDate: '2027-03-11', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't4', title: 'Ulusal Egemenlik ve Çocuk Bayramı', date: '2027-04-23', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't5', title: 'Emek ve Dayanışma Günü', date: '2027-05-01', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't6', title: 'Atatürk’ü Anma, Gençlik ve Spor Bayramı', date: '2027-05-19', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't7', title: 'Kurban Bayramı', date: '2027-05-16', endDate: '2027-05-19', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't8', title: 'Demokrasi ve Milli Birlik Günü', date: '2027-07-15', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't9', title: 'Zafer Bayramı', date: '2027-08-30', term: 'Resmi Tatiller', type: 'holiday' },
  ];
};

