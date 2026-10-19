import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import qs from 'qs';
import * as cheerio from 'cheerio';
import https from 'https';
import cors from 'cors';
import { AUTHENTIC_FORMS_DATA, cleanTurkishFormTitle } from './src/data/formsData';
import { ACADEMIC_STAFF_DATA, STAFF_FACULTIES_LIST } from './src/data/staffData';
import { FALLBACK_DEPARTMENT_NEWS, FALLBACK_DEPARTMENT_ANNOUNCEMENTS, ACADEMIC_UNITS_WITH_DEPARTMENTS } from './src/data/departmentNewsData';
import { PHONE_DIRECTORY_DATA, DirectoryUnit, DirectoryContact } from './src/data/phoneDirectoryData';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for all routes (necessary when frontend runs in APK or different origin)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Render / monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }), // In case of SSL issues
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  },
  timeout: 10000
});

function cleanDuplicateTitle(raw?: string | null): string {
  if (!raw) return '';
  let s = raw.trim().replace(/\s+/g, ' ');

  // 1. Remove trailing dates first so date suffix doesn't prevent title deduplication
  s = s.replace(/\s*\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4}\s*$/i, '').trim();
  s = s.replace(/\s*\d{1,2}[./-]\d{1,2}[./-]\d{4}\s*$/i, '').trim();

  // 2. Remove delimiter-separated duplicate: e.g. "Başlık - Başlık" or "Başlık | Başlık"
  const separators = [' - ', ' – ', ' — ', ' | ', ' / ', ' : ', ' • '];
  for (const sep of separators) {
    if (s.includes(sep)) {
      const parts = s.split(sep);
      if (parts.length === 2 && parts[0].trim().toLowerCase() === parts[1].trim().toLowerCase()) {
        s = parts[0].trim();
        break;
      }
    }
  }

  // 3. Remove exact word-sequence duplicate: e.g. "Bahar Şenliği Programı Bahar Şenliği Programı"
  const words = s.split(' ');
  if (words.length >= 2) {
    const halfWords = Math.floor(words.length / 2);
    for (let h = halfWords; h >= 1; h--) {
      if (h * 2 === words.length) {
        const part1 = words.slice(0, h).join(' ').trim().toLowerCase();
        const part2 = words.slice(h, h * 2).join(' ').trim().toLowerCase();
        if (part1 && part1 === part2) {
          s = words.slice(0, h).join(' ');
          break;
        }
      }
    }
  }

  // 4. Remove exact duplicate without spaces: e.g. "ABCABC"
  const len = s.length;
  if (len >= 6 && len % 2 === 0) {
    const half = len / 2;
    if (s.slice(0, half).toLowerCase() === s.slice(half).toLowerCase()) {
      s = s.slice(0, half).trim();
    }
  }

  return s;
}

const FACULTIES = [
  // Fakülteler
  { name: 'Fen Fakültesi', url: 'https://fen.kilis.edu.tr' },
  { name: 'Güzel Sanatlar ve Tasarım Fakültesi', url: 'https://gstf.kilis.edu.tr' },
  { name: 'İktisadi ve İdari Bilimler Fakültesi', url: 'https://iibf.kilis.edu.tr' },
  { name: 'İlahiyat Fakültesi', url: 'https://ilahiyat.kilis.edu.tr' },
  { name: 'İletişim Fakültesi', url: 'https://iletisim.kilis.edu.tr' },
  { name: 'İnsan ve Toplum Bilimleri Fakültesi', url: 'https://itbf.kilis.edu.tr' },
  { name: 'Kilisli Muallim Rıfat Eğitim Fakültesi', url: 'https://egitim.kilis.edu.tr' },
  { name: 'Mühendislik - Mimarlık Fakültesi', url: 'https://mmf.kilis.edu.tr' },
  { name: 'Spor Bilimleri Fakültesi', url: 'https://sporbilimleri.kilis.edu.tr' },
  { name: 'Uygulamalı Bilimler Fakültesi', url: 'https://ubf.kilis.edu.tr' },
  { name: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi', url: 'https://sbf.kilis.edu.tr' },
  { name: 'Ziraat Fakültesi', url: 'https://ziraat.kilis.edu.tr' },

  // Enstitü
  { name: 'Lisansüstü Eğitim Enstitüsü', url: 'https://enstitu.kilis.edu.tr' },

  // Yüksekokul
  { name: 'Yabancı Diller Yüksekokulu', url: 'https://yadyo.kilis.edu.tr' },

  // Meslek Yüksekokulları
  { name: 'Sosyal Bilimler MYO', url: 'https://sbmyo.kilis.edu.tr' },
  { name: 'Sağlık Hizmetleri MYO', url: 'https://shmyo.kilis.edu.tr' },
  { name: 'Teknik Bilimler MYO', url: 'https://tbmyo.kilis.edu.tr' },
  { name: 'Turizm ve Otelcilik MYO', url: 'https://tomyo.kilis.edu.tr' },

  // Konservatuvar
  { name: 'Alaeddin Yavaşca Devlet Konservatuvarı', url: 'https://konservatuvar.kilis.edu.tr' },

  // Koordinatörlükler
  { name: 'Erasmus Koordinatörlüğü', url: 'https://erasmus.kilis.edu.tr' },
  { name: 'Kalite Koordinatörlüğü', url: 'https://kalite.kilis.edu.tr' },
  { name: 'Uluslararası Öğrenci Koordinatörlüğü', url: 'https://uluslararasi.kilis.edu.tr' }
];

// Cache setup
let cachedAnnouncements: any[] = [];
let cachedAnnouncementsTime = 0;
let cachedNews: any[] = [];
let cachedNewsTime = 0;
let cachedCalendar: any[] = [];
let cachedCalendarTime = 0;
const CACHE_TTL = 5 * 60 * 1000;
const CALENDAR_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week) smart cache

// Simple chunking utility
async function processInChunks<T, R>(items: T[], chunkSize: number, processor: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map((item, idx) => processor(item, i + idx)));
    results.push(...chunkResults);
  }
  return results;
}


let cachedFaculties: Record<string, any> = {};
let cachedFacultiesTime: Record<string, number> = {};
const CACHE_FAC_TTL = 3600 * 1000; // 1 hour

app.get('/api/bologna/faculties', async (req, res) => {
  try {
    const type = (req.query.type as string) || 'lis';
    if (!['myo', 'lis', 'yls', 'dok'].includes(type)) {
       return res.status(400).json({ error: 'Invalid type parameter' });
    }

    if (cachedFacultiesTime[type] && Date.now() - cachedFacultiesTime[type] < CACHE_FAC_TTL && cachedFaculties[type]) {
      return res.json(cachedFaculties[type]);
    }
    
    const response = await axiosInstance.get(`https://obs.kilis.edu.tr/oibs/bologna/unitSelection.aspx?type=${type}&lang=tr`);
    const $ = cheerio.load(response.data);
    const faculties: any[] = [];
    
    $('a[data-bs-toggle="collapse"]').each((i, el) => {
      const facName = $(el).text().trim();
      const targetId = $(el).attr('href'); 
      
      const departments: any[] = [];
      const collapseDiv = $(targetId);
      if (collapseDiv.length) {
         collapseDiv.find('.list-group-item a').each((j, depEl) => {
             const depName = $(depEl).text().trim();
             const depHref = $(depEl).attr('href');
             const m = depHref?.match(/curSunit=(\d+)/);
             if (m) {
                 departments.push({ id: `dep-${m[1]}`, name: depName, href: depHref, sUnitId: m[1] });
             }
         });
      }
      
      if (departments.length > 0) {
        faculties.push({ id: `fac-${type}-${i}`, name: facName, departments });
      }
    });
    
    cachedFaculties[type] = faculties;
    cachedFacultiesTime[type] = Date.now();
    res.json(faculties);
  } catch (error) {
    console.error("Faculties fetch error", error);
    res.status(500).json({ error: 'Failed to fetch faculties' });
  }
});

app.get('/api/bologna/courses', async (req, res) => {
  try {
    const sUnitId = req.query.sunit;
    if (!sUnitId) {
       return res.status(400).json({ error: 'sunit parameter is required' });
    }
    
    const response = await axiosInstance.get(`https://obs.kilis.edu.tr/oibs/bologna/progCourses.aspx?lang=tr&curSunit=${sUnitId}`);
    const $ = cheerio.load(response.data);
    const courses = [];
    let currentSemester = 1;
    
    $('tr').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('Yarıyıl Ders Planı') || text.toLowerCase().includes('hazırlık')) {
             if (text.toLowerCase().includes('hazırlık')) {
               currentSemester = 0;
             } else {
               const m = text.match(/(\d+)\.\s*Yarıyıl/i);
               if (m) currentSemester = parseInt(m[1], 10);
             }
        }
        
        const codeLink = $(el).find('a[id*="btnDersKod_"]');
        if (codeLink.length > 0) {
            const code = codeLink.text().trim();
            const idNum = codeLink.attr('id').split('_').pop();
            
            let detailTarget = '';
            const detailBtn = $(el).find('a[id*="btnDersAyrinti_"]');
            if (detailBtn.length > 0) {
                const href = detailBtn.attr('href') || '';
                const m = href.match(/__doPostBack\('([^']*)'/);
                if (m) {
                   detailTarget = m[1];
                }
            }
            
            const name = $(el).find(`span[id*="lblDersAd_"]`).text().trim();
            const ects = $(el).find(`span[id*="lblAKTS_"]`).text().trim();
            const type = $(el).find(`span[id*="Label5_"]`).text().trim();
            const creditStr = $(el).find(`span[id*="Label3_"]`).text().trim();
            
            courses.push({
               id: `crs-${idNum}`,
               code: code,
               name: name,
               semester: currentSemester,
               ects: parseInt(ects, 10) || 0,
               credit: creditStr,
               type: type,
               language: 'Türkçe',
               description: 'Ders içeriği Bologna sisteminden alınmıştır.',
               outcomes: [],
               detailTarget: detailTarget,
               detailsLoaded: false
            });
        }
    });
    
    res.json(courses);
  } catch (error) {
    console.error("Courses fetch error", error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});


