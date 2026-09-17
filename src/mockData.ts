
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

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  return [
    // GÜZ YARIYILI
    { id: 'g1', title: 'Özel Öğrenci Giden/Gelen Başvurusu Son Gün', date: '2026-08-14', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g2', title: 'Çift Anadal / Yandal Başvuruları', date: '2026-08-24', endDate: '2026-08-28', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g3', title: 'Ders Muafiyetleri Başvurusu Son Gün', date: '2026-08-28', term: 'Güz Yarıyılı', type: 'other' },
    { id: 'g4', title: 'Katkı Payı ve Öğrenim Ücreti Yatırma / Ders Kayıtları', date: '2026-09-07', endDate: '2026-09-11', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g5', title: 'Ders Ekleme-Bırakma ve Danışman Onayı', date: '2026-09-07', endDate: '2026-09-15', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g6', title: 'Güz Yarıyılı Derslerinin Başlaması ve Sona Ermesi', date: '2026-09-14', endDate: '2026-12-25', term: 'Güz Yarıyılı', type: 'other' },
    { id: 'g7', title: 'Güz Yarıyılı Ara Sınavları (Vize)', date: '2026-10-31', endDate: '2026-11-08', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g8', title: 'Yarıyıl Sonu Sınavları (Final)', date: '2026-12-26', endDate: '2027-01-03', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g9', title: 'Bütünleme Sınavları', date: '2027-01-11', endDate: '2027-01-15', term: 'Güz Yarıyılı', type: 'exam' },
    
    // BAHAR YARIYILI
    { id: 'b1', title: 'Özel Öğrenci Giden/Gelen Başvurusu Son Gün', date: '2027-01-02', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b2', title: 'Çift Anadal / Yandal Başvuruları', date: '2027-01-19', endDate: '2027-01-21', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b3', title: 'Katkı Payı ve Öğrenim Ücreti Yatırma / Ders Kayıtları', date: '2027-02-08', endDate: '2027-02-12', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b4', title: 'Ders Ekleme-Bırakma ve Danışman Onayı', date: '2027-02-08', endDate: '2027-02-16', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b5', title: 'Bahar Yarıyılı Derslerinin Başlaması ve Sona Ermesi', date: '2027-02-15', endDate: '2027-06-11', term: 'Bahar Yarıyılı', type: 'other' },

    // LİSANSÜSTÜ (Examples from the summary)
    { id: 'l1', title: 'Lisansüstü Güz Yarıyılı Başvuruları', date: '2026-08-03', endDate: '2026-08-18', term: 'Lisansüstü', type: 'registration' },
    { id: 'l2', title: 'Yazılı ve Sözlü Mülakat Sınavı', date: '2026-08-24', term: 'Lisansüstü', type: 'exam' },
    { id: 'l3', title: 'Katkı Payı Yatırma ve Ders Kayıtları', date: '2026-09-07', endDate: '2026-09-11', term: 'Lisansüstü', type: 'registration' },
    { id: 'l4', title: 'Lisansüstü Derslerin Başlaması', date: '2026-09-14', term: 'Lisansüstü', type: 'other' },
  ];
};

