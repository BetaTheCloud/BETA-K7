const axios = require('axios');
const cheerio = require('cheerio');

async function check() {
  const res = await axios.get('https://www.kilis.edu.tr/tr/duyurular');
  const $ = cheerio.load(res.data);
  const links = [];
  $('a[href*="announcements-detail"], a[href*="duyuru"]').each((i, el) => {
    let href = $(el).attr('href');
    if (href && !links.includes(href)) {
      if (!href.startsWith('http')) href = 'https://www.kilis.edu.tr' + (href.startsWith('/') ? '' : '/') + href;
      links.push(href);
    }
  });

  console.log('Found main announcement links:', links.slice(0, 5));

  for (const url of links.slice(0, 5)) {
    try {
      const pageRes = await axios.get(url);
      const $page = cheerio.load(pageRes.data);
      const imgs = $page('img').length;
      console.log('URL:', url, 'Images count:', imgs, 'Title:', $page('h1').text().trim().slice(0, 50));
      
      const apiRes = await axios.get(`http://localhost:3000/api/detail?url=${encodeURIComponent(url)}`);
      console.log('  API contentHtml length:', (apiRes.data.contentHtml || '').length);
      console.log('  API imageUrl:', apiRes.data.imageUrl);
      console.log('  API images count:', (apiRes.data.images || []).length);
    } catch (e) {
      console.error('Error for', url, e.message);
    }
  }
}

check();