app.get('/api/bologna/courseDetail', async (req, res) => {
  try {
    const sunit = req.query.sunit;
    const target = req.query.target;
    
    if (!sunit || !target) {
       return res.status(400).json({ error: 'sunit and target are required' });
    }
    
    const url = `https://obs.kilis.edu.tr/oibs/bologna/progCourses.aspx?lang=tr&curSunit=${sunit}`;
    
    // 1. GET to grab viewstate
    const getRes = await axiosInstance.get(url);
    const $1 = cheerio.load(getRes.data);
    const viewstate = $1('#__VIEWSTATE').val();
    const viewstategenerator = $1('#__VIEWSTATEGENERATOR').val();
    const eventvalidation = $1('#__EVENTVALIDATION').val();

    // 2. POST to get details
    const postData = {
      __EVENTTARGET: target,
      __EVENTARGUMENT: '',
      __VIEWSTATE: viewstate,
      __VIEWSTATEGENERATOR: viewstategenerator,
      __EVENTVALIDATION: eventvalidation
    };

    const postRes = await axiosInstance.post(url, qs.stringify(postData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': url
      }
    });

    const $2 = cheerio.load(postRes.data);
    const outcomes = [];
    const weeklyTopics = [];
    let description = "Ders içeriği Bologna sisteminden alınmıştır.";
    
    $2('table').each((i, tbl) => {
       const text = $2(tbl).text().trim();
       
       if (text.includes('Sıra No') && text.includes('Açıklama') && !text.includes('Hafta')) {
           $2(tbl).find('tr').each((j, tr) => {
               const tds = $2(tr).find('td');
               if (tds.length >= 2) {
                   const num = $2(tds[0]).text().trim();
                   const desc = $2(tds[1]).text().trim();
                   if (num && !Number.isNaN(Number(num))) {
                       outcomes.push(desc);
                   }
               }
           });
       }
       
       if (text.includes('Hafta') && text.includes('Konu') && text.includes('Ön Hazırlık')) {
           $2(tbl).find('tr').each((j, tr) => {
               const tds = $2(tr).find('td');
               if (tds.length >= 2) {
                   const week = $2(tds[0]).text().trim();
                   const topic = $2(tds[1]).text().trim();
                   if (week && !Number.isNaN(Number(week))) {
                       weeklyTopics.push({ week: parseInt(week, 10), topic });
                   }
               }
           });
       }
       
       // Try to find description from a table with "Dersin İçeriği"
       if (text.includes('Dersin İçeriği') && !text.includes('Hafta')) {
           $2(tbl).find('tr').each((j, tr) => {
               const tds = $2(tr).find('td');
               if (tds.length >= 2) {
                   const lbl = $2(tds[0]).text().trim();
                   if (lbl.includes('Dersin İçeriği')) {
                       const val = $2(tds[1]).text().trim();
                       if (val) description = val;
                   }
               }
           });
       }
    });
    
    res.json({ outcomes, weeklyTopics, description });
  } catch (error) {
    console.error("Course detail error:", error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'ann-fb-1',
    title: '2026-2027 Eğitim-Öğretim Yılı Güz Yarıyılı Ders Kayıt ve Kayıt Yenileme Duyurusu',
    date: '30.09.2026',
    content: 'Öğrencilerimizin ders kayıt ve katkı payı işlemlerini akademik takvimde belirtilen tarihler arasında tamamlamaları gerekmektedir.',
    category: 'Ana Duyurular',
    url: 'https://www.kilis.edu.tr/tr/duyurular'
  },
  {
    id: 'ann-fb-2',
    title: 'Mazeret Sınavı Başvuruları ve İlgili Esaslar Hakkında',
    date: '28.09.2026',
    content: 'Haklı ve geçerli mazereti sebebiyle vize sınavlarına katılamayan öğrencilerin dekanlık ve müdürlüklere başvuru süreci başlamıştır.',
    category: 'Öğrenci İşleri',
    url: 'https://ogrenciisleri.kilis.edu.tr'
  },
  {
    id: 'ann-fb-3',
    title: 'Erasmus+ Öğrenim ve Staj Hareketliliği Başvuru Takvimi',
    date: '25.09.2026',
    content: 'Avrupa üniversitelerinde öğrenim görmek isteyen öğrencilerimiz için yabancı dil sınavı ve başvuru süreci açılmıştır.',
    category: 'Dış İlişkiler',
    url: 'https://erasmus.kilis.edu.tr'
  },
  {
    id: 'ann-fb-4',
    title: 'Merkez Kütüphane Çalışma Saatleri ve Gece Etüt Salonu Düzenlemesi',
    date: '20.09.2026',
    content: 'Öğrencilerimizin yoğun talebi doğrultusunda sınav dönemlerinde kütüphanemiz 7/24 kesintisiz hizmet vermektedir.',
    category: 'Kütüphane',
    url: 'https://kutuphane.kilis.edu.tr'
  },
  {
    id: 'ann-fb-5',
    title: 'Yemekhane Bursu ve Kısmi Zamanlı Öğrenci Başvuruları',
    date: '18.09.2026',
    content: 'Sağlık Kültür ve Spor Daire Başkanlığı burs başvuruları online form üzerinden alınmaya başlamıştır.',
    category: 'SKS',
    url: 'https://sks.kilis.edu.tr'
  }
];

const DEFAULT_NEWS = [
  {
    id: 'news-fb-1',
    title: 'Kilis 7 Aralık Üniversitesi 2026-2027 Akademik Yılı Açılış Töreni Coşkuyla Gerçekleşti',
    date: '02.10.2026',
    content: 'Üniversitemiz Konferans Salonunda gerçekleştirilen açılış törenine çok sayıda akademisyen, protokol ve öğrenci katıldı.',
    category: 'Üniversite Haberleri',
    url: 'https://www.kilis.edu.tr/tr/haberler'
  },
  {
    id: 'news-fb-2',
    title: '1. Kilis Kitap Fuarı ve Yazar Buluşmaları Kapılarını Ziyaretçilere Açtı',
    date: '29.09.2026',
    content: 'Yüzlerce yayınevi ve seçkin yazarların katılımıyla düzenlenen kitap fuarı kampüste büyük ilgi görüyor.',
    category: 'Kültür & Sanat',
    url: 'https://www.kilis.edu.tr/tr/etkinlikler'
  },
  {
    id: 'news-fb-3',
    title: 'Mühendislik Fakültesi Öğrencilerimizden TEKNOFEST Başarısı',
    date: '24.09.2026',
    content: 'Elektrik ve Bilgisayar Mühendisliği öğrencilerimizin geliştirdiği insansız hava aracı projesi finallere kaldı.',
    category: 'Başarılar',
    url: 'https://mmf.kilis.edu.tr'
  },
  {
    id: 'news-fb-4',
    title: 'Üniversitemiz ile Kilis Sanayi ve Ticaret Odası Arasında İş Birliği Protokolü İmzalandı',
    date: '19.09.2026',
    content: 'Öğrencilerimize staj, istihdam ve AR-GE projelerinde geniş imkanlar sağlayacak protokol imzalandı.',
    category: 'İş Birlikleri',
    url: 'https://www.kilis.edu.tr/tr/haberler'
  }
];

const DEFAULT_MENU = [
  { id: 'menu-oct-1', date: '1 Ekim 2026 Perşembe', mainDish: 'Mantarlı Tavuk Sote', sideDish: 'Domatesli Bulgur Pilavı', soup: 'Yayla Çorbası', dessertOrFruit: 'Armut', calories: 840 },
  { id: 'menu-oct-2', date: '2 Ekim 2026 Cuma', mainDish: 'Ali Paşa Köfte', sideDish: 'Patatesli Börek', soup: 'Ezogelin Çorbası', dessertOrFruit: 'Kazandibi', calories: 890 },
  { id: 'menu-oct-3', date: '5 Ekim 2026 Pazartesi', mainDish: 'Tavuk Pirzola', sideDish: 'Mısırlı Pirinç Pilavı', soup: 'Mercimek Çorbası', dessertOrFruit: 'Cacık', calories: 820 },
  { id: 'menu-oct-4', date: '6 Ekim 2026 Salı', mainDish: 'Belen Tava', sideDish: 'Şehriyeli Bulgur Pilavı', soup: 'Kaşarlı Domates Çorbası', dessertOrFruit: 'Şekerpare', calories: 870 },
  { id: 'menu-oct-5', date: '7 Ekim 2026 Çarşamba', mainDish: 'Püreli Hasan Paşa Köfte', sideDish: 'Peynirli Börek', soup: 'Düğün Çorbası', dessertOrFruit: 'Sütlaç', calories: 860 },
  { id: 'menu-oct-6', date: '8 Ekim 2026 Perşembe', mainDish: 'Orman Kebabı', sideDish: 'Soslu Makarna', soup: 'Ezogelin Çorbası', dessertOrFruit: 'Muz', calories: 830 },
  { id: 'menu-oct-7', date: '9 Ekim 2026 Cuma', mainDish: 'Patates Oturtma', sideDish: 'Şehriyeli Pirinç Pilavı', soup: 'Dövme Çorbası', dessertOrFruit: 'Revani', calories: 850 },
  { id: 'menu-oct-8', date: '12 Ekim 2026 Pazartesi', mainDish: 'Pilav Üstü Piliç Tandır', sideDish: 'Karışık Kızartma', soup: 'Mercimek Çorbası', dessertOrFruit: 'Ayran', calories: 860 },
  { id: 'menu-oct-9', date: '13 Ekim 2026 Salı', mainDish: 'Et Tantuni + Lavaş', sideDish: 'Mısırlı Pirinç Pilavı', soup: 'Ezogelin Çorbası', dessertOrFruit: 'Elma', calories: 890 },
  { id: 'menu-oct-10', date: '14 Ekim 2026 Çarşamba', mainDish: 'Tavuk Baget Haşlama', sideDish: 'Bulgur Pilavı', soup: 'Sultan Çorbası', dessertOrFruit: 'Cevizli Kadayıf', calories: 840 },
  { id: 'menu-oct-11', date: '15 Ekim 2026 Perşembe', mainDish: 'İzmir Köfte', sideDish: 'Karışık Börek', soup: 'Yayla Çorbası', dessertOrFruit: 'Keşkül', calories: 850 },
  { id: 'menu-oct-12', date: '16 Ekim 2026 Cuma', mainDish: 'Çiftlik Kebabı', sideDish: 'Yoğurtlu Mantı', soup: 'Kaşarlı Domates Çorbası', dessertOrFruit: 'Şam Tatlısı', calories: 880 },
  { id: 'menu-oct-13', date: '19 Ekim 2026 Pazartesi', mainDish: 'Beşamel Soslu Tavuk', sideDish: 'Mısırlı Pirinç Pilavı', soup: 'Mercimek Çorbası', dessertOrFruit: 'Mandalina', calories: 830 },
  { id: 'menu-oct-14', date: '20 Ekim 2026 Salı', mainDish: 'Et Haşlama', sideDish: 'Bulgur Pilavı', soup: 'Ezogelin Çorbası', dessertOrFruit: 'Tulumba Tatlısı', calories: 860 },
  { id: 'menu-oct-15', date: '21 Ekim 2026 Çarşamba', mainDish: 'Etli Dolma', sideDish: 'Tepsi Börek', soup: 'Tutmaç Çorbası', dessertOrFruit: 'Yoğurt', calories: 820 },
  { id: 'menu-oct-16', date: '22 Ekim 2026 Perşembe', mainDish: 'Izgara Köfte + Patates Cips', sideDish: 'Bolonez Soslu Makarna', soup: 'Dövme Çorbası', dessertOrFruit: 'Fıstıklı Şöbiyet', calories: 910 },
  { id: 'menu-oct-17', date: '23 Ekim 2026 Cuma', mainDish: 'Çökertme Kebabı', sideDish: 'Zeytinyağlı Dolma', soup: 'Şehriye Çorbası', dessertOrFruit: 'Islak Kek', calories: 890 },
  { id: 'menu-oct-18', date: '26 Ekim 2026 Pazartesi', mainDish: 'Tavuk Fajita', sideDish: 'Soslu Makarna', soup: 'Süzme Mercimek Çorbası', dessertOrFruit: 'Lokma Tatlısı', calories: 840 },
  { id: 'menu-oct-19', date: '27 Ekim 2026 Salı', mainDish: 'Elbasan Tava', sideDish: 'Şehriyeli Pirinç Pilavı', soup: 'Ezogelin Çorbası', dessertOrFruit: 'Supangle', calories: 870 },
  { id: 'menu-oct-20', date: '28 Ekim 2026 Çarşamba', mainDish: 'Etli Kuru Fasulye', sideDish: 'Pirinç Pilavı', soup: 'Yoğurt', dessertOrFruit: 'Cevizli Helva', calories: 860 },
  { id: 'menu-oct-21', date: '30 Ekim 2026 Cuma', mainDish: 'Çanak Köfte', sideDish: 'Pirinç Pilavı', soup: 'Yoğurt', dessertOrFruit: 'Cevizli Helva', calories: 850 }
];

app.get('/api/announcements', async (req, res) => {
  try {
    if (req.query.force !== 'true' && Date.now() - cachedAnnouncementsTime < CACHE_TTL && cachedAnnouncements.length > 0) {
      return res.json(cachedAnnouncements);
    }
    
    const announcements: any[] = [];
    
    // Main Announcements
    try {
      const response = await axiosInstance.get('https://www.kilis.edu.tr/tr/duyurular', { timeout: 6000 });
      const $ = cheerio.load(response.data);
      $('a.full-link-item').each((i, el) => {
        let titleEl = $(el).find('.title-wrapper .text, .title, h3, h4').first();
        let title = cleanDuplicateTitle(titleEl.length ? titleEl.text() : $(el).text());
        let dateStr = $(el).find('.link-footer .date .text').text().replace(/\s+/g, ' ').trim();
        let href = $(el).attr('href') || '';
        if (href && !href.startsWith('http')) {
          href = `https://www.kilis.edu.tr${href.startsWith('/') ? '' : '/'}${href}`;
        }
        
        if (title && !announcements.some(a => a.title === title || (href && a.url === href))) {
          announcements.push({
            id: `ann-main-${i}`,
            title: title,
            date: dateStr || new Date().toISOString(),
            content: '',
            category: 'Ana Duyurular',
            url: href
          });
        }
      });
    } catch(e) { console.error('Main ann fetch error'); }

    // Faculty Announcements are now fetched on-demand per faculty/department via /api/department-announcements.
    // Only scrape faculties if explicitly requested with includeFaculties=true.
    if (req.query.includeFaculties === 'true') {
      const activeFaculties = FACULTIES.slice(0, 10);
      await processInChunks(activeFaculties, 5, async (fac, index) => {
        try {
          const facRes = await axiosInstance.get(`${fac.url}/tr`, { timeout: 3500 });
          const $ = cheerio.load(facRes.data);
          $('.announcement-item').each((i, el) => {
            let titleEl = $(el).find('.announcement-title, .title, h3, h4').first();
            let title = cleanDuplicateTitle(titleEl.length ? titleEl.text() : $(el).text());
            let dateStr = $(el).find('.announcement-date').text().trim();
            let url = $(el).attr('href');
            let fullUrl = url?.startsWith('http') ? url : `${fac.url}${url?.startsWith('/') ? '' : '/'}${url}`;
            if (title && !announcements.some(a => a.title === title || (fullUrl && a.url === fullUrl))) {
              announcements.push({
                id: `ann-fac-${index}-${i}`,
                title: title,
                date: dateStr || new Date().toISOString(),
                content: '',
                category: fac.name,
                url: fullUrl
              });
            }
          });
        } catch (e) {
          // Silently handle
        }
      });
    }

    if (announcements.length > 0) {
      cachedAnnouncements = announcements;
      cachedAnnouncementsTime = Date.now();
      return res.json(announcements);
    }

    res.json(cachedAnnouncements.length > 0 ? cachedAnnouncements : DEFAULT_ANNOUNCEMENTS);
  } catch (error) {
    console.error('Announcements error, returning default data:', error);
    res.json(cachedAnnouncements.length > 0 ? cachedAnnouncements : DEFAULT_ANNOUNCEMENTS);
  }
});

app.get('/api/news', async (req, res) => {
  try {
    if (req.query.force !== 'true' && Date.now() - cachedNewsTime < CACHE_TTL && cachedNews.length > 0) {
      return res.json(cachedNews);
    }
    
    const news: any[] = [];
    
    // Main News
    try {
      const response = await axiosInstance.get('https://www.kilis.edu.tr/tr/haberler', { timeout: 6000 });
      const $ = cheerio.load(response.data);
      $('a.full-link-item').each((i, el) => {
        let titleEl = $(el).find('.title-wrapper .text, .title, h3, h4').first();
        let title = cleanDuplicateTitle(titleEl.length ? titleEl.text() : $(el).text());
        let dateStr = $(el).find('.link-footer .date .text').text().replace(/\s+/g, ' ').trim();
        let href = $(el).attr('href') || '';
        if (href && !href.startsWith('http')) {
          href = `https://www.kilis.edu.tr${href.startsWith('/') ? '' : '/'}${href}`;
        }
        
        if (title && !news.some(n => n.title === title || (href && n.url === href))) {
          news.push({
            id: `news-main-${i}`,
            title: title,
            date: dateStr || new Date().toISOString(),
            content: '',
            category: 'Üniversite Haberleri',
            url: href
          });
        }
      });
    } catch(e) { console.error('Main news fetch error'); }

    // Faculty News are now fetched on-demand per faculty/department via /api/department-news.
    // Only scrape faculties if explicitly requested with includeFaculties=true.
    if (req.query.includeFaculties === 'true') {
      const activeFaculties = FACULTIES.slice(0, 10);
      await processInChunks(activeFaculties, 5, async (fac, index) => {
        try {
          const facRes = await axiosInstance.get(`${fac.url}/tr`, { timeout: 3500 });
          const $ = cheerio.load(facRes.data);
          $('.news-item').each((i, el) => {
            let titleEl = $(el).find('.news-title, .title, h3, h4').first();
            let title = cleanDuplicateTitle(titleEl.length ? titleEl.text() : $(el).text());
            let dateStr = $(el).find('.news-date').text().trim();
            let url = $(el).attr('href');
            let fullUrl = url?.startsWith('http') ? url : `${fac.url}${url?.startsWith('/') ? '' : '/'}${url}`;
            if (title && !news.some(n => n.title === title || (fullUrl && n.url === fullUrl))) {
              news.push({
                id: `news-fac-${index}-${i}`,
                title: title,
                date: dateStr || new Date().toISOString(),
                content: '',
                category: fac.name,
                url: fullUrl
              });
            }
          });
        } catch (e) {
          // Silently handle
        }
      });
    }

    if (news.length > 0) {
      cachedNews = news;
      cachedNewsTime = Date.now();
      return res.json(news);
    }

    res.json(cachedNews.length > 0 ? cachedNews : DEFAULT_NEWS);
  } catch (error) {
    console.error('News error, returning default data:', error);
    res.json(cachedNews.length > 0 ? cachedNews : DEFAULT_NEWS);
  }
});

// Cache for department specific news
const cachedDepartmentNewsMap = new Map<string, { data: any[]; time: number }>();

app.get('/api/department-news', async (req, res) => {
  try {
    let deptUrl = typeof req.query.deptUrl === 'string' ? req.query.deptUrl.trim() : '';
    const deptId = typeof req.query.deptId === 'string' ? req.query.deptId.trim() : '';
    const facultyId = typeof req.query.facultyId === 'string' ? req.query.facultyId.trim() : '';
    const force = req.query.force === 'true';

    // Lookup academic unit details
    const foundGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === facultyId) || 
      (deptId ? ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.departments.some(d => d.id === deptId || d.slug === deptId)) : undefined);
    const foundDept = foundGroup && deptId && deptId !== 'all' ? foundGroup.departments.find(d => d.id === deptId || d.slug === deptId) : undefined;
    
    const facultyName = foundGroup ? foundGroup.facultyName : '';
    const departmentName = foundDept ? foundDept.name : (deptId && deptId !== 'all' ? deptId : 'Fakülte Geneli');

    if (!deptUrl) {
      if (foundDept) {
        deptUrl = foundDept.newsUrl;
      } else if (foundGroup) {
        deptUrl = foundGroup.facultyNewsUrl;
      }
    }

    // 1. If a specific department live URL is provided
    if (deptUrl && deptUrl.startsWith('http')) {
      const cacheKey = `dept_${deptUrl}`;
      if (!force && cachedDepartmentNewsMap.has(cacheKey)) {
        const cached = cachedDepartmentNewsMap.get(cacheKey)!;
        if (Date.now() - cached.time < CACHE_TTL) {
          return res.json(cached.data);
        }
      }

      try {
        const response = await axiosInstance.get(deptUrl, { timeout: 6000 });
        const $ = cheerio.load(response.data);
        const list: any[] = [];
        const base = deptUrl.split('/tr')[0];

        $('.news-item, a.news-item, a[href*="news-detail"], .news-all-item').each((i, el) => {
          let titleEl = $(el).find('.news-item-title, .title, h3, h4').first();
          let title = cleanDuplicateTitle(titleEl.length ? titleEl.text() : $(el).text());
          if (!title || title.length < 5) return;

          let dateEl = $(el).find('.news-item-date, .date, .time, .link-footer .date .text, .link-footer .date').first();
          let rawDate = dateEl.text().trim().replace(/\s+/g, ' ');
          let href = $(el).attr('href') || $(el).find('a').attr('href');
          if (href && !href.startsWith('http')) {
            href = `${base}${href.startsWith('/') ? '' : '/'}${href}`;
          }

          let img = $(el).find('img').attr('src');
          if (img && !img.startsWith('http')) {
            img = `${base}${img.startsWith('/') ? '' : '/'}${img}`;
          }

          if (!list.some(it => it.title === title || (href && it.url === href) || (img && it.imageUrl === img))) {
            list.push({
              id: `dept-live-${deptId || facultyId || 'item'}-${i}-${Date.now()}`,
              title,
              date: rawDate || 'Güncel',
              url: href || deptUrl,
              imageUrl: img || undefined,
              facultyId: facultyId || (foundGroup ? foundGroup.facultyId : ''),
              facultyName,
              departmentId: deptId || 'general',
              departmentName,
              sourceUrl: deptUrl,
              category: `${departmentName || facultyName || 'Bölüm'} Haberleri`
            });
          }
        });

        if (list.length > 0) {
          cachedDepartmentNewsMap.set(cacheKey, { data: list, time: Date.now() });
          return res.json(list);
        }
      } catch (scrapeErr) {
        console.warn('Live department scrape failed for', deptUrl, (scrapeErr as any)?.message);
      }
    }

    // 2. Filter fallback department news
    let result = [...FALLBACK_DEPARTMENT_NEWS];
    if (deptId && deptId !== 'all') {
      const match = result.filter(item => item.departmentId === deptId || item.id.includes(deptId));
      if (match.length > 0) result = match;
    } else if (facultyId && facultyId !== 'all') {
      const match = result.filter(item => item.facultyId === facultyId);
      if (match.length > 0) result = match;
    }

    return res.json(result);
  } catch (error) {
    console.error('Department news error:', error);
    res.json(FALLBACK_DEPARTMENT_NEWS);
  }
});

