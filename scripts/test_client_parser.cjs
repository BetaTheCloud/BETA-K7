const axios = require('axios');
const cheerio = require('cheerio');

async function test(url) {
  const res = await axios.get(url);
  const rawHtml = res.data;
  const origin = new URL(url).origin;
  const $ = cheerio.load(rawHtml);

  console.log('\n========================================');
  console.log('Testing Parser for:', url);

  // 1. Attachments
  const attachments = [];
  $('table.course-list-table tbody tr, .courses-list table tbody tr, .course-list-table tbody tr, table tbody tr, #files tr, .announcement-attached-documents tr').each((_, tr) => {
    const link = $(tr).find('a').first();
    const downloadLink = $(tr).find('a[download]').length ? $(tr).find('a[download]') : link;
    const onclickAttr = $(tr).attr('onclick') || '';
    const onclickMatch = onclickAttr.match(/get_url\(['"]([^'"]+)['"]\)/);
    const href = downloadLink.attr('href') || link.attr('href') || (onclickMatch ? onclickMatch[1] : undefined);
    const name = link.text().trim() || downloadLink.attr('download') || $(tr).find('td').first().text().trim();
    if (href) attachments.push({ name, href });
  });
  console.log('Detected attachments count:', attachments.length, attachments);

  // 2. Diğer Duyurular (Sidebars and Navigation)
  console.log('Detected .other-announcements-sidebar count:', $('.other-announcements-sidebar').length);
  console.log('Detected .other-announcements-list count:', $('.other-announcements-list').length);
  console.log('Detected .announcement-navigation count:', $('.announcement-navigation').length);

  // 3. What is the real content container?
  console.log('.announcement-detail-text text:', $('.announcement-detail-text').text().trim());
  console.log('.content-block text length:', $('.content-block').text().trim().length);
}

async function run() {
  await test('https://turkdili.kilis.edu.tr/tr/announcements-detail/1512');
  await test('https://turkdili.kilis.edu.tr/tr/announcements-detail/1380');
}

run();
