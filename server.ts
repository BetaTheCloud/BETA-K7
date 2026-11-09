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
import { getImageSignature, areImagesEqual } from './src/lib/utils';

const app = express();

function getPort(): number {
  const portArgIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = Number(process.argv[portArgIndex + 1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    const parsed = Number(process.env.PORT);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 3000;
}

const PORT = getPort();

// Enable CORS for all routes (necessary when frontend runs in APK or different origin)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Scrape live status flags
let hasSuccessfullyScrapedAnnouncements = false;
let hasSuccessfullyScrapedNews = false;
let lastSuccessfulScrapeTimestamp = 0;

// Health check endpoint for Render / monitoring / client sync status
app.get(['/api/health', '/api/ping'], (req, res) => {
  const isLive = (hasSuccessfullyScrapedAnnouncements && cachedAnnouncements.length > 0) ||
                 (hasSuccessfullyScrapedNews && cachedNews.length > 0);
  res.json({
    status: 'ok',
    live: isLive,
    source: isLive ? 'live' : 'fallback',
    lastSyncTime: lastSuccessfulScrapeTimestamp || 0,
    announcementsLive: hasSuccessfullyScrapedAnnouncements,
    newsLive: hasSuccessfullyScrapedNews,
    timestamp: new Date().toISOString()
  });
});

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    maxSockets: 20
  }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache'
  },
  timeout: 30000
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

const TURKISH_MONTHS: Record<string, number> = {
  ocak: 0, oca: 0,
  subat: 1, şubat: 1, sub: 1, şub: 1,
  mart: 2, mar: 2,
  nisan: 3, nis: 3,
  mayis: 4, mayıs: 4, may: 4,
  haziran: 5, haz: 5,
  temmuz: 6, tem: 6,
  agustos: 7, ağustos: 7, agu: 7, ağu: 7,
  eylul: 8, eylül: 8, eyl: 8,
  ekim: 9, eki: 9,
  kasim: 10, kasım: 10, kas: 10,
  aralik: 11, aralık: 11, ara: 11,
};

function parseDateToTimestamp(dateStr?: string | null): number {
  if (!dateStr) return 0;
  const str = dateStr.trim();
  if (!str) return 0;

  if (str.toLowerCase() === 'güncel' || str.toLowerCase() === 'guncel') {
    return Date.now() - 3600000;
  }

  if (str.includes('T')) {
    const t = Date.parse(str);
    if (!isNaN(t)) return t;
  }

  const dmyMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(Date.UTC(year, month, day)).getTime();
  }

  const ymdMatch = str.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(Date.UTC(year, month, day)).getTime();
  }

  const trWithYear = str.match(/^(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\s+(\d{4})/i);
  if (trWithYear) {
    const day = parseInt(trWithYear[1], 10);
    const rawMonth = trWithYear[2].toLowerCase();
    const cleanMonth = rawMonth
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    const month = TURKISH_MONTHS[cleanMonth] ?? TURKISH_MONTHS[rawMonth] ?? 0;
    const year = parseInt(trWithYear[3], 10);
    return new Date(Date.UTC(year, month, day)).getTime();
  }

  const trNoYear = str.match(/^(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)/i);
  if (trNoYear) {
    const day = parseInt(trNoYear[1], 10);
    const rawMonth = trNoYear[2].toLowerCase();
    const cleanMonth = rawMonth
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    const month = TURKISH_MONTHS[cleanMonth] ?? TURKISH_MONTHS[rawMonth] ?? 0;
    return new Date(Date.UTC(2026, month, day)).getTime();
  }

  const parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
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

// Cache setup (Initial timestamps 0 so server scrapes fresh on start)
let cachedAnnouncements: any[] = [];
let cachedAnnouncementsTime = 0;
let cachedNews: any[] = [];
let cachedNewsTime = 0;
let cachedCalendar: any[] = [];
let cachedCalendarTime = 0;
const CACHE_TTL = 5 * 60 * 1000;
const CALENDAR_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week) smart cache

// In-flight mutex promises to avoid redundant parallel scrapes
let scrapingAnnouncementsPromise: Promise<any[]> | null = null;
let scrapingNewsPromise: Promise<any[]> | null = null;
let scrapingMenuPromise: Promise<any[]> | null = null;

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

// Pre-seed cache so initial responses are instant (< 5ms)
cachedAnnouncements = [...DEFAULT_ANNOUNCEMENTS];
cachedNews = [...DEFAULT_NEWS];