// Cache for department specific announcements
const cachedDepartmentAnnouncementsMap = new Map<string, { data: any[]; time: number }>();

app.get('/api/department-announcements', async (req, res) => {
  try {
    let deptUrl = typeof req.query.deptUrl === 'string' ? req.query.deptUrl.trim() : '';
    const deptId = typeof req.query.deptId === 'string' ? req.query.deptId.trim() : '';
    const facultyId = typeof req.query.facultyId === 'string' ? req.query.facultyId.trim() : '';
    const force = req.query.force === 'true';

    // Lookup academic unit details
    const foundGroup = ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.facultyId === facultyId) || 
      (deptId ? ACADEMIC_UNITS_WITH_DEPARTMENTS.find(g => g.departments.some(d => d.id === deptId || d.slug === deptId)) : undefined);
    const foundDept = foundGroup && deptId && deptId !== 'all' ? foundGroup.departments.find(d => d.id === deptId || d.slug === deptId) : undefined;
    
    const facultyName = foundGroup ? foundGroup.facultyName : '';
    const departmentName = foundDept ? foundDept.name : (deptId && deptId !== 'all' ? deptId : 'Fakülte Geneli');

    // Auto-resolve URL if missing
    if (!deptUrl) {
      if (foundDept) {
        deptUrl = foundDept.announcementUrl || foundDept.newsUrl.replace('/news-all', '/announcements-all');
      } else if (foundGroup) {
        deptUrl = foundGroup.facultyAnnouncementUrl || foundGroup.facultyNewsUrl.replace('/news-all', '/announcements-all');
      }
    }

    // Normalize URL: convert singular /announcement-all to plural /announcements-all
    if (deptUrl) {
      deptUrl = deptUrl.replace('/announcement-all', '/announcements-all');
    }

    // 1. Live Scrape
    if (deptUrl && deptUrl.startsWith('http')) {
      const cacheKey = `dept_ann_${deptUrl}`;
      if (!force && cachedDepartmentAnnouncementsMap.has(cacheKey)) {
        const cached = cachedDepartmentAnnouncementsMap.get(cacheKey)!;
        if (Date.now() - cached.time < CACHE_TTL) {
          return res.json(cached.data);
        }
      }

      try {
        const response = await axiosInstance.get(deptUrl, { timeout: 6000 });
        const $ = cheerio.load(response.data);
        const list: any[] = [];
        const base = deptUrl.split('/tr')[0];

        $('.news-item, a.news-item, .announcement-item, a.announcement-item, a[href*="announcements-detail"], a[href*="announcement-detail"], .sidebar-news-item, .announcement-all-item, .duyuru-item, a.full-link-item').each((i, el) => {
          let titleEl = $(el).find('.news-item-title, .announcement-item-title, .announcement-title, .sidebar-news-item-title, .title-wrapper .text, .title, h3, h4').first();
          let title = cleanDuplicateTitle(titleEl.length ? titleEl.text() : $(el).text());
          if (!title || title.length < 5) return;

          let dateEl = $(el).find('.news-item-date, .announcement-item-date, .announcement-date, .date, .time, .link-footer .date .text, .link-footer .date').first();
          let rawDate = dateEl.text().trim().replace(/\s+/g, ' ');
          let href = $(el).attr('href') || $(el).find('a').attr('href');
          if (href && !href.startsWith('http')) {
            href = `${base}${href.startsWith('/') ? '' : '/'}${href}`;
          }

          let img = $(el).find('img').attr('src');
          if (img && !img.startsWith('http')) {
            img = `${base}${img.startsWith('/') ? '' : '/'}${img}`;
          }

          if (!list.some(it => it.title === title || (href && it.url === href) || (img && it.imageUrl === img))) {
            list.push({
              id: `dept-ann-live-${deptId || facultyId || 'item'}-${i}-${Date.now()}`,
              title,
              date: rawDate || 'Güncel',
              url: href || deptUrl,
              imageUrl: img || undefined,
              facultyId: facultyId || (foundGroup ? foundGroup.facultyId : ''),
              facultyName,
              departmentId: deptId || 'general',
              departmentName,
              sourceUrl: deptUrl,
              category: `${departmentName || facultyName || 'Üniversite'} Duyuruları`
            });
          }
        });

        if (list.length > 0) {
          cachedDepartmentAnnouncementsMap.set(cacheKey, { data: list, time: Date.now() });
          return res.json(list);
        }
      } catch (scrapeErr) {
        console.warn('Live department announcements scrape failed for', deptUrl, (scrapeErr as any)?.message);
      }
    }

    // 2. Filter fallback department announcements
    let result = [...FALLBACK_DEPARTMENT_ANNOUNCEMENTS];
    if (deptId && deptId !== 'all') {
      const match = result.filter(item => (item.departmentId && item.departmentId === deptId) || item.id.includes(deptId));
      if (match.length > 0) result = match;
    } else if (facultyId && facultyId !== 'all') {
      const match = result.filter(item => item.facultyId === facultyId);
      if (match.length > 0) result = match;
    }

    return res.json(result);
  } catch (error) {
    console.error('Department announcements error:', error);
    res.json(FALLBACK_DEPARTMENT_ANNOUNCEMENTS);
  }
});

let cachedMenu: any[] = [];
let cachedMenuTime = 0;
const MENU_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

app.get('/api/menu', async (req, res) => {
  try {
    if (req.query.force !== 'true' && Date.now() - cachedMenuTime < MENU_CACHE_TTL && cachedMenu.length > 0) {
      return res.json(cachedMenu);
    }

    const response = await axiosInstance.get('https://sks.kilis.edu.tr/tr/page/5088', { timeout: 7000 });
    const $ = cheerio.load(response.data);
    const menuItems: any[] = [];
    
    const cleanDish = (str: string) => {
      let s = (str || '').replace(/\s+/g, ' ').trim();
      s = s.replace(/MANTARLI TAVUK SOYE/i, 'MANTARLI TAVUK SOTE');
      s = s.replace(/ALİ AŞA KÖFTE/i, 'ALİ PAŞA KÖFTE');
      s = s.replace(/ŞEKERPARRE/i, 'ŞEKERPARE');
      s = s.replace(/TEPSİ BÖRREK/i, 'TEPSİ BÖREK');
      s = s.replace(/IZGARA KÖFTE\+CİPS/i, 'IZGARA KÖFTE + PATATES CİPS');
      s = s.replace(/BOL\.\s*SOS\.\s*MAKARNA/i, 'BOLONEZ SOSLU MAKARNA');
      s = s.replace(/ŞEH\.\s*PİRİNÇ\s*PİLAVI/i, 'ŞEHRİYELİ PİRİNÇ PİLAVI');
      return s;
    };

    $('table tr').each((i, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 5) {
        const dateStr = $(tds[0]).text().replace(/\s+/g, ' ').trim();
        const mainDish = cleanDish($(tds[1]).text());
        const sideDish = cleanDish($(tds[2]).text());
        const soup = cleanDish($(tds[3]).text());
        const dessert = cleanDish($(tds[4]).text());
        
        if (mainDish && !mainDish.includes('1.YEMEK') && !dateStr.toLowerCase().includes('menüsü')) {
          menuItems.push({
            id: `menu-live-${i}`,
            date: dateStr,
            mainDish: mainDish,
            sideDish: sideDish,
            soup: soup,
            dessertOrFruit: dessert,
            calories: 0
          });
        }
      }
    });
    
    if (menuItems.length > 0) {
      cachedMenu = menuItems;
      cachedMenuTime = Date.now();
      return res.json(menuItems);
    }

    res.json(cachedMenu.length > 0 ? cachedMenu : DEFAULT_MENU);
  } catch (error) {
    console.error('Menu error, returning fallback menu:', error);
    res.json(cachedMenu.length > 0 ? cachedMenu : DEFAULT_MENU);
  }
});

const MONTH_MAP: Record<string, string> = {
  'ocak': '01', 'şubat': '02', 'subat': '02', 'mart': '03', 'nisan': '04',
  'mayıs': '05', 'mayis': '05', 'haziran': '06', 'temmuz': '07', 'ağustos': '08', 'agustos': '08',
  'eylül': '09', 'eylul': '09', 'ekim': '10', 'kasım': '11', 'kasim': '11', 'aralık': '12', 'aralik': '12'
};

function parseTrDate(str: string): string {
  if (!str) return '';
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, '0');
    const month = MONTH_MAP[parts[1].toLowerCase()] || '01';
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return str;
}

function detectCalendarEventType(title: string, term?: string): 'exam' | 'registration' | 'holiday' | 'other' {
  const t = title.toLowerCase();
  
  // 1. Resmi Tatiller / Bayramlar / Özel Günler
  if (term === 'Resmi Tatiller' || 
      t.includes('tatil') || 
      t.includes('bayram') || 
      t.includes('yılbaşı') || 
      t.includes('yilbasi') ||
      t.includes('günü') || 
      t.includes('gunu') ||
      t.includes('arefe') ||
      t.includes('1 mayıs') ||
      t.includes('23 nisan') ||
      t.includes('19 mayıs') ||
      t.includes('15 temmuz') ||
      t.includes('30 ağustos') ||
      t.includes('29 ekim')) {
    return 'holiday';
  }

  // 2. Kayıt ve Başvuru Süreçleri
  if (t.includes('başvuru') || 
      t.includes('basvuru') || 
      t.includes('kayıt') || 
      t.includes('kayit') || 
      t.includes('katkı payı') || 
      t.includes('öğrenim ücreti') || 
      t.includes('ücret') || 
      t.includes('ekle-bırak') || 
      t.includes('ekle bırak') || 
      t.includes('danışman') || 
      t.includes('kabul listesi')) {
    return 'registration';
  }

  // 3. Sınavlar ve Not Süreçleri
  if (t.includes('sınav') || 
      t.includes('sinav') || 
      t.includes('vize') || 
      t.includes('final') || 
      t.includes('bütünleme') || 
      t.includes('mülakat') || 
      t.includes('muafiyet sınavı') || 
      t.includes('yeterlilik') || 
      t.includes('öbs’ne girişi') || 
      t.includes('notları')) {
    return 'exam';
  }

  // 4. Genel Eğitim / Ders Başlangıç-Bitiş / Staj
  return 'other';
}

// --- CANLI HAVA DURUMU (MGM RESMİ KİLİS İSTASYONU & YEDEK MODEL) ---
let cachedWeatherData: any = null;
let cachedWeatherTime = 0;
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const MGM_HADISE_MAP: Record<string, { wmo: number; text: string }> = {
  'A': { wmo: 0, text: 'Açık & Güneşli' },
  'AB': { wmo: 1, text: 'Az Bulutlu' },
  'PB': { wmo: 2, text: 'Parçalı Bulutlu' },
  'CB': { wmo: 3, text: 'Çok Bulutlu' },
  'HY': { wmo: 51, text: 'Hafif Yağmurlu' },
  'Y': { wmo: 61, text: 'Yağmurlu' },
  'KY': { wmo: 65, text: 'Kuvvetli Yağmurlu' },
  'KKY': { wmo: 68, text: 'Karla Karışık Yağmurlu' },
  'HKY': { wmo: 71, text: 'Hafif Kar Yağışlı' },
  'K': { wmo: 73, text: 'Kar Yağışlı' },
  'KYK': { wmo: 75, text: 'Yoğun Kar Yağışlı' },
  'YKY': { wmo: 75, text: 'Yoğun Kar Yağışlı' },
  'HSY': { wmo: 80, text: 'Hafif Sağanak Yağışlı' },
  'SY': { wmo: 81, text: 'Sağanak Yağışlı' },
  'KSY': { wmo: 82, text: 'Kuvvetli Sağanak Yağışlı' },
  'MSY': { wmo: 80, text: 'Mevzi Sağanak Yağışlı' },
  'DY': { wmo: 96, text: 'Dolu Yağışlı' },
  'GSY': { wmo: 95, text: 'Gökgürültülü Sağanak Yağışlı' },
  'KGSY': { wmo: 99, text: 'Kuvvetli Gökgürültülü Sağanak Yağışlı' },
  'KGY': { wmo: 99, text: 'Kuvvetli Gökgürültülü Sağanak Yağışlı' },
  'SIS': { wmo: 45, text: 'Sisli' },
  'PUS': { wmo: 48, text: 'Puslu' },
  'DNM': { wmo: 48, text: 'Dumanlı' },
  'KF': { wmo: 48, text: 'Toz veya Kum Fırtınası' },
  'R': { wmo: 2, text: 'Rüzgarlı' },
  'GKR': { wmo: 2, text: 'Güneyli Kuvvetli Rüzgar' },
  'KKR': { wmo: 2, text: 'Kuzeyli Kuvvetli Rüzgar' },
  'SCK': { wmo: 0, text: 'Sıcak' },
  'SGK': { wmo: 3, text: 'Soğuk' },
  'HHY': { wmo: 61, text: 'Yağışlı' }
};

