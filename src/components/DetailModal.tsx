import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Calendar,
  Building2,
  Paperclip,
  Download,
  FileText
} from 'lucide-react';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { cleanDuplicateTitle, cn } from '../lib/utils';
import { getApiUrl, safeFetch } from '../config';
import { openExternalUrl } from '../lib/openExternal';

export interface AttachmentItem {
  name: string;
  url: string;
  extension?: string;
  size?: string;
}

/**
 * Strips redundant repeated headings, duplicate cover images, and modernizes tables from scraped HTML.
 * Ensures clean rendering in both light and dark mode on mobile and desktop.
 */
function cleanDetailContentHtml(html?: string | null, coverImg?: string, title?: string, attachmentsCount?: number): string {
  if (!html || typeof window === 'undefined') return html || '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Remove raw file attachment boxes when files are extracted
    // This prevents broken, unstyled duplicate tables with white headers and squished red icons
    doc.querySelectorAll('#files, .course-list-table, .courses-list, .flat-all-course, .announcement-attached-documents').forEach((el) => el.remove());

    doc.querySelectorAll('table').forEach((tbl) => {
      const tblText = (tbl.textContent || '').toLowerCase();
      if (
        tblText.includes('döküman ismi') ||
        tblText.includes('doküman ismi') ||
        (tblText.includes('indir') && (tblText.includes('.pdf') || tblText.includes('/file/')))
      ) {
        const parentWrap = tbl.closest('.overflow-x-auto, .course-list-table, .courses-list, #files');
        if (parentWrap) {
          parentWrap.remove();
        } else {
          tbl.remove();
        }
      }
    });

    const cleanTitle = cleanDuplicateTitle(title || '');
    const normTitle = cleanTitle.replace(/\s+/g, ' ').trim().toLowerCase();

    // 2. Remove duplicate headings & paragraphs matching the page title
    if (normTitle) {
      const headings = doc.querySelectorAll('h1, h2, h3, h4, .title, .announcement-detail-title, .news-detail-title, .inner-page__content-header');
      headings.forEach((el) => {
        const text = cleanDuplicateTitle(el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (text && (text === normTitle || normTitle.includes(text) || text.includes(normTitle))) {
          el.remove();
        }
      });

      // Also remove paragraphs or divs that literally just repeat the title
      doc.querySelectorAll('p, div.announcement-detail-text, div.news-detail-text, span, strong, b').forEach((el) => {
        if (el.querySelector('table, img, iframe, video')) return;
        const pText = cleanDuplicateTitle(el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (pText && (pText === normTitle || (normTitle.length > 8 && (pText.includes(normTitle) || normTitle.includes(pText))))) {
          const parent = el.parentElement;
          el.remove();
          if (parent && parent.children.length === 0 && !parent.textContent?.trim()) {
            parent.remove();
          }
        }
      });
    }

    // Remove noisy icons or separators and unstyled duplicate CMS galleries
    doc.querySelectorAll(
      '.announcement-icon-separator, .title-list, .photo-gallery-header, .swiper, .mySwiper, .full-screen-slider, .photo-gallery, .slider, .fotorama'
    ).forEach((el) => el.remove());

    // 3. Robust image deduplication: Ensure no image is shown 2 or 3 times
    const seenSrcs = new Set<string>();
    const normalizeImgKey = (urlStr: string): string => {
      if (!urlStr) return '';
      let s = urlStr.trim();
      try { s = decodeURIComponent(s); } catch {}
      let filename = s.split('/').pop()?.split('?')[0]?.trim().toLowerCase() || '';
      // Strip CMS timestamp prefixes like "1791370207202.WhatsApp..."
      filename = filename.replace(/^\d{10,14}\./, '');
      // Strip thumbnail/preview size prefixes
      filename = filename.replace(/^(thumb_|small_|large_|medium_|cover_|mini_)/, '');
      return filename;
    };

    if (coverImg) {
      const normCover = normalizeImgKey(coverImg);
      if (normCover) seenSrcs.add(normCover);
      seenSrcs.add(coverImg.trim().toLowerCase());
    }

    const images = doc.querySelectorAll('img');
    images.forEach((imgEl) => {
      const rawSrc = (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '').trim();
      const normKey = normalizeImgKey(rawSrc);

      const isNoise = !rawSrc || rawSrc.includes('logo') || rawSrc.includes('icon') || rawSrc.includes('flag') || rawSrc.endsWith('.svg');
      const isDuplicate = isNoise || (normKey && seenSrcs.has(normKey)) || (rawSrc && seenSrcs.has(rawSrc.toLowerCase()));

      if (isDuplicate) {
        const parent = imgEl.parentElement;
        imgEl.remove();
        if (parent && parent.children.length === 0 && !parent.textContent?.trim()) {
          parent.remove();
        }
      } else {
        if (normKey) seenSrcs.add(normKey);
        if (rawSrc) seenSrcs.add(rawSrc.toLowerCase());
      }
    });

    // 4. Modernize legitimate data tables (schedules, plans) for mobile and dark mode
    const tables = doc.querySelectorAll('table');
    tables.forEach((tbl) => {
      tbl.removeAttribute('style');
      tbl.className = 'w-full border-collapse my-3 text-xs sm:text-sm rounded-xl overflow-hidden';
      const parent = tbl.parentElement;
      if (!parent || !parent.classList.contains('overflow-x-auto')) {
        const wrap = doc.createElement('div');
        wrap.className = 'overflow-x-auto -mx-1 sm:mx-0 my-3 rounded-xl border border-stone-200/90 dark:border-white/10 shadow-2xs bg-white dark:bg-stone-900/60';
        parent?.insertBefore(wrap, tbl);
        wrap.appendChild(tbl);
      }
    });

    doc.querySelectorAll('thead').forEach((thGroup) => {
      thGroup.removeAttribute('style');
      thGroup.className = 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100';
    });

    doc.querySelectorAll('tbody').forEach((tb) => {
      tb.removeAttribute('style');
    });

    doc.querySelectorAll('tr').forEach((tr) => {
      tr.removeAttribute('style');
      tr.className = 'hover:bg-stone-50 dark:hover:bg-white/5 transition-colors border-b border-stone-100 dark:border-white/5';
    });

    doc.querySelectorAll('th').forEach((th) => {
      th.removeAttribute('style');
      th.className = 'p-3 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-bold border-b border-stone-200 dark:border-white/10 text-left text-xs';
    });

    doc.querySelectorAll('td').forEach((td) => {
      td.removeAttribute('style');
      td.className = 'p-3 border-b border-stone-100 dark:border-white/5 text-stone-800 dark:text-stone-200 text-xs';
    });

    // 5. Mark all anchor tags for external opening & strip hardcoded color styles
    const links = doc.querySelectorAll('a');
    links.forEach((aEl) => {
      const style = aEl.getAttribute('style') || '';
      if (style) {
        aEl.setAttribute('style', style.replace(/color:\s*[^;]+;?/gi, ''));
      }
      aEl.setAttribute('target', '_blank');
      aEl.setAttribute('rel', 'noopener noreferrer');
    });

    // 6. Clean empty paragraphs or divs
    doc.querySelectorAll('div, p, span').forEach((el) => {
      if (el.children.length === 0 && (!el.textContent || el.textContent.trim() === '' || el.textContent.trim() === '&nbsp;')) {
        el.remove();
      }
    });

    const rawText = (doc.body.textContent || '').replace(/\u00a0/g, ' ').trim();
    const hasMedia = doc.querySelectorAll('img, table, iframe').length > 0;
    if (!rawText && !hasMedia) {
      return '';
    }

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

/**
 * Fallback attachment extractor from HTML in case API response didn't include attachments array
 */
function extractAttachmentsFromHtml(html?: string | null, baseUrl?: string): AttachmentItem[] {
  if (!html || typeof window === 'undefined') return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const list: AttachmentItem[] = [];
    const seen = new Set<string>();

    const add = (name: string, url: string) => {
      if (!url) return;
      let full = url.trim();
      if (!full.startsWith('http') && baseUrl) {
        try {
          const origin = new URL(baseUrl).origin;
          full = `${origin}${full.startsWith('/') ? '' : '/'}${full}`;
        } catch {}
      }
      let cName = name.trim().replace(/\s+/g, ' ');
      if (!cName || cName.toLowerCase() === 'tıklayınız.' || cName.toLowerCase() === 'tıklayınız' || cName.toLowerCase() === 'indir' || cName === '.') {
        const parts = full.split('/');
        try {
          cName = decodeURIComponent(parts[parts.length - 1].split('?')[0]) || 'Döküman İndir';
        } catch {
          cName = parts[parts.length - 1].split('?')[0] || 'Döküman İndir';
        }
      }
      let ext = '';
      const match = full.match(/\.([a-zA-Z0-9]{2,5})(?:[\?#]|$)/);
      if (match) ext = match[1].toUpperCase();
      else if (cName.match(/\.([a-zA-Z0-9]{2,5})$/)) ext = cName.match(/\.([a-zA-Z0-9]{2,5})$/)[1].toUpperCase();
      else if (full.includes('/file/')) ext = 'PDF';

      if (!seen.has(full)) {
        seen.add(full);
        list.push({ name: cName, url: full, extension: ext || 'FILE' });
      }
    };

    doc.querySelectorAll('table.course-list-table tbody tr, .courses-list table tbody tr, .course-list-table tbody tr, table tbody tr').forEach((tr) => {
      const link = tr.querySelector('a');
      const downloadLink = tr.querySelector('a[download]') || link;
      const href = downloadLink?.getAttribute('href') || link?.getAttribute('href') || tr.getAttribute('onclick')?.match(/get_url\(['"]([^'"]+)['"]\)/)?.[1];
      const name = link?.textContent?.trim() || downloadLink?.getAttribute('download') || tr.querySelector('td')?.textContent?.trim() || '';
      if (href && (href.includes('/file/') || href.includes('.pdf') || href.includes('.doc') || href.includes('.xls') || downloadLink?.getAttribute('download'))) {
        add(name, href);
      }
    });

    doc.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href');
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
        const name = a.textContent?.trim() || a.getAttribute('download') || '';
        add(name, href);
      }
    });

    return list;
  } catch {
    return [];
  }
}

/**
 * Direct client-side university announcement parser.
 * Used natively in mobile Capacitor APK to bypass any remote proxy or unpatched backend limitations,
 * and as an instant fallback when HTML is retrieved directly.
 */
function parseUniversityAnnouncementHtml(rawHtml: string, pageUrl: string) {
  if (!rawHtml || typeof window === 'undefined') return { contentHtml: '', attachments: [] as AttachmentItem[], imageUrl: '' };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    const origin = new URL(pageUrl).origin;

    // 1. Title
    const titleEl = doc.querySelector('h1.title, .announcement-detail-title, .news-detail-title, .inner-page__title, h1');
    const title = cleanDuplicateTitle(titleEl?.textContent || '');

    // 2. Attachments
    const attachments: AttachmentItem[] = [];
    const seenUrls = new Set<string>();

    const addAttachment = (rawName: string, rawHref: string) => {
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

    // Table rows
    doc.querySelectorAll('table.course-list-table tbody tr, .courses-list table tbody tr, .course-list-table tbody tr, table tbody tr').forEach((tr) => {
      const link = tr.querySelector('a');
      const downloadLink = tr.querySelector('a[download]') || link;
      const href = downloadLink?.getAttribute('href') || link?.getAttribute('href') || tr.getAttribute('onclick')?.match(/get_url\(['"]([^'"]+)['"]\)/)?.[1];
      const name = link?.textContent?.trim() || downloadLink?.getAttribute('download') || tr.querySelector('td')?.textContent?.trim() || '';
      if (href && (href.includes('/file/') || href.includes('.pdf') || href.includes('.doc') || href.includes('.xls') || downloadLink?.getAttribute('download'))) {
        addAttachment(name, href);
      }
    });

    // Document links
    doc.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href');
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
        const name = a.textContent?.trim() || a.getAttribute('download') || '';
        addAttachment(name, href);
      }
    });

    // 3. Content container
    const contentBox = doc.querySelector('.announcement-detail-content-box, .announcement-detail-card, .announcement-detail-wrapper, .announcement-detail-layout') ||
                      doc.querySelector('.announcement-detail-text') ||
                      doc.querySelector('.inner-page__content-description') ||
                      doc.querySelector('.inner-page__content') ||
                      doc.querySelector('.news-detail-text') ||
                      doc.querySelector('article') ||
                      doc.querySelector('.content-block');

    let contentHtml = '';
    if (contentBox) {
      contentBox.querySelectorAll('h1, h2, h3, .title, .announcement-detail-title, .news-detail-title, .inner-page__content-header').forEach((h) => h.remove());
      contentBox.querySelectorAll('.announcement-icon-separator, .title-list').forEach((s) => s.remove());
      // Remove raw file boxes since they are cleanly extracted into attachments
      contentBox.querySelectorAll('#files, .course-list-table, .courses-list, .flat-all-course, .announcement-attached-documents').forEach((f) => f.remove());
      contentHtml = contentBox.innerHTML;
    }

    // Extract primary featured image (from meta tag, prominent container, or first article image)
    let imageUrl = '';
    const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (ogImg && !ogImg.includes('logo') && !ogImg.includes('default')) {
      imageUrl = ogImg.startsWith('http') ? ogImg : `${origin}${ogImg.startsWith('/') ? '' : '/'}${ogImg}`;
    }

    if (!imageUrl) {
      const imgEl = doc.querySelector('.news-detail-image img, .detail-image img, .announcement-detail-image img, .inner-page__image img');
      let src = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';
      if (src && !src.includes('logo') && !src.includes('icon') && !src.endsWith('.svg')) {
        imageUrl = src.startsWith('http') ? src : `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
      }
    }

    // Fallback: If no imageUrl found yet, check first image in contentBox
    if (!imageUrl && contentBox) {
      const firstImg = contentBox.querySelector('img');
      let src = firstImg?.getAttribute('src') || firstImg?.getAttribute('data-src') || '';
      if (src && !src.includes('logo') && !src.includes('icon') && !src.endsWith('.svg')) {
        imageUrl = src.startsWith('http') ? src : `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
      }
    }

    // Modernize and clean HTML, passing imageUrl so that it is never duplicated inside the article body
    const cleaned = cleanDetailContentHtml(contentHtml, imageUrl, title, attachments.length);

    return { title, contentHtml: cleaned, attachments, imageUrl };
  } catch (err) {
    console.warn('parseUniversityAnnouncementHtml failed:', err);
    return { contentHtml: '', attachments: [] as AttachmentItem[], imageUrl: '' };
  }
}

