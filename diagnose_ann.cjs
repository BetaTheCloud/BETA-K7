const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const res = await axios.get('https://turkdili.kilis.edu.tr/tr/announcements-all', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 8000
    });
    console.log('STATUS:', res.status);
    const $ = cheerio.load(res.data);
    const links = [];
    $('a[href*="announcements-detail"]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const img = $(el).find('img').attr('src');
      links.push({ href, text: text.slice(0, 40), img });
    });
    console.log('Found announcements-detail links:', links.length);
    console.log(links.slice(0, 8));
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
