const axios = require('axios');
const cheerio = require('cheerio');

function cleanHtml(rawHtml, pageUrl) {
  const $ = cheerio.load(rawHtml);
  const origin = new URL(pageUrl).origin;

  // 1. EXTRACT ATTACHMENTS FIRST
  const attachments = [];
  const seenUrls = new Set();

  const addAttachment = (rawName, rawHref) => {
    if (!rawHref) return;
    let fullUrl = rawHref.trim();
    if (!fullUrl.startsWith('http')) {
      fullUrl = `${origin}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
    }
    let cleanName = (rawName || '').trim().replace(/\s+/g, ' ');
    const lowerName = cleanName.toLowerCase();
    if (
      !cleanName ||
      lowerName === 'tıklayınız.' ||
      lowerName === 'tıklayınız' ||
      lowerName === 'tıklayın' ||
      lowerName === 'tıklayın.' ||
      lowerName === 'indir' ||
      lowerName === 'döküman indir' ||
      lowerName === 'doküman indir' ||
      lowerName === 'tıkla' ||
      cleanName === '.'
    ) {
      const parts = fullUrl.split('/');
      try {
        cleanName = decodeURIComponent(parts[parts.length - 1].split('?')[0]) || 'Döküman İndir';
      } catch {
        cleanName = parts[parts.length - 1].split('?')[0] || 'Döküman İndir';
      }
    }

    let ext = '';
    const extMatch = fullUrl.match(/\.([a-zA-Z0-9]{2,5})(?:[\?#]|$)/);
    if (extMatch) {
      ext = extMatch[1].toUpperCase();
    } else {
      const nameMatch = cleanName.match(/\.([a-zA-Z0-9]{2,5})$/);
      if (nameMatch) {
        ext = nameMatch[1].toUpperCase();
      } else if (fullUrl.includes('/file/')) {
        ext = 'PDF';
      }
    }

    if (!seenUrls.has(fullUrl)) {
      seenUrls.add(fullUrl);
      attachments.push({ name: cleanName, url: fullUrl, extension: ext || 'FILE' });
    }
  };

  // Table rows & onclick handlers for attachments
  $('table.course-list-table tbody tr, .courses-list table tbody tr, .course-list-table tbody tr, table tbody tr, #files tr, .announcement-attached-documents tr').each((_, tr) => {
    const row = $(tr);
    const link = row.find('a').first();
    const downloadLink = row.find('a[download]').length ? row.find('a[download]') : link;
    const onclickAttr = row.attr('onclick') || '';
    const onclickMatch = onclickAttr.match(/get_url\(['"]([^'"]+)['"]\)/);
    const href = downloadLink.attr('href') || link.attr('href') || (onclickMatch ? onclickMatch[1] : undefined);
    const name = link.text().trim() || downloadLink.attr('download') || row.find('td').first().text().trim();
    if (href && (href.includes('/file/') || href.includes('.pdf') || href.includes('.doc') || href.includes('.xls') || downloadLink.attr('download') || onclickMatch)) {
      addAttachment(name, href);
    }
  });

  // All document links
  $('a').each((_, a) => {
    const href = $(a).attr('href');
    if (!href) return;
    const lower = href.toLowerCase();
    if (
      lower.includes('/file/') ||
      lower.includes('/contentfiles/') ||
      lower.includes('/subdomain_files/') ||
      lower.endsWith('.pdf') || lower.includes('.pdf?') ||
      lower.endsWith('.doc') || lower.endsWith('.docx') ||
      lower.endsWith('.xls') || lower.endsWith('.xlsx') ||
      lower.endsWith('.zip') || lower.endsWith('.rar')
    ) {
      const name = $(a).text().trim() || $(a).attr('download') || '';
      addAttachment(name, href);
    }
  });

  // 2. ABSOLUTELY PURGE ALL SIDEBARS, NAVIGATION AND OTHER ANNOUNCEMENTS LISTS
  $(
    '.other-announcements-sidebar, .other-announcements-list, .other-announcements-item, ' +
    '.other-announcements-title, .announcement-navigation, .announcements-navigation, ' +
    '.sidebar, #sidebar, .right-sidebar, .left-sidebar, .inner-page__sidebar, ' +
    '.sidebar-news, .sidebar-announcements, .sidebar-box, .sidebar-card, ' +
    '.recent-announcements, .latest-announcements, .other-announcements, .other-news, ' +
    '.related-announcements, .related-news, .announcements-sidebar, .announcement-sidebar, .news-sidebar, ' +
    '.sidebar-item, .sidebar-widget, aside, .announcements-right, .announcements-left'
  ).remove();

  // Purge any container containing "Diğer Duyurular" or "Son Duyurular"
  $('h1, h2, h3, h4, h5, h6, strong, b').each((_, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim().toLowerCase();
    if (t.includes('diğer duyurular') || t.includes('diger duyurular') || t.includes('son duyurular') || t.includes('ilgili duyurular')) {
      const p = $(el).closest('.other-announcements-sidebar, .sidebar-box, .widget, .card, div');
      if (p.length && p.find('a').length > 1) {
        p.remove();
      } else {
        $(el).nextAll('ul, ol, div').remove();
        $(el).remove();
      }
    }
  });

  // 3. TARGET THE PRECISE CONTENT CONTAINER
  // Priority: .announcement-detail-text is the purest container on department sites!
  let contentEl = $('.announcement-detail-text').first();
  if (!contentEl.length || !contentEl.text().trim()) {
    contentEl = $('.news-detail-text, .content-block, .news-content-body, .inner-page__content-description, .announcement-detail-content-box').first();
  }
  if (!contentEl.length || !contentEl.text().trim()) {
    contentEl = $('article, .inner-page__content .main-content, .inner-page__content').first();
  }

  // Inside contentEl, remove duplicate headers and files table
  contentEl.find('h1, h2, h3, .announcement-detail-title, .news-detail-title, .title-list, .announcement-icon-separator').remove();
  contentEl.find('#files, .course-list-table, .courses-list, .announcement-attached-documents').remove();
  contentEl.find('.other-announcements-sidebar, .other-announcements-list, .announcement-navigation').remove();

  // Remove any stray links pointing to announcements-detail
  contentEl.find('a[href*="announcements-detail"], a[href*="announcement-detail"]').each((_, a) => {
    const href = $(a).attr('href') || '';
    if (!href.includes('/file/')) {
      $(a).remove();
    }
  });

  let contentHtml = contentEl.html() || '';
  const cleanText = contentHtml.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  const hasMedia = contentEl.find('img, table, iframe').length > 0;

  if (!cleanText && !hasMedia) {
    if (attachments.length > 0) {
      contentHtml = `<p>Bu duyuru ekli döküman barındırmaktadır. Detayları aşağıdaki Ekli Belgeler bölümünden inceleyebilirsiniz.</p>`;
    } else {
      contentHtml = '';
    }
  }

  return { attachments, contentHtml, textLength: cleanText.length };
}

async function run() {
  console.log('=== TEST 1: 1512 (Exam timetable with PDF) ===');
  const res1 = await axios.get('https://turkdili.kilis.edu.tr/tr/announcements-detail/1512');
  const out1 = cleanHtml(res1.data, 'https://turkdili.kilis.edu.tr/tr/announcements-detail/1512');
  console.log('Attachments:', out1.attachments);
  console.log('Has amber links:', out1.contentHtml.includes('1354') || out1.contentHtml.includes('1188'));
  console.log('ContentHtml:', out1.contentHtml);

  console.log('\n=== TEST 2: 1380 (Orientation text) ===');
  const res2 = await axios.get('https://turkdili.kilis.edu.tr/tr/announcements-detail/1380');
  const out2 = cleanHtml(res2.data, 'https://turkdili.kilis.edu.tr/tr/announcements-detail/1380');
  console.log('Attachments:', out2.attachments);
  console.log('Has amber links:', out2.contentHtml.includes('1354') || out2.contentHtml.includes('1188') || out2.contentHtml.includes('Final'));
  console.log('ContentHtml:', out2.contentHtml.trim());

  console.log('\n=== TEST 3: 1589 (Workshop news with images) ===');
  const res3 = await axios.get('https://itbf.kilis.edu.tr/tr/news-detail/1589');
  const out3 = cleanHtml(res3.data, 'https://itbf.kilis.edu.tr/tr/news-detail/1589');
  console.log('Attachments:', out3.attachments);
  console.log('ContentHtml text length:', out3.textLength);
  console.log('Images in contentHtml:', (out3.contentHtml.match(/<img/g) || []).length);
}

run();
