const axios = require('axios');
const cheerio = require('cheerio');

async function test(url) {
  const r = await axios.get(url);
  const $ = cheerio.load(r.data);
  const boxImg = $('.announcement-detail-content-box > img, .announcement-detail-card > img, .announcement-detail-content-box img').first().attr('src');
  const textImg = $('.announcement-detail-text img').first().attr('src');
  console.log(url, '\n  boxImg:', boxImg, '\n  textImg:', textImg);
}

async function run() {
  await test('https://mmf.kilis.edu.tr/tr/announcements-detail/1514');
  await test('https://mmf.kilis.edu.tr/tr/announcements-detail/1397');
  await test('https://iibf.kilis.edu.tr/tr/announcements-detail/1496');
  await test('https://ilahiyat.kilis.edu.tr/tr/announcements-detail/1494');
}
run();
