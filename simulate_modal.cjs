const axios = require('axios');
const cheerio = require('cheerio');

// We simulate DetailModal client-side parsing and server-side parsing on 1380
async function run() {
  const url = 'https://turkdili.kilis.edu.tr/tr/announcements-detail/1380';
  
  // 1. Let's call /api/detail via HTTP
  const apiRes = await axios.get('http://localhost:3000/api/detail?url=' + encodeURIComponent(url));
  console.log('--- /api/detail RESPONSE ---');
  console.log('Title:', apiRes.data.title);
  console.log('ImageUrl:', apiRes.data.imageUrl);
  console.log('Attachments:', apiRes.data.attachments);
  console.log('ContentHtml:', JSON.stringify(apiRes.data.contentHtml));

  // 2. What happens in client DetailModal with this data?
  const initialContent = 'Türk Dili ve Edebiyatı Bölümü Oryantasyon Programı';
  const initialImageUrl = '';
  const item = {
    url,
    title: 'Türk Dili ve Edebiyatı Bölümü Oryantasyon Programı',
    content: initialContent,
    imageUrl: initialImageUrl
  };

  console.log('\n--- DETAIL MODAL RENDERING SIMULATION ---');
  // Does featuredImage show?
  const featuredImage = item.imageUrl || initialImageUrl || apiRes.data.imageUrl || '';
  console.log('featuredImage in modal:', featuredImage);

  // Does contentHtml show?
  const contentHtml = apiRes.data.contentHtml;
  console.log('contentHtml has text?', contentHtml && contentHtml.trim().length > 0);
  console.log('contentHtml contains img tag?', contentHtml && contentHtml.includes('<img'));
  console.log('What img tag is in contentHtml?', contentHtml.match(/<img[^>]+>/g));
}

run();
