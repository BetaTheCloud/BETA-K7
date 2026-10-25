const axios = require('axios');

async function test(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log(url, 'STATUS:', res.status, 'TYPE:', typeof res.data, 'LEN:', typeof res.data === 'string' ? res.data.length : JSON.stringify(res.data).length);
  } catch(e) {
    console.log(url, 'FAILED:', e.message, e.response?.status, e.response?.data);
  }
}

async function run() {
  await test('https://turkdili.kilis.edu.tr/tr/announcements-detail/1380');
  await test('https://turkdili.kilis.edu.tr/tr/announcements-detail/1512');
  await test('https://itbf.kilis.edu.tr/tr/announcements-detail/1380');
}
run();
