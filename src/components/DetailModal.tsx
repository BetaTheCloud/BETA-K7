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
  FileText,
  Image as ImageIcon,
  ZoomIn,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { cleanDuplicateTitle, ensureSafeUrl, cn, areImagesEqual, getImageSignature } from '../lib/utils';
import { getApiUrl, safeFetch } from '../config';
import { openExternalUrl } from '../lib/openExternal';

export interface AttachmentItem {
  name: string;
  url: string;
  extension?: string;
  size?: string;
}

/**
 * Modernizes and cleans scraped HTML for university announcement bodies:
 * - Removes raw file tables (since they are shown in the dedicated Attachments card)
 * - Removes duplicate headings that repeat the modal title
 * - PRESERVES all legitimate text paragraphs and links (never deletes text just for mentioning title)
 * - Converts image URLs to safe-encoded absolute URLs
 * - Styles data tables for mobile and dark mode
 */
function cleanDetailContentHtml(
  html?: string | null,
  coverImg?: string,
  title?: string,
  baseUrl?: string
): string {
  if (!html || typeof window === 'undefined') return html || '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const origin = baseUrl ? new URL(baseUrl).origin : window.location.origin;

    // 1. Remove raw file attachment boxes since they are displayed in the structured section
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

    // 2. Remove ONLY duplicate headings that literally just repeat the page title
    if (normTitle) {
      const headings = doc.querySelectorAll('h1, h2, .announcement-detail-title, .news-detail-title, .inner-page__content-header');
      headings.forEach((el) => {
        const text = cleanDuplicateTitle(el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (text && (text === normTitle || text === cleanTitle.toLowerCase())) {
          el.remove();
        }
      });
    }

    // Remove noise elements and unstyled sliders
    doc.querySelectorAll(
      '.announcement-icon-separator, .title-list, .photo-gallery-header, .swiper-button-next, .swiper-button-prev, .swiper-pagination'
    ).forEach((el) => el.remove());

    // 3. Ensure images have safe URLs and prevent duplicating the cover hero image in contentHtml
    const seenSrcs = new Set<string>();

    doc.querySelectorAll('img').forEach((imgEl) => {
      let rawSrc = (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '').trim();
      if (!rawSrc) {
        imgEl.remove();
        return;
      }
      if (!rawSrc.startsWith('http')) {
        rawSrc = `${origin}${rawSrc.startsWith('/') ? '' : '/'}${rawSrc}`;
      }
      const isNoise = rawSrc.includes('logo') || rawSrc.includes('icon') || rawSrc.includes('flag') || rawSrc.endsWith('.svg');
      if (isNoise) {
        imgEl.remove();
        return;
      }

      const safeSrc = ensureSafeUrl(rawSrc);
      const isSameAsCover = coverImg ? areImagesEqual(safeSrc, coverImg) : false;
      const sig = getImageSignature(safeSrc);
      const isDuplicate = isSameAsCover || seenSrcs.has(safeSrc.toLowerCase()) || (sig ? seenSrcs.has(sig) : false);

      if (isDuplicate) {
        // If the duplicate image was wrapped inside an <a> with no extra text, remove the whole wrapper
        const parentAnchor = imgEl.closest('a');
        if (parentAnchor && (!parentAnchor.textContent || !parentAnchor.textContent.trim())) {
          parentAnchor.remove();
        } else {
          imgEl.remove();
        }
      } else {
        seenSrcs.add(safeSrc.toLowerCase());
        if (sig) seenSrcs.add(sig);
        imgEl.setAttribute('src', safeSrc);
        imgEl.removeAttribute('srcset');
        imgEl.className = 'w-full max-h-[500px] object-contain rounded-xl my-3 shadow-xs border border-stone-200/90 dark:border-white/10 cursor-zoom-in';
      }
    });

    // 4. Modernize data tables for mobile and dark mode
    doc.querySelectorAll('table').forEach((tbl) => {
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

    // 5. Ensure all links have target="_blank" and safe URLs
    doc.querySelectorAll('a').forEach((aEl) => {
      let href = (aEl.getAttribute('href') || '').trim();
      if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        href = `${origin}${href.startsWith('/') ? '' : '/'}${href}`;
      }
      if (href) {
        aEl.setAttribute('href', ensureSafeUrl(href));
      }
      aEl.setAttribute('target', '_blank');
      aEl.setAttribute('rel', 'noopener noreferrer');
      const style = aEl.getAttribute('style') || '';
      if (style) {
        aEl.setAttribute('style', style.replace(/color:\s*[^;]+;?/gi, ''));
      }
    });

    // 6. Clean empty paragraphs or divs
    doc.querySelectorAll('div, p, span').forEach((el) => {
      if (el.children.length === 0 && (!el.textContent || el.textContent.trim() === '' || el.textContent.trim() === '&nbsp;')) {
        el.remove();
      }
    });

    const rawText = (doc.body.textContent || '').replace(/\u00a0/g, ' ').trim();
    const hasMedia = doc.querySelectorAll('img, table, iframe, a').length > 0;
    if (!rawText && !hasMedia) {
      return '';
    }

    return doc.body.innerHTML;
  } catch {
    return html || '';
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
    const origin = baseUrl ? new URL(baseUrl).origin : '';

    const add = (name: string, url: string) => {
      if (!url) return;
      let full = url.trim();
      if (!full.startsWith('http') && origin) {
        full = `${origin}${full.startsWith('/') ? '' : '/'}${full}`;
      }

      const lowerUrl = full.toLowerCase();
      const isNoiseDoc =
        lowerUrl.includes('oa_yonerge.pdf') ||
        lowerUrl.includes('hizmet%20ici') ||
        lowerUrl.includes('stratejik%20plan') ||
        lowerUrl.includes('kurumsal%20izleme') ||
        lowerUrl.includes('odul%20yonergesi');

      if (isNoiseDoc) return;

      let cName = name.trim().replace(/\s+/g, ' ');
      const lower = cName.toLowerCase();
      if (!cName || lower === 'tıklayınız.' || lower === 'tıklayınız' || lower === 'tıklayın' || lower === 'indir' || lower === 'döküman indir' || cName === '.') {
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
      else if (cName.match(/\.([a-zA-Z0-9]{2,5})$/)) ext = cName.match(/\.([a-zA-Z0-9]{2,5})$/)![1].toUpperCase();
      else if (full.includes('/file/')) ext = 'PDF';

      const safe = ensureSafeUrl(full);
      if (!seen.has(safe)) {
        seen.add(safe);
        list.push({ name: cName, url: safe, extension: ext || 'FILE' });
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

    doc.querySelectorAll('#files a, .announcement-detail-content-box a, .announcement-detail-card a, article a').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      const lower = href.toLowerCase();
      if (
        lower.includes('/file/') ||
        lower.includes('/contentfiles/') ||
        lower.includes('/documentfiles/') ||
        lower.includes('/subdomain_files/') ||
        lower.endsWith('.pdf') || lower.includes('.pdf?') ||
        lower.endsWith('.doc') || lower.endsWith('.docx') ||
        lower.endsWith('.xls') || lower.endsWith('.xlsx') ||
        lower.endsWith('.zip') || lower.endsWith('.rar') ||
        lower.includes('drive.google.com/file')
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
 * Direct client-side announcement parser (used natively in Capacitor or on direct fetch fallback)
 */
function parseUniversityAnnouncementHtml(rawHtml: string, pageUrl: string) {
  if (!rawHtml || typeof window === 'undefined') {
    return { title: '', contentHtml: '', attachments: [] as AttachmentItem[], imageUrl: '', images: [] as string[] };
  }
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

      const lowerUrl = fullUrl.toLowerCase();
      if (
        lowerUrl.includes('oa_yonerge.pdf') ||
        lowerUrl.includes('hizmet%20ici') ||
        lowerUrl.includes('stratejik%20plan') ||
        lowerUrl.includes('kurumsal%20izleme') ||
        lowerUrl.includes('odul%20yonergesi')
      ) {
        return;
      }

      let cleanName = (rawName || '').trim().replace(/\s+/g, ' ');
      const lowerName = cleanName.toLowerCase();
      if (
        !cleanName ||
        lowerName === 'tıklayınız.' ||
        lowerName === 'tıklayınız' ||
        lowerName === 'tıklayın' ||
        lowerName === 'indir' ||
        lowerName === 'döküman indir' ||
        lowerName === 'doküman indir' ||
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

      const safeUrl = ensureSafeUrl(fullUrl);
      if (!seenUrls.has(safeUrl)) {
        seenUrls.add(safeUrl);
        attachments.push({ name: cleanName, url: safeUrl, extension: ext || 'FILE' });
      }
    };

    // Scrape files from tables and containers
    doc.querySelectorAll('#files tr, .course-list-table tr, .courses-list tr, table tr').forEach((tr) => {
      const link = tr.querySelector('a');
      const downloadLink = tr.querySelector('a[download]') || link;
      const href = downloadLink?.getAttribute('href') || link?.getAttribute('href') || tr.getAttribute('onclick')?.match(/get_url\(['"]([^'"]+)['"]\)/)?.[1];
      const name = link?.textContent?.trim() || downloadLink?.getAttribute('download') || tr.querySelector('td')?.textContent?.trim() || '';
      if (href && (href.includes('/file/') || href.includes('.pdf') || href.includes('.doc') || href.includes('.xls') || downloadLink?.getAttribute('download'))) {
        addAttachment(name, href);
      }
    });

    const contentBox = doc.querySelector('.announcement-detail-content-box, .announcement-detail-card, .announcement-detail-wrapper, .announcement-detail-layout, .inner-page__content-description, .announcement-detail-text, .news-detail-text, article');

    if (contentBox) {
      contentBox.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href');
        if (!href) return;
        const lower = href.toLowerCase();
        if (
          lower.includes('/file/') ||
          lower.includes('/contentfiles/') ||
          lower.includes('/documentfiles/') ||
          lower.includes('/subdomain_files/') ||
          lower.endsWith('.pdf') || lower.includes('.pdf?') ||
          lower.endsWith('.doc') || lower.endsWith('.docx') ||
          lower.endsWith('.xls') || lower.endsWith('.xlsx') ||
          lower.endsWith('.zip') || lower.endsWith('.rar') ||
          lower.includes('drive.google.com/file')
        ) {
          const name = a.textContent?.trim() || a.getAttribute('download') || '';
          addAttachment(name, href);
        }
      });
    }

    // 3. Images
    const images: string[] = [];
    let imageUrl = '';

    const addImg = (raw?: string | null) => {
      if (!raw) return;
      let src = raw.trim();
      if (!src.startsWith('http')) {
        src = `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
      }
      const isNoise = src.includes('logo') || src.includes('icon') || src.includes('flag') || src.endsWith('.svg');
      if (!isNoise) {
        const safe = ensureSafeUrl(src);
        if (safe && !images.includes(safe)) {
          images.push(safe);
          if (!imageUrl) imageUrl = safe;
        }
      }
    };

    const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (ogImg) addImg(ogImg);

    doc.querySelectorAll('.announcement-detail-content-box img, .announcement-detail-text img, .swiper-slide img, .inner-page__image img, .detail-image img, article img').forEach((el) => {
      addImg(el.getAttribute('src') || el.getAttribute('data-src'));
    });

    // 4. Content HTML
    let contentHtml = '';
    if (contentBox) {
      const textNode = contentBox.querySelector('.announcement-detail-text, .news-detail-text, .inner-page__content-description') || contentBox;
      contentHtml = textNode.innerHTML;
    }

    const cleaned = cleanDetailContentHtml(contentHtml, imageUrl, title, pageUrl);
    return { title, contentHtml: cleaned, attachments, imageUrl, images };
  } catch (err) {
    console.warn('parseUniversityAnnouncementHtml failed:', err);
    return { title: '', contentHtml: '', attachments: [] as AttachmentItem[], imageUrl: '', images: [] as string[] };
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
  url?: string;
  title?: string;
}

export default function DetailModal({ isOpen, onClose, item, url, title }: DetailModalProps) {
  const rawTitle = item?.title || title || '';
  const activeTitle = cleanDuplicateTitle(rawTitle);
  const activeUrl = item?.url || url || '';
  const initialImageUrl = item?.imageUrl ? ensureSafeUrl(item.imageUrl) : '';
  const initialContent = item?.content || '';
  const initialDate = item?.date || '';
  const initialDept = item?.departmentName || item?.facultyName || item?.category || '';

  const [contentHtml, setContentHtml] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>(item?.attachments || []);
  const [featuredImage, setFeaturedImage] = useState<string>(initialImageUrl);
  const [allImages, setAllImages] = useState<string[]>(item?.images && item.images.length > 0 ? item.images.map(ensureSafeUrl) : (initialImageUrl ? [initialImageUrl] : []));
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const img = item?.imageUrl ? ensureSafeUrl(item.imageUrl) : initialImageUrl;
      setFeaturedImage(img);
      setImgError(false);
      setContentHtml(null);
      setAttachments(item?.attachments || []);
      setError(false);
      setCopiedLink(false);
      setZoomImage(null);
      setActiveImageIndex(0);

      const deduplicateImagesList = (list: string[]): string[] => {
        const result: string[] = [];
        const seenSigs = new Set<string>();
        for (const raw of list) {
          if (!raw) continue;
          const safe = ensureSafeUrl(raw);
          const sig = getImageSignature(safe);
          const isDup = result.some((item) => areImagesEqual(item, safe)) || (sig ? seenSigs.has(sig) : false);
          if (!isDup) {
            if (sig) seenSigs.add(sig);
            result.push(safe);
          }
        }
        return result;
      };

      const initImages = deduplicateImagesList(item?.images && item.images.length > 0 ? item.images : (img ? [img] : []));
      setAllImages(initImages);

      if (activeUrl && activeUrl.startsWith('http')) {
        setLoading(true);

        // A. Native Capacitor HTTP direct fetch (if in mobile app)
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
                  if (parsed.images.length > 0) setAllImages(deduplicateImagesList(parsed.images));
                  setLoading(false);
                  return true;
                }
              }
            } catch (nativeErr) {
              console.warn('Capacitor direct fetch notice:', nativeErr);
            }
          }
          return false;
        };

        tryNativeDirect().then((success) => {
          if (success) return;

          // B. Full-stack proxy endpoint /api/detail
          safeFetch(getApiUrl(`/api/detail?url=${encodeURIComponent(activeUrl)}&_t=${Date.now()}`))
            .then((res) => {
              if (!res.ok) throw new Error('Network response was not ok');
              return res.json();
            })
            .then((data) => {
              const safeImg = data.imageUrl ? ensureSafeUrl(data.imageUrl) : img;
              if (safeImg) {
                setFeaturedImage(safeImg);
                setImgError(false);
              }

              const rawImages = Array.isArray(data.images) && data.images.length > 0 ? data.images : (safeImg ? [safeImg] : []);
              const cleanImages = deduplicateImagesList(rawImages);
              setAllImages(cleanImages);

              let currentAttachments = Array.isArray(data.attachments) ? data.attachments : [];
              if (currentAttachments.length === 0 && data.contentHtml) {
                currentAttachments = extractAttachmentsFromHtml(data.contentHtml, activeUrl);
              }

              // Filter out duplicate image attachments that are already shown as cover/gallery images
              const nonDuplicateAttachments = currentAttachments.filter((att) => {
                if (!att || !att.url) return false;
                const ext = (att.extension || '').toUpperCase();
                const isImg = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'AVIF'].includes(ext);
                if (isImg) {
                  const isAlreadyCoverOrGallery = (safeImg && areImagesEqual(safeImg, att.url)) || cleanImages.some((cImg) => areImagesEqual(cImg, att.url));
                  if (isAlreadyCoverOrGallery) {
                    return false;
                  }
                }
                return true;
              });

              if (nonDuplicateAttachments.length > 0) {
                setAttachments(nonDuplicateAttachments);
              } else {
                setAttachments([]);
              }

              if (data.contentHtml && data.contentHtml.trim().length > 0) {
                setContentHtml(cleanDetailContentHtml(data.contentHtml, safeImg, activeTitle, activeUrl));
              } else if (initialContent) {
                setContentHtml(null); // Will render initialContent nicely
              } else {
                setContentHtml('');
              }

              setLoading(false);
            })
            .catch((err) => {
              console.warn('Detail fetch notice:', err?.message || err);
              // Fallback to initialContent if available
              if (initialContent) {
                setContentHtml(null);
              }
              if (!initialContent && !img && (!attachments || attachments.length === 0)) {
                setError(true);
              }
              setLoading(false);
            });
        });
      }
    }
  }, [isOpen, activeUrl, initialImageUrl, initialContent, item, activeTitle]);

  // Lock body scroll when modal is open and bind Escape key / back event
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (zoomImage) {
            setZoomImage(null);
          } else {
            onClose();
          }
        }
      };
      const handleHeaderBack = (e: Event) => {
        e.preventDefault();
        if (zoomImage) {
          setZoomImage(null);
        } else {
          onClose();
        }
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
  }, [isOpen, zoomImage, onClose]);

  if (typeof document === 'undefined') return null;

  const currentDisplayImage = allImages.length > 0 ? allImages[activeImageIndex] : featuredImage;
  const hasMultipleImages = allImages.length > 1;

  const handleCopyLink = () => {
    if (!activeUrl) return;
    try {
      navigator.clipboard.writeText(activeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col md:items-center md:justify-center overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative z-10 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl bg-[#fcfbf9] dark:bg-[#1d3540] flex flex-col md:rounded-2xl shadow-2xl overflow-hidden md:border border-[#e6e2d6] dark:border-white/10"
          >
            {/* Header */}
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

              <div className="flex-1 text-center truncate px-2">
                <span className="text-xs sm:text-sm font-display font-bold text-stone-800 dark:text-stone-200 leading-tight truncate block">
                  {item?.category || (item?.departmentName ? `${item.departmentName} Duyurusu` : 'Duyuru Detayı')}
                </span>
                {initialDept && (
                  <span className="text-[10px] text-stone-500 dark:text-white/50 truncate block">
                    {initialDept}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {activeUrl && (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 text-stone-500 dark:text-stone-300 transition-colors cursor-pointer"
                    title="Bağlantıyı Kopyala"
                    aria-label="Bağlantıyı Kopyala"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 transition-colors text-stone-500 dark:text-stone-300 cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5" strokeWidth={1.8} />
                </button>
              </div>
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
                  {attachments.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25">
                      <Paperclip className="w-3 h-3" />
                      <span>{attachments.length} Ekli Dosya</span>
                    </span>
                  )}
                </div>
              )}

              {/* Title inside article body for full readability */}
              <h1 className="font-display font-extrabold text-lg sm:text-2xl text-stone-900 dark:text-white leading-snug">
                {activeTitle}
              </h1>

              {/* Featured / Carousel Images */}
              {currentDisplayImage && (
                <div className="space-y-2">
                  <div className="rounded-2xl overflow-hidden bg-stone-100/90 dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/10 shadow-sm relative group">
                    {!imgError ? (
                      <>
                        <img
                          src={currentDisplayImage}
                          alt={activeTitle}
                          className="w-full max-h-[520px] object-contain rounded-xl transition-all cursor-zoom-in bg-stone-50 dark:bg-black/20"
                          loading="lazy"
                          onClick={() => setZoomImage(currentDisplayImage)}
                          onError={() => setImgError(true)}
                        />
                        <button
                          type="button"
                          onClick={() => setZoomImage(currentDisplayImage)}
                          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Büyüt</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-6 text-center space-y-2 bg-stone-50 dark:bg-stone-900/40">
                        <ImageIcon className="w-8 h-8 mx-auto text-amber-600/70 dark:text-amber-400/70" />
                        <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
                          Duyuru Görseli
                        </p>
                        <a
                          href={currentDisplayImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => openExternalUrl(currentDisplayImage, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
                        >
                          <span>Görseli Aç / İndir</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Multiple image switcher thumbnails */}
                  {hasMultipleImages && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 custom-scrollbar">
                      {allImages.map((imgSrc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveImageIndex(idx);
                            setImgError(false);
                          }}
                          className={cn(
                            "w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer relative",
                            activeImageIndex === idx
                              ? "border-amber-500 ring-2 ring-amber-500/30 scale-105"
                              : "border-stone-200 dark:border-white/10 opacity-70 hover:opacity-100"
                          )}
                        >
                          <img
                            src={imgSrc}
                            alt={`Görsel ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Loading State for Additional Content */}
              {loading && !contentHtml && (
                <div className="flex flex-col items-center justify-center py-8 text-stone-500 space-y-2">
                  <Loader2 strokeWidth={2} className="w-7 h-7 animate-spin text-amber-600 dark:text-amber-400" />
                  <p className="text-xs font-medium">Duyuru içeriği ve ekli belgeler yükleniyor...</p>
                </div>
              )}

              {/* Error Notice Only if No Initial Content and No Image */}
              {error && !contentHtml && !initialContent && attachments.length === 0 && !featuredImage && (
                <div className="p-6 bg-stone-50 dark:bg-white/5 border border-[#e6e2d6] dark:border-white/10 rounded-2xl text-center space-y-3">
                  <p className="text-xs text-stone-500 dark:text-white/60">
                    Önizleme sunucusuna ulaşılamadı. Duyurunun tamamını ve ekli dosyalarını resmi web sayfasından görüntüleyebilirsiniz.
                  </p>
                  {activeUrl && (
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => openExternalUrl(activeUrl, e)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
                    >
                      <span>Resmi Sayfada Aç</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Scraped HTML Content */}
              {contentHtml && contentHtml.trim().length > 0 ? (
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none pt-1
                    prose-p:text-stone-800 dark:prose-p:text-stone-200 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base
                    prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:font-bold hover:prose-a:underline
                    prose-img:rounded-xl prose-img:mx-auto prose-img:max-h-[500px] prose-img:object-contain prose-img:shadow-sm prose-img:border prose-img:border-stone-200 dark:prose-img:border-white/10 prose-img:cursor-zoom-in
                    prose-headings:font-display prose-headings:font-bold prose-headings:text-stone-900 dark:prose-headings:text-white"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const clickedImg = target.closest('img');
                    if (clickedImg && clickedImg.src) {
                      e.preventDefault();
                      setZoomImage(clickedImg.src);
                      return;
                    }
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
              ) : initialContent && cleanDuplicateTitle(initialContent).trim().length > 0 ? (
                <div className="text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed space-y-2 pt-1 font-normal bg-stone-50 dark:bg-white/5 p-4 rounded-xl border border-stone-200/60 dark:border-white/10">
                  <p>{initialContent}</p>
                </div>
              ) : !loading && attachments.length > 0 ? (
                /* Informative card when announcement body consists solely of file attachment (e.g. Exam Timetable) */
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                      Resmi Ekli Belge Duyurusu
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-white/70 mt-0.5 leading-relaxed">
                      Bu duyuru metin yerine resmi döküman/çizelge olarak yayınlanmıştır. Aşağıdaki ekli belgeleri ve dosyaları cihazınıza indirebilir veya tek dokunuşla görüntüleyebilirsiniz.
                    </p>
                  </div>
                </div>
              ) : !loading && currentDisplayImage ? (
                /* Informative card when announcement is an image poster */
                <div className="p-4 rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-xs text-stone-600 dark:text-white/70">
                    Duyuru afiş formatında yayınlanmıştır. Yukarıdaki görseli büyüterek detayları inceleyebilirsiniz.
                  </p>
                </div>
              ) : !loading ? (
                /* Fallback if university page didn't provide additional text */
                <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                      {activeTitle}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-white/60 mt-1">
                      Bu duyuruya ait ek açıklamaları ve güncellemeleri aşağıdaki "Resmi Sayfada Aç" düğmesini kullanarak ilgili birimin web sayfasında görebilirsiniz.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Attached Documents & Files Section */}
              {attachments.length > 0 && (
                <div className="rounded-2xl p-4 sm:p-5 bg-stone-100/90 dark:bg-stone-900/60 border border-stone-200/90 dark:border-white/10 space-y-3.5 shadow-xs my-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 dark:bg-amber-400/15 flex items-center justify-center text-amber-700 dark:text-amber-300">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-stone-900 dark:text-white">
                          Ekli Belgeler ve Dosyalar ({attachments.length})
                        </h3>
                        <p className="text-[10px] text-stone-500 dark:text-white/50">
                          Resmi kurum dökümanları ve sınav/ders listeleri
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md">
                      Dokun ve İndir
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {attachments.map((file, idx) => {
                      const ext = (file.extension || '').toUpperCase();
                      const isPdf = ext === 'PDF' || file.name.toLowerCase().endsWith('.pdf');
                      const isDoc = ext === 'DOC' || ext === 'DOCX';
                      const isXls = ext === 'XLS' || ext === 'XLSX';
                      const isImg = ext === 'JPG' || ext === 'JPEG' || ext === 'PNG';

                      return (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => openExternalUrl(file.url, e)}
                          className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-amber-400/50 shadow-2xs hover:shadow-xs transition-all group active:scale-[0.99] cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[11px] shrink-0 transition-transform group-hover:scale-105 shadow-2xs',
                                isPdf
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25'
                                  : isDoc
                                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25'
                                  : isXls
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                                  : isImg
                                  ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25'
                                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                              )}
                            >
                              {isPdf ? (
                                'PDF'
                              ) : isDoc ? (
                                'DOC'
                              ) : isXls ? (
                                <FileSpreadsheet className="w-4 h-4" />
                              ) : (
                                ext || 'FILE'
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-stone-400 dark:text-white/40 flex items-center gap-1.5 mt-0.5">
                                <span>{isPdf ? 'PDF Belgesi' : isDoc ? 'Word Belgesi' : isXls ? 'Excel Tablosu' : isImg ? 'Görsel Dosyası' : 'Dosya Eki'}</span>
                                <span>·</span>
                                <span className="text-amber-600 dark:text-amber-400 font-bold">Görüntüle / İndir</span>
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

          {/* Fullscreen Image Lightbox Modal */}
          {zoomImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/95 flex flex-col justify-between p-3 sm:p-5"
            >
              <div className="flex items-center justify-between text-white shrink-0 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)]">
                <span className="text-xs font-semibold text-white/70 truncate max-w-[70%]">
                  {activeTitle}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={zoomImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => openExternalUrl(zoomImage, e)}
                    className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Kaydet</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setZoomImage(null)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center overflow-auto p-2">
                <img
                  src={zoomImage}
                  alt={activeTitle}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              </div>

              <div className="text-center text-[11px] text-white/50 shrink-0 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
                Kapatmak için sağ üstteki çarpıya dokunun veya ESC tuşuna basın
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
