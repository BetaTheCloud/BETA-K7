import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getApiUrl } from '../config';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function DetailModal({ isOpen, onClose, url, title }: DetailModalProps) {
  const [contentHtml, setContentHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      setLoading(true);
      setError(false);
      setContentHtml(null);
      
      fetch(getApiUrl(`/api/detail?url=${encodeURIComponent(url)}`))
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          setContentHtml(data.contentHtml);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(true);
          setLoading(false);
        });
    }
  }, [isOpen, url]);

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal / Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-[#fcfbf9] dark:bg-[#264653] md:rounded-xl rounded-t-xl shadow-2xl md:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] md:max-h-[85vh] flex flex-col md:border border-[#e6e2d6] dark:border-white/10"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 md:p-6 border-b border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9]/80 dark:bg-[#264653]/80 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-lg md:text-xl font-display font-bold pr-8 text-stone-900 dark:text-white leading-tight">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 transition-colors text-stone-500"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-stone-500">
                  <Loader2 strokeWidth={1.5} className="w-8 h-8 animate-spin mb-4 text-amber-600 dark:text-amber-500" />
                  <p>Önizleme yükleniyor...</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-10 text-stone-500">
                  <p className="mb-4 text-center">Önizleme çekilirken bir hata oluştu veya bu sayfa engellendi.</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-md font-medium hover:bg-amber-700 transition-colors tracking-wide text-sm uppercase"
                  >
                    Orijinal Sayfada Aç <ExternalLink strokeWidth={1.5} className="w-4 h-4" />
                  </a>
                </div>
              )}

              {contentHtml && !loading && !error && (
                <>
                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <p className="text-sm text-amber-800 dark:text-amber-200/80 font-medium leading-relaxed">
                      Bu sadece bir önizlemedir. Ekler, dosyalar ve tüm detaylar için lütfen orijinal sayfayı ziyaret edin.
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-xs font-semibold uppercase tracking-widest"
                    >
                      Daha Fazla Bilgi İçin Tıklayın <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                    </a>
                  </div>
                  <div 
                    className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                      prose-p:text-stone-700 dark:prose-p:text-stone-300
                      prose-a:text-amber-600 dark:prose-a:text-amber-500
                      prose-img:rounded-md prose-img:mx-auto prose-img:border prose-img:border-[#e6e2d6] dark:prose-img:border-stone-800
                      prose-headings:font-display prose-headings:font-bold prose-headings:text-stone-900 dark:prose-headings:text-white"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                </>
              )}
            </div>

            {/* Footer */}
            {!loading && !error && (
              <div className="p-4 border-t border-[#e6e2d6] dark:border-white/10 bg-[#f4f1ea] dark:bg-[#264653] flex justify-end">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 dark:bg-white/10 text-white dark:text-white/90 rounded-md hover:bg-stone-800 dark:hover:bg-stone-700 transition-colors text-xs font-semibold uppercase tracking-widest border border-transparent dark:border-stone-700"
                >
                  Orijinal Sayfada Aç <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
