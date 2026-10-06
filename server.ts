import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import qs from 'qs';
import * as cheerio from 'cheerio';
import https from 'https';
import cors from 'cors';
import { AUTHENTIC_FORMS_DATA, cleanTurkishFormTitle } from './src/data/formsData';
import { ACADEMIC_STAFF_DATA } from './src/data/staffData';
import { FALLBACK_DEPARTMENT_NEWS } from './src/data/departmentNewsData';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for all routes (necessary when frontend runs in APK or different origin)
app.use(cors());

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
        let title = $(el).find('.title-wrapper .text').text().replace(/\s+/g, ' ').trim();
        let dateStr = $(el).find('.link-footer .date .text').text().replace(/\s+/g, ' ').trim();
        if (!title) title = $(el).text().replace(/\s+/g, ' ').trim();
        let href = $(el).attr('href') || '';
        if (href && !href.startsWith('http')) {
          href = `https://www.kilis.edu.tr${href.startsWith('/') ? '' : '/'}${href}`;
        }
        
        if (title) {
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

    // Faculty Announcements (parallel with fast individual timeout)
    const activeFaculties = FACULTIES.slice(0, 10);
    await processInChunks(activeFaculties, 5, async (fac, index) => {
      try {
        const facRes = await axiosInstance.get(`${fac.url}/tr`, { timeout: 3500 });
        const $ = cheerio.load(facRes.data);
        $('.announcement-item').each((i, el) => {
          let title = $(el).find('.announcement-title').text().trim();
          let dateStr = $(el).find('.announcement-date').text().trim();
          let url = $(el).attr('href');
          if (title) {
            announcements.push({
              id: `ann-fac-${index}-${i}`,
              title: title,
              date: dateStr || new Date().toISOString(),
              content: '',
              category: fac.name,
              url: url?.startsWith('http') ? url : `${fac.url}${url?.startsWith('/') ? '' : '/'}${url}`
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
        let title = $(el).find('.title-wrapper .text').text().replace(/\s+/g, ' ').trim();
        let dateStr = $(el).find('.link-footer .date .text').text().replace(/\s+/g, ' ').trim();
        if (!title) title = $(el).text().replace(/\s+/g, ' ').trim();
        let href = $(el).attr('href') || '';
        if (href && !href.startsWith('http')) {
          href = `https://www.kilis.edu.tr${href.startsWith('/') ? '' : '/'}${href}`;
        }
        
        if (title) {
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

    // Faculty News
    const activeFaculties = FACULTIES.slice(0, 10);
    await processInChunks(activeFaculties, 5, async (fac, index) => {
      try {
        const facRes = await axiosInstance.get(`${fac.url}/tr`, { timeout: 3500 });
        const $ = cheerio.load(facRes.data);
        $('.news-item').each((i, el) => {
          let title = $(el).find('.news-title').text().trim();
          let dateStr = $(el).find('.news-date').text().trim();
          let url = $(el).attr('href');
          if (title) {
            news.push({
              id: `news-fac-${index}-${i}`,
              title: title,
              date: dateStr || new Date().toISOString(),
              content: '',
              category: fac.name,
              url: url?.startsWith('http') ? url : `${fac.url}${url?.startsWith('/') ? '' : '/'}${url}`
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
    const deptUrl = typeof req.query.deptUrl === 'string' ? req.query.deptUrl.trim() : '';
    const deptId = typeof req.query.deptId === 'string' ? req.query.deptId.trim() : '';
    const facultyId = typeof req.query.facultyId === 'string' ? req.query.facultyId.trim() : '';
    const force = req.query.force === 'true';

    // 1. If a specific department live URL is provided (e.g., https://turkdili.kilis.edu.tr/tr/news-all)
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
          let title = $(el).find('.news-item-title, .title, h3, h4').text().trim().replace(/\s+/g, ' ');
          if (!title) title = $(el).text().trim().replace(/\s+/g, ' ');
          if (!title || title.length < 5) return;

          let rawDate = $(el).find('.news-item-date, .date, .time, .link-footer .date').text().trim().replace(/\s+/g, ' ');
          let href = $(el).attr('href') || $(el).find('a').attr('href');
          if (href && !href.startsWith('http')) {
            href = `${base}${href.startsWith('/') ? '' : '/'}${href}`;
          }

          let img = $(el).find('img').attr('src');
          if (img && !img.startsWith('http')) {
            img = `${base}${img.startsWith('/') ? '' : '/'}${img}`;
          }

          list.push({
            id: `dept-live-${deptId || 'item'}-${i}-${Date.now()}`,
            title,
            date: rawDate || 'Güncel',
            url: href || deptUrl,
            imageUrl: img || undefined,
            facultyId: facultyId || '',
            facultyName: '',
            departmentId: deptId || '',
            departmentName: '',
            sourceUrl: deptUrl,
            category: 'Bölüm Haberleri'
          });
        });

        if (list.length > 0) {
          cachedDepartmentNewsMap.set(cacheKey, { data: list, time: Date.now() });
          return res.json(list);
        }
      } catch (scrapeErr) {
        console.warn('Live department scrape failed for', deptUrl, scrapeErr);
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

app.get('/api/menu', async (req, res) => {
  try {
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
      return res.json(menuItems);
    }

    res.json(DEFAULT_MENU);
  } catch (error) {
    console.error('Menu error, returning fallback menu:', error);
    res.json(DEFAULT_MENU);
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

app.get('/api/detail', async (req, res) => {
  try {
    let targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!targetUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const response = await axiosInstance.get(targetUrl);
    const $ = cheerio.load(response.data);
    
    let title = $('h1.title').text().trim() || 
                $('.announcement-detail-title').text().trim() || 
                $('.news-detail-title').text().trim() || 
                $('h1').text().trim();
    
    let contentHtml = '';
    
    const contentSelectors = [
      '.inner-page__content-description',
      '.announcement-detail-text',
      '.news-detail-text',
      '.inner-page__content',
      '.news-content-body',
      '.content-block'
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
      contentHtml = `<p>İçerik okunamadı veya sayfa yapısı farklı. (<a href="${targetUrl}" target="_blank" style="color:blue;text-decoration:underline;">Orijinal sayfaya git</a>)</p>`;
    }
    
    const urlObj = new URL(targetUrl);
    const baseUrl = urlObj.origin;
    
    if (contentHtml) {
      contentHtml = contentHtml.replace(/href="\//g, `href="${baseUrl}/`);
      contentHtml = contentHtml.replace(/src="\//g, `src="${baseUrl}/`);
    }
    
    res.json({ title, contentHtml });
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

// --- AKADEMİK & İDARİ PERSONEL (FAKÜLTE, ENSTİTÜ, YO, MYO, KONSERVATUVAR, KOORDİNATÖRLÜK BAZLI) ---
app.get('/api/staff', (req, res) => {
  try {
    const faculty = ((req.query.faculty || 'all') as string).toLowerCase().trim();
    const department = ((req.query.department || 'all') as string).toLowerCase().trim();
    const category = ((req.query.category || 'all') as string).toLowerCase().trim();
    const q = ((req.query.q || req.query.search || '') as string).toLowerCase().trim();

    let list = ACADEMIC_STAFF_DATA;

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

    const response = await axiosInstance.get('https://www.kilis.edu.tr/tr/etkinlikler');
    const $ = cheerio.load(response.data);
    const events: any[] = [];
    const seenTitles = new Set<string>();

    $('a[href*="/etkinlik/"], a.full-link-item').each((i, el) => {
      let title = $(el).find('.title-wrapper .text, .title, h3, h4').first().text().replace(/\s+/g, ' ').trim();
      let img = $(el).find('img').attr('src') || '';
      let imgAlt = $(el).find('img').attr('alt') || '';
      if (!title && imgAlt) title = imgAlt.trim();
      if (!title) title = $(el).text().replace(/\s+/g, ' ').trim();

      let rawDate = $(el).find('.link-footer .date .text, .date, time').first().text().replace(/\s+/g, ' ').trim();
      if (!rawDate) rawDate = $(el).text().replace(/\s+/g, ' ').trim();

      const dateMatch = rawDate.match(/(\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4})/i) || rawDate.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{4})/);
      let cleanDate = dateMatch ? dateMatch[1] : '';

      if (cleanDate) {
        title = title.replace(new RegExp('\\s*' + cleanDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'i'), '').trim();
      }
      title = title.replace(/\s*\d{1,2}\s+[A-Za-zÇĞİÖŞÜçğıöşü]+\s+\d{4}\s*$/i, '').trim();
      title = title.replace(/\s*\d{1,2}[./-]\d{1,2}[./-]\d{4}\s*$/i, '').trim();

      let href = $(el).attr('href') || '';

      if (title && !title.toLowerCase().includes('tüm etkinlikler') && title.length > 5 && !seenTitles.has(title)) {
        seenTitles.add(title);
        if (href && !href.startsWith('http')) {
          href = `https://www.kilis.edu.tr${href.startsWith('/') ? '' : '/'}${href}`;
        }
        if (img && !img.startsWith('http')) {
          img = `https://www.kilis.edu.tr${img.startsWith('/') ? '' : '/'}${img}`;
        }

        events.push({
          id: `event-${events.length + 1}`,
          title: title,
          date: cleanDate || '02 Ekim 2026',
          location: 'Konum için bilgi afişini referans alın.',
          url: href,
          img: img,
          category: 'Etkinlik'
        });
      }
    });

    if (events.length > 0) {
      cachedEvents = events;
      cachedEventsTime = Date.now();
      return res.json(events);
    }

    // Fallback events
    res.json([
      { id: 'ev-1', title: "Gazze'de Öğrenci Olmak: Resim Sergisi", date: '02 Ekim 2026', location: 'Konum için bilgi afişini referans alın.', category: 'Sergi' },
      { id: 'ev-2', title: '1. Kilis Kitap Fuarı: Program Akışı', date: '02 Ekim 2026', location: 'Konum için bilgi afişini referans alın.', category: 'Fuar & Söyleşi' },
      { id: 'ev-3', title: 'Bilim İletişimi Buluşmaları: Kitap Kahramanları Aramızda', date: '02 Ekim 2026', location: 'Konum için bilgi afişini referans alın.', category: 'Sempozyum' },
      { id: 'ev-4', title: 'Modernleşmenin Kavşağında Türkiye Konferansı', date: '02 Ekim 2026', location: 'Konum için bilgi afişini referans alın.', category: 'Konferans' }
    ]);
  } catch (error) {
    console.error('Events fetch error:', error);
    res.json([
      { id: 'ev-1', title: "Gazze'de Öğrenci Olmak: Resim Sergisi", date: '02 Ekim 2026', location: 'Konum için bilgi afişini referans alın.', category: 'Sergi' },
      { id: 'ev-2', title: '1. Kilis Kitap Fuarı: Program Akışı', date: '02 Ekim 2026', location: 'Konum için bilgi afişini referans alın.', category: 'Fuar & Söyleşi' }
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
      server: { middlewareMode: true },
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
