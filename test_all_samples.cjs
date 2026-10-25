const axios = require('axios');
const cheerio = require('cheerio');

function testExtraction(rawHtml, pageUrl) {
  const $ = cheerio.load(rawHtml);
  const origin = new URL(pageUrl).origin;

  // 1. EXTRACT ATTACHMENTS FIRST
  const attachments = [];
  const seenAttachmentUrls = new Set();
  const addAttachment = (rawName, rawHref) => {
    if (!rawHref) return;
    let full = rawHref.trim();
    if (!full.startsWith('http')) {
      full = `${origin}${full.startsWith('/') ? '' : '/'}${full}`;
    }
    const isDoc = full.includes('/file/') || full.includes('/document/') || full.includes('/contentfiles/') || 
                  /\.(pdf|docx?|xlsx?|zip|rar)(?:[\?#]|$)/i.test(full);
    if (!isDoc) return;
    let cleanName = (rawName || '').trim().replace(/\s+/g, ' ');
    if (!cleanName || cleanName.toLowerCase().includes('indir') || cleanName === '.') {
      const parts = full.split('/');
      cleanName = parts[parts.length - 1].split('?')[0] || 'Döküman';
    }
    let ext = 'FILE';
    const m = full.match(/\.([a-zA-Z0-9]{2,5})(?:[\?#]|$)/);
    if (m) ext = m[1].toUpperCase();
    else if (full.includes('/file/')) ext = 'PDF';

    if (!seenAttachmentUrls.has(full)) {
      seenAttachmentUrls.add(full);
      attachments.push({ name: cleanName, url: full, extension: ext });
    }
  };

  $('table.course-list-table tbody tr, .courses-list table tbody tr, #files tr, .announcement-attached-documents tr').each((_, tr) => {
    const row = $(tr);
    const link = row.find('a').first();
    const href = link.attr('href') || row.attr('onclick')?.match(/get_url\(['"]([^'"]+)['"]\)/)?.[1];
    const name = link.text().trim() || row.find('td').first().text().trim();
    if (href) addAttachment(name, href);
  });

  $('a').each((_, a) => {
    const href = $(a).attr('href');
    if (href) addAttachment($(a).text().trim(), href);
  });

  // 2. EXTRACT FEATURED IMAGE (CHECK CONTENT BOX & META)
  let imageUrl = '';
  const ogImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
  if (ogImg && !ogImg.includes('logo') && !ogImg.includes('default') && !ogImg.endsWith('.svg')) {
    imageUrl = ogImg.startsWith('http') ? ogImg : `${origin}${ogImg.startsWith('/') ? '' : '/'}${ogImg}`;
  }

  if (!imageUrl) {
    // Check specific prominent containers
    const imgSelectors = [
      '.announcement-detail-content-box > img',
      '.announcement-detail-card > img',
      '.announcement-detail-content-box img',
      '.announcement-detail-card img',
      '.announcement-detail-image img',
      '.news-detail-image img',
      '.detail-image img',
      '.inner-page__image img',
      '.featured-image img',
      '.announcement-detail-text img',
      '.content-block img',
      'article img'
    ];
    for (const sel of imgSelectors) {
      const found = $(sel);
      if (found.length) {
        let src = found.first().attr('src') || found.first().attr('data-src') || '';
        if (src && !src.includes('logo') && !src.includes('icon') && !src.endsWith('.svg')) {
          imageUrl = src.startsWith('http') ? src : `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
          break;
        }
      }
    }
  }

  // 3. SAFE SIDEBAR REMOVAL (ONLY sidebars & navigation, NEVER the content card)
  $(
    '.other-announcements-sidebar, .other-announcements-list, .other-announcements-item, .other-announcements-title, ' +
    '.other-announcements, .sidebar, #sidebar, .right-sidebar, .left-sidebar, .inner-page__sidebar, ' +
    '.sidebar-news, .sidebar-announcements, .sidebar-box, .sidebar-card, ' +
    '.recent-announcements, .latest-announcements, .other-news, ' +
    '.related-announcements, .related-news, .announcements-sidebar, .announcement-sidebar, .news-sidebar, ' +
    '.announcement-navigation, .announcements-navigation, .announcement-prev, .announcement-next, .prev-next, ' +
    '.sidebar-item, .sidebar-widget, aside.sidebar, aside, nav.pagination, .pagination'
  ).remove();

  $('h1, h2, h3, h4, h5, h6, .sidebar-title, .widget-title, .other-announcements-title').each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, ' ').trim().toLowerCase();
    if (
      txt.includes('son duyurular') || txt.includes('diğer duyurular') || txt.includes('diger duyurular') ||
      txt.includes('son haberler') || txt.includes('diğer haberler') || txt.includes('ilgili duyurular')
    ) {
      $(el).closest('.sidebar-box, .widget, .sidebar-card, .sidebar-item, .other-announcements-sidebar').remove();
    }
  });

  // Remove lists containing 2+ links to announcement/news detail
  $('ul, ol, div, nav, section').each((_, container) => {
    const annLinks = $(container).find('a[href*="announcements-detail"], a[href*="announcement-detail"], a[href*="news-detail"]');
    if (annLinks.length >= 2) {
      $(container).remove();
    }
  });

  $('a[href*="announcements-detail"], a[href*="announcement-detail"], a[href*="news-detail"]').each((_, a) => {
    const parentLi = $(a).closest('li, .other-announcements-item');
    if (parentLi.length) parentLi.remove();
    else $(a).remove();
  });

  // 4. CONTENT CONTAINER:
  // Use .announcement-detail-content-box or .announcement-detail-card
  // (which contain BOTH the flyer image and the text, but NOT the sidebar!)
  let contentHtml = '';
  const contentSelectors = [
    '.announcement-detail-content-box',
    '.announcement-detail-card',
    '.inner-page__content-description',
    '.news-detail-text',
    '.announcement-detail-text',
    '.news-content-body',
    '.event-detail-text',
    '.event-detail-content',
    'article'
  ];

  for (const sel of contentSelectors) {
    const el = $(sel);
    if (el.length > 0) {
      // Remove title and icon separators from inside
      el.find('h1, h2, h3, .title, .announcement-detail-title, .news-detail-title, .announcement-icon-separator, .title-list').remove();
      // Remove attachment tables since they are in attachments
      el.find('#files, .course-list-table, .courses-list, .flat-all-course, .announcement-attached-documents').remove();
      contentHtml = el.html() || '';
      break;
    }
  }

  // 5. CLEAN CONTENT HTML & FIX RELATIVE IMAGE PATHS
  if (contentHtml) {
    const $c = cheerio.load(contentHtml, null, false);
    $c('img').each((_, im) => {
      let s = $c(im).attr('src') || $c(im).attr('data-src') || '';
      if (s) {
        if (!s.startsWith('http')) {
          s = `${origin}${s.startsWith('/') ? '' : '/'}${s}`;
          $c(im).attr('src', s);
        }
      }
    });
    contentHtml = $c.html() || '';
  }

  return { imageUrl, attachments, contentHtmlLength: contentHtml.length, hasAmberLinks: contentHtml.includes('announcements-detail') };
}

async function run() {
  const urls = [
    'https://mmf.kilis.edu.tr/tr/announcements-detail/1514',
    'https://turkdili.kilis.edu.tr/tr/announcements-detail/1380',
    'https://turkdili.kilis.edu.tr/tr/announcements-detail/1512',
    'https://egitim.kilis.edu.tr/tr/announcements-detail/1517',
    'https://iibf.kilis.edu.tr/tr/announcements-detail/1496',
    'https://ilahiyat.kilis.edu.tr/tr/announcements-detail/1494'
  ];

  for (const u of urls) {
    try {
      const res = await axios.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 7000 });
      const out = testExtraction(res.data, u);
      console.log(`URL: ${u}`);
      console.log(`  ImageUrl: ${out.imageUrl}`);
      console.log(`  Attachments: ${out.attachments.length} (${out.attachments[0]?.name || ''})`);
      console.log(`  ContentLen: ${out.contentHtmlLength} | HasAmberLinks: ${out.hasAmberLinks}\n`);
    } catch (e) {
      console.log(`URL ${u} FAILED:`, e.message);
    }
  }
}
run();
