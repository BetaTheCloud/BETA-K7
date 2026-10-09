import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Loader2, ArrowLeft, Calendar, Building2, Newspaper, Megaphone } from 'lucide-react';
import { cleanDuplicateTitle } from '../lib/utils';
import { getApiUrl, safeFetch } from '../config';
import { openExternalUrl } from '../lib/openExternal';

/**
 * Strips redundant repeated headings and duplicate cover images from scraped HTML.
 * Ensures that titles and images are never rendered twice inside the modal.
 */
function cleanDetailContentHtml(html?: string | null, coverImg?: string, title?: string): string {
  if (!html || typeof window === 'undefined') return html || '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const cleanTitle = cleanDuplicateTitle(title || '');
    const normTitle = cleanTitle.replace(/\s+/g, ' ').trim().toLowerCase();

    // 1. Remove duplicate headings matching the page title or being the main h1 inside content
    if (normTitle) {
      const headings = doc.querySelectorAll('h1, h2, h3, .title, .announcement-detail-title, .news-detail-title, .inner-page__content-header');
      headings.forEach((el) => {
        const text = cleanDuplicateTitle(el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (text && (text === normTitle || normTitle.includes(text) || text.includes(normTitle))) {
          el.remove();
        }
      });
    }

    // 2. Remove duplicate images matching the cover image or already seen
    const seenSrcs = new Set<string>();
    const normalizeImgKey = (urlStr: string): string => {
      if (!urlStr) return '';
      let s = urlStr.trim();
      try { s = decodeURIComponent(s); } catch {}
      return s.split('/').pop()?.split('?')[0]?.trim().toLowerCase() || '';
    };

    if (coverImg) {
      const normCover = normalizeImgKey(coverImg);
      if (normCover) seenSrcs.add(normCover);
      seenSrcs.add(coverImg.trim().toLowerCase());
    }

    const images = doc.querySelectorAll('img');
    images.forEach((imgEl) => {
      const rawSrc = (imgEl.getAttribute('src') || '').trim();
      const normKey = normalizeImgKey(rawSrc);

      if (
        (normKey && seenSrcs.has(normKey)) ||
        (rawSrc && seenSrcs.has(rawSrc.toLowerCase()))
      ) {
        // Remove image element and any lonely empty parent container
        const parent = imgEl.parentElement;
        imgEl.remove();
        if (parent && parent.children.length === 0 && !parent.textContent?.trim()) {
          parent.remove();
        }
      } else if (normKey) {
        seenSrcs.add(normKey);
        if (rawSrc) seenSrcs.add(rawSrc.toLowerCase());
      }
    });

    // 3. Mark all anchor tags for external opening
    const links = doc.querySelectorAll('a');
    links.forEach((aEl) => {
      aEl.setAttribute('target', '_blank');
      aEl.setAttribute('rel', 'noopener noreferrer');
    });

    return doc.body.innerHTML;
  } catch {
    return html;
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

  const [contentHtml, setContentHtml] = useState<string | null>(null);
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
      setError(false);

      if (activeUrl && activeUrl.startsWith('http')) {
        setLoading(true);
        safeFetch(getApiUrl(`/api/detail?url=${encodeURIComponent(activeUrl)}`))
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
            if (data.contentHtml) {
              setContentHtml(cleanDetailContentHtml(data.contentHtml, bestImg, activeTitle));
            }
            setLoading(false);
          })
          .catch(err => {
            console.warn('Detail fetch notice:', err);
            // If we have initialContent or initialImageUrl, we do not mark as fatal error!
            if (!initialContent && !img) {
              setError(true);
            }
            setLoading(false);
          });
      }
    }
  }, [isOpen, activeUrl, initialImageUrl, initialContent, item, activeTitle]);

  // Lock body scroll when modal is open and bind Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
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
              {contentHtml ? (
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none pt-1
                    prose-p:text-stone-700 dark:prose-p:text-stone-300 prose-p:leading-relaxed
                    prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:font-semibold hover:prose-a:underline
                    prose-img:rounded-xl prose-img:mx-auto prose-img:max-h-[500px] prose-img:object-contain prose-img:shadow-sm prose-img:border prose-img:border-stone-200 dark:prose-img:border-white/10
                    prose-headings:font-display prose-headings:font-bold prose-headings:text-stone-900 dark:prose-headings:text-white"
                  onClick={(e) => {
                    const anchor = (e.target as HTMLElement).closest('a');
                    if (anchor && anchor.href) {
                      openExternalUrl(anchor.href, e);
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : initialContent ? (
                <div className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed space-y-2 pt-1">
                  <p>{initialContent}</p>
                </div>
              ) : null}
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