app.get('/api/weather', async (req, res) => {
  try {
    if (req.query.force !== 'true' && cachedWeatherData && Date.now() - cachedWeatherTime < WEATHER_CACHE_TTL) {
      return res.json(cachedWeatherData);
    }

    const mgmHeaders = {
      'Origin': 'https://www.mgm.gov.tr',
      'Referer': 'https://www.mgm.gov.tr/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    try {
      // 1. Primary: Fetch from MGM official Kilis station (İstasyon No: 17262), forecasts (Tahmin No: 97901) and hourly predictions
      const [sondurumRes, gunlukRes, saatlikRes, openMeteoRes] = await Promise.allSettled([
        axiosInstance.get('https://servis.mgm.gov.tr/web/sondurumlar?istno=17262', { headers: mgmHeaders, timeout: 6500 }),
        axiosInstance.get('https://servis.mgm.gov.tr/web/tahminler/gunluk?istno=97901', { headers: mgmHeaders, timeout: 6500 }),
        axiosInstance.get('https://servis.mgm.gov.tr/web/tahminler/saatlik?istno=17262', { headers: mgmHeaders, timeout: 6500 }),
        axiosInstance.get(
          'https://api.open-meteo.com/v1/forecast?latitude=36.7161&longitude=37.1150&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,apparent_temperature,surface_pressure,uv_index,is_day&current=time&forecast_days=3&timezone=Europe%2FIstanbul',
          { timeout: 5000 }
        )
      ]);

      const cur = (sondurumRes.status === 'fulfilled' && sondurumRes.value.data && sondurumRes.value.data[0]) || {};
      const g = (gunlukRes.status === 'fulfilled' && gunlukRes.value.data && gunlukRes.value.data[0]) || {};
      const s = (saatlikRes.status === 'fulfilled' && saatlikRes.value.data && saatlikRes.value.data[0]?.tahmin) || [];
      const omData = (openMeteoRes.status === 'fulfilled' && openMeteoRes.value.data) || null;

      if (cur && typeof cur.sicaklik === 'number') {
        const hadiseKodu = (cur.hadiseKodu || 'A').toUpperCase();
        const info = MGM_HADISE_MAP[hadiseKodu] || { wmo: 0, text: 'Açık' };

        // Determine day or night for Kilis local time (Europe/Istanbul UTC+3)
        const now = new Date();
        const trHour = (now.getUTCHours() + 3) % 24;
        const isDay = trHour >= 6 && trHour < 18 ? 1 : 0;
        const pad = (n: number) => String(n).padStart(2, '0');
        const liveNowStr = `${pad(trHour)}:${pad(now.getUTCMinutes())}`;

        // Build +1, +2, +3, +4, +6, +8, +12, +24 hourly forecast system
        const targetOffsets = [
          { offset: 0, label: 'Şu An' },
          { offset: 1, label: '+1 Saat' },
          { offset: 2, label: '+2 Saat' },
          { offset: 3, label: '+3 Saat' },
          { offset: 4, label: '+4 Saat' },
          { offset: 6, label: '+6 Saat' },
          { offset: 8, label: '+8 Saat' },
          { offset: 12, label: '+12 Saat' },
          { offset: 24, label: '+24 Saat' }
        ];

        let hourlyList: any[] = [];

        if (omData?.hourly?.time) {
          const times: string[] = omData.hourly.time;
          const currentTimeIso: string = omData.current?.time || '';
          const currentHourPrefix = currentTimeIso ? currentTimeIso.slice(0, 13) : '';
          let baseIndex = currentHourPrefix ? times.findIndex((t: string) => t.startsWith(currentHourPrefix)) : 0;
          if (baseIndex === -1) baseIndex = 0;

          hourlyList = targetOffsets.map(item => {
            const idx = baseIndex + item.offset;
            const timeStr = item.offset === 0 ? liveNowStr : `${pad((trHour + item.offset) % 24)}:00`;
            const itemIsDay = ((trHour + item.offset) % 24) >= 6 && ((trHour + item.offset) % 24) < 18 ? 1 : 0;

            if (item.offset === 0) {
              // Exact live observation from MGM Kilis station
              return {
                hourOffset: 0,
                label: 'Şu An',
                timeStr,
                temp: cur.sicaklik,
                apparentTemp: cur.hissedilenSicaklik ?? cur.sicaklik,
                humidity: cur.nem,
                precipitationProb: cur.hadiseKodu?.includes('Y') ? 70 : (omData.hourly.precipitation_probability?.[idx] ?? 5),
                windSpeed: cur.ruzgarHiz || (omData.hourly.wind_speed_10m?.[idx] ?? 0),
                windDirection: cur.ruzgarYon || (omData.hourly.wind_direction_10m?.[idx] ?? 0),
                surfacePressure: Math.round(cur.aktuelBasinc || 943),
                uvIndex: isDay ? (omData.hourly.uv_index?.[idx] ?? 4) : 0,
                weatherCode: info.wmo,
                conditionText: info.text,
                isDay
              };
            }

            return {
              hourOffset: item.offset,
              label: item.label,
              timeStr,
              temp: omData.hourly.temperature_2m?.[idx] ?? cur.sicaklik,
              apparentTemp: omData.hourly.apparent_temperature?.[idx] ?? cur.sicaklik,
              humidity: omData.hourly.relative_humidity_2m?.[idx] ?? cur.nem,
              precipitationProb: omData.hourly.precipitation_probability?.[idx] ?? 0,
              windSpeed: omData.hourly.wind_speed_10m?.[idx] ?? (cur.ruzgarHiz || 0),
              windDirection: omData.hourly.wind_direction_10m?.[idx] ?? (cur.ruzgarYon || 0),
              surfacePressure: Math.round(omData.hourly.surface_pressure?.[idx] || cur.aktuelBasinc || 943),
              uvIndex: omData.hourly.uv_index?.[idx] ?? (itemIsDay ? 3 : 0),
              weatherCode: omData.hourly.weather_code?.[idx] ?? 0,
              isDay: omData.hourly.is_day?.[idx] ?? itemIsDay
            };
          });
        } else if (Array.isArray(s) && s.length > 0) {
          // Fallback using MGM 3-hourly predictions interpolated to target offsets
          hourlyList = targetOffsets.map(item => {
            const mgmIdx = Math.min(s.length - 1, Math.round(item.offset / 3));
            const mgmItem = s[mgmIdx] || {};
            const itemHour = (trHour + item.offset) % 24;
            const itemIsDay = itemHour >= 6 && itemHour < 18 ? 1 : 0;
            const itemInfo = MGM_HADISE_MAP[(mgmItem.hadise || 'A').toUpperCase()] || info;

            if (item.offset === 0) {
              return {
                hourOffset: 0,
                label: 'Şu An',
                timeStr: liveNowStr,
                temp: cur.sicaklik,
                apparentTemp: cur.hissedilenSicaklik ?? cur.sicaklik,
                humidity: cur.nem,
                precipitationProb: cur.hadiseKodu?.includes('Y') ? 70 : 5,
                windSpeed: cur.ruzgarHiz || 0,
                windDirection: cur.ruzgarYon || 0,
                surfacePressure: Math.round(cur.aktuelBasinc || 943),
                uvIndex: isDay ? 4 : 0,
                weatherCode: info.wmo,
                conditionText: info.text,
                isDay
              };
            }

            return {
              hourOffset: item.offset,
              label: item.label,
              timeStr: `${String(itemHour).padStart(2, '0')}:00`,
              temp: mgmItem.sicaklik ?? cur.sicaklik,
              apparentTemp: mgmItem.hissedilenSicaklik || mgmItem.sicaklik || cur.sicaklik,
              humidity: mgmItem.nem ?? cur.nem,
              precipitationProb: mgmItem.hadise?.includes('Y') ? 65 : mgmItem.hadise?.includes('B') ? 20 : 5,
              windSpeed: mgmItem.ruzgarHizi || cur.ruzgarHiz || 0,
              windDirection: mgmItem.ruzgarYonu || cur.ruzgarYon || 0,
              surfacePressure: Math.round(cur.aktuelBasinc || 943),
              uvIndex: itemIsDay ? 3 : 0,
              weatherCode: itemInfo.wmo,
              conditionText: itemInfo.text,
              isDay: itemIsDay
            };
          });
        }

        // 4-day MGM official daily forecast (4 gün)
        const dailyForecasts: any[] = [];
        const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        for (let i = 1; i <= 4; i++) {
          const rawDate = g['tarihGun' + i];
          if (rawDate) {
            const dt = new Date(rawDate);
            const dayName = dayNames[dt.getUTCDay()];
            const dHadise = (g['hadiseGun' + i] || 'A').toUpperCase();
            const dInfo = MGM_HADISE_MAP[dHadise] || { wmo: 0, text: 'Açık' };
            dailyForecasts.push({
              dayName,
              dateStr: `${String(dt.getUTCDate()).padStart(2, '0')}.${String(dt.getUTCMonth() + 1).padStart(2, '0')}`,
              hadise: dHadise,
              conditionText: dInfo.text,
              weatherCode: dInfo.wmo,
              minTemp: g['enDusukGun' + i],
              maxTemp: g['enYuksekGun' + i],
              minHumidity: g['enDusukNemGun' + i],
              maxHumidity: g['enYuksekNemGun' + i],
              windSpeed: g['ruzgarHizGun' + i]
            });
          }
        }

        const mgmPayload = {
          source: 'MGM Resmi Kilis İstasyonu (No: 17262)',
          stationName: 'Kilis Merkez Meteoroloji İstasyonu',
          observationTime: cur.veriZamani,
          temperature: cur.sicaklik,
          apparentTemperature: cur.hissedilenSicaklik ?? cur.sicaklik,
          humidity: cur.nem,
          windSpeed: cur.ruzgarHiz || 0,
          windDirection: cur.ruzgarYon || 0,
          surfacePressure: Math.round(cur.aktuelBasinc || 943),
          seaLevelPressure: Math.round(cur.denizeIndirgenmisBasinc || 1014),
          rainChance: cur.hadiseKodu?.includes('Y') ? 70 : 0,
          rainChanceMax: g.hadiseGun1?.includes('Y') ? 75 : 10,
          rain24h: cur.yagis24Saat || 0,
          hadiseKodu: cur.hadiseKodu,
          conditionText: info.text,
          weathercode: info.wmo,
          is_day: isDay,
          tempMin: g.enDusukGun1 ?? cur.sicaklik,
          tempMax: g.enYuksekGun1 ?? cur.sicaklik,
          sunrise: '06:40',
          sunset: '18:15',
          uvIndexMax: isDay ? 5 : 0,
          hourlyList: hourlyList.length > 0 ? hourlyList : undefined,
          dailyForecasts: dailyForecasts.length > 0 ? dailyForecasts : undefined
        };

        cachedWeatherData = mgmPayload;
        cachedWeatherTime = Date.now();
        return res.json(mgmPayload);
      }
    } catch (mgmErr: any) {
      console.warn('MGM primary weather fetch notice:', mgmErr.message);
    }

    // 2. High-precision Fallback: ECMWF model via Open-Meteo
    const fallbackRes = await axiosInstance.get(
      'https://api.open-meteo.com/v1/forecast?latitude=36.7161&longitude=37.1150&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day,apparent_temperature,surface_pressure&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,apparent_temperature,surface_pressure,uv_index,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&models=ecmwf_ifs025&forecast_days=3&timezone=Europe%2FIstanbul',
      { timeout: 5000 }
    );
    const data = fallbackRes.data;
    const times = data.hourly?.time || [];
    const currentTimeIso = data.current?.time || '';
    const currentHourPrefix = currentTimeIso ? currentTimeIso.slice(0, 13) : '';
    let baseIndex = currentHourPrefix ? times.findIndex((t: string) => t.startsWith(currentHourPrefix)) : 0;
    if (baseIndex === -1) baseIndex = 0;

    const currentHourlyRainChance = data.hourly?.precipitation_probability?.[baseIndex] ?? 0;
    const dailyMaxRainChance = data.daily?.precipitation_probability_max?.[0] ?? currentHourlyRainChance;

    const targetOffsets = [
      { offset: 0, label: 'Şu An' },
      { offset: 1, label: '+1 Saat' },
      { offset: 2, label: '+2 Saat' },
      { offset: 3, label: '+3 Saat' },
      { offset: 4, label: '+4 Saat' },
      { offset: 6, label: '+6 Saat' },
      { offset: 8, label: '+8 Saat' },
      { offset: 12, label: '+12 Saat' },
      { offset: 24, label: '+24 Saat' }
    ];

    const hourlyList = targetOffsets
      .map(item => {
        const idx = baseIndex + item.offset;
        if (idx < times.length) {
          const pad = (n: number) => String(n).padStart(2, '0');
          const nowFallback = new Date();
          const trHourFallback = (nowFallback.getUTCHours() + 3) % 24;
          const liveNowFallback = `${pad(trHourFallback)}:${pad(nowFallback.getUTCMinutes())}`;
          const timeStr = item.offset === 0 ? liveNowFallback : `${pad((trHourFallback + item.offset) % 24)}:00`;
          return {
            hourOffset: item.offset,
            label: item.label,
            timeStr,
            temp: data.hourly.temperature_2m[idx] ?? data.current.temperature_2m,
            apparentTemp: data.hourly.apparent_temperature?.[idx] ?? data.current.temperature_2m,
            humidity: data.hourly.relative_humidity_2m?.[idx] ?? data.current.relative_humidity_2m,
            precipitationProb: data.hourly.precipitation_probability?.[idx] ?? 0,
            windSpeed: data.hourly.wind_speed_10m?.[idx] ?? 0,
            windDirection: data.hourly.wind_direction_10m?.[idx] ?? 0,
            surfacePressure: data.hourly.surface_pressure?.[idx] ?? 1013,
            uvIndex: data.hourly.uv_index?.[idx] ?? 0,
            weatherCode: data.hourly.weather_code?.[idx] ?? 0,
            isDay: data.hourly.is_day?.[idx] ?? 1
          };
        }
        return null;
      })
      .filter(Boolean);

    const fallbackPayload = {
      source: 'ECMWF Avrupa Meteoroloji Modeli (Yedek)',
      stationName: 'Kilis 7 Aralık Kampüsü',
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature || data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m || 0,
      surfacePressure: data.current.surface_pressure || 1013,
      rainChance: currentHourlyRainChance,
      rainChanceMax: dailyMaxRainChance,
      weathercode: data.current.weather_code,
      is_day: data.current.is_day,
      tempMin: data.daily.temperature_2m_min?.[0] ?? data.current.temperature_2m,
      tempMax: data.daily.temperature_2m_max?.[0] ?? data.current.temperature_2m,
      sunrise: data.daily.sunrise?.[0] || '06:40',
      sunset: data.daily.sunset?.[0] || '18:15',
      uvIndexMax: data.daily.uv_index_max?.[0] || 0,
      hourlyList
    };

    cachedWeatherData = fallbackPayload;
    cachedWeatherTime = Date.now();
    res.json(fallbackPayload);
  } catch (err: any) {
    console.error('Weather API error:', err);
    if (cachedWeatherData) return res.json(cachedWeatherData);
    res.status(500).json({ error: 'Hava durumu alınamadı' });
  }
});

