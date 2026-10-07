import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Loader2, ArrowLeft, Calendar, Building2, Tag, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { getApiUrl, safeFetch } from '../config';

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
  const activeTitle = item?.title || title || '';
  const activeUrl = item?.url || url || '';
  const initialImageUrl = item?.imageUrl || '';
  const initialImages = item?.images && item.images.length > 0 ? item.images : (item?.imageUrl ? [item.imageUrl] : []);
  const initialContent = item?.content || '';
  const initialDate = item?.date || '';
  const initialDept = item?.departmentName || item?.facultyName || item?.category || '';

  const [contentHtml, setContentHtml] = useState<string | null>(null);
  const [featuredImage, setFeaturedImage] = useState<string>(initialImageUrl);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialImages);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const img = item?.imageUrl || initialImageUrl || '';
      const imgs = item?.images && item.images.length > 0 ? item.images : (img ? [img] : []);
      setFeaturedImage(img);
      setGalleryImages(imgs);
      setImgError(false);
      setContentHtml(null);
      setError(false);
      setActiveLightboxImg(null);

      if (activeUrl && activeUrl.startsWith('http')) {
        setLoading(true);
        safeFetch(getApiUrl(`/api/detail?url=${encodeURIComponent(activeUrl)}`))
          .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
          })
          .then(data => {
            if (data.contentHtml) {
              setContentHtml(data.contentHtml);
            }
            if (data.imageUrl && !img) {
              setFeaturedImage(data.imageUrl);
              setImgError(false);
            }
            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
              setGalleryImages(prev => Array.from(new Set([...prev, ...data.images])));
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
  }, [isOpen, activeUrl, initialImageUrl, initialContent, item]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal / Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-[#fcfbf9] dark:bg-[#264653] md:rounded-2xl rounded-t-2xl shadow-2xl md:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[92vh] md:max-h-[88vh] flex flex-col md:border border-[#e6e2d6] dark:border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9]/95 dark:bg-[#264653]/95 backdrop-blur-md sticky top-0 z-10 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-700 dark:text-white text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shrink-0 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
                <span>Geri Dön</span>
              </button>

              <h2 className="text-xs md:text-sm font-display font-bold text-stone-900 dark:text-white leading-tight line-clamp-1 flex-1 text-center px-1">
                {activeTitle}
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 transition-colors text-stone-500 dark:text-stone-300 shrink-0 cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Area */}
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
                </div>
              )}

              {/* Title inside article body for full readability */}
              <h1 className="font-display font-bold text-lg sm:text-xl text-stone-900 dark:text-white leading-snug">
                {activeTitle}
              </h1>

              {/* Featured News Image (Prominent & High-Quality) */}
              {featuredImage && !imgError && (
                <div className="relative group rounded-2xl overflow-hidden bg-stone-100 dark:bg-black/30 border border-stone-200/80 dark:border-white/10 shadow-md">
                  <img
                    src={featuredImage}
                    alt={activeTitle}
                    className="w-full max-h-[380px] object-cover object-center transition-transform duration-300 group-hover:scale-[1.01]"
                    onError={() => {
                      setImgError(true);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setActiveLightboxImg(featuredImage)}
                    className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                    title="Büyük boyutta gör"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Görseli Büyüt</span>
                  </button>
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
                    prose-img:rounded-xl prose-img:mx-auto prose-img:shadow-md prose-img:border prose-img:border-stone-200 dark:prose-img:border-white/10
                    prose-headings:font-display prose-headings:font-bold prose-headings:text-stone-900 dark:prose-headings:text-white"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : initialContent ? (
                <div className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed space-y-2 pt-1">
                  <p>{initialContent}</p>
                </div>
              ) : null}

              {/* Additional Gallery Images if Available */}
              {galleryImages && galleryImages.length > 1 && (
                <div className="pt-4 border-t border-stone-200/70 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-white">
                    <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Haber Fotoğraf Galerisi ({galleryImages.length} Görsel)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {galleryImages.map((gImg, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setFeaturedImage(gImg);
                          setActiveLightboxImg(gImg);
                        }}
                        className={cn(
                          "relative rounded-xl overflow-hidden h-24 bg-stone-100 dark:bg-white/5 border transition-all cursor-pointer group",
                          featuredImage === gImg
                            ? "border-amber-500 ring-2 ring-amber-500/40"
                            : "border-stone-200 dark:border-white/10 hover:border-amber-500/60"
                        )}
                      >
                        <img
                          src={gImg}
                          alt={`Fotoğraf ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 border-t border-[#e6e2d6] dark:border-white/10 bg-[#f4f1ea] dark:bg-[#264653] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-800 dark:text-white text-xs font-semibold transition-all border border-stone-300 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
                <span>Kapat</span>
              </button>

              {activeUrl && activeUrl.startsWith('http') && (
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all text-xs font-bold shadow-md shadow-amber-600/25 active:scale-95 cursor-pointer"
                >
                  <span>Resmi Sayfada Aç</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Fullscreen Lightbox / Zoom Modal */}
          <AnimatePresence>
            {activeLightboxImg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveLightboxImg(null)}
                className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => setActiveLightboxImg(null)}
                  className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={activeLightboxImg}
                  alt={activeTitle}
                  className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
