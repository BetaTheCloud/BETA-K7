const axios = require('axios');
const cheerio = require('cheerio');

async function inspectHtml() {
  const res = await axios.get('https://turkdili.kilis.edu.tr/tr/announcements-detail/1380', {
    headers: { 'Accept': 'text/html,application/xhtml+xml', 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(res.data);
  
  console.log('--- IMAGES IN ENTIRE PAGE ---');
  $('img').each((i, el) => {
    console.log(`IMG ${i}:`, $(el).attr('src'), 'PARENT:', $(el).parent().attr('class'), 'GRANDPARENT:', $(el).parent().parent().attr('class'));
  });

  console.log('\n--- .announcement-detail-card HTML ---');
  console.log($('.announcement-detail-card').html()?.slice(0, 500));

  console.log('\n--- .announcement-detail-text HTML ---');
  console.log($('.announcement-detail-text').html());

  console.log('\n--- .announcement-detail-content-box HTML ---');
  console.log($('.announcement-detail-content-box').html()?.slice(0, 500));

  console.log('\n--- .announcement-detail-image HTML ---');
  console.log($('.announcement-detail-image').html());
}
inspectHtml();
