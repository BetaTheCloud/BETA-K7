import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import qs from 'qs';
import * as cheerio from 'cheerio';
import https from 'https';
import cors from 'cors';

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
        if (text.includes('Yarıyıl Ders Planı')) {
             const m = text.match(/(\d+)\.\s*Yarıyıl/i);
             if (m) currentSemester = parseInt(m[1], 10);
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

app.get('/api/announcements', async (req, res) => {
  try {
    if (req.query.force !== 'true' && Date.now() - cachedAnnouncementsTime < CACHE_TTL && cachedAnnouncements.length > 0) {
      return res.json(cachedAnnouncements);
    }
    
    const announcements: any[] = [];
    
    // Main Announcements
    try {
      const response = await axiosInstance.get('https://www.kilis.edu.tr/tr/duyurular');
      const $ = cheerio.load(response.data);
      $('a.full-link-item').each((i, el) => {
        let title = $(el).find('.title-wrapper .text').text().replace(/\s+/g, ' ').trim();
        let dateStr = $(el).find('.link-footer .date .text').text().replace(/\s+/g, ' ').trim();
        if (!title) title = $(el).text().replace(/\s+/g, ' ').trim();
        
        announcements.push({
          id: `ann-main-${i}`,
          title: title,
          date: dateStr || new Date().toISOString(),
          content: '',
          category: 'Ana Duyurular',
          url: $(el).attr('href')
        });
      });
    } catch(e) { console.error('Main ann fetch error'); }

    // Faculty Announcements
    await processInChunks(FACULTIES, 5, async (fac, index) => {
      try {
        const facRes = await axiosInstance.get(`${fac.url}/tr`);
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
        // Silently handle to avoid spamming the user console
      }
    });

    cachedAnnouncements = announcements;
    cachedAnnouncementsTime = Date.now();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
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
      const response = await axiosInstance.get('https://www.kilis.edu.tr/tr/haberler');
      const $ = cheerio.load(response.data);
      $('a.full-link-item').each((i, el) => {
        let title = $(el).find('.title-wrapper .text').text().replace(/\s+/g, ' ').trim();
        let dateStr = $(el).find('.link-footer .date .text').text().replace(/\s+/g, ' ').trim();
        if (!title) title = $(el).text().replace(/\s+/g, ' ').trim();
        
        news.push({
          id: `news-main-${i}`,
          title: title,
          date: dateStr || new Date().toISOString(),
          content: '',
          category: 'Üniversite Haberleri',
          url: $(el).attr('href')
        });
      });
    } catch(e) { console.error('Main news fetch error'); }

    // Faculty News
    await processInChunks(FACULTIES, 5, async (fac, index) => {
      try {
        const facRes = await axiosInstance.get(`${fac.url}/tr`);
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

    cachedNews = news;
    cachedNewsTime = Date.now();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/menu', async (req, res) => {
  try {
    const response = await axiosInstance.get('https://sks.kilis.edu.tr/tr/page/5088');
    const $ = cheerio.load(response.data);
    const menuItems: any[] = [];
    
    $('table tr').each((i, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 5) {
        const dateStr = $(tds[0]).text().trim();
        const mainDish = $(tds[1]).text().trim();
        const sideDish = $(tds[2]).text().trim();
        const soup = $(tds[3]).text().trim();
        const dessert = $(tds[4]).text().trim();
        
        if (mainDish && !mainDish.includes('1.YEMEK') && !dateStr.toLowerCase().includes('menüsü')) {
          menuItems.push({
            id: `menu-${i}`,
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
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
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

    if (events.length > 0) {
      cachedCalendar = events;
      cachedCalendarTime = Date.now();
      return res.json(events);
    }

    // Fallback to cached or empty
    res.json(cachedCalendar);
  } catch (error) {
    console.error('Failed to fetch academic calendar:', error);
    if (cachedCalendar.length > 0) {
      return res.json(cachedCalendar);
    }
    res.status(500).json({ error: 'Failed to fetch academic calendar' });
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
