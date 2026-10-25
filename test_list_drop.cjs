const axios = require('axios');
const cheerio = require('cheerio');

async function testList() {
  const res = await axios.get('http://localhost:3000/api/department-announcements?deptUrl=https%3A%2F%2Fmmf.kilis.edu.tr%2Ftr%2Fannouncements-all&facultyId=mmf');
  console.log('Total returned by API:', res.data.length);
  res.data.forEach((item, i) => {
    console.log(i, 'TITLE:', item.title.slice(0, 35), 'IMG:', item.imageUrl?.slice(0, 50));
  });

  // Now apply the deduplication from Announcements.tsx:
  const seenUrls = new Set();
  const seenTitles = new Set();
  const seenImages = new Set();
  const deduplicated = [];

  for (const item of res.data) {
    const urlKey = item.url ? item.url.trim().toLowerCase() : '';
    const titleKey = item.title.trim().toLowerCase();
    const imgKey = item.imageUrl ? item.imageUrl.trim().toLowerCase() : '';

    if (urlKey && seenUrls.has(urlKey)) { console.log('DROPPED by url:', item.title); continue; }
    if (titleKey && seenTitles.has(titleKey)) { console.log('DROPPED by title:', item.title); continue; }
    if (imgKey && seenImages.has(imgKey)) { console.log('DROPPED BY IMAGE:', item.title, 'IMG:', imgKey); continue; }

    if (urlKey) seenUrls.add(urlKey);
    if (titleKey) seenTitles.add(titleKey);
    if (imgKey) seenImages.add(imgKey);

    deduplicated.push(item);
  }

  console.log('Deduplicated count:', deduplicated.length);
}
testList();