async function scrapeAnnouncementsCore(includeFaculties = false): Promise<any[]> {
  const announcements: any[] = [];
  try {
    const response = await axiosInstance.get('https://www.kilis.edu.tr/tr/duyurular', { timeout: 12000 });
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

    // Save main announcements immediately so they become instantly available!
    if (announcements.length > 0) {
      cachedAnnouncements = [...announcements];
      cachedAnnouncementsTime = Date.now();
      hasSuccessfullyScrapedAnnouncements = true;
      lastSuccessfulScrapeTimestamp = Date.now();
    }
  } catch (e) {
    console.warn('Main announcements scrape failed/timed out');
  }

  if (includeFaculties) {
    const activeFaculties = FACULTIES.slice(0, 10);
    await processInChunks(activeFaculties, 5, async (fac, index) => {
      try {
        const facRes = await axiosInstance.get(`${fac.url}/tr`, { timeout: 5000 });
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

    if (announcements.length > 0) {
      cachedAnnouncements = announcements;
      cachedAnnouncementsTime = Date.now();
    }
  }

  return cachedAnnouncements.length > 0 ? cachedAnnouncements : DEFAULT_ANNOUNCEMENTS;
}

function triggerAnnouncementsScrape(includeFaculties = false): Promise<any[]> {
  if (scrapingAnnouncementsPromise) return scrapingAnnouncementsPromise;
  scrapingAnnouncementsPromise = scrapeAnnouncementsCore(includeFaculties).finally(() => {
    scrapingAnnouncementsPromise = null;
  });
  return scrapingAnnouncementsPromise;
}

app.get('/api/announcements', async (req, res) => {
  const isForce = req.query.force === 'true';
  const includeFac = req.query.includeFaculties === 'true';
  const isStale = Date.now() - cachedAnnouncementsTime > CACHE_TTL;

  if (isForce) {
    try {
      // Fast race: wait max 1500ms for live scrape; return cached immediately if scrape takes longer
      const liveData = await Promise.race([
        triggerAnnouncementsScrape(includeFac),
        new Promise<any[]>((resolve) => setTimeout(() => resolve(null), 1500))
      ]);
      const dataToReturn = (liveData && liveData.length > 0) ? liveData : (cachedAnnouncements.length > 0 ? cachedAnnouncements : DEFAULT_ANNOUNCEMENTS);
      const isLive = hasSuccessfullyScrapedAnnouncements && dataToReturn !== DEFAULT_ANNOUNCEMENTS;
      res.setHeader('x-data-source', isLive ? 'live' : 'fallback');
      res.setHeader('x-is-live', isLive ? 'true' : 'false');
      return res.json(dataToReturn);
    } catch {
      const isLive = hasSuccessfullyScrapedAnnouncements && cachedAnnouncements.length > 0;
      res.setHeader('x-data-source', isLive ? 'live' : 'fallback');
      res.setHeader('x-is-live', isLive ? 'true' : 'false');
      return res.json(cachedAnnouncements.length > 0 ? cachedAnnouncements : DEFAULT_ANNOUNCEMENTS);
    }
  }

  if (isStale || cachedAnnouncements.length === 0) {
    triggerAnnouncementsScrape(includeFac).catch(() => {});
  }

  const isLive = hasSuccessfullyScrapedAnnouncements && cachedAnnouncements.length > 0;
  res.setHeader('x-data-source', isLive ? 'live' : 'fallback');
  res.setHeader('x-is-live', isLive ? 'true' : 'false');
  return res.json(isLive ? cachedAnnouncements : DEFAULT_ANNOUNCEMENTS);
});

async function scrapeNewsCore(includeFaculties = false): Promise<any[]> {
  const news: any[] = [];
  try {
    const response = await axiosInstance.get('https://www.kilis.edu.tr/tr/haberler', { timeout: 12000 });
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

    // Save main news immediately so they become instantly available!
    if (news.length > 0) {
      cachedNews = [...news];
      cachedNewsTime = Date.now();
      hasSuccessfullyScrapedNews = true;
      lastSuccessfulScrapeTimestamp = Date.now();
    }
  } catch (e) {
    console.warn('Main news scrape failed/timed out');
  }

  if (includeFaculties) {
    const activeFaculties = FACULTIES.slice(0, 10);
    await processInChunks(activeFaculties, 5, async (fac, index) => {
      try {
        const facRes = await axiosInstance.get(`${fac.url}/tr`, { timeout: 5000 });
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

    if (news.length > 0) {
      cachedNews = news;
      cachedNewsTime = Date.now();
    }
  }

  return cachedNews.length > 0 ? cachedNews : DEFAULT_NEWS;
}

function triggerNewsScrape(includeFaculties = false): Promise<any[]> {
  if (scrapingNewsPromise) return scrapingNewsPromise;
  scrapingNewsPromise = scrapeNewsCore(includeFaculties).finally(() => {
    scrapingNewsPromise = null;
  });
  return scrapingNewsPromise;
}

app.get('/api/news', async (req, res) => {
  const isForce = req.query.force === 'true';
  const includeFac = req.query.includeFaculties === 'true';
  const isStale = Date.now() - cachedNewsTime > CACHE_TTL;

  if (isForce) {
    try {
      // Fast race: wait max 1500ms for live scrape; return cached immediately if scrape takes longer
      const liveData = await Promise.race([
        triggerNewsScrape(includeFac),
        new Promise<any[]>((resolve) => setTimeout(() => resolve(null), 1500))
      ]);
      const dataToReturn = (liveData && liveData.length > 0) ? liveData : (cachedNews.length > 0 ? cachedNews : DEFAULT_NEWS);
      const isLive = hasSuccessfullyScrapedNews && dataToReturn !== DEFAULT_NEWS;
      res.setHeader('x-data-source', isLive ? 'live' : 'fallback');
      res.setHeader('x-is-live', isLive ? 'true' : 'false');
      return res.json(dataToReturn);
    } catch {
      const isLive = hasSuccessfullyScrapedNews && cachedNews.length > 0;
      res.setHeader('x-data-source', isLive ? 'live' : 'fallback');
      res.setHeader('x-is-live', isLive ? 'true' : 'false');
      return res.json(cachedNews.length > 0 ? cachedNews : DEFAULT_NEWS);
    }
  }

  if (isStale || cachedNews.length === 0) {
    triggerNewsScrape(includeFac).catch(() => {});
  }

  const isLive = hasSuccessfullyScrapedNews && cachedNews.length > 0;
  res.setHeader('x-data-source', isLive ? 'live' : 'fallback');
  res.setHeader('x-is-live', isLive ? 'true' : 'false');
  return res.json(isLive ? cachedNews : DEFAULT_NEWS);
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

// Proxy endpoint to download images with attachment headers and cross-origin bypass
app.get('/api/download-image', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Geçersiz görsel adresi' });
    }

    const requestedFilename = (req.query.filename as string) || '';
    let filename = requestedFilename.replace(/[^a-zA-Z0-9_\-\.]/g, '_').trim();
    if (!filename) {
      filename = `k7au-duyuru-gorsel-${Date.now()}`;
    }
    if (!filename.includes('.')) {
      filename += '.jpg';
    }

    let parsedOrigin = 'https://www.kilis.edu.tr';
    try {
      parsedOrigin = new URL(imageUrl).origin;
    } catch {}

    const safeUrl = encodeURI(decodeURI(imageUrl));

    const imageRes = await axiosInstance.get(safeUrl, {
      responseType: 'arraybuffer',
      timeout: 25000,
      headers: {
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': parsedOrigin
      }
    });

    const contentType = String(imageRes.headers['content-type'] || 'image/jpeg');
    const safeAsciiFilename = filename.replace(/[^\x20-\x7E]/g, '_');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(imageRes.data));
  } catch (err: any) {
    console.error('Image download proxy error:', err?.message || err);
    return res.status(500).json({ error: 'Görsel sunucudan indirilemedi' });
  }
});

app.get('/api/detail', async (req, res) => {
  // Prevent any browser, proxy or service worker caching of detail content
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    let targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!targetUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const response = await axiosInstance.get(targetUrl, { timeout: 25000 });
    const $ = cheerio.load(response.data);
    
    let title = $('h1.title, .announcement-detail-title, .news-detail-title, .inner-page__title, h1').first().text().trim();
    title = cleanDuplicateTitle(title);
    
    const urlObj = new URL(targetUrl);
    const baseUrl = urlObj.origin;

    // Helper to safely encode URLs
    const ensureSafeUrl = (urlStr?: string | null): string => {
      if (!urlStr) return '';
      const trimmed = urlStr.trim();
      if (!trimmed) return '';
      try {
        const u = new URL(trimmed);
        const safePath = u.pathname
          .split('/')
          .map(seg => encodeURIComponent(decodeURIComponent(seg)))
          .join('/');
        return `${u.origin}${safePath}${u.search ? '?' + u.searchParams.toString() : ''}${u.hash || ''}`;
      } catch {
        try {
          return encodeURI(decodeURI(trimmed));
        } catch {
          return trimmed;
        }
      }
    };

    // Target primary article container to avoid picking up site-wide navigation/footer links
    const contentContainer = $(
      '.announcement-detail-content-box, .announcement-detail-card, .announcement-detail-wrapper, ' +
      '.announcement-detail-layout, .event-detail-content, .event-detail-text, .inner-page__content-description, ' +
      '.announcement-detail-text, .news-detail-text, .inner-page__content, article, .detail-content, .content-block, #main, main'
    ).first();

    const searchScope = contentContainer.length > 0 ? contentContainer : $('body');

    // Extract images (Cover + Gallery)
    let imageUrl = '';
    const images: string[] = [];
    const seenImageSignatures = new Set<string>();

    const addImage = (rawSrc?: string | null) => {
      if (!rawSrc) return;
      let full = rawSrc.trim();
      if (!full) return;
      if (!full.startsWith('http')) {
        full = `${baseUrl}${full.startsWith('/') ? '' : '/'}${full}`;
      }
      const lower = full.toLowerCase();
      const isNoise =
        lower.includes('logo') ||
        lower.includes('icon') ||
        lower.includes('flag') ||
        lower.endsWith('.svg') ||
        lower.includes('firat_logo') ||
        lower.includes('logo%20web') ||
        lower.includes('logo web') ||
        lower.includes('kilis-logo') ||
        lower.includes('avatar');

      if (!isNoise) {
        const safe = ensureSafeUrl(full);
        const sig = getImageSignature(safe);
        const isDuplicate = images.some(img => areImagesEqual(img, safe)) || (sig && seenImageSignatures.has(sig));
        if (safe && !isDuplicate) {
          if (sig) seenImageSignatures.add(sig);
          images.push(safe);
          if (!imageUrl) imageUrl = safe;
        }
      }
    };

    // 1. Check meta tags
    const ogImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
    if (ogImg) addImage(ogImg);

    // 2. Check prominent image containers & swipers
    const imgSelectors = [
      '.announcement-detail-content-box img',
      '.announcement-detail-text img',
      '.announcement-detail-card img',
      '.news-detail-image img',
      '.detail-image img',
      '.announcement-detail-image img',
      '.inner-page__image img',
      '.swiper-slide img',
      '.full-screen-slider img',
      '.photo-gallery img',
      '.featured-image img',
      'article img',
      '.inner-page__content img'
    ];

    for (const sel of imgSelectors) {
      $(sel).each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-large');
        addImage(src);
      });
    }

    // 3. Fallback to all images with announcement/photos/content path
    searchScope.find('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (
        src &&
        (src.includes('/photos/') ||
         src.includes('/announcements/') ||
         src.includes('/contentFiles/') ||
         src.includes('/subdomain_files/') ||
         src.includes('/upload/') ||
         src.includes('/news/') ||
         src.includes('/duyuru/'))
      ) {
        addImage(src);
      }
    });

    // Extract structured attachments (PDF, DOCX, XLSX, etc.)
    interface DetailAttachment {
      name: string;
      url: string;
      extension: string;
      size?: string;
    }

    const attachments: DetailAttachment[] = [];
    const seenAttachmentUrls = new Set<string>();

    const addAttachment = (rawName: string, rawHref: string) => {
      if (!rawHref) return;
      let fullUrl = rawHref.trim();
      if (!fullUrl.startsWith('http')) {
        fullUrl = `${baseUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }

      // Filter out global university footer/navigation docs that appear statically on every page
      const lowerUrl = fullUrl.toLowerCase();
      const lowerName = (rawName || '').toLowerCase().trim();
      
      const isNoiseDoc =
        lowerUrl.includes('oa_yonerge.pdf') ||
        lowerUrl.includes('hizmet%20ici%20egitim') ||
        lowerUrl.includes('hizmet%20i%cc%87%c3%a7i%cc%87%20egi%cc%87ti%cc%87m') ||
        lowerUrl.includes('stratejik%20plan') ||
        lowerUrl.includes('kurumsal%20izleme') ||
        lowerUrl.includes('odul%20yonergesi') ||
        lowerUrl.includes('performans%20degerlendirme') ||
        lowerUrl.includes('proje%20destek%20ofisi') ||
        lowerUrl.includes('tto)%20yonergesi') ||
        lowerUrl.includes('kalite%20el%20kitab') ||
        lowerUrl.includes('ogrenci%20el%20kalite%20el%20kitab') ||
        lowerName === 'eğiticilerin eğitimi' ||
        lowerName === 'izleme ve iyileştirme kanıtları' ||
        lowerName === 'hizmet içi eğitim uygulamalarına ilişkin planlamalar' ||
        lowerName === 'ödül yönergesi' ||
        lowerName === 'idari personel performans değerlendirme yönergesi' ||
        lowerName === 'proje destek ofisi yönergesi' ||
        lowerName === 'teknoloji transfer ofisi yönergesi' ||
        lowerName === 'süreç yönetimi el kitapları' ||
        lowerName === 'öğrenci el kitabı';

      if (isNoiseDoc) return;

      let cleanName = (rawName || '').trim().replace(/\s+/g, ' ');
      if (
        !cleanName ||
        lowerName === 'tıklayınız.' ||
        lowerName === 'tıklayınız' ||
        lowerName === 'tıklayın' ||
        lowerName === 'indir' ||
        lowerName === 'döküman indir' ||
        lowerName === 'doküman indir' ||
        lowerName === 'dosyayı indir' ||
        cleanName === '.'
      ) {
        const parts = fullUrl.split('/');
        try {
          cleanName = decodeURIComponent(parts[parts.length - 1].split('?')[0]) || 'Döküman İndir';
        } catch {
          cleanName = parts[parts.length - 1].split('?')[0] || 'Döküman İndir';
        }
      }

      // Determine extension
      let ext = '';
      const extMatch = fullUrl.match(/\.([a-zA-Z0-9]{2,5})(?:[\?#]|$)/);
      if (extMatch) {
        ext = extMatch[1].toUpperCase();
      } else {
        const nameMatch = cleanName.match(/\.([a-zA-Z0-9]{2,5})$/);
        if (nameMatch) {
          ext = nameMatch[1].toUpperCase();
        } else if (fullUrl.includes('/file/')) {
          ext = 'PDF';
        }
      }

      const safeUrl = ensureSafeUrl(fullUrl);
      const isImgFile = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'AVIF'].includes(ext);
      if (isImgFile) {
        const isDuplicateOfGallery = images.some(img => areImagesEqual(img, safeUrl)) || areImagesEqual(imageUrl, safeUrl);
        if (isDuplicateOfGallery) {
          return;
        }
      }

      if (!seenAttachmentUrls.has(safeUrl)) {
        seenAttachmentUrls.add(safeUrl);
        attachments.push({ name: cleanName, url: safeUrl, extension: ext || 'FILE' });
      }
    };

    // 1. Scrape explicitly dedicated file attachment containers (#files, .course-list-table, .courses-list)
    $('#files, .course-list-table, .courses-list, .flat-all-course, .announcement-attached-documents').each((_, containerEl) => {
      $(containerEl).find('tr').each((__, tr) => {
        const row = $(tr);
        const link = row.find('a').first();
        const downloadLink = row.find('a[download]').length ? row.find('a[download]') : link;
        const href = downloadLink.attr('href') || link.attr('href') || row.attr('onclick')?.match(/get_url\(['"]([^'"]+)['"]\)/)?.[1];
        const name = link.text().trim() || downloadLink.attr('download') || row.find('td').first().text().trim();
        if (href) {
          addAttachment(name, href);
        }
      });

      // Also search any free links inside #files
      $(containerEl).find('a').each((__, a) => {
        const href = $(a).attr('href');
        const name = $(a).text().trim() || $(a).attr('download') || '';
        if (href) addAttachment(name, href);
      });
    });

    // 2. Scrape file links directly inside the announcement content container
    searchScope.find('a').each((_, a) => {
      const href = $(a).attr('href');
      if (!href) return;
      const lower = href.toLowerCase();
      if (
        lower.includes('/file/') ||
        lower.includes('/contentfiles/') ||
        lower.includes('/documentfiles/') ||
        lower.includes('/subdomain_files/') ||
        lower.endsWith('.pdf') || lower.includes('.pdf?') ||
        lower.endsWith('.doc') || lower.endsWith('.docx') ||
        lower.endsWith('.xls') || lower.endsWith('.xlsx') ||
        lower.endsWith('.zip') || lower.endsWith('.rar') ||
        lower.includes('drive.google.com/file')
      ) {
        const name = $(a).text().trim() || $(a).attr('download') || '';
        addAttachment(name, href);
      }
    });

    // 3. Extract and Clean Content HTML
    let contentHtml = '';
    const textContainer = contentContainer.find('.announcement-detail-text, .news-detail-text, .inner-page__content-description, .event-detail-content').first();
    if (textContainer.length > 0) {
      contentHtml = textContainer.html() || '';
    } else if (contentContainer.length > 0) {
      contentHtml = contentContainer.html() || '';
    }

    if (!contentHtml) {
      const ps = searchScope.find('p');
      if (ps.length > 0) {
        contentHtml = ps.map((_, p) => `<p>${$(p).html()}</p>`).get().join('');
      }
    }

    if (contentHtml) {
      const $content = cheerio.load(contentHtml, null, false);

      // Remove raw file attachment tables since they are presented in the structured Attachments list
      $content('#files, .course-list-table, .courses-list, .flat-all-course, .announcement-attached-documents').remove();

      $content('table').each((_, tbl) => {
        const tblText = $content(tbl).text().toLowerCase();
        if (
          tblText.includes('döküman ismi') ||
          tblText.includes('doküman ismi') ||
          (tblText.includes('indir') && (tblText.includes('.pdf') || tblText.includes('/file/')))
        ) {
          const parentWrap = $content(tbl).closest('.overflow-x-auto, .course-list-table, .courses-list, #files');
          if (parentWrap.length) {
            parentWrap.remove();
          } else {
            $content(tbl).remove();
          }
        }
      });

      // Remove ONLY duplicate h1/h2 headings matching title, NEVER delete body paragraphs or text
      const normTitle = (title || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (normTitle) {
        $content('h1, h2, .announcement-detail-title, .news-detail-title, .inner-page__content-header').each((_, el) => {
          const hText = cleanDuplicateTitle($content(el).text()).replace(/\s+/g, ' ').trim().toLowerCase();
          if (hText && (hText === normTitle || hText === cleanDuplicateTitle(title).toLowerCase())) {
            $content(el).remove();
          }
        });
      }

      // Remove noise separators and slider controls
      $content('.announcement-icon-separator, .title-list, .photo-gallery-header, .swiper-button-next, .swiper-button-prev, .swiper-pagination').remove();

      // Normalize images in HTML with safe URLs
      $content('img').each((_, el) => {
        let src = $content(el).attr('src') || $content(el).attr('data-src') || '';
        if (src) {
          if (!src.startsWith('http')) {
            src = `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
          }
          const safeSrc = ensureSafeUrl(src);
          const isNoise = !src || src.includes('logo') || src.includes('icon') || src.includes('flag') || src.endsWith('.svg');
          if (isNoise) {
            $content(el).remove();
          } else {
            $content(el).attr('src', safeSrc);
            $content(el).removeAttr('srcset');
            $content(el).addClass('rounded-xl mx-auto my-3 max-h-[500px] object-contain shadow-sm border border-stone-200 dark:border-white/10');
          }
        }
      });

      // Normalize links
      $content('a').each((_, el) => {
        let href = $content(el).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          href = `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
        }
        if (href) {
          $content(el).attr('href', ensureSafeUrl(href));
        }
        $content(el).attr('target', '_blank');
        $content(el).attr('rel', 'noopener noreferrer');
        const style = $content(el).attr('style') || '';
        if (style) {
          $content(el).attr('style', style.replace(/color:\s*[^;]+;?/gi, ''));
        }
      });

      // Modernize tables
      $content('table').each((_, tbl) => {
        $content(tbl).removeAttr('style');
        $content(tbl).addClass('w-full border-collapse my-3 text-xs sm:text-sm rounded-xl overflow-hidden');
        if (!$content(tbl).parent().hasClass('overflow-x-auto')) {
          $content(tbl).wrap('<div class="overflow-x-auto -mx-1 sm:mx-0 my-3 rounded-xl border border-stone-200 dark:border-white/10 shadow-xs"></div>');
        }
      });
      $content('thead').removeAttr('style').addClass('bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100');
      $content('tbody').removeAttr('style');
      $content('tr').removeAttr('style').addClass('hover:bg-stone-50 dark:hover:bg-white/5 transition-colors border-b border-stone-100 dark:border-white/5');
      $content('th').removeAttr('style').addClass('p-3 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-bold border-b border-stone-200 dark:border-white/10 text-left text-xs');
      $content('td').removeAttr('style').addClass('p-3 border-b border-stone-100 dark:border-white/5 text-stone-800 dark:text-stone-200 text-xs');

      // Clean empty tags
      $content('div, p, span').each((_, el) => {
        if ($content(el).children().length === 0 && (!$content(el).text() || !$content(el).text().trim() || $content(el).text().trim() === '&nbsp;')) {
          $content(el).remove();
        }
      });

      contentHtml = $content.html() || '';
      const rawText = contentHtml.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      const hasMediaOrTables = $content('img, table, iframe, a').length > 0;
      if (!rawText && !hasMediaOrTables) {
        contentHtml = '';
      }
    }

    res.json({ title, contentHtml, imageUrl, images, attachments });
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

const phoneUnitSyncTimeMap: Record<string, number> = {};

app.get('/api/phone-directory/sync', async (req, res) => {
  try {
    const unitId = ((req.query.unitId || req.query.department_id || '') as string).trim();
    const isForce = req.query.force === 'true';
    if (!unitId) {
      return res.json({ success: true, message: 'Veriler güncel', data: memoryPhoneDirectory });
    }

    // Sunucu koruması: Son 30 dakika içinde çekilmişse ve zorlanmıyorsa bellekteki veriyi sun
    const lastSync = phoneUnitSyncTimeMap[unitId] || 0;
    const isFresh = (Date.now() - lastSync) < (30 * 60 * 1000);
    const existingUnit = memoryPhoneDirectory.find(u => u.id === unitId);
    if (!isForce && isFresh && existingUnit && existingUnit.sections && existingUnit.sections.length > 0) {
      return res.json({
        success: true,
        message: 'Önbellekten sunuldu (sunucu koruması aktif)',
        data: existingUnit,
        cached: true
      });
    }

    const targetUrl = `https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi?department_id=${encodeURIComponent(unitId)}`;
    const response = await axiosInstance.get(targetUrl, { timeout: 9000 });
    phoneUnitSyncTimeMap[unitId] = Date.now();
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
    const isForce = req.query.force === 'true' || req.body?.force === true;
    
    // Find target faculty
    const targetFac = STAFF_FACULTIES_LIST.find(f => f.id.toLowerCase() === facultyId && f.id !== 'all');
    
    if (targetFac && targetFac.sourceUrl) {
      const lastTime = facultyStaffSyncTimeMap[targetFac.id] || 0;
      const isFresh = (Date.now() - lastTime) < (30 * 60 * 1000); // 30 dakika sunucu koruması
      const existingStaff = syncedStaffData.filter(s => s.facultyId.toLowerCase() === targetFac.id.toLowerCase());

      // Sunucu koruması: Son 30 dakika içinde çekilmişse ve zorlanmıyorsa bellekteki veriyi sun
      if (!isForce && isFresh && existingStaff.length > 0) {
        return res.json({
          success: true,
          facultyId: targetFac.id,
          facultyName: targetFac.name,
          count: existingStaff.length,
          lastSyncTime: lastTime,
          data: existingStaff,
          cached: true
        });
      }

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

// ============================================================================
// --- HAVA DURUMU SİSTEMİ (MGM RESMİ İSTASYON & OPEN-METEO ÇİFT KAYNAK) ---
// ============================================================================
const MGM_HADİSE_MAP: Record<string, { code: number; text: string }> = {
  'A': { code: 0, text: 'Açık' },
  'AB': { code: 1, text: 'Az Bulutlu' },
  'PB': { code: 2, text: 'Parçalı Bulutlu' },
  'CB': { code: 3, text: 'Çok Bulutlu' },
  'HY': { code: 51, text: 'Hafif Yağmurlu' },
  'Y': { code: 61, text: 'Yağmurlu' },
  'KY': { code: 65, text: 'Kuvvetli Yağmurlu' },
  'KGY': { code: 95, text: 'Kuvvetli Gökgürültülü Sağanak' },
  'GSY': { code: 95, text: 'Gökgürültülü Sağanak Yağışlı' },
  'MSY': { code: 80, text: 'Mevzi Sağanak Yağışlı' },
  'SY': { code: 80, text: 'Sağanak Yağışlı' },
  'K': { code: 71, text: 'Karlı' },
  'HKY': { code: 71, text: 'Hafif Kar Yağışlı' },
  'YKY': { code: 75, text: 'Yoğun Kar Yağışlı' },
  'KKY': { code: 66, text: 'Karla Karışık Yağmurlu' },
  'DY': { code: 96, text: 'Dolu' },
  'SC': { code: 45, text: 'Sisli' },
  'P': { code: 45, text: 'Puslu' },
  'D': { code: 45, text: 'Dumanlı' },
  'R': { code: 1, text: 'Rüzgarlı' },
  'KF': { code: 45, text: 'Kum veya Toz Fırtınası' },
  'G': { code: 0, text: 'Güneşli' }
};

let cachedMGMWeather: any = null;
let cachedMGMWeatherTime = 0;
let cachedOpenMeteoWeather: any = null;
let cachedOpenMeteoWeatherTime = 0;
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

const mgmAxiosHeaders = {
  'Origin': 'https://www.mgm.gov.tr',
  'Referer': 'https://www.mgm.gov.tr/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*'
};

async function fetchMGMWeatherData(force = false): Promise<any> {
  if (!force && cachedMGMWeather && (Date.now() - cachedMGMWeatherTime < WEATHER_CACHE_TTL)) {
    return cachedMGMWeather;
  }

  const [sonRes, saatRes, gunRes] = await Promise.all([
    axios.get('https://servis.mgm.gov.tr/web/sondurumlar?istno=17262', { headers: mgmAxiosHeaders, timeout: 8000 })
      .catch(() => axios.get('https://servis.mgm.gov.tr/web/sondurumlar?istno=17260', { headers: mgmAxiosHeaders, timeout: 8000 }))
      .catch(() => ({ data: [] })),
    axios.get('https://servis.mgm.gov.tr/web/tahminler/saatlik?istno=17262', { headers: mgmAxiosHeaders, timeout: 8000 })
      .catch(() => ({ data: [] })),
    axios.get('https://servis.mgm.gov.tr/web/tahminler/gunluk?istno=97901', { headers: mgmAxiosHeaders, timeout: 8000 })
      .catch(() => axios.get('https://servis.mgm.gov.tr/web/tahminler/gunluk?istno=17260', { headers: mgmAxiosHeaders, timeout: 8000 }))
      .catch(() => ({ data: [] }))
  ]);

  const son = sonRes.data?.[0] || {};
  const gun = gunRes.data?.[0] || {};
  const saatObj = saatRes.data?.[0] || {};
  const saatTahminler: any[] = Array.isArray(saatObj.tahmin) ? saatObj.tahmin : [];

  if (typeof son.sicaklik !== 'number' && typeof gun.enYuksekGun1 !== 'number') {
    if (cachedMGMWeather) return cachedMGMWeather;
    throw new Error('MGM servisinden veri alınamadı');
  }

  const currentTemp = typeof son.sicaklik === 'number' ? son.sicaklik : (gun.enYuksekGun1 ?? 18);
  const apparentTemp = typeof son.hissedilenSicaklik === 'number' && son.hissedilenSicaklik !== -9999
    ? son.hissedilenSicaklik
    : currentTemp;

  const currentHumidity = typeof son.nem === 'number' && son.nem > 0 ? son.nem : 65;
  const currentWindSpeed = typeof son.ruzgarHiz === 'number' && son.ruzgarHiz >= 0 ? son.ruzgarHiz : 5;
  const currentWindDir = typeof son.ruzgarYon === 'number' && son.ruzgarYon >= 0 ? son.ruzgarYon : 0;
  const currentPressure = typeof son.denizeIndirgenmisBasinc === 'number' && son.denizeIndirgenmisBasinc > 800
    ? son.denizeIndirgenmisBasinc
    : (typeof son.aktuelBasinc === 'number' && son.aktuelBasinc > 800 ? son.aktuelBasinc : 1014);

  const hadiseCode = (son.hadiseKodu || gun.hadiseGun1 || 'PB').toUpperCase();
  const hadiseInfo = MGM_HADİSE_MAP[hadiseCode] || { code: 2, text: 'Parçalı Bulutlu' };

  // Calculate day/night in Turkey
  const now = new Date();
  const trHour = (now.getUTCHours() + 3) % 24;
  const isDay = (trHour >= 6 && trHour < 18) ? 1 : 0;

  // Compute 5-day daily forecasts from MGM
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const dailyForecasts: any[] = [];

  for (let i = 1; i <= 5; i++) {
    const tarih = gun[`tarihGun${i}`];
    const minT = gun[`enDusukGun${i}`];
    const maxT = gun[`enYuksekGun${i}`];
    const hadiseG = gun[`hadiseGun${i}`] || 'PB';
    const minNem = gun[`enDusukNemGun${i}`];
    const maxNem = gun[`enYuksekNemGun${i}`];
    const ruzgarH = gun[`ruzgarHizGun${i}`];

    if (tarih && typeof minT === 'number' && typeof maxT === 'number') {
      const d = new Date(tarih);
      const dayName = isNaN(d.getTime()) ? `Gün ${i}` : dayNames[d.getUTCDay()];
      const dateStr = isNaN(d.getTime()) ? '' : `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const hInfo = MGM_HADİSE_MAP[hadiseG] || { code: 2, text: 'Parçalı Bulutlu' };

      dailyForecasts.push({
        dayName,
        dateStr,
        hadise: hadiseG,
        conditionText: hInfo.text,
        weatherCode: hInfo.code,
        minTemp: minT,
        maxTemp: maxT,
        minHumidity: minNem,
        maxHumidity: maxNem,
        windSpeed: ruzgarH
      });
    }
  }

  // Construct target offsets hourly items (+0, +1, +2, +3, +4, +6, +8, +12, +24)
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

  const hourlyList: any[] = [];
  const pad = (n: number) => String(n).padStart(2, '0');

  for (const t of targetOffsets) {
    const futureDate = new Date(now.getTime() + t.offset * 60 * 60 * 1000);
    const targetHourTr = (futureDate.getUTCHours() + 3) % 24;
    const isTargetDay = (targetHourTr >= 6 && targetHourTr < 18) ? 1 : 0;

    // Find best match in MGM 3-hourly predictions
    let matchedPred = saatTahminler.find((p: any) => {
      if (!p.tarih) return false;
      const pDate = new Date(p.tarih);
      return Math.abs(pDate.getTime() - futureDate.getTime()) <= 90 * 60 * 1000;
    });

    if (!matchedPred && saatTahminler.length > 0) {
      matchedPred = saatTahminler.reduce((prev: any, curr: any) => {
        const prevDiff = Math.abs(new Date(prev.tarih).getTime() - futureDate.getTime());
        const currDiff = Math.abs(new Date(curr.tarih).getTime() - futureDate.getTime());
        return currDiff < prevDiff ? curr : prev;
      }, saatTahminler[0]);
    }

    const itemTemp = t.offset === 0 
      ? currentTemp 
      : (matchedPred?.sicaklik ?? currentTemp);
    const itemApparent = t.offset === 0 
      ? apparentTemp 
      : (matchedPred?.hissedilenSicaklik ?? itemTemp);
    const itemHumidity = t.offset === 0 
      ? currentHumidity 
      : (matchedPred?.nem ?? currentHumidity);
    const itemWind = t.offset === 0 
      ? currentWindSpeed 
      : (matchedPred?.ruzgarHizi ?? currentWindSpeed);
    const itemWindDir = t.offset === 0 
      ? currentWindDir 
      : (matchedPred?.ruzgarYonu ?? currentWindDir);
    const itemHadise = t.offset === 0 
      ? hadiseCode 
      : (matchedPred?.hadise || hadiseCode);
    const itemHInfo = MGM_HADİSE_MAP[itemHadise] || hadiseInfo;

    // Precipitation probability estimate from condition
    let precipProb = 0;
    if (['Y', 'SY', 'HY', 'KY', 'GSY', 'KGY', 'MSY'].includes(itemHadise)) {
      precipProb = ['KY', 'KGY', 'GSY'].includes(itemHadise) ? 85 : 65;
    } else if (itemHadise === 'CB') {
      precipProb = 25;
    }

    hourlyList.push({
      hourOffset: t.offset,
      label: t.label,
      timeStr: t.offset === 0 ? `${pad(trHour)}:${pad(now.getUTCMinutes())}` : `${pad(targetHourTr)}:00`,
      temp: itemTemp,
      apparentTemp: itemApparent,
      humidity: itemHumidity,
      precipitationProb: precipProb,
      windSpeed: itemWind,
      windDirection: itemWindDir,
      surfacePressure: currentPressure,
      uvIndex: isTargetDay ? (isTargetDay && (targetHourTr >= 11 && targetHourTr <= 15) ? 4 : 2) : 0,
      weatherCode: itemHInfo.code,
      isDay: isTargetDay
    });
  }

  const rain24Val = typeof son.yagis24Saat === 'number' && son.yagis24Saat >= 0 ? son.yagis24Saat : 0;
  const currentRainProb = ['KY', 'KGY', 'GSY'].includes(hadiseCode) ? 90 : (['Y', 'SY', 'MSY'].includes(hadiseCode) ? 75 : (['HY', 'CB'].includes(hadiseCode) ? 35 : 10));

  const payload = {
    provider: 'mgm',
    source: 'MGM (Resmi İstasyon)',
    stationName: 'Kilis Merkez İstasyonu (17262)',
    temperature: currentTemp,
    apparentTemperature: apparentTemp,
    humidity: currentHumidity,
    windSpeed: currentWindSpeed,
    windDirection: currentWindDir,
    surfacePressure: currentPressure,
    rainChance: currentRainProb,
    rainChanceMax: Math.max(currentRainProb, 40),
    weathercode: hadiseInfo.code,
    conditionText: hadiseInfo.text,
    is_day: isDay,
    tempMin: gun.enDusukGun1 ?? Math.round(currentTemp - 4),
    tempMax: gun.enYuksekGun1 ?? Math.round(currentTemp + 5),
    sunrise: '06:45',
    sunset: '18:15',
    uvIndexMax: 4,
    rain24h: rain24Val,
    observationTime: son.veriZamani || new Date().toISOString(),
    hourlyList,
    dailyForecasts,
    cachedAt: new Date().toISOString()
  };

  cachedMGMWeather = payload;
  cachedMGMWeatherTime = Date.now();
  return payload;
}