app.get('/api/calendar', async (req, res) => {
  try {
    if (req.query.force !== 'true' && Date.now() - cachedCalendarTime < CALENDAR_CACHE_TTL && cachedCalendar.length > 0) {
      return res.json(cachedCalendar);
    }

    const response = await axiosInstance.get('https://ogrenciisleri.kilis.edu.tr/tr/page/6461');
    const $ = cheerio.load(response.data);
    const events: any[] = [];
    let currentTerm = 'Güz Yarıyılı';

    $('table tr').each((i, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim().toUpperCase();
      if (text.includes('RESMİ TATİLLER') || text.includes('RESMI TATILLER')) {
        currentTerm = 'Resmi Tatiller';
      } else if (text.includes('BAHAR YARIYILI')) {
        currentTerm = 'Bahar Yarıyılı';
      } else if (text.includes('GÜZ YARIYILI') || text.includes('DERS YILI')) {
        currentTerm = 'Güz Yarıyılı';
      }

      const tds = $(el).find('td');
      if (tds.length === 3) {
        const startText = $(tds[0]).text().trim();
        const endText = $(tds[1]).text().trim();
        const title = $(tds[2]).text().trim();

        if (title && startText && !title.toUpperCase().includes('YARIYILI') && !title.toUpperCase().includes('RESMİ TATİLLER') && !startText.toUpperCase().includes('BAŞLANGIÇ')) {
          events.push({
            id: `cal-live-${events.length + 1}`,
            title,
            date: parseTrDate(startText),
            endDate: endText ? parseTrDate(endText) : undefined,
            term: currentTerm,
            type: detectCalendarEventType(title, currentTerm),
            rawStart: startText,
            rawEnd: endText
          });
        }
      } else if (tds.length === 2) {
        const dateText = $(tds[0]).text().trim();
        const title = $(tds[1]).text().trim();
        if (title && dateText && !title.toUpperCase().includes('YARIYILI') && !title.toUpperCase().includes('RESMİ TATİLLER') && !dateText.toUpperCase().includes('BAŞLANGIÇ')) {
          events.push({
            id: `cal-live-${events.length + 1}`,
            title,
            date: parseTrDate(dateText),
            term: currentTerm,
            type: detectCalendarEventType(title, currentTerm),
            rawStart: dateText
          });
        }
      }
    });

    const FALLBACK_CAL = [
      { id: 't1', title: 'Güz Yarıyılı Ders Kayıtları', date: '2026-09-15', term: 'Güz Yarıyılı', type: 'registration' },
      { id: 't2', title: 'Güz Yarıyılı Ders Başlangıcı', date: '2026-09-22', term: 'Güz Yarıyılı', type: 'other' },
      { id: 't3', title: 'Danışman Onayları ve Ekle-Bırak', date: '2026-09-29', term: 'Güz Yarıyılı', type: 'registration' },
      { id: 't4', title: 'Güz Yarıyılı Ara Sınavları (Vizeler)', date: '2026-11-10', term: 'Güz Yarıyılı', type: 'exam' },
      { id: 't5', title: 'Güz Yarıyılı Ders Bitişi', date: '2027-01-02', term: 'Güz Yarıyılı', type: 'other' },
      { id: 't6', title: 'Güz Yarıyılı Yarıyıl Sonu Sınavları (Finaller)', date: '2027-01-05', term: 'Güz Yarıyılı', type: 'exam' },
      { id: 't7', title: 'Güz Bütünleme Sınavları', date: '2027-01-20', term: 'Güz Yarıyılı', type: 'exam' },
      { id: 't8', title: 'Bahar Yarıyılı Ders Kayıtları', date: '2027-02-09', term: 'Bahar Yarıyılı', type: 'registration' },
      { id: 't9', title: 'Bahar Yarıyılı Ders Başlangıcı', date: '2027-02-16', term: 'Bahar Yarıyılı', type: 'other' },
      { id: 't10', title: 'Bahar Yarıyılı Ara Sınavları', date: '2027-04-06', term: 'Bahar Yarıyılı', type: 'exam' },
      { id: 't11', title: 'Bahar Yarıyılı Final Sınavları', date: '2027-06-01', term: 'Bahar Yarıyılı', type: 'exam' },
      { id: 't12', title: 'Bahar Yarıyılı Bütünleme Sınavları', date: '2027-06-15', term: 'Bahar Yarıyılı', type: 'exam' },
      { id: 't13', title: 'Cumhuriyet Bayramı', date: '2026-10-29', term: 'Resmi Tatiller', type: 'holiday' },
      { id: 't14', title: 'Yılbaşı Tatili', date: '2027-01-01', term: 'Resmi Tatiller', type: 'holiday' },
      { id: 't15', title: 'Ramazan Bayramı', date: '2027-03-10', term: 'Resmi Tatiller', type: 'holiday' },
      { id: 't16', title: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı', date: '2027-04-23', term: 'Resmi Tatiller', type: 'holiday' },
      { id: 't17', title: '1 Mayıs Emek ve Dayanışma Günü', date: '2027-05-01', term: 'Resmi Tatiller', type: 'holiday' },
      { id: 't18', title: '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı', date: '2027-05-19', term: 'Resmi Tatiller', type: 'holiday' },
      { id: 't19', title: 'Kurban Bayramı', date: '2027-05-17', term: 'Resmi Tatiller', type: 'holiday' },
      { id: 't20', title: '15 Temmuz Demokrasi ve Milli Birlik Günü', date: '2027-07-15', term: 'Resmi Tatiller', type: 'holiday' },
      { id: 't21', title: '30 Ağustos Zafer Bayramı', date: '2027-08-30', term: 'Resmi Tatiller', type: 'holiday' }
    ];

    if (events.length > 0) {
      cachedCalendar = events;
      cachedCalendarTime = Date.now();
      return res.json(events);
    }

    // Fallback to cached or fallback list
    res.json(cachedCalendar.length > 0 ? cachedCalendar : FALLBACK_CAL);
  } catch (error) {
    console.error('Failed to fetch academic calendar:', error);
    const FALLBACK_CAL = [
      { id: 't1', title: 'Güz Yarıyılı Ders Kayıtları', date: '2026-09-15', term: 'Güz Yarıyılı', type: 'registration' },
      { id: 't2', title: 'Güz Yarıyılı Ders Başlangıcı', date: '2026-09-22', term: 'Güz Yarıyılı', type: 'other' },
      { id: 't3', title: 'Danışman Onayları ve Ekle-Bırak', date: '2026-09-29', term: 'Güz Yarıyılı', type: 'registration' },
      { id: 't4', title: 'Güz Yarıyılı Ara Sınavları (Vizeler)', date: '2026-11-10', term: 'Güz Yarıyılı', type: 'exam' },
      { id: 't5', title: 'Güz Yarıyılı Ders Bitişi', date: '2027-01-02', term: 'Güz Yarıyılı', type: 'other' },
      { id: 't6', title: 'Güz Yarıyılı Yarıyıl Sonu Sınavları (Finaller)', date: '2027-01-05', term: 'Güz Yarıyılı', type: 'exam' },
      { id: 't7', title: 'Güz Bütünleme Sınavları', date: '2027-01-20', term: 'Güz Yarıyılı', type: 'exam' },
      { id: 't8', title: 'Bahar Yarıyılı Ders Kayıtları', date: '2027-02-09', term: 'Bahar Yarıyılı', type: 'registration' },
      { id: 't9', title: 'Bahar Yarıyılı Ders Başlangıcı', date: '2027-02-16', term: 'Bahar Yarıyılı', type: 'other' },
      { id: 't10', title: 'Bahar Yarıyılı Ara Sınavları', date: '2027-04-06', term: 'Bahar Yarıyılı', type: 'exam' },
      { id: 't11', title: 'Bahar Yarıyılı Final Sınavları', date: '2027-06-01', term: 'Bahar Yarıyılı', type: 'exam' },
      { id: 't12', title: 'Bahar Yarıyılı Bütünleme Sınavları', date: '2027-06-15', term: 'Bahar Yarıyılı', type: 'exam' }
    ];
    res.json(cachedCalendar.length > 0 ? cachedCalendar : FALLBACK_CAL);
  }
});

app.get('/api/detail', async (req, res) => {
  try {
    let targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!targetUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const response = await axiosInstance.get(targetUrl, { timeout: 7000 });
    const $ = cheerio.load(response.data);
    
    let title = $('h1.title, .announcement-detail-title, .news-detail-title, .inner-page__title, h1').first().text().trim();
    title = cleanDuplicateTitle(title);
    
    const urlObj = new URL(targetUrl);
    const baseUrl = urlObj.origin;

    // Extract images (Cover + Gallery)
    let imageUrl = '';
    const images: string[] = [];

    // 1. Check meta tags
    const ogImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
    if (ogImg && !ogImg.includes('logo') && !ogImg.includes('default')) {
      imageUrl = ogImg.startsWith('http') ? ogImg : `${baseUrl}${ogImg.startsWith('/') ? '' : '/'}${ogImg}`;
    }

    // 2. Check prominent news detail image containers
    const imgSelectors = [
      '.news-detail-image img',
      '.detail-image img',
      '.announcement-detail-image img',
      '.inner-page__image img',
      '.news-img img',
      '.featured-image img',
      '.slider img',
      '.fotorama img',
      '.content-block img',
      'article img',
      '.inner-page__content img'
    ];

    for (const sel of imgSelectors) {
      $(sel).each((_, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-large');
        if (src) {
          if (!src.startsWith('http')) {
            src = `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
          }
          const isNoise = src.includes('logo') || src.includes('icon') || src.includes('flag') || src.endsWith('.svg');
          if (!isNoise && !images.includes(src)) {
            images.push(src);
            if (!imageUrl) imageUrl = src;
          }
        }
      });
    }

    // 3. Fallback to all page images with news pattern
    if (!imageUrl) {
      $('img').each((_, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src');
        if (src && (src.includes('/news/') || src.includes('/haber') || src.includes('/duyuru') || src.includes('/upload/'))) {
          if (!src.startsWith('http')) {
            src = `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
          }
          if (!images.includes(src)) {
            images.push(src);
            if (!imageUrl) imageUrl = src;
          }
        }
      });
    }
    
    let contentHtml = '';
    
    const contentSelectors = [
      '.event-detail-text',
      '.event-detail-content',
      '.event-content',
      '.etkinlik-detail',
      '.etkinlik-content',
      '.inner-page__content-description',
      '.announcement-detail-text',
      '.news-detail-text',
      '.inner-page__content',
      '.news-content-body',
      '.content-block',
      'article',
      '.detail-content'
    ];
    
    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        contentHtml = el.html() || '';
        break;
      }
    }
    
    if (!contentHtml) {
      const contentBlock = $('h1.title').closest('div').parent().find('p').first().parent();
      if (contentBlock.length) {
        contentHtml = contentBlock.html() || '';
      }
    }
    
    if (!contentHtml) {
      const ps = $('p');
      if (ps.length > 0) {
        contentHtml = ps.map((_, p) => `<p>${$(p).html()}</p>`).get().join('');
      }
    }
    
    if (contentHtml) {
      const $content = cheerio.load(contentHtml, null, false);

      // 1. Remove duplicate headings matching page title
      const normTitle = (title || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (normTitle) {
        $content('h1, h2, h3, .title, .announcement-detail-title, .news-detail-title, .inner-page__content-header').each((_, el) => {
          const hText = $content(el).text().replace(/\s+/g, ' ').trim().toLowerCase();
          if (hText && (hText === normTitle || normTitle.includes(hText) || hText.includes(normTitle))) {
            $content(el).remove();
          }
        });
      }

      // 2. Remove duplicate images matching imageUrl or same filename
      const seenImgs = new Set<string>();
      const normalizeImgKey = (urlStr: string): string => {
        if (!urlStr) return '';
        let s = urlStr.trim();
        try { s = decodeURIComponent(s); } catch {}
        return s.split('/').pop()?.split('?')[0]?.trim().toLowerCase() || '';
      };

      if (imageUrl) {
        seenImgs.add(imageUrl.toLowerCase());
        const coverFn = normalizeImgKey(imageUrl);
        if (coverFn) seenImgs.add(coverFn);
      }

      $content('img').each((_, el) => {
        let src = $content(el).attr('src') || '';
        if (src && !src.startsWith('http')) {
          src = `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
          $content(el).attr('src', src);
        }
        const fn = normalizeImgKey(src);
        if ((imageUrl && src === imageUrl) || (fn && seenImgs.has(fn)) || (src && seenImgs.has(src.toLowerCase()))) {
          const parent = $content(el).parent();
          $content(el).remove();
          if (parent.length && parent.children().length === 0 && !parent.text().trim()) {
            parent.remove();
          }
        } else if (fn) {
          seenImgs.add(fn);
          if (src) seenImgs.add(src.toLowerCase());
        }
      });

      // 3. Ensure all links have target="_blank" and rel="noopener noreferrer"
      $content('a').each((_, el) => {
        let href = $content(el).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          href = `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
          $content(el).attr('href', href);
        }
        $content(el).attr('target', '_blank');
        $content(el).attr('rel', 'noopener noreferrer');
      });

      contentHtml = $content.html() || '';
      contentHtml = contentHtml.replace(/href="\//g, `href="${baseUrl}/`);
      contentHtml = contentHtml.replace(/src="\//g, `src="${baseUrl}/`);
    }
    
    res.json({ title, contentHtml, imageUrl, images });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch detail content' });
  }
});

// --- CAMPUS MODULES API ENDPOINTS ---

const DEFAULT_PHONEBOOK: any[] = [
  { id: 'pb-1', name: 'Rektörlük Santral', title: 'Santral', role: 'Genel İletişim', department: 'Rektörlük', phone: '0348 814 26 66', extension: '1000', email: 'rimer@kilis.edu.tr' },
  { id: 'pb-2', name: 'Öğrenci İşleri Daire Başkanlığı', title: 'Daire Başkanlığı', role: 'Öğrenci Hizmetleri', department: 'Öğrenci İşleri', phone: '0348 814 26 66', extension: '6461', email: 'ogrenciisleri@kilis.edu.tr' },
  { id: 'pb-3', name: 'Sağlık Kültür ve Spor Daire Bşk (SKS)', title: 'Daire Başkanlığı', role: 'Yemekhane & Kulüpler & Spor', department: 'SKS Daire Bşk.', phone: '0348 814 26 66', extension: '5050', email: 'sks@kilis.edu.tr' },
  { id: 'pb-4', name: 'Merkez Kütüphane Danışma', title: 'Kütüphane Şube Md.', role: 'Kitap & Veritabanı Danışma', department: 'Kütüphane Daire Bşk.', phone: '0348 814 26 66', extension: '4160', email: 'kutuphane@kilis.edu.tr' },
  { id: 'pb-5', name: 'Bilgi İşlem Daire Başkanlığı', title: 'Teknik Destek', role: 'Eduroam Wi-Fi & E-Posta Destek', department: 'Bilgi İşlem', phone: '0348 814 26 66', extension: '1313', email: 'bilgiislem@kilis.edu.tr' },
  { id: 'pb-6', name: 'Kampüs Güvenlik Amirliği', title: 'Güvenlik', role: 'Kampüs Güvenlik & Nizamiye', department: 'İdari ve Mali İşler', phone: '0348 814 26 66', extension: '1111', email: 'guvenlik@kilis.edu.tr' },
  { id: 'pb-7', name: 'K7AÜ Uygulama Oteli (Konukevi)', title: 'Resepsiyon', role: 'Oda Rezervasyon & Konaklama', department: 'Sosyal Tesisler', phone: '0348 814 26 66', extension: '7000', email: 'kiyuotel@kilis.edu.tr' },
  { id: 'pb-8', name: 'Mediko-Sosyal Sağlık Merkezi', title: 'Sağlık Merkezi', role: 'Öğrenci & Personel Sağlık', department: 'SKS Sağlık Şb.', phone: '0348 814 26 66', extension: '5064', email: 'mediko@kilis.edu.tr' },
  { id: 'pb-9', name: 'Erasmus & Dış İlişkiler Ofisi', title: 'Koordinatörlük', role: 'Öğrenci Değişim Programları', department: 'Uluslararası İlişkiler', phone: '0348 814 26 66', extension: '1450', email: 'erasmus@kilis.edu.tr' },
  { id: 'pb-10', name: 'Kariyer Planlama Uygulama Merkezi', title: 'KARMER', role: 'Staj ve Kariyer Danışmanlığı', department: 'Kariyer Merkezi', phone: '0348 814 26 66', extension: '1520', email: 'karmer@kilis.edu.tr' }
];

app.get('/api/phonebook', async (req, res) => {
  try {
    const query = ((req.query.q || req.query.search || '') as string).trim();
    if (!query) {
      return res.json(DEFAULT_PHONEBOOK);
    }

    const response = await axiosInstance.get(`https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi?search=${encodeURIComponent(query)}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/html'
      }
    });

    const $ = cheerio.load(response.data);
    const results: any[] = [];

    // Parse phonebook items from HTML
    $('table tr, .phone-book-row, div[class*="phone-item"]').each((idx, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (!text || text.length < 5) return;

      // Check if it looks like a person row
      if (text.includes('Dahili') || text.includes('Telefon') || text.includes('Ünvan') || text.includes('E-posta')) {
        let name = $(el).find('strong, h4, h5, .name, [class*="title"]').first().text().trim();
        if (!name) {
          const parts = text.split(/(Ünvan:|Görev:|Telefon:|Dahili:|E-posta:)/);
          name = parts[0]?.trim() || `Personel ${idx + 1}`;
        }

        const unvanMatch = text.match(/Ünvan:\s*([^G|T|D|E]+?)(?=Görev|Telefon|Dahili|E-posta|$)/i);
        const gorevMatch = text.match(/Görev:\s*([^T|D|E]+?)(?=Telefon|Dahili|E-posta|$)/i);
        const telefonMatch = text.match(/Telefon:\s*([+0-9\s]{8,20})/i);
        const dahiliMatch = text.match(/Dahili:\s*([0-9]{3,6})/i);
        const epostaMatch = text.match(/E-posta:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/i);

        results.push({
          id: `pb-search-${idx}`,
          name: name.replace(/\s+/g, ' ').trim(),
          title: unvanMatch ? unvanMatch[1].trim() : 'Personel / Akademisyen',
          role: gorevMatch ? gorevMatch[1].trim() : '',
          department: 'Kilis 7 Aralık Üniversitesi',
          phone: telefonMatch ? telefonMatch[1].trim() : '0348 814 26 66',
          extension: dahiliMatch ? dahiliMatch[1].trim() : '',
          email: epostaMatch ? epostaMatch[1].trim() : ''
        });
      }
    });

    if (results.length > 0) {
      return res.json(results);
    }

    // Filter default directory if search didn't return web rows
    const qLower = query.toLowerCase();
    const filteredDefaults = DEFAULT_PHONEBOOK.filter(p => 
      p.name.toLowerCase().includes(qLower) || 
      p.role.toLowerCase().includes(qLower) || 
      p.department.toLowerCase().includes(qLower) ||
      p.extension.includes(qLower)
    );

    res.json(filteredDefaults.length > 0 ? filteredDefaults : results);
  } catch (error) {
    console.error('Phonebook fetch error:', error);
    const query = ((req.query.q || req.query.search || '') as string).toLowerCase();
    const filtered = DEFAULT_PHONEBOOK.filter(p => p.name.toLowerCase().includes(query) || p.department.toLowerCase().includes(query));
    res.json(filtered.length > 0 ? filtered : DEFAULT_PHONEBOOK);
  }
});

// --- YENİ TELEFON REHBERİ SİSTEMİ (https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi) ---
let memoryPhoneDirectory: DirectoryUnit[] = [...PHONE_DIRECTORY_DATA];

app.get('/api/phone-directory', (req, res) => {
  try {
    const q = ((req.query.q || req.query.search || '') as string).toLowerCase().trim();
    const category = ((req.query.category || '') as string).toLowerCase().trim();
    const unitId = ((req.query.unitId || req.query.department_id || '') as string).trim();
    const subDeptId = ((req.query.subDeptId || req.query.sub_department_id || '') as string).trim();

    let list = memoryPhoneDirectory;

    if (category && category !== 'all' && category !== 'tümü') {
      list = list.filter(u => u.category.toLowerCase() === category);
    }

    if (unitId) {
      list = list.filter(u => u.id === unitId);
    }

    if (subDeptId && unitId) {
      list = list.map(u => ({
        ...u,
        sections: u.sections.filter(s => s.subDepartmentId === subDeptId || s.id === subDeptId)
      }));
    }

    if (q) {
      list = list.map(unit => {
        const matchesUnitName = unit.name.toLowerCase().includes(q);
        const filteredSections = unit.sections.map(sec => {
          const matchesSecHeader = sec.fullHeader.toLowerCase().includes(q) || sec.title.toLowerCase().includes(q);
          const filteredContacts = sec.contacts.filter(c => {
            return (
              c.name.toLowerCase().includes(q) ||
              (c.title && c.title.toLowerCase().includes(q)) ||
              (c.role && c.role.toLowerCase().includes(q)) ||
              (c.extension && c.extension.includes(q)) ||
              (c.email && c.email.toLowerCase().includes(q)) ||
              (c.phone && c.phone.includes(q))
            );
          });

          if (matchesSecHeader) return sec;
          if (filteredContacts.length > 0) return { ...sec, contacts: filteredContacts };
          return null;
        }).filter(Boolean) as typeof unit.sections;

        if (matchesUnitName) return unit;
        if (filteredSections.length > 0) return { ...unit, sections: filteredSections };
        return null;
      }).filter(Boolean) as DirectoryUnit[];
    }

    const totalContacts = list.reduce((acc, u) => acc + u.sections.reduce((sAcc, s) => sAcc + s.contacts.length, 0), 0);

    res.json({
      success: true,
      totalUnits: list.length,
      totalContacts,
      data: list
    });
  } catch (err: any) {
    console.error('Phone directory error:', err);
    res.status(500).json({ success: false, error: err.message, data: PHONE_DIRECTORY_DATA });
  }
});

app.get('/api/phone-directory/sync', async (req, res) => {
  try {
    const unitId = ((req.query.unitId || req.query.department_id || '') as string).trim();
    if (!unitId) {
      return res.json({ success: true, message: 'Veriler güncel', data: memoryPhoneDirectory });
    }

    const targetUrl = `https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi?department_id=${encodeURIComponent(unitId)}`;
    const response = await axiosInstance.get(targetUrl, { timeout: 9000 });
    const $ = cheerio.load(response.data);

    const subs: any[] = [];
    $('#phone-book-sub-department-select option').each((j, opt) => {
      const sVal = $(opt).attr('value');
      const sName = cleanDuplicateTitle($(opt).text());
      if (sVal && sName && !sName.includes('-- Bölüm Seçiniz --')) {
        let shortDeptName = sName;
        if (sName.includes(' - ')) {
          shortDeptName = sName.split(' - ').slice(1).join(' - ').trim();
        }
        subs.push({ id: sVal, fullName: sName, name: shortDeptName });
      }
    });

    const sections: any[] = [];
    $('.phone-book-container').each((cIdx, cEl) => {
      const headerText = cleanDuplicateTitle($(cEl).find('.phone-book-header span:not(.phone-book-header-toggle)').text());
      const contacts: any[] = [];
      $(cEl).find('.phone-book-row').each((rIdx, rEl) => {
        const name = cleanDuplicateTitle($(rEl).find('.phone-book-name-inner').text()) || cleanDuplicateTitle($(rEl).find('.phone-book-name').text());
        if (!name) return;

        const link = $(rEl).find('.phone-book-link-text').attr('href') || '';
        const unvan = cleanDuplicateTitle($(rEl).find('[data-type=unvan] .phone-book-info-value').text());
        const gorev = cleanDuplicateTitle($(rEl).find('[data-type=gorev] .phone-book-info-value').text());
        const telefon = cleanDuplicateTitle($(rEl).find('[data-type=telefon] .phone-book-info-value').text()) || '0 (348) 814 26 66';
        const email = cleanDuplicateTitle($(rEl).find('[data-type=email] .phone-book-info-value a').text()) || cleanDuplicateTitle($(rEl).find('[data-type=email] .phone-book-info-value').text());
        const dahili = cleanDuplicateTitle($(rEl).find('[data-type=dahili] .phone-book-info-value').text());

        contacts.push({
          id: `${unitId}-${cIdx}-${rIdx}`,
          name,
          title: unvan,
          role: gorev,
          phone: telefon,
          extension: dahili,
          email,
          profileUrl: link || undefined
        });
      });

      if (contacts.length > 0) {
        let sectionTitle = headerText;
        if (headerText.includes(' - ')) {
          sectionTitle = headerText.split(' - ').slice(1).join(' - ').trim();
        }
        sections.push({
          id: `sec-${unitId}-${cIdx}`,
          fullHeader: headerText,
          title: sectionTitle,
          contacts
        });
      }
    });

    // Update in memory directory
    const existingIdx = memoryPhoneDirectory.findIndex(u => u.id === unitId);
    if (existingIdx >= 0 && sections.length > 0) {
      memoryPhoneDirectory[existingIdx].subDepartments = subs.length > 0 ? subs : memoryPhoneDirectory[existingIdx].subDepartments;
      memoryPhoneDirectory[existingIdx].sections = sections;
      return res.json({ success: true, count: sections.reduce((acc, s) => acc + s.contacts.length, 0), unit: memoryPhoneDirectory[existingIdx] });
    }

    res.json({ success: true, message: 'Birim kadrosu senkronize edildi.' });
  } catch (err: any) {
    console.warn('Phone directory sync error:', err.message);
    res.json({ success: false, error: err.message });
  }
});

// --- AKADEMİK & İDARİ PERSONEL VERİ YÖNETİMİ & CANLI SENKRONİZASYON ---
let syncedStaffData: any[] = [...ACADEMIC_STAFF_DATA];
const facultyStaffSyncTimeMap: Record<string, number> = {};
let globalStaffLastSync = Date.now();

// Helper to scrape a single faculty live
async function scrapeFacultyStaffLive(facultyOption: typeof STAFF_FACULTIES_LIST[0]): Promise<any[]> {
  if (!facultyOption.sourceUrl || !facultyOption.sourceUrl.startsWith('http')) return [];
  try {
    const res = await axiosInstance.get(facultyOption.sourceUrl, { timeout: 8500 });
    const $ = cheerio.load(res.data);
    const parsedStaff: any[] = [];
    const base = facultyOption.sourceUrl.split('/tr')[0];

    $('.staff-card').each((idx, el) => {
      const nameEl = $(el).find('.staff-card-name');
      const fullName = nameEl.text().trim();
      if (!fullName || fullName.length < 3) return;

      const email = $(el).find('.staff-card-email').text().trim();
      const role = $(el).find('.staff-card-title').text().trim();
      let img = $(el).find('.staff-card-img img').attr('src') || '';
      if (img && !img.startsWith('http')) {
        img = `${base}${img.startsWith('/') ? '' : '/'}${img}`;
      }

      let dept = $(el).closest('.accordion-item').find('.accordion-item-header, .accordion-header').first().text().replace(/[+\-\s]+/g, ' ').trim();
      if (!dept) dept = 'Dekanlık / Bölüm';

      let yokUrl = $(el).find('.staff-card-social a[href*="yok.gov.tr"]').attr('href');
      let scholarUrl = $(el).find('.staff-card-social a[href*="scholar.google"]').attr('href');
      let orcidUrl = $(el).find('.staff-card-social a[href*="orcid.org"]').attr('href');
      let publonsUrl = $(el).find('.staff-card-social a[href*="webofscience"], .staff-card-social a[href*="publons"]').attr('href');

      const titleMatch = fullName.match(/^(Prof\.\s*Dr\.|Doç\.\s*Dr\.|Doc\.\s*Dr\.|Dr\.\s*Öğr\.\s*Üyesi|Dr\.\s*Ogr\.\s*Uyesi|Öğr\.\s*Gör\.\s*Dr\.|Ogr\.\s*Gor\.\s*Dr\.|Öğr\.\s*Gör\.|Ogr\.\s*Gor\.|Arş\.\s*Gör\.\s*Dr\.|Ars\.\s*Gor\.\s*Dr\.|Arş\.\s*Gör\.|Ars\.\s*Gor\.|Uzm\.|Dr\.)/i);
      const title = titleMatch ? titleMatch[1] : '';
      const name = title ? fullName.replace(title, '').trim() : fullName;

      // Preserve existing research URLs if live card does not include them
      const existing = syncedStaffData.find(s => 
        (email && s.email && s.email.toLowerCase() === email.toLowerCase()) ||
        (s.name && name && s.name.trim().toLowerCase() === name.trim().toLowerCase())
      );
      if (existing) {
        if (!yokUrl && existing.yokUrl) yokUrl = existing.yokUrl;
        if (!scholarUrl && existing.scholarUrl) scholarUrl = existing.scholarUrl;
        if (!orcidUrl && existing.orcidUrl) orcidUrl = existing.orcidUrl;
        if (!publonsUrl && existing.publonsUrl) publonsUrl = existing.publonsUrl;
        if (!img && existing.image) img = existing.image;
      }

      parsedStaff.push({
        id: `staff-${facultyOption.id}-${idx}`,
        fullName,
        title: title || 'Öğretim Elemanı',
        name,
        role: role || 'Öğretim Üyesi',
        facultyId: facultyOption.id,
        facultyName: facultyOption.name,
        facultyShortName: facultyOption.shortName,
        department: dept,
        email,
        image: img || undefined,
        sourceUrl: facultyOption.sourceUrl,
        yokUrl,
        scholarUrl,
        orcidUrl,
        publonsUrl,
        unitCategory: facultyOption.category
      });
    });

    return parsedStaff;
  } catch (err: any) {
    console.warn(`Staff live scrape notice for ${facultyOption.name}:`, err.message);
    return [];
  }
}

// Background Sync Schedule: Staggered, gentle background sync every 4 hours for stale faculties
let backgroundSyncIndex = 0;
const syncableFaculties = STAFF_FACULTIES_LIST.filter(f => f.id !== 'all' && f.sourceUrl);

setInterval(async () => {
  if (syncableFaculties.length === 0) return;
  const fac = syncableFaculties[backgroundSyncIndex % syncableFaculties.length];
  backgroundSyncIndex++;

  const lastTime = facultyStaffSyncTimeMap[fac.id] || 0;
  // If not synced in last 7 days
  if (Date.now() - lastTime > 7 * 24 * 60 * 60 * 1000) {
    try {
      const fresh = await scrapeFacultyStaffLive(fac);
      if (fresh.length > 0) {
        syncedStaffData = syncedStaffData.filter(s => s.facultyId.toLowerCase() !== fac.id.toLowerCase()).concat(fresh);
        facultyStaffSyncTimeMap[fac.id] = Date.now();
        globalStaffLastSync = Date.now();
      }
    } catch {}
  }
}, 4 * 60 * 60 * 1000);

// On-demand staff sync endpoint
app.all(['/api/staff/sync'], async (req, res) => {
  try {
    const facultyId = ((req.query.faculty || req.body?.faculty || 'all') as string).toLowerCase().trim();
    
    // Find target faculty
    const targetFac = STAFF_FACULTIES_LIST.find(f => f.id.toLowerCase() === facultyId && f.id !== 'all');
    
    if (targetFac && targetFac.sourceUrl) {
      const freshStaff = await scrapeFacultyStaffLive(targetFac);
      if (freshStaff.length > 0) {
        // Replace this faculty's staff in syncedStaffData
        syncedStaffData = syncedStaffData.filter(s => s.facultyId.toLowerCase() !== targetFac.id.toLowerCase()).concat(freshStaff);
        facultyStaffSyncTimeMap[targetFac.id] = Date.now();
        globalStaffLastSync = Date.now();

        return res.json({
          success: true,
          facultyId: targetFac.id,
          facultyName: targetFac.name,
          count: freshStaff.length,
          lastSyncTime: facultyStaffSyncTimeMap[targetFac.id],
          data: freshStaff
        });
      }
    }

    // If 'all' or fallback, actively scrape key faculties live in parallel so title promotions are updated
    if (facultyId === 'all') {
      const primaryFaculties = syncableFaculties.slice(0, 8);
      await Promise.allSettled(primaryFaculties.map(async fac => {
        try {
          const fresh = await scrapeFacultyStaffLive(fac);
          if (fresh.length > 0) {
            syncedStaffData = syncedStaffData.filter(s => s.facultyId.toLowerCase() !== fac.id.toLowerCase()).concat(fresh);
            facultyStaffSyncTimeMap[fac.id] = Date.now();
          }
        } catch {}
      }));
      globalStaffLastSync = Date.now();
    }

    res.json({
      success: true,
      facultyId: 'all',
      count: syncedStaffData.length,
      lastSyncTime: globalStaffLastSync,
      data: syncedStaffData
    });
  } catch (error: any) {
    console.error('Staff sync error:', error);
    res.status(500).json({ success: false, error: error.message || 'Senkronizasyon hatası' });
  }
});

// Primary staff query endpoint
app.get('/api/staff', (req, res) => {
  try {
    const faculty = ((req.query.faculty || 'all') as string).toLowerCase().trim();
    const department = ((req.query.department || 'all') as string).toLowerCase().trim();
    const category = ((req.query.category || 'all') as string).toLowerCase().trim();
    const q = ((req.query.q || req.query.search || '') as string).toLowerCase().trim();

    let list = syncedStaffData;

    if (category && category !== 'all' && category !== 'tümü') {
      list = list.filter(s => s.unitCategory && s.unitCategory.toLowerCase() === category);
    }

    if (faculty && faculty !== 'all' && faculty !== 'tümü') {
      list = list.filter(s => s.facultyId.toLowerCase() === faculty);
    }

    if (department && department !== 'all' && department !== 'tümü') {
      list = list.filter(s => s.department.toLowerCase().includes(department));
    }

    if (q) {
      list = list.filter(s => 
        s.fullName.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.facultyName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    res.json(list);
  } catch (error) {
    console.error('Staff API error:', error);
    res.json(ACADEMIC_STAFF_DATA);
  }
});

let cachedEvents: any[] = [];
let cachedEventsTime = 0;

app.get('/api/events', async (req, res) => {
  try {
    if (req.query.force !== 'true' && Date.now() - cachedEventsTime < CACHE_TTL && cachedEvents.length > 0) {
      return res.json(cachedEvents);
    }

    const response = await axiosInstance.get('https://www.kilis.edu.tr/tr/etkinlikler', {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const eventsMap = new Map<string, any>();
    const seenImages = new Set<string>();

    if (typeof response.data === 'string') {
      const $ = cheerio.load(response.data);

      $('a[href*="/etkinlik/"], a.full-link-item').each((_, el) => {
        let href = $(el).attr('href') || '';
        if (!href || href.includes('page=') || href === '/tr/etkinlikler' || href === 'https://www.kilis.edu.tr/tr/etkinlikler') return;
        if (!href.startsWith('http')) {
          href = `https://www.kilis.edu.tr${href.startsWith('/') ? '' : '/'}${href}`;
        }

        let titleEl = $(el).find('.title-wrapper .text, .title, h3, h4').first();
        let rawTitle = titleEl.length ? titleEl.text() : $(el).text();
        let title = cleanDuplicateTitle(rawTitle);

        let img = $(el).find('img').attr('src') || '';
        if (img && !img.startsWith('http')) {
          img = `https://www.kilis.edu.tr${img.startsWith('/') ? '' : '/'}${img}`;
        }

        let rawDate = $(el).find('.link-footer .date .text, .date, time').first().text().trim();
        const dateMatch = rawDate.match(/(\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4})/i) || rawDate.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{4})/);
        let cleanDate = dateMatch ? dateMatch[1] : '';

        // Extract summary / content text from event card
        let summaryEl = $(el).find('.summary, .desc, .description, .content, .sub-title, p, .text-wrapper').not('.title-wrapper').first();
        let content = summaryEl.text().replace(/\s+/g, ' ').trim();
        if (!content || content === title) {
          content = $(el).find('p').first().text().replace(/\s+/g, ' ').trim();
        }

        // Extract location if present
        let locationEl = $(el).find('.location, .place, .location-text, .konum, .venue').first();
        let location = locationEl.text().replace(/\s+/g, ' ').trim();

        if (!title || title.length < 5 || title.toLowerCase().includes('tüm etkinlikler')) return;

        const hrefKey = href.toLowerCase();
        if (eventsMap.has(hrefKey)) {
          const existing = eventsMap.get(hrefKey);
          if (title.length > existing.title.length && !title.includes('...')) {
            existing.title = title;
          }
          if (!existing.img && img) existing.img = img;
          if (!existing.date && cleanDate) existing.date = cleanDate;
          if (!existing.content && content) {
            existing.content = content;
            existing.description = content;
          }
          if ((!existing.location || existing.location.includes('referans')) && location) {
            existing.location = location;
          }
        } else {
          const imgKey = img ? img.toLowerCase() : '';
          if (imgKey && seenImages.has(imgKey)) return;
          if (imgKey) seenImages.add(imgKey);

          eventsMap.set(hrefKey, {
            id: `event-${eventsMap.size + 1}`,
            title,
            date: cleanDate || '02 Ekim 2026',
            location: location || 'Konum için bilgi afişini referans alın.',
            content: content || title,
            description: content || title,
            url: href,
            img,
            category: 'Etkinlik'
          });
        }
      });
    }

    const events = Array.from(eventsMap.values());

    if (events.length > 0) {
      cachedEvents = events;
      cachedEventsTime = Date.now();
      return res.json(events);
    }

    // Fallback events with detailed descriptions
    const fallbackEvents = [
      {
        id: 'ev-1',
        title: "Gazze'de Öğrenci Olmak: Resim Sergisi",
        date: '02 Ekim 2026',
        location: 'Muallim Rıfat Eğitim Fakültesi Fuaye Alanı',
        category: 'Sergi',
        content: "Filistin'de yaşanan insani dramı ve Filistinli öğrencilerin zorlu eğitim mücadelesini konu alan resim ve fotoğraf sergisi, Üniversitemiz Muallim Rıfat Eğitim Fakültesi Fuaye Alanında tüm akademisyen, öğrenci ve Kilis halkının ziyaretine açılmıştır.",
        description: "Filistin'de yaşanan insani dramı ve Filistinli öğrencilerin eğitim mücadelesini konu alan sergi.",
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      },
      {
        id: 'ev-2',
        title: '1. Kilis Kitap Fuarı ve Yazar Söyleşileri',
        date: '29 Eylül 2026',
        location: '15 Temmuz Kongre ve Kültür Merkezi',
        category: 'Fuar & Söyleşi',
        content: "Kilis 7 Aralık Üniversitesi ve Kilis Belediyesi iş birliğiyle düzenlenen 1. Kilis Kitap Fuarı kapsamında seçkin yayınevleri, Türkiye'nin önde gelen yazarları, şairleri ve akademisyenleri imza günleri ve söyleşilerle okurlarla buluşuyor.",
        description: "Yüzlerce yayınevi, akademisyen yazarların katılımıyla düzenlenen imza günleri ve panel söyleşileri.",
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      },
      {
        id: 'ev-3',
        title: 'Bilim İletişimi Buluşmaları: Kitap Kahramanları Aramızda',
        date: '25 Eylül 2026',
        location: 'Rektörlük Konferans Salonu',
        category: 'Sempozyum',
        content: "TÜBİTAK destekli Bilim İletişimi Buluşmaları serisinin ikincisi olan 'Kitap Kahramanları Aramızda' etkinliğinde edebiyat ve bilim dünyasından öne çıkan eserler, disiplinlerarası sunumlar ve atölye çalışmaları ile ele alınacaktır.",
        description: "TÜBİTAK destekli bilim iletişimi etkinlikleri, disiplinlerarası sunumlar ve interaktif öğrenci atölyeleri.",
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      },
      {
        id: 'ev-4',
        title: 'Modernleşmenin Kavşağında Türkiye Konferansı',
        date: '20 Eylül 2026',
        location: 'İnsan ve Toplum Bilimleri Fakültesi Amfi 1',
        category: 'Konferans',
        content: "İnsan ve Toplum Bilimleri Fakültesi Tarih Bölümü tarafından organize edilen konferansta, Türkiye'nin modernleşme süreci, sosyo-kültürel değişimler ve iktisadi dönüşümler uzman akademisyenlerin bildirileriyle değerlendirilecektir.",
        description: "Tarih ve sosyoloji perspektifinden Türkiye'nin modernleşme süreci ve toplumsal dönüşümü.",
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      }
    ];

    res.json(fallbackEvents);
  } catch (error) {
    console.error('Events fetch error:', error);
    res.json([
      {
        id: 'ev-1',
        title: "Gazze'de Öğrenci Olmak: Resim Sergisi",
        date: '02 Ekim 2026',
        location: 'Muallim Rıfat Eğitim Fakültesi Fuaye Alanı',
        category: 'Sergi',
        content: "Filistin'de yaşanan insani dramı ve Filistinli öğrencilerin eğitim mücadelesini konu alan sergi.",
        description: "Filistin'de yaşanan insani dramı ve Filistinli öğrencilerin eğitim mücadelesini konu alan sergi.",
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      },
      {
        id: 'ev-2',
        title: '1. Kilis Kitap Fuarı ve Yazar Söyleşileri',
        date: '29 Eylül 2026',
        location: '15 Temmuz Kongre ve Kültür Merkezi',
        category: 'Fuar & Söyleşi',
        content: "Yüzlerce yayınevi ve akademisyen yazarların katılımıyla düzenlenen imza günleri ve panel söyleşileri.",
        description: "Yüzlerce yayınevi ve akademisyen yazarların katılımıyla düzenlenen imza günleri ve panel söyleşileri.",
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      }
    ]);
  }
});

