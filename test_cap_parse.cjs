const axios = require('axios');
const cheerio = require('cheerio');

async function testCapacitorParser() {
  const url = 'https://turkdili.kilis.edu.tr/tr/announcements-detail/1380';
  const res = await axios.get(url, { headers: { 'Accept': 'text/html' } });
  const rawHtml = res.data;

  // Let's inspect what happens in cleanDetailContentHtml:
  // In DetailModal.tsx:
  // 1. contentBox = doc.querySelector('.announcement-detail-text')
  // 2. contentHtml = contentBox.innerHTML
  // 3. cleanDetailContentHtml(contentHtml, imageUrl, title, attachments.length)
  const $ = cheerio.load(rawHtml);
  const contentBox = $('.announcement-detail-text');
  console.log('contentBox text:', contentBox.text().trim());
  console.log('contentBox html:', contentBox.html());
  
  // What is imageUrl?
  let imageUrl = '';
  const firstImg = contentBox.find('img').first();
  let src = firstImg.attr('src');
  console.log('firstImg src:', src);
}
testCapacitorParser();