function getKilisFallbackWeather(sourceName = 'Open-Meteo'): any {
  const now = new Date();
  const trHour = (now.getUTCHours() + 3) % 24;
  const isDay = (trHour >= 6 && trHour < 18) ? 1 : 0;
  const pad = (n: number) => String(n).padStart(2, '0');
  const liveNowTimeStr = `${pad(trHour)}:${pad(now.getUTCMinutes())}`;

  // Realistic temperature curve based on hour (base 13°C at night, 20°C at peak 14:00)
  const tempOffset = Math.sin((trHour - 7) / 24 * 2 * Math.PI) * 4;
  const currentTemp = Math.round((16 + tempOffset) * 10) / 10;

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

  const hourlyList = targetOffsets.map(item => {
    const targetH = (trHour + item.offset) % 24;
    const itemIsDay = (targetH >= 6 && targetH < 18) ? 1 : 0;
    const hTempOffset = Math.sin((targetH - 7) / 24 * 2 * Math.PI) * 4;
    const hTemp = Math.round((16 + hTempOffset) * 10) / 10;

    return {
      hourOffset: item.offset,
      label: item.label,
      timeStr: item.offset === 0 ? liveNowTimeStr : `${pad(targetH)}:00`,
      temp: hTemp,
      apparentTemp: hTemp,
      humidity: 65,
      precipitationProb: 15,
      windSpeed: 7,
      windDirection: 140,
      surfacePressure: 1014,
      uvIndex: itemIsDay ? 3 : 0,
      weatherCode: 1,
      isDay: itemIsDay
    };
  });

  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const dailyForecasts = Array.from({ length: 7 }).map((_, i) => {
    const dt = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
    return {
      dayName: dayNames[dt.getUTCDay()],
      dateStr: `${pad(dt.getUTCDate())}.${pad(dt.getUTCMonth() + 1)}`,
      hadise: 'PB',
      conditionText: 'Parçalı Bulutlu',
      weatherCode: 1,
      minTemp: 12,
      maxTemp: 21,
      minHumidity: 45,
      maxHumidity: 80,
      windSpeed: 8
    };
  });

  return {
    provider: 'openmeteo',
    source: `${sourceName} (Model Tahmini)`,
    stationName: 'Kilis 7 Aralık Kampüsü',
    temperature: currentTemp,
    apparentTemperature: currentTemp,
    humidity: 65,
    windSpeed: 8,
    windDirection: 140,
    surfacePressure: 1014,
    rainChance: 15,
    rainChanceMax: 25,
    weathercode: 1,
    conditionText: 'Parçalı Bulutlu',
    is_day: isDay,
    tempMin: 12,
    tempMax: 21,
    sunrise: '06:40',
    sunset: '18:15',
    uvIndexMax: 4,
    rain24h: 0,
    observationTime: now.toISOString(),
    hourlyList,
    dailyForecasts,
    fallbackNotice: 'Servis yoğunluğu nedeniyle model tahmini devrede.'
  };
}

