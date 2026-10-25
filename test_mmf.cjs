const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const r = await axios.get('https://mmf.kilis.edu.tr/tr/announcements-detail/1514');
  const $ = cheerio.load(r.data);
  $('img').each((i, el) => {
    console.log(i, $(el).attr('src'), 'Parent:', $(el).parent().attr('class'), 'GP:', $(el).parent().parent().attr('class'));
  });
}
test();
