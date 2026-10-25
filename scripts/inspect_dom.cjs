const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const res = await axios.get('https://turkdili.kilis.edu.tr/tr/announcements-detail/1380');
  const $ = cheerio.load(res.data);
  console.log('--- Checking 1380 structure ---');
  
  console.log('.announcement-detail-layout children:');
  $('.announcement-detail-layout').children().each((i, el) => {
    console.log(i, el.tagName, $(el).attr('class') || $(el).attr('id') || '');
  });

  console.log('\n.announcement-detail-card children:');
  $('.announcement-detail-card').children().each((i, el) => {
    console.log(i, el.tagName, $(el).attr('class') || $(el).attr('id') || '');
  });

  console.log('\nWhere is Diğer Duyurular?');
  $('*').each((i, el) => {
    const t = $(el).text().trim();
    if (t === 'Diğer Duyurular') {
      console.log('Found Diğer Duyurular:', el.tagName, 'class:', $(el).attr('class'), 'parent:', $(el).parent().prop('tagName'), 'parent class:', $(el).parent().attr('class'), 'parent of parent:', $(el).parent().parent().attr('class'));
    }
  });

  console.log('\nWhat are the links under Diğer Duyurular?');
  $('a[href*="announcements-detail"]').each((i, el) => {
    console.log(i, $(el).text().trim(), 'href:', $(el).attr('href'), 'parent container:', $(el).closest('div, section, aside, ul').attr('class'));
  });
}

test();