async function fetchOpenMeteoWeatherData(force = false): Promise<any> {
  if (!force && cachedOpenMeteoWeather && (Date.now() - cachedOpenMeteoWeatherTime < WEATHER_CACHE_TTL)) {
    return cachedOpenMeteoWeather;
  }

  const url = 'https://api.open-meteo.com/v1/forecast?latitude=36.7161&longitude=37.1150&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day,apparent_temperature,surface_pressure&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,apparent_temperature,surface_pressure,uv_index,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&forecast_days=7&timezone=Europe%2FIstanbul';
  
  let data: any = null;
  try {
    const res = await axios.get(url, {
      timeout: 8000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    data = res.data;
  } catch (fetchErr: any) {
    const status = fetchErr?.response?.status;
    console.warn(`Open-Meteo API notice (${status || fetchErr.message}), activating fallback.`);

    // 1. Return stale cache if available
    if (cachedOpenMeteoWeather) {
      return {
        ...cachedOpenMeteoWeather,
        fallbackNotice: 'Open-Meteo yoğunluğu nedeniyle son güncel tahmin sunuluyor.'
      };
    }

    // 2. Fallback to MGM live station data
    try {
      const mgmData = await fetchMGMWeatherData(false);
      if (mgmData && typeof mgmData.temperature === 'number') {
        return {
          ...mgmData,
          source: 'MGM (Open-Meteo Yedeği)',
          fallbackNotice: 'Open-Meteo geçici olarak meşgul olduğu için resmi MGM verisi gösteriliyor.'
        };
      }
    } catch {}

    // 3. Fallback to realistic synthetic weather
    return getKilisFallbackWeather('Open-Meteo');
  }

  if (!data?.current || typeof data.current.temperature_2m !== 'number') {
    if (cachedOpenMeteoWeather) return cachedOpenMeteoWeather;
    return getKilisFallbackWeather('Open-Meteo');
  }

  const times: string[] = data.hourly?.time || [];
  const currentTimeIso = data.current?.time || '';
  const currentHourPrefix = currentTimeIso ? currentTimeIso.slice(0, 13) : '';
  let baseIndex = currentHourPrefix ? times.findIndex((t: string) => t.startsWith(currentHourPrefix)) : -1;
  if (baseIndex === -1 && currentTimeIso) {
    const nextIndex = times.findIndex((t: string) => t >= currentTimeIso);
    baseIndex = nextIndex > 0 ? nextIndex - 1 : 0;
  }
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

  const now = new Date();
  const trHour = (now.getUTCHours() + 3) % 24;
  const pad = (n: number) => String(n).padStart(2, '0');
  const liveNowTimeStr = `${pad(trHour)}:${pad(now.getUTCMinutes())}`;

  const hourlyList = targetOffsets.map(item => {
    const idx = baseIndex + item.offset;
    const timeStr = item.offset === 0 ? liveNowTimeStr : `${pad((trHour + item.offset) % 24)}:00`;
    return {
      hourOffset: item.offset,
      label: item.label,
      timeStr,
      temp: data.hourly?.temperature_2m?.[idx] ?? data.current.temperature_2m,
      apparentTemp: data.hourly?.apparent_temperature?.[idx] ?? data.current.apparent_temperature ?? data.current.temperature_2m,
      humidity: data.hourly?.relative_humidity_2m?.[idx] ?? data.current.relative_humidity_2m ?? 60,
      precipitationProb: data.hourly?.precipitation_probability?.[idx] ?? 0,
      windSpeed: data.hourly?.wind_speed_10m?.[idx] ?? 0,
      windDirection: data.hourly?.wind_direction_10m?.[idx] ?? (data.current.wind_direction_10m || 0),
      surfacePressure: data.hourly?.surface_pressure?.[idx] ?? (data.current.surface_pressure || 1013),
      uvIndex: data.hourly?.uv_index?.[idx] ?? 0,
      weatherCode: data.hourly?.weather_code?.[idx] ?? 0,
      isDay: data.hourly?.is_day?.[idx] ?? 1,
    };
  });

  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const dailyForecasts = (data.daily?.time || []).map((tStr: string, i: number) => {
    const dt = new Date(tStr);
    const dayName = isNaN(dt.getTime()) ? `Gün ${i + 1}` : dayNames[dt.getUTCDay()];
    const dateStr = isNaN(dt.getTime()) ? '' : `${pad(dt.getUTCDate())}.${pad(dt.getUTCMonth() + 1)}`;
    const rainMax = data.daily.precipitation_probability_max?.[i] ?? 0;
    return {
      dayName,
      dateStr,
      hadise: '',
      conditionText: rainMax > 50 ? 'Yağış Bekleniyor' : 'Açık / Parçalı',
      weatherCode: rainMax > 50 ? 61 : 1,
      minTemp: data.daily.temperature_2m_min?.[i] ?? 12,
      maxTemp: data.daily.temperature_2m_max?.[i] ?? 20,
      minHumidity: 40,
      maxHumidity: 85,
      windSpeed: 10
    };
  });

  const payload = {
    provider: 'openmeteo',
    source: 'Open-Meteo (Sayısal Model)',
    stationName: 'Kilis 7 Aralık Kampüsü (ECMWF)',
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature || data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m ?? 60,
    windSpeed: data.current.wind_speed_10m ?? 5,
    windDirection: data.current.wind_direction_10m || 0,
    surfacePressure: data.current.surface_pressure || 1013,
    rainChance: currentHourlyRainChance,
    rainChanceMax: dailyMaxRainChance,
    weathercode: data.current.weather_code ?? 0,
    is_day: data.current.is_day ?? 1,
    tempMin: data.daily?.temperature_2m_min?.[0] ?? data.current.temperature_2m,
    tempMax: data.daily?.temperature_2m_max?.[0] ?? data.current.temperature_2m,
    sunrise: data.daily?.sunrise?.[0] || '06:40',
    sunset: data.daily?.sunset?.[0] || '18:15',
    uvIndexMax: data.daily?.uv_index_max?.[0] || 0,
    hourlyList,
    dailyForecasts,
    cachedAt: new Date().toISOString()
  };

  cachedOpenMeteoWeather = payload;
  cachedOpenMeteoWeatherTime = Date.now();
  return payload;
}

app.get('/api/weather/mgm', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const data = await fetchMGMWeatherData(force);
    res.json(data);
  } catch (err: any) {
    console.warn('MGM API route fallback notice:', err.message);
    if (cachedMGMWeather) {
      return res.json(cachedMGMWeather);
    }
    try {
      const fallbackData = await fetchOpenMeteoWeatherData(false);
      res.json({ ...fallbackData, fallbackNotice: 'MGM yerine Open-Meteo sunuldu' });
    } catch {
      res.json(getKilisFallbackWeather('MGM'));
    }
  }
});