// --- AUTHENTIC VERIFIED FORMS & MULTI-FACULTY SCRAPING ---
const DEFAULT_AUTHENTIC_FORMS = AUTHENTIC_FORMS_DATA;
let cachedForms: any[] = [];
let cachedFormsTime = 0;

app.get('/api/forms', (req, res) => {
  try {
    const facultyQuery = ((req.query.faculty || 'all') as string).toLowerCase().trim();
    const categoryQuery = ((req.query.category || 'all') as string).toLowerCase().trim();
    const searchQuery = ((req.query.q || req.query.search || '') as string).toLowerCase().trim();

    let activeForms = AUTHENTIC_FORMS_DATA;

    // Filter by faculty
    if (facultyQuery && facultyQuery !== 'all' && facultyQuery !== 'tümü') {
      activeForms = activeForms.filter(f => f.faculty && f.faculty.toLowerCase() === facultyQuery);
    }

    // Filter by category
    if (categoryQuery && categoryQuery !== 'all' && categoryQuery !== 'tümü') {
      activeForms = activeForms.filter(f => f.category && f.category.toLowerCase().includes(categoryQuery));
    }

    // Filter by search query
    if (searchQuery) {
      activeForms = activeForms.filter(f => 
        f.title.toLowerCase().includes(searchQuery) ||
        (f.description || '').toLowerCase().includes(searchQuery) ||
        (f.sourceName || '').toLowerCase().includes(searchQuery) ||
        (f.category || '').toLowerCase().includes(searchQuery) ||
        (f.fileType || '').toLowerCase().includes(searchQuery)
      );
    }

    res.json(activeForms);
  } catch (error) {
    console.error('Forms API error, returning verified default forms:', error);
    res.json(AUTHENTIC_FORMS_DATA);
  }
});

