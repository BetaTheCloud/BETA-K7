function safeEncodeUrl(url) {
  if (!url) return '';
  try {
    let clean = url.trim().replace(/\\/g, '/');
    try {
      clean = decodeURI(clean);
    } catch {}
    return encodeURI(clean);
  } catch {
    return encodeURI(url.trim());
  }
}

const input = '/subdomain_files/turkdili/photos/108/WhatsApp Image 2026-10-06 at 18.04.41.jpeg';
console.log('Result for relative:', safeEncodeUrl(input));

const inputFull = 'https://turkdili.kilis.edu.tr/subdomain_files/turkdili/photos/108/WhatsApp Image 2026-10-06 at 18.04.41.jpeg';
console.log('Result for full:', safeEncodeUrl(inputFull));

// Test axios get on both
const axios = require('axios');
axios.get(safeEncodeUrl(inputFull)).then(r => {
  console.log('Full URL download status:', r.status, 'Content-Type:', r.headers['content-type']);
}).catch(e => {
  console.log('Full URL download error:', e.message);
});
