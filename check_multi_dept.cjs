const axios = require('axios');
const cheerio = require('cheerio');

async function checkDept(url, name) {
  try {
    const res = await axios.get(url, { timeout: 7000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(res.data);
    const links = [];
    $('a[href*="announcements-detail"], a[href*="announcement-detail"]').each((i, el) => {
      const h = $(el).attr('href');
      if (h && !links.includes(h)) links.push(h);
    });
    console.log(`\n=== ${name} (${url}) Found ${links.length} links ===`);
    for (const link of links.slice(0, 3)) {
      try {
        let fullLink = link.startsWith('http') ? link : new URL(link, url).href;
        const detRes = await axios.get(fullLink, { timeout: 7000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const det$ = cheerio.load(detRes.data);
        const imgs = [];
        det$('img').each((_, im) => {
          const s = det$(im).attr('src');
          if (s && !s.includes('logo') && !s.includes('icon') && !s.endsWith('.svg')) imgs.push(s);
        });
        const textLen = det$('.announcement-detail-text, .content-block, article, .news-detail-text').text().trim().length;
        console.log(`Link: ${fullLink} | Title: "${det$('h1').text().trim().slice(0, 30)}" | Imgs: ${imgs.length} (${imgs[0]?.slice(0, 50)}) | TextLen: ${textLen}`);
      } catch (e) {
        console.log(`Link ${link} failed:`, e.message);
      }
    }
  } catch (err) {
    console.log(`Dept ${name} failed:`, err.message);
  }
}

async function run() {
  await checkDept('https://mmf.kilis.edu.tr/tr/announcements-all', 'MMF');
  await checkDept('https://iibf.kilis.edu.tr/tr/announcements-all', 'İİBF');
  await checkDept('https://ilahiyat.kilis.edu.tr/tr/announcements-all', 'İlahiyat');
  await checkDept('https://egitim.kilis.edu.tr/tr/announcements-all', 'Eğitim');
}
run();
