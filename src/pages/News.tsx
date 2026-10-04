import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getNews, FALLBACK_NEWS } from '../mockData';
import { Announcement } from '../types';
import { ChevronDown, ExternalLink, Maximize2, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import DetailModal from '../components/DetailModal';
import PullToRefresh from '../components/PullToRefresh';
import LoadingState from '../components/LoadingState';

export default function News() {
  const navigate = useNavigate();
  const [news, setNews] = useState<Announcement[]>(() => {
    try {
      const cached = localStorage.getItem('k7_cached_news');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return FALLBACK_NEWS;
  });
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>('Üniversite Haberleri');
  const [selectedItem, setSelectedItem] = useState<{url: string, title: string} | null>(null);

  const load = async (force = false) => {
    const data = await getNews(force);
    if (data && data.length > 0) {
      setNews(data);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    await load(true);
  };

  const categories = Array.from(new Set(news.map(n => n.category)));

  if (loading) {
    return <LoadingState message="Haberler Yükleniyor..." subtitle="Üniversite haberleri güncelleniyor" />;
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <header className="mb-6 border-b border-[#e6e2d6] dark:border-white/10 pb-4">
        <button
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate('/');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold mb-3 transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
          <span>Geri Menüye Dön</span>
        </button>
        <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-white">Haberler</h2>
        <p className="text-stone-500 dark:text-white/60 text-sm mt-2 font-medium tracking-wide">Üniversitemizden en güncel haberler ve etkinlikler.</p>
      </header>

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category} className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              className="w-full flex items-center justify-between p-5 bg-[#f4f1ea]/50 dark:bg-[#264653]/50 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
            >
              <span className="font-display font-bold text-lg text-stone-900 dark:text-white tracking-wide">{category || 'Üniversite Haberleri'}</span>
              <ChevronDown strokeWidth={1.5} className={cn("w-5 h-5 text-stone-400 transition-transform duration-300", activeCategory === category ? "rotate-180 text-amber-600 dark:text-amber-500" : "rotate-0")}
              />
            </button>
            
            <AnimatePresence>
              {activeCategory === category && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653]"
                >
                  <div className="p-5 space-y-5">
                    {news
                      .filter(n => n.category === category)
                      .map((item) => (
                        <div key={item.id} className="pb-5 border-b border-stone-100 dark:border-white/10 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                              {item.category || category || 'Haber'}
                            </span>
                            {item.date && !item.date.includes('T') && (
                              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-white/50">
                                {item.date}
                              </span>
                            )}
                          </div>
                          <h4 className="font-display font-bold text-[1.05rem] sm:text-[1.1rem] leading-snug text-stone-800 dark:text-white/90 mb-3">
                            {item.title}
                          </h4>
                          {item.url && (
                            <button 
                              onClick={() => setSelectedItem({ url: item.url || '', title: item.title })}
                              
                              
                              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors focus:outline-none"
                            >
                              Haberi Oku <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      ))}
                    
                    {news.filter(n => n.category === category).length === 0 && (
                      <p className="text-sm text-stone-500 italic">Bu kategoride güncel haber bulunmamaktadır.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <DetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        url={selectedItem?.url || ''}
        title={selectedItem?.title || ''}
      />
      </motion.div>
    </PullToRefresh>
  );
}