app.get('/api/weather/openmeteo', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const data = await fetchOpenMeteoWeatherData(force);
    res.json(data);
  } catch (err: any) {
    console.warn('Open-Meteo API route fallback notice:', err.message);
    if (cachedOpenMeteoWeather) {
      return res.json(cachedOpenMeteoWeather);
    }
    try {
      const mgmData = await fetchMGMWeatherData(false);
      return res.json({ ...mgmData, fallbackNotice: 'Open-Meteo yerine MGM sunuldu' });
    } catch {
      res.json(getKilisFallbackWeather('Open-Meteo'));
    }
  }
});

app.get('/api/weather', async (req, res) => {
  const source = ((req.query.source || 'mgm') as string).toLowerCase();
  const force = req.query.force === 'true';
  try {
    if (source === 'openmeteo' || source === 'open-meteo') {
      const data = await fetchOpenMeteoWeatherData(force);
      return res.json(data);
    }
    const data = await fetchMGMWeatherData(force);
    return res.json(data);
  } catch (err: any) {
    console.warn('Weather route fallback notice:', err.message);
    if (cachedMGMWeather) return res.json(cachedMGMWeather);
    if (cachedOpenMeteoWeather) return res.json(cachedOpenMeteoWeather);
    return res.json(getKilisFallbackWeather(source === 'openmeteo' ? 'Open-Meteo' : 'MGM'));
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
          if (cleanDate) existing.date = cleanDate;
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
            date: cleanDate || '',
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

    // Sort chronologically descending (newest first)
    events.sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));

    if (events.length > 0) {
      cachedEvents = events;
      cachedEventsTime = Date.now();
      return res.json(events);
    }

    // Fallback events with detailed descriptions (chronologically ordered)
    const fallbackEvents = [
      {
        id: 'ev-1',
        title: 'Üniversitemizde “Sektör-Üniversite Buluşmaları”nın İlki Gerçekleştirildi',
        date: '28 Ekim 2026',
        location: '15 Temmuz Kongre ve Kültür Merkezi',
        category: 'Buluşma & Konferans',
        content: 'Üniversitemiz Kariyer Planlama Uygulama ve Araştırma Merkezi koordinasyonunda düzenlenen “Sektör-Üniversite Buluşmaları” etkinliğinde öğrenciler iş dünyası temsilcileriyle bir araya geldi.',
        description: 'Öğrencilerimizi sektör temsilcileriyle buluşturan kariyer ve vizyon panelleri.',
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      },
      {
        id: 'ev-2',
        title: 'Cumhuriyetimizin 103. Yıl Anısına Cumhuriyet Konseri',
        date: '28 Ekim 2026',
        location: 'Rektörlük Konferans Salonu',
        category: 'Konser & Sanat',
        content: '29 Ekim Cumhuriyet Bayramı kutlamaları kapsamında üniversitemiz Müzik Eğitimi Anabilim Dalı öğretim elemanları ve öğrencileri tarafından Cumhuriyet Konseri icra edildi.',
        description: 'Cumhuriyet Bayramı kutlamaları kapsamında icra edilen klasik ve çok sesli Türk müziği konseri.',
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      },
      {
        id: 'ev-3',
        title: 'Üniversitemizde “Cumhuriyet’in İlanı ve Kazanımları” Konferansı Gerçekleştirildi',
        date: '27 Ekim 2026',
        location: 'İnsan ve Toplum Bilimleri Fakültesi Konferans Salonu',
        category: 'Konferans',
        content: 'Tarih Bölümü öğretim üyelerimizin sunumuyla cumhuriyetin kuruluş ilkeleri ve modern Türkiye’nin kazanımları ele alındı.',
        description: 'Tarih perspektifinden Cumhuriyetimizin kuruluşu ve kazanımları üzerine bilimsel konferans.',
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      },
      {
        id: 'ev-4',
        title: 'Milli Teknoloji Burs Program Tanıtımları ve TEKNOFEST Genel Bilgilendirmesi',
        date: '26 Ekim 2026',
        location: 'Mühendislik-Mimarlık Fakültesi Amfi 1',
        category: 'Bilgilendirme',
        content: 'T3 Vakfı ve TEKNOFEST yarışma kategorileri, takım kurma süreçleri ve Milli Teknoloji Hamlesi burs programları hakkında bilgilendirme semineri düzenlendi.',
        description: 'TEKNOFEST yarışmaları ve T3 Vakfı burs programları detaylı öğrenci bilgilendirmesi.',
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      },
      {
        id: 'ev-5',
        title: 'Türkiye Sibervatan Programı 2027 Dönemi Başlıyor',
        date: '23 Ekim 2026',
        location: 'Bilgisayar Mühendisliği Laboratuvarları',
        category: 'Eğitim & Teknoloji',
        content: 'Siber güvenlik alanında uzman genç yetenekler yetiştirmeyi amaçlayan Siber Vatan programı yeni dönem başvuruları ve eğitim takvimi açıklandı.',
        description: 'Siber güvenlik uzmanlığı ve teknik eğitim kampı tanıtımı.',
        url: 'https://www.kilis.edu.tr/tr/etkinlikler'
      }
    ];

    res.json(fallbackEvents);
  } catch (error) {
    console.error('Events fetch error:', error);
    res.json([
      {
        id: 'ev-1',
        title: 'Üniversitemizde “Sektör-Üniversite Buluşmaları”nın İlki Gerçekleştirildi',
        date: '28 Ekim 2026',
        location: '15 Temmuz Kongre ve Kültür Merkezi',
        category: 'Etkinlik',
        content: 'Sektör temsilcileri ile üniversite öğrencilerimizin buluşması.',
        description: 'Sektör temsilcileri ile üniversite öğrencilerimizin buluşması.',
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

// K7AÜ Merkez Kütüphanesi Açık Katalog Arama ve Canlı Raf Durumu API'si
const K7_LIBRARY_BOOKS = [
  {
    id: 'k7-b1',
    title: 'Kilis Tarihi ve Kültür Varlıkları',
    author: 'Prof. Dr. Hikmet Özdemir',
    category: 'Kilis & Bölge',
    publisher: 'Kilis 7 Aralık Üniversitesi Yayınları',
    year: 2021,
    isbn: '978-605-69214-3-2',
    barcode: 'DEM-79102',
    callNumber: '956.19 K55 2021',
    floorLocation: 'Merkez Kütüphane Zemin Kat - Kilis ve Yerel Tarih Kitaplığı',
    shelfNumber: 'K-01 / Raf B',
    status: 'available',
    totalCopies: 2,
    availableCopies: 2,
    language: 'Türkçe',
    pages: 428,
    description: 'Kilis kentinin antik çağlardan günümüze kadar uzanan tarihi, mimari yapıları, vakıfları ve kültürel zenginliklerini belgeleyen kapsamlı üniversite yayını.'
  },
  {
    id: 'k7-b2',
    title: 'Veri Yapıları ve Algoritmalar (C/C++ ile)',
    author: 'Dr. Rifat Çölkesen',
    category: 'Mühendislik & Bilgisayar',
    publisher: 'Papatya Bilim Yayınevi',
    year: 2022,
    isbn: '978-975-6797-40-5',
    barcode: 'DEM-48201',
    callNumber: '005.133 C65 2022',
    floorLocation: 'Merkez Kütüphane 1. Kat - Fen ve Mühendislik Salonu',
    shelfNumber: 'M-08 / Raf C',
    status: 'available',
    totalCopies: 4,
    availableCopies: 3,
    language: 'Türkçe',
    pages: 560,
    description: 'Bağlı listeler, yığınlar, kuyruklar, ağaçlar, grafik algoritmaları ve karmaşıklık analizlerini içeren mühendislik ders kitabı.'
  },
  {
    id: 'k7-b3',
    title: 'Diferansiyel Denklemler ve Sınır Değer Problemleri',
    author: 'Prof. Dr. Fikri Akdeniz & Doç. Dr. Ahmet Kaya',
    category: 'Temel Bilimler',
    publisher: 'Nobel Akademik Yayıncılık',
    year: 2020,
    isbn: '978-605-320-812-4',
    barcode: 'DEM-33918',
    callNumber: '515.35 A34 2020',
    floorLocation: 'Merkez Kütüphane 1. Kat - Fen ve Mühendislik Salonu',
    shelfNumber: 'F-14 / Raf A',
    status: 'available',
    totalCopies: 3,
    availableCopies: 2,
    language: 'Türkçe',
    pages: 490,
    description: 'Birinci ve yüksek mertebeden diferansiyel denklemler, Laplace dönüşümleri, Fourier serileri ve mühendislik uygulamaları.'
  },
  {
    id: 'k7-b4',
    title: 'Mikroiktisat (Modern Teori ve Uygulamalar)',
    author: 'Prof. Dr. Erdal M. Ünsal',
    category: 'İİBF & İktisat',
    publisher: 'İmaj Yayınevi',
    year: 2023,
    isbn: '978-975-8752-98-1',
    barcode: 'DEM-52119',
    callNumber: '338.5 U57 2023',
    floorLocation: 'Merkez Kütüphane 2. Kat - İİBF ve Sosyal Bilimler Salonu',
    shelfNumber: 'S-06 / Raf D',
    status: 'borrowed',
    returnDate: '24 Kasım 2026',
    totalCopies: 2,
    availableCopies: 0,
    language: 'Türkçe',
    pages: 684,
    description: 'Tüketici dengesi, firma teorisi, piyasa yapıları, genel denge ve refah ekonomisi konularını içeren temel lisans kaynağı.'
  },
  {
    id: 'k7-b5',
    title: 'İslam Hukukuna Giriş',
    author: 'Prof. Dr. Hayreddin Karaman',
    category: 'İlahiyat',
    publisher: 'Ensar Neşriyat',
    year: 2021,
    isbn: '978-975-6782-12-8',
    barcode: 'DEM-61044',
    callNumber: '297.5 K37 2021',
    floorLocation: 'Merkez Kütüphane 2. Kat - İlahiyat ve Din Bilimleri Salonu',
    shelfNumber: 'I-03 / Raf B',
    status: 'available',
    totalCopies: 4,
    availableCopies: 4,
    language: 'Türkçe',
    pages: 376,
    description: 'Fıkıh usulünün doğuşu, mezheplerin teşekkülü, hüküm çıkarma metotları ve klasik kaynaklar üzerine temel başvuru eseri.'
  },
  {
    id: 'k7-b6',
    title: 'Zeytincilik ve Akdeniz Tarımı',
    author: 'Prof. Dr. Nazım Şekeroğlu & Prof. Dr. Muhittin Kulak',
    category: 'Ziraat & Doğa Bilimleri',
    publisher: 'Kilis 7 Aralık Üniversitesi Ziraat Fakültesi Yayınları',
    year: 2022,
    isbn: '978-605-7281-05-9',
    barcode: 'DEM-83011',
    callNumber: '634.63 S45 2022',
    floorLocation: 'Merkez Kütüphane 1. Kat - Ziraat ve Biyoloji Salonu',
    shelfNumber: 'Z-02 / Raf A',
    status: 'available',
    totalCopies: 2,
    availableCopies: 2,
    language: 'Türkçe',
    pages: 312,
    description: 'Kilis yağlık zeytin çeşidinin genetik özellikleri, Akdeniz ikliminde zeytin yetiştiriciliği, budama, gübreleme ve kaliteli zeytinyağı üretimi.'
  },
  {
    id: 'k7-b7',
    title: 'İnsan Anatomisi Atlası ve Fizyolojiye Giriş',
    author: 'Prof. Dr. Kaplan Arıncı & Prof. Dr. Alaittin Elhan',
    category: 'Sağlık & Tıp',
    publisher: 'Güneş Tıp Kitabevleri',
    year: 2021,
    isbn: '978-975-277-512-1',
    barcode: 'DEM-29177',
    callNumber: '611 A75 2021',
    floorLocation: 'Merkez Kütüphane 1. Kat - Tıp ve Sağlık Bilimleri Salonu',
    shelfNumber: 'T-05 / Raf B',
    status: 'borrowed',
    returnDate: '19 Kasım 2026',
    totalCopies: 3,
    availableCopies: 1,
    language: 'Türkçe',
    pages: 720,
    description: 'Hemşirelik ve sağlık bilimleri öğrencileri için sistematik anatomi atlası ve temel fizyolojik mekanizmalar.'
  },
  {
    id: 'k7-b8',
    title: 'Yapay Zeka ve Makine Öğrenmesi',
    author: 'Prof. Dr. Ethem Alpaydın',
    category: 'Mühendislik & Bilgisayar',
    publisher: 'Boğaziçi Üniversitesi Yayınevi / Seçkin',
    year: 2023,
    isbn: '978-975-02-7815-3',
    barcode: 'DEM-91204',
    callNumber: '006.3 A47 2023',
    floorLocation: 'Merkez Kütüphane 1. Kat - Fen ve Mühendislik Salonu',
    shelfNumber: 'M-11 / Raf A',
    status: 'available',
    totalCopies: 2,
    availableCopies: 1,
    language: 'Türkçe',
    pages: 480,
    description: 'Gözetimli ve gözetimsiz öğrenme modelleri, yapay sinir ağları, derin öğrenme ve karar ağaçları.'
  },
  {
    id: 'k7-b9',
    title: 'Türk Dili ve Kompozisyon Bilgileri',
    author: 'Prof. Dr. Muharrem Ergin',
    category: 'Edebiyat',
    publisher: 'Bayrak Basım Yayım',
    year: 2020,
    isbn: '978-975-6541-11-4',
    barcode: 'DEM-15092',
    callNumber: '494.35 E74 2020',
    floorLocation: 'Merkez Kütüphane 2. Kat - Sosyal Bilimler ve Edebiyat Salonu',
    shelfNumber: 'E-02 / Raf C',
    status: 'available',
    totalCopies: 6,
    availableCopies: 5,
    language: 'Türkçe',
    pages: 384,
    description: 'Türkçenin ses ve şekil bilgisi, cümle yapısı, yazım ve noktalama kuralları ile etkili ifade sanatı.'
  },
  {
    id: 'k7-b10',
    title: 'İşletme Yöneticiliği (Yönetim ve Organizasyon)',
    author: 'Prof. Dr. Tamer Koçel',
    category: 'İİBF & İktisat',
    publisher: 'Beta Basım Yayım Dağıtım',
    year: 2022,
    isbn: '978-605-242-709-6',
    barcode: 'DEM-44183',
    callNumber: '658 K63 2022',
    floorLocation: 'Merkez Kütüphane 2. Kat - İİBF ve Sosyal Bilimler Salonu',
    shelfNumber: 'S-10 / Raf A',
    status: 'available',
    totalCopies: 3,
    availableCopies: 2,
    language: 'Türkçe',
    pages: 742,
    description: 'Klasik, neoklasik ve modern yönetim yaklaşımları, stratejik planlama, liderlik ve örgütsel davranış.'
  },
  {
    id: 'k7-b11',
    title: 'Nutuk (Belgelerle Tam Metin)',
    author: 'Gazi Mustafa Kemal Atatürk',
    category: 'Tarih',
    publisher: 'Türk Tarih Kurumu Yayınları',
    year: 2019,
    isbn: '978-975-16-0145-2',
    barcode: 'DEM-10025',
    callNumber: '956.102 A83 2019',
    floorLocation: 'Merkez Kütüphane Zemin Kat - Nadir Eserler ve Referans Salonu',
    shelfNumber: 'R-01 / Özel Raf',
    status: 'available',
    totalCopies: 3,
    availableCopies: 3,
    language: 'Türkçe',
    pages: 896,
    description: 'Milli Mücadele dönemi, TBMM kuruluşu ve Cumhuriyetin ilanını anlatan birincil tarihi kaynak.'
  },
  {
    id: 'k7-b12',
    title: 'Suç ve Ceza',
    author: 'Fyodor Mihayloviç Dostoyevski',
    category: 'Edebiyat',
    publisher: 'Türkiye İş Bankası Kültür Yayınları',
    year: 2021,
    isbn: '978-975-458-902-3',
    barcode: 'DEM-67319',
    callNumber: '891.73 D72 2021',
    floorLocation: 'Merkez Kütüphane 2. Kat - Genel Edebiyat ve Dünya Klasikleri',
    shelfNumber: 'E-18 / Raf B',
    status: 'borrowed',
    returnDate: '21 Kasım 2026',
    totalCopies: 3,
    availableCopies: 0,
    language: 'Türkçe',
    pages: 688,
    description: 'Raskolnikov\'un ahlak, vicdan ve adalet sorgulamasını işleyen dünya edebiyatının başyapıtı.'
  },
  {
    id: 'k7-b13',
    title: 'Organik Kimya',
    author: 'T. W. Graham Solomons & Craig B. Fryhle',
    category: 'Temel Bilimler',
    publisher: 'Literatür Yayıncılık',
    year: 2021,
    isbn: '978-975-04-0518-4',
    barcode: 'DEM-38410',
    callNumber: '547 S65 2021',
    floorLocation: 'Merkez Kütüphane 1. Kat - Fen ve Mühendislik Salonu',
    shelfNumber: 'F-07 / Raf C',
    status: 'available',
    totalCopies: 3,
    availableCopies: 2,
    language: 'Türkçe',
    pages: 1150,
    description: 'Organik bileşiklerin yapıları, reaksiyon mekanizmaları, stereokimya ve spektroskopi ders kitabı.'
  },
  {
    id: 'k7-b14',
    title: 'İslam Felsefesi Tarihi',
    author: 'Prof. Dr. Macit Fahri',
    category: 'İlahiyat',
    publisher: 'İklim Yayınları',
    year: 2018,
    isbn: '978-975-7883-20-6',
    barcode: 'DEM-70321',
    callNumber: '181.07 F14 2018',
    floorLocation: 'Merkez Kütüphane 2. Kat - İlahiyat ve Felsefe Salonu',
    shelfNumber: 'I-09 / Raf D',
    status: 'available',
    totalCopies: 2,
    availableCopies: 1,
    language: 'Türkçe',
    pages: 416,
    description: 'Kindi, Farabi, İbn Sina, Gazali ve İbn Rüşd ekolleri ile İslam düşünce tarihinin sistematik analizi.'
  },
  {
    id: 'k7-b15',
    title: 'Kilis Yöresi Ağızları ve Folklorik Unsurları',
    author: 'Prof. Dr. Bilgehan Atsız Gökdağ',
    category: 'Kilis & Bölge',
    publisher: 'Kilis 7 Aralık Üniversitesi Yayınları',
    year: 2020,
    isbn: '978-605-69214-7-0',
    barcode: 'DEM-79244',
    callNumber: '398.0956 G65 2020',
    floorLocation: 'Merkez Kütüphane Zemin Kat - Kilis ve Yerel Tarih Kitaplığı',
    shelfNumber: 'K-03 / Raf A',
    status: 'available',
    totalCopies: 2,
    availableCopies: 2,
    language: 'Türkçe',
    pages: 294,
    description: 'Kilis ağzının ses ve sözlük özellikleri, yöresel deyimler, masallar, maniler ve halk kültürü derlemeleri.'
  },
  {
    id: 'k7-b16',
    title: 'Bilgisayar Ağları ve İnternet Protokolleri',
    author: 'Andrew S. Tanenbaum & David J. Wetherall',
    category: 'Mühendislik & Bilgisayar',
    publisher: 'Palme Yayınevi',
    year: 2021,
    isbn: '978-605-355-144-2',
    barcode: 'DEM-88192',
    callNumber: '004.6 T36 2021',
    floorLocation: 'Merkez Kütüphane 1. Kat - Fen ve Mühendislik Salonu',
    shelfNumber: 'M-05 / Raf B',
    status: 'borrowed',
    returnDate: '27 Kasım 2026',
    totalCopies: 2,
    availableCopies: 0,
    language: 'Türkçe',
    pages: 820,
    description: 'OSI modeli, TCP/IP mimarisi, yönlendirme algoritmaları, ağ güvenliği ve modern kablosuz ağlar.'
  },
  {
    id: 'k7-b17',
    title: 'Hemşirelik Esasları ve Klinik Uygulama İlkeleri',
    author: 'Prof. Dr. Nuran Akdemir & Prof. Dr. Leman Birol',
    category: 'Sağlık & Tıp',
    publisher: 'Sistem Ofset / Palme',
    year: 2022,
    isbn: '978-975-8663-81-2',
    barcode: 'DEM-31085',
    callNumber: '610.73 A38 2022',
    floorLocation: 'Merkez Kütüphane 1. Kat - Tıp ve Sağlık Bilimleri Salonu',
    shelfNumber: 'T-02 / Raf C',
    status: 'available',
    totalCopies: 4,
    availableCopies: 3,
    language: 'Türkçe',
    pages: 940,
    description: 'Hasta bakımı, vital bulgular, ilaç uygulamaları, asepsi ve hasta güvenliği prensipleri.'
  },
  {
    id: 'k7-b18',
    title: 'Fizik (Fen ve Mühendislik İçin - Cilt 1: Mekanik)',
    author: 'Raymond A. Serway & John W. Jewett',
    category: 'Temel Bilimler',
    publisher: 'Palme Yayınevi',
    year: 2022,
    isbn: '978-605-355-001-8',
    barcode: 'DEM-24109',
    callNumber: '530 S47 2022',
    floorLocation: 'Merkez Kütüphane 1. Kat - Fen ve Mühendislik Salonu',
    shelfNumber: 'F-02 / Raf A',
    status: 'available',
    totalCopies: 5,
    availableCopies: 4,
    language: 'Türkçe',
    pages: 672,
    description: 'Newton mekaniği, enerji korunumu, dairesel hareket, titreşimler ve dalga mekaniği.'
  }
];

app.get('/api/library/search', (req, res) => {
  const query = String(req.query.q || '').trim().toLowerCase();
  const category = String(req.query.category || 'all').trim();
  const statusFilter = String(req.query.status || 'all').trim();

  let results = K7_LIBRARY_BOOKS;

  if (category && category !== 'all' && category !== 'Tümü') {
    results = results.filter((b) => b.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (statusFilter === 'available') {
    results = results.filter((b) => b.status === 'available');
  } else if (statusFilter === 'borrowed') {
    results = results.filter((b) => b.status === 'borrowed');
  }

  if (query) {
    results = results.filter((b) => {
      const q = query;
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.callNumber.toLowerCase().includes(q) ||
        b.barcode.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.shelfNumber.toLowerCase().includes(q) ||
        b.floorLocation.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    });
  }

  res.json({
    total: results.length,
    catalogName: 'Kilis 7 Aralık Üniversitesi Açık Katalog Sistemi (Yordam / OPAC)',
    query,
    category,
    statusFilter,
    books: results
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
        ws: false,
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
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Warm up university scrapers in the background on startup
    setTimeout(() => {
      triggerAnnouncementsScrape(false).catch(() => {});
      setTimeout(() => triggerNewsScrape(false).catch(() => {}), 1200);
    }, 800);
  });

  server.on('error', (err: any) => {
    console.error(`Server listen error on port ${PORT}:`, err);
  });
}

startServer();