app.get('/api/transport', (req, res) => {
  res.json({
    cityRoutes: [
      {
        id: 'tr-1',
        name: '1 Nolu Hat: Cumhuriyet Meydanı ⇄ Merkez Kampüs',
        badge: 'En Sık Hat',
        hours: '07:00 – 23:00',
        frequency: 'Her 5–7 dakikada bir',
        route: ['Cumhuriyet Meydanı', 'Eski Valilik', 'Vali Güner Özmen Cad.', 'KYK Yurtları', 'Merkez Kampüs Ana Nizamiye'],
        notes: 'Öğrenci kimliği veya Kilis KentKart ile indirimli biniş geçerlidir.'
      },
      {
        id: 'tr-2',
        name: '2 Nolu Hat: Otogar ⇄ Karataş Kampüsü',
        badge: 'Sağlık & MYO',
        hours: '07:15 – 22:30',
        frequency: 'Her 10–12 dakikada bir',
        route: ['Şehirlerarası Otogar', 'Çevre Yolu', 'Beşevler', 'Sağlık Bilimleri Fakültesi', 'Karataş Kampüsü'],
        notes: 'Sağlık Hizmetleri MYO ve Sosyal Bilimler MYO öğrencileri için doğrudan servis.'
      },
      {
        id: 'tr-3',
        name: '3 Nolu Hat: Devlet Hastanesi ⇄ Kampüs',
        badge: 'Hastane Bağlantısı',
        hours: '07:30 – 21:00',
        frequency: 'Her 15 dakikada bir',
        route: ['Kilis Prof. Dr. Alaeddin Yavaşca Devlet Hastanesi', 'Sanayi', 'Cumhuriyet Meydanı', 'Merkez Kampüs'],
        notes: 'Stajyer ve tıp/sağlık öğrencileri için en hızlı bağlantı.'
      }
    ],
    intercityRoutes: [
      {
        id: 'ic-1',
        title: 'Gaziantep ⇄ Kilis Minibüs Seferleri',
        distance: '~55–65 km (Ortalama 45–50 dk)',
        departure: 'Gaziantep Şehirlerarası Otobüs Terminali (Kilis Peronu)',
        frequency: '06:00 – 22:00 saatleri arasında her 15–20 dakikada bir',
        arrival: 'Kilis Otogarı ve Cumhuriyet Meydanı yolcuları için ara duraklar'
      },
      {
        id: 'ic-2',
        title: 'Gaziantep Havalimanı (GZT) Ulaşımı',
        distance: '~45–50 km',
        options: 'Havalimanından Gaziantep Otogara HAVAŞ veya belediye otobüsü, ardından Kilis minibüsleri. Kampüse toplam yolculuk ~1 saat 15 dk.'
      }
    ],
    taxis: [
      { name: 'Üniversite Kampüs Taksi', phone: '0348 814 26 00', location: 'Merkez Kampüs Girişi' },
      { name: 'Cumhuriyet Meydan Taksi', phone: '0348 813 15 50', location: 'Kilis Meydan' },
      { name: 'Kilis Otogar Taksi', phone: '0348 813 88 99', location: 'Şehirlerarası Otogar' }
    ]
  });
});