export interface DetailModalItem {
  url?: string;
  title: string;
  imageUrl?: string;
  images?: string[];
  date?: string;
  category?: string;
  departmentName?: string;
  facultyName?: string;
  content?: string;
  attachments?: AttachmentItem[];
}

export interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: DetailModalItem | null;
  // Legacy backward compatibility
  url?: string;
  title?: string;
}

export default function DetailModal({ isOpen, onClose, item, url, title }: DetailModalProps) {
  const rawTitle = item?.title || title || '';
  const activeTitle = cleanDuplicateTitle(rawTitle);
  const activeUrl = item?.url || url || '';
  const initialImageUrl = item?.imageUrl || '';
  const initialContent = item?.content || '';
  const initialDate = item?.date || '';
  const initialDept = item?.departmentName || item?.facultyName || item?.category || '';

  const shouldShowInitialContent = !!initialContent &&
    cleanDuplicateTitle(initialContent).trim().toLowerCase() !== activeTitle.trim().toLowerCase() &&
    initialContent.trim().length > 0;

  const [contentHtml, setContentHtml] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>(item?.attachments || []);
  const [featuredImage, setFeaturedImage] = useState<string>(initialImageUrl);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const img = item?.imageUrl || initialImageUrl || '';
      setFeaturedImage(img);
      setImgError(false);
      setContentHtml(null);
      setAttachments(item?.attachments || []);
      setError(false);

      if (activeUrl && activeUrl.startsWith('http')) {
        setLoading(true);

        // A. If running in native Capacitor (Android APK), use native CapacitorHttp for 100% direct CORS-free fetch
        const tryNativeDirect = async (): Promise<boolean> => {
          if (Capacitor.isNativePlatform()) {
            try {
              const res = await CapacitorHttp.get({ url: activeUrl });
              if (res.status === 200 && typeof res.data === 'string' && res.data.length > 200) {
                const parsed = parseUniversityAnnouncementHtml(res.data, activeUrl);
                if (parsed.contentHtml !== undefined) {
                  setContentHtml(parsed.contentHtml);
                  if (parsed.attachments.length > 0) setAttachments(parsed.attachments);
                  if (parsed.imageUrl && !img) setFeaturedImage(parsed.imageUrl);
                  setLoading(false);
                  return true;
                }
              }
            } catch (nativeErr) {
              console.warn('Capacitor native direct fetch notice:', nativeErr);
            }
          }
          return false;
        };

        tryNativeDirect().then((success) => {
          if (success) return;

          // B. Otherwise or if fallback needed: call /api/detail
          safeFetch(getApiUrl(`/api/detail?url=${encodeURIComponent(activeUrl)}&_t=${Date.now()}`))
            .then(res => {
              if (!res.ok) throw new Error('Network response was not ok');
              return res.json();
            })
            .then(data => {
              const bestImg = img || data.imageUrl || '';
              if (data.imageUrl && !img) {
                setFeaturedImage(data.imageUrl);
                setImgError(false);
              }

              let currentAttachments = Array.isArray(data.attachments) ? data.attachments : [];
              if (currentAttachments.length === 0 && data.contentHtml) {
                currentAttachments = extractAttachmentsFromHtml(data.contentHtml, activeUrl);
              }
              if (currentAttachments.length > 0) {
                setAttachments(currentAttachments);
              }

              if (data.contentHtml) {
                setContentHtml(cleanDetailContentHtml(data.contentHtml, bestImg, activeTitle, currentAttachments.length));
              } else {
                setContentHtml('');
              }

              // C. If the API response returned no attachments and no content, attempt direct fetch as safety net
              if (currentAttachments.length === 0 && !data.contentHtml) {
                fetch(activeUrl)
                  .then(r => r.text())
                  .then(raw => {
                    const parsed = parseUniversityAnnouncementHtml(raw, activeUrl);
                    if (parsed.attachments.length > 0) setAttachments(parsed.attachments);
                    if (parsed.contentHtml) {
                      setContentHtml(parsed.contentHtml);
                    }
                  })
                  .catch(() => {});
              }

              setLoading(false);
            })
            .catch(err => {
              console.warn('Detail fetch notice:', err);
              // Direct fetch fallback on network error
              fetch(activeUrl)
                .then(r => r.text())
                .then(raw => {
                  const parsed = parseUniversityAnnouncementHtml(raw, activeUrl);
                  if (parsed.contentHtml !== undefined) setContentHtml(parsed.contentHtml);
                  if (parsed.attachments.length > 0) setAttachments(parsed.attachments);
                  setLoading(false);
                })
                .catch(() => {
                  if (!initialContent && !img) setError(true);
                  setLoading(false);
                });
            });
        });
      }
    }
  }, [isOpen, activeUrl, initialImageUrl, initialContent, item, activeTitle]);

  // Lock body scroll when modal is open and bind Escape key / header back event
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      const handleHeaderBack = (e: Event) => {
        e.preventDefault();
        onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('k7_header_back', handleHeaderBack);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('k7_header_back', handleHeaderBack);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col md:items-center md:justify-center overflow-hidden">
          {/* Full viewport Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-0"
          />

          {/* Modal Container: Fullscreen on mobile, centered card on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative z-10 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl bg-[#fcfbf9] dark:bg-[#1d3540] flex flex-col md:rounded-2xl shadow-2xl overflow-hidden md:border border-[#e6e2d6] dark:border-white/10"
          >
            {/* Header: Dedicated safe area padding preventing clash with mobile status bars / headers */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653] shrink-0 gap-3 pt-[calc(env(safe-area-inset-top,0px)+0.65rem)] shadow-sm">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-800 dark:text-white text-xs font-bold transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shrink-0 shadow-sm"
                aria-label="Geri Dön"
              >
                <ArrowLeft className="w-4 h-4 text-rose-600 dark:text-amber-400" />
                <span>Geri Dön</span>
              </button>

              <span className="text-xs sm:text-sm font-display font-bold text-stone-700 dark:text-stone-300 leading-tight truncate flex-1 text-center px-2">
                {item?.category || (item?.departmentName ? `${item.departmentName} Duyurusu` : 'Duyuru Detayı')}
              </span>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 transition-colors text-stone-500 dark:text-stone-300 shrink-0 cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" strokeWidth={1.8} />
              </button>
            </div>

            {/* Scrollable Article Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
              {/* Metadata Badges */}
              {(initialDept || initialDate) && (
                <div className="flex items-center gap-2 flex-wrap pb-1">
                  {initialDept && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                      <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{initialDept}</span>
                    </span>
                  )}
                  {initialDate && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 dark:text-white/60">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{initialDate}</span>
                    </span>
                  )}
                  {item?.category && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                      {item.category}
                    </span>
                  )}
                </div>
              )}

              {/* Title inside article body for full readability */}
              <h1 className="font-display font-bold text-lg sm:text-xl text-stone-900 dark:text-white leading-snug">
                {activeTitle}
              </h1>

              {/* Natural Featured Image without cropping or ZoomIn button */}
              {featuredImage && !imgError && (
                <div className="rounded-2xl overflow-hidden bg-stone-100/90 dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/10 shadow-sm flex items-center justify-center p-2 sm:p-3">
                  <img
                    src={featuredImage}
                    alt={activeTitle}
                    className="w-full max-h-[500px] object-contain rounded-xl transition-all"
                    loading="lazy"
                    onError={() => {
                      setImgError(true);
                    }}
                  />
                </div>
              )}

              {/* Loading State for Additional Scraped Content */}
              {loading && !contentHtml && (
                <div className="flex flex-col items-center justify-center py-6 text-stone-500 space-y-2">
                  <Loader2 strokeWidth={1.8} className="w-6 h-6 animate-spin text-amber-600 dark:text-amber-400" />
                  <p className="text-xs">Detaylı haber içeriği yükleniyor...</p>
                </div>
              )}

              {/* Error Notice Only if No Initial Content Available */}
              {error && !contentHtml && !initialContent && (
                <div className="p-6 bg-stone-50 dark:bg-white/5 border border-[#e6e2d6] dark:border-white/10 rounded-2xl text-center space-y-3">
                  <p className="text-xs text-stone-500 dark:text-white/60">
                    Önizleme sunucusuna ulaşılamadı. Haberin tamamını resmi web sitesinden görüntüleyebilirsiniz.
                  </p>
                  {activeUrl && (
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => openExternalUrl(activeUrl, e)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer"
                    >
                      <span>Resmi Sayfada Aç</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Scraped HTML Content or Fallback Summary Text */}
              {contentHtml && contentHtml.trim().length > 0 ? (
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none pt-1
                    prose-p:text-stone-700 dark:prose-p:text-stone-300 prose-p:leading-relaxed
                    prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:font-semibold hover:prose-a:underline
                    prose-img:rounded-xl prose-img:mx-auto prose-img:max-h-[500px] prose-img:object-contain prose-img:shadow-sm prose-img:border prose-img:border-stone-200 dark:prose-img:border-white/10
                    prose-headings:font-display prose-headings:font-bold prose-headings:text-stone-900 dark:prose-headings:text-white"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const anchor = target.closest('a');
                    if (anchor && anchor.href) {
                      openExternalUrl(anchor.href, e);
                      return;
                    }
                    const tr = target.closest('tr');
                    if (tr) {
                      const trAnchor = tr.querySelector('a');
                      if (trAnchor && trAnchor.href) {
                        openExternalUrl(trAnchor.href, e);
                        return;
                      }
                      const onclickAttr = tr.getAttribute('onclick') || '';
                      const match = onclickAttr.match(/get_url\(['"]([^'"]+)['"]\)/);
                      if (match && match[1]) {
                        openExternalUrl(match[1], e);
                        return;
                      }
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : shouldShowInitialContent ? (
                <div className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed space-y-2 pt-1">
                  <p>{initialContent}</p>
                </div>
              ) : null}

              {/* Attached Documents & Files Section */}
              {attachments.length > 0 && (
                <div className="rounded-2xl p-4 bg-stone-100/90 dark:bg-stone-900/50 border border-stone-200/90 dark:border-white/10 space-y-3 shadow-xs my-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 dark:bg-amber-400/15 flex items-center justify-center text-amber-700 dark:text-amber-300">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200">
                        Ekli Belgeler ve Dosyalar ({attachments.length})
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold text-stone-500 dark:text-white/50">
                      Dokun ve İndir
                    </span>
                  </div>

                  <div className="space-y-2">
                    {attachments.map((file, idx) => {
                      const ext = (file.extension || '').toUpperCase();
                      const isPdf = ext === 'PDF' || file.name.toLowerCase().endsWith('.pdf');
                      const isDoc = ext === 'DOC' || ext === 'DOCX';
                      const isXls = ext === 'XLS' || ext === 'XLSX';

                      return (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => openExternalUrl(file.url, e)}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-amber-400/50 shadow-2xs hover:shadow-xs transition-all group active:scale-[0.99] cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 transition-transform group-hover:scale-105 shadow-2xs',
                                isPdf
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25'
                                  : isDoc
                                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25'
                                  : isXls
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                              )}
                            >
                              {ext || 'FILE'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs text-stone-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-stone-400 dark:text-white/40 flex items-center gap-1.5 mt-0.5">
                                <span>{isPdf ? 'PDF Belgesi' : isDoc ? 'Word Dökümanı' : isXls ? 'Excel Tablosu' : 'Dosya Eki'}</span>
                                <span>·</span>
                                <span className="text-amber-600 dark:text-amber-400 font-medium">İndir / Görüntüle</span>
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-stone-100 dark:bg-white/10 group-hover:bg-amber-600 group-hover:text-white text-stone-600 dark:text-stone-300 transition-all">
                            <Download className="w-4 h-4" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Safe Area padding covering BottomNav */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-[#e6e2d6] dark:border-white/10 bg-[#f4f1ea] dark:bg-[#264653] flex items-center justify-between gap-3 shrink-0 pb-[calc(env(safe-area-inset-bottom,0px)+0.65rem)] shadow-lg">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-800 dark:text-white text-xs font-bold transition-all border border-stone-300 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
                <span>Geri Dön</span>
              </button>

              {activeUrl && activeUrl.startsWith('http') && (
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openExternalUrl(activeUrl, e)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all text-xs font-bold shadow-md shadow-amber-600/25 active:scale-95 cursor-pointer"
                >
                  <span>Resmi Sayfada Aç</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
