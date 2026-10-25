const axios = require('axios');
const cheerio = require('cheerio');

async function test(url) {
  console.log('Testing image announcement:', url);
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  console.log('Images in HTML:');
  $('img').each((i, el) => {
    console.log(i, $(el).attr('src') || $(el).attr('data-src'));
  });
  console.log('Paragraphs:');
  $('p').each((i, el) => {
    console.log(i, $(el).text().trim());
  });

  const apiRes = await axios.get('http://localhost:3000/api/detail?url=' + encodeURIComponent(url));
  console.log('API title:', apiRes.data.title);
  console.log('API imageUrl:', apiRes.data.imageUrl);
  console.log('API contentHtml:', apiRes.data.contentHtml);
}

test('https://itbf.kilis.edu.tr/tr/news-detail/1589');