app.get('/api/library', (req, res) => {
  res.json({
    name: 'Kilis 7 Aralık Üniversitesi Merkez Kütüphanesi',
    status: 'Açık',
    hours: {
      weekday: '08:00 – 22:00',
      weekend: '09:00 – 18:00',
      exams: '7/24 Kesintisiz Açık (Vize ve Final Dönemlerinde Gece İkramları İle)'
    },
    borrowingRules: [
      { user: 'Ön Lisans & Lisans Öğrencileri', bookCount: '3 Kitap', duration: '15 Gün', renewCount: '1 Kez Uzatma' },
      { user: 'Yüksek Lisans & Doktora', bookCount: '5 Kitap', duration: '30 Gün', renewCount: '2 Kez Uzatma' },
      { user: 'Akademik Personel', bookCount: '10 Kitap', duration: '60 Gün', renewCount: '2 Kez Uzatma' },
      { user: 'İdari Personel', bookCount: '3 Kitap', duration: '15 Gün', renewCount: '1 Kez Uzatma' }
    ],
    catalogUrl: 'https://yordam.kilis.edu.tr/',
    vetisUrl: 'https://yordam.kilis.edu.tr/vetisbt/',
    databases: [
      'TÜBİTAK ULAKBİM EKUAL',
      'IEEE Xplore Digital Library',
      'ScienceDirect / Elsevier',
      'Web of Science Core Collection',
      'EBSCOhost Academic Search Ultimate',
      'SpringerLink Journals'
    ],
    phone: '0348 814 26 66 (Dahili: 4160)'
  });
});

app.get('/api/sports', (req, res) => {
  res.json({
    facilities: [
      {
        id: 'sp-1',
        name: 'Sentetik Çim Halı Saha',
        specs: 'Standart ölçülerde, gece aydınlatmalı, tribünlü',
        hours: '10:00 – 23:00 (Haftanın 7 günü)',
        bookingUrl: 'https://rezervasyon.kilis.edu.tr/SporRezervasyon/Rezervasyon',
        info: 'Öğrenci ve personele uygun seans ücreti ile randevulu hizmet verir.'
      },
      {
        id: 'sp-2',
        name: 'Kapalı Spor Salonu',
        specs: 'FİBA standartlarında parke zemin, 1.000 seyirci kapasitesi',
        hours: '08:30 – 21:00',
        branches: ['Basketbol', 'Voleybol', 'Futsal', 'Hentbol', 'Badminton'],
        info: 'Öğrenci toplulukları ve fakülte turnuvaları için tahsis edilebilir.'
      },
      {
        id: 'sp-3',
        name: 'Fitness & Ağırlık Merkezi',
        specs: 'Profesyonel kardiyo ve ağırlık istasyonları, soyunma odaları',
        hours: 'Hafta içi: 09:00 – 20:00 (Kadın/Erkek seans saatleri mevcuttur)',
        info: 'Dönemlik veya aylık öğrenci aboneliği SKS üzerinden yapılır.'
      }
    ],
    reservationSteps: [
      '1. rezervasyon.kilis.edu.tr adresine gidin.',
      '2. Spor Alanı seçeneğinden Sentetik Halı Saha veya Salonu belirleyin.',
      '3. Uygun seans saatini ve müşteri grubunuzu (Öğrenci/Personel) seçin.',
      '4. İletişim bilgilerinizi girip SMS/E-posta onayını tamamlayın.'
    ],
    contactPhone: '0348 814 26 66 (Dahili: 5053)'
  });
});

app.get('/api/hotel', (req, res) => {
  res.json({
    name: 'K7AÜ Uygulama Oteli (Sosyal Tesisler)',
    location: 'Merkez Kampüs Girişi, Kilis',
    phone: '0348 814 26 66',
    extension: '7000',
    website: 'https://kiyuotel.kilis.edu.tr',
    roomTypes: [
      { type: 'Standart Tek Kişilik Oda', features: 'Ortopedik yatak, 24 saat sıcak su, TV, Wi-Fi, klima, minibar, çalışma masası' },
      { type: 'Standart Çift Kişilik Oda (Twin/Double)', features: '2 ayrı tek kişilik veya 1 çift kişilik yatak, lüks banyo, gardırop' },
      { type: 'Süit Oda', features: 'Oturma grubu, geniş ferah salon, manzaralı balkon, özel çalışma köşesi' }
    ],
    services: [
      { name: 'Kahvaltı Servisi', hours: '07:30 – 10:00 (Açık büfe & zengin yöresel lezzetler)' },
      { name: 'Restoran & Kafeterya', hours: '12:00 – 21:30 (Öğle ve akşam alakart menü)' },
      { name: 'Toplantı ve Seminer Salonu', hours: 'Özel akademik ve kurumsal toplantılar için ses sistemli salon' }
    ],
    pricingNotes: 'Öğrenci velilerine ve kamu personeline indirimli tarife uygulanmaktadır.'
  });
});

app.get('/api/it-help', (req, res) => {
  res.json({
    eduroam: {
      title: 'Eduroam Wi-Fi Kurulum Kılavuzu',
      description: 'Dünya çapında binlerce üniversitede geçerli olan yüksek hızlı ücretsiz akademik internet ağı.',
      androidSteps: [
        '1. Ayarlar > Wi-Fi bölümünden "eduroam" ağını seçin.',
        '2. EAP Yöntemi: PEAP seçin.',
        '3. Aşama 2 Kimlik Doğrulaması: MSCHAPV2 seçin.',
        '4. CA Sertifikası: "Doğrulama Yapma" veya "Sistem Sertifikalarını Kullan" seçin.',
        '5. Çevrimiçi Sertifika Durumu: "Doğrulama Yapma".',
        '6. Alan Adı: "kilis.edu.tr" yazın.',
        '7. Kimlik (Kullanıcı Adı): "ogrencino@kilis.edu.tr" (Örn: 230101001@kilis.edu.tr).',
        '8. Şifre: Öğrenci e-posta / OBS parolanız.',
        '9. "Bağlan" butonuna dokunun.'
      ],
      iosSteps: [
        '1. Ayarlar > Wi-Fi menüsünden "eduroam" ağına dokunun.',
        '2. Kullanıcı Adı kısmına: "ogrencino@kilis.edu.tr" yazın.',
        '3. Parola kısmına: Öğrenci şifrenizi yazın.',
        '4. Sağ üstteki "Katıl"a basın.',
        '5. Ekrana gelen üniversite güvenlik sertifikası penceresinde sağ üstteki "Güven" butonuna dokunun.'
      ],
      windowsSteps: [
        'eduroam CAT (cat.eduroam.org) aracını indirip Kilis 7 Aralık Üniversitesi profilini kurarak otomatik bağlanabilirsiniz.'
      ]
    },
    emailPassword: {
      title: 'Öğrenci E-Posta & Parola İşlemleri',
      url: 'https://bilgiislem.kilis.edu.tr/tr/page/6470',
      steps: [
        'Üniversiteye yeni kayıt yaptıran her öğrenci için otomatik "@kilis.edu.tr" uzantılı e-posta adresi açılır.',
        'İlk parola genellikle T.C. Kimlik numaranızın ilk 6 hanesi veya OBS şifrenizle eşleşir.',
        'Parolanızı unuttuysanız bilgiislem.kilis.edu.tr üzerindeki "Parola Sıfırlama" portalından SMS doğrulaması ile yenileyebilirsiniz.'
      ]
    },
    softwareLicenses: [
      { name: 'Microsoft Office 365', info: 'Öğrenci e-postanızla Word, Excel, PowerPoint ve 1 TB OneDrive ücretsiz.' },
      { name: 'MATLAB & Simulink', info: 'Mühendislik ve fen öğrencileri için tam paket kampüs lisansı.' },
      { name: 'Autodesk Education', info: 'AutoCAD, Revit, 3ds Max öğrenci lisansları.' }
    ],
    supportPhone: '0348 814 26 66 (Dahili: 1313 - Bilgi İşlem Destek)'
  });
});

app.get('/api/campus-map', (req, res) => {
  res.json([
    {
      id: 'cmp-1',
      name: 'Rektörlük & İdari Bina',
      campus: 'Merkez Kampüs',
      type: 'Sosyal / İdari',
      description: 'Senato, Yönetim Kurulu, Genel Sekreterlik ve Daire Başkanlıkları.',
      mapsUrl: 'https://maps.google.com/?q=36.7121,37.1082',
      coordinates: { lat: 36.7121, lng: 37.1082 }
    },
    {
      id: 'cmp-2',
      name: 'Mühendislik - Mimarlık Fakültesi',
      campus: 'Merkez Kampüs',
      type: 'Fakülte',
      description: 'Bilgisayar, İnşaat, Elektrik-Elektronik, Makine mühendislikleri ve laboratuvarlar.',
      mapsUrl: 'https://maps.google.com/?q=36.7115,37.1075',
      coordinates: { lat: 36.7115, lng: 37.1075 }
    },
    {
      id: 'cmp-3',
      name: 'İlahiyat Fakültesi',
      campus: 'Merkez Kampüs',
      type: 'Fakülte',
      description: 'Derslikler, amfiler ve İlahiyat Konferans Salonu.',
      mapsUrl: 'https://maps.google.com/?q=36.7130,37.1090',
      coordinates: { lat: 36.7130, lng: 37.1090 }
    },
    {
      id: 'cmp-4',
      name: 'İktisadi ve İdari Bilimler Fakültesi (İİBF)',
      campus: 'Merkez Kampüs',
      type: 'Fakülte',
      description: 'İktisat, İşletme, Siyaset Bilimi ve Uluslararası İlişkiler.',
      mapsUrl: 'https://maps.google.com/?q=36.7125,37.1070',
      coordinates: { lat: 36.7125, lng: 37.1070 }
    },
    {
      id: 'cmp-5',
      name: 'İnsan ve Toplum Bilimleri Fakültesi',
      campus: 'Merkez Kampüs',
      type: 'Fakülte',
      description: 'Tarih, Türk Dili ve Edebiyatı, Felsefe, Coğrafya ve Sosyoloji bölümleri.',
      mapsUrl: 'https://maps.google.com/?q=36.7110,37.1085',
      coordinates: { lat: 36.7110, lng: 37.1085 }
    },
    {
      id: 'cmp-6',
      name: 'Fen Fakültesi & Ziraat Fakültesi',
      campus: 'Merkez Kampüs',
      type: 'Fakülte',
      description: 'Biyoloji, Kimya, Matematik laboratuvarları ve tarımsal araştırma birimleri.',
      mapsUrl: 'https://maps.google.com/?q=36.7105,37.1092',
      coordinates: { lat: 36.7105, lng: 37.1092 }
    },
    {
      id: 'cmp-7',
      name: 'Merkez Kütüphane & 7/24 Çalışma Salonu',
      campus: 'Merkez Kampüs',
      type: 'Sosyal / İdari',
      description: 'Zengin basılı koleksiyon, sessiz çalışma alanları ve kafeterya.',
      mapsUrl: 'https://maps.google.com/?q=36.7118,37.1084',
      coordinates: { lat: 36.7118, lng: 37.1084 }
    },
    {
      id: 'cmp-8',
      name: 'Öğrenci Yemekhanesi & Mediko Sosyal',
      campus: 'Merkez Kampüs',
      type: 'Sosyal / İdari',
      description: 'Ana tabldot yemekhane salonu, sağlık odası ve öğrenci kulüp ofisleri.',
      mapsUrl: 'https://maps.google.com/?q=36.7123,37.1078',
      coordinates: { lat: 36.7123, lng: 37.1078 }
    },
    {
      id: 'cmp-9',
      name: 'Kapalı Spor Salonu & Halı Saha',
      campus: 'Merkez Kampüs',
      type: 'Spor & Sağlık',
      description: 'Sentetik çim saha, basketbol/voleybol salonu ve fitness merkezi.',
      mapsUrl: 'https://maps.google.com/?q=36.7135,37.1065',
      coordinates: { lat: 36.7135, lng: 37.1065 }
    },
    {
      id: 'cmp-10',
      name: 'K7AÜ Uygulama Oteli (Konukevi)',
      campus: 'Merkez Kampüs',
      type: 'Sosyal / İdari',
      description: 'Merkez kampüs ana giriş nizamiye yanı, otel odaları ve restoran.',
      mapsUrl: 'https://maps.google.com/?q=36.7140,37.1095',
      coordinates: { lat: 36.7140, lng: 37.1095 }
    },
    {
      id: 'cmp-11',
      name: 'Karataş Kampüsü (Sağlık & MYO)',
      campus: 'Karataş Kampüsü',
      type: 'Fakülte',
      description: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi, Sağlık Hizmetleri MYO, Sosyal Bilimler MYO.',
      mapsUrl: 'https://maps.google.com/?q=36.7235,37.1265',
      coordinates: { lat: 36.7235, lng: 37.1265 }
    },
    {
      id: 'cmp-12',
      name: 'Mercidabık Kampüsü',
      campus: 'Mercidabık Kampüsü',
      type: 'Yüksekokul',
      description: 'Uygulamalı Bilimler Fakültesi, Turizm ve Otelcilik MYO derslikleri.',
      mapsUrl: 'https://maps.google.com/?q=36.7050,37.1190',
      coordinates: { lat: 36.7050, lng: 37.1190 }
    }
  ]);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
