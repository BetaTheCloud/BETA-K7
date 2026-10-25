const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  // Let's test a news/announcement with image
  const res = await axios.get('https://www.kilis.edu.tr/tr/duyurular');
  const $ = cheerio.load(res.data);
  
  // Find all links
  const urls = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && (href.includes('/duyuru/') || href.includes('/haber/'))) {
      const full = href.startsWith('http') ? href : 'https://www.kilis.edu.tr' + (href.startsWith('/') ? '' : '/') + href;
      if (!urls.includes(full)) urls.push(full);
    }
  });

  console.log('Found URLs:', urls.length);

  for (const u of urls.slice(0, 4)) {
    console.log('\n--- Testing URL:', u);
    const page = await axios.get(u);
    const $p = cheerio.load(page.data);
    const rawImgs = [];
    $p('img').each((_, im) => {
      rawImgs.push($p(im).attr('src'));
    });
    console.log('Raw page images:', rawImgs);
    console.log('Raw page text length:', $p('body').text().trim().length);

    // Call API detail
    const apiRes = await axios.get(`http://localhost:3000/api/detail?url=${encodeURIComponent(u)}`);
    console.log('API title:', apiRes.data.title);
    console.log('API imageUrl:', apiRes.data.imageUrl);
    console.log('API contentHtml length:', (apiRes.data.contentHtml || '').length);
    console.log('API contentHtml sample:', (apiRes.data.contentHtml || '').slice(0, 200));
  }
}

test();
