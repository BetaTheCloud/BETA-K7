import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getCalendarEvents } from '../mockData';
import { CalendarEvent } from '../types';
import { classifyCalendarEvent } from '../utils/calendarClassifier';
import { Calendar as CalendarIcon, BookOpen, Flag, Bookmark, GraduationCap, ListFilter, RefreshCw } from 'lucide-react';
import LoadingState from '../components/LoadingState';

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string>('Tümü');

  const loadData = async (force: boolean = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getCalendarEvents(force);
      // Run robust classification on all events
      const classified = data.map(classifyCalendarEvent);
      // Tarihe göre sırala
      classified.sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeA - timeB;
      });
      setEvents(classified);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  if (loading) {
    return <LoadingState message="Akademik Takvim Yükleniyor..." subtitle="2026-2027 öğretim yılı ve tatil verileri alınıyor" />;
  }

  const getTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return <BookOpen strokeWidth={1.5} className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
      case 'registration': return <Bookmark strokeWidth={1.5} className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      case 'holiday': return <Flag strokeWidth={1.5} className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      default: return <GraduationCap strokeWidth={1.5} className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    }
  };

  const getTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20';
      case 'registration': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20';
      case 'holiday': return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
      default: return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
    }
  };

  const getTypeName = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return 'Sınav / Not';
      case 'registration': return 'Kayıt / Başvuru';
      case 'holiday': return 'Resmi Tatil';
      default: return 'Akademik Dönem';
    }
  };

  const formatDate = (dateString: string, rawFallback?: string) => {
    if (!dateString) return rawFallback || '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return rawFallback || dateString;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Grouping logic - ordered terms
  const presentTerms: string[] = Array.from(new Set(events.map(e => e.term || 'Diğer')));
  const standardOrder: string[] = ['Güz Yarıyılı', 'Bahar Yarıyılı', 'Resmi Tatiller', 'Lisansüstü'];
  const orderedPresentTerms: string[] = [
    ...standardOrder.filter(t => presentTerms.includes(t)),
    ...presentTerms.filter(t => !standardOrder.includes(t))
  ];
  const terms: string[] = ['Tümü', ...orderedPresentTerms];
  
  const filteredEvents = selectedTerm === 'Tümü' 
    ? events 
    : events.filter(e => (e.term || 'Diğer') === selectedTerm);

  // Group filtered events by term for display
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const term = event.term || 'Diğer';
    if (!acc[term]) acc[term] = [];
    acc[term].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <header className="mb-8 border-b border-[#e6e2d6] dark:border-teal-700/50 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-stone-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
              <CalendarIcon className="w-6 h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            </div>
            Akademik Takvim
          </h2>
          <p className="text-stone-500 dark:text-teal-100/70 text-sm mt-3 font-medium tracking-wide">
            2026-2027 Eğitim Öğretim Yılı (Lisans, Lisansüstü & Resmi Tatiller)
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <ListFilter className="w-4 h-4 text-stone-400 mr-1 shrink-0" strokeWidth={2} />
          {terms.map(term => (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors ${
                selectedTerm === term 
                  ? 'bg-stone-900 text-white dark:bg-[#fcfbf9] dark:text-[#1d3540]' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#264653] dark:text-teal-100/70 dark:hover:bg-teal-900/40 border border-transparent dark:border-teal-700/50'
              }`}
            >
              {term}
            </button>
          ))}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Takvimi Yenile"
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors ml-1"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </header>

      <div className="space-y-10">
        {orderedPresentTerms.filter(t => groupedEvents[t]).map((term) => {
          const termEvents = groupedEvents[term];
          const isHolidayTerm = term === 'Resmi Tatiller';

          return (
            <div key={term} className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e6e2d6]/60 dark:border-teal-700/40 pb-2">
                <h3 className="text-xl font-display font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isHolidayTerm ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  {term}
                </h3>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {termEvents.length} Etkinlik
                </span>
              </div>
              
              <div className="relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-100 dark:before:bg-teal-700/40 space-y-6">
                {termEvents.map((event) => (
                  <div key={event.id} className="relative group">
                    <div className="absolute -left-[32.5px] bg-[#fcfbf9] dark:bg-[#1d3540] p-1.5 rounded-full border-2 border-stone-100 dark:border-teal-700/50 z-10 text-stone-500 transition-colors group-hover:border-amber-500/30 dark:group-hover:border-amber-500/30">
                      {getTypeIcon(event.type)}
                    </div>
                    
                    <div className={`bg-[#fcfbf9] dark:bg-[#264653] border rounded-2xl p-5 ml-4 shadow-sm hover:shadow-md transition-shadow ${
                      event.type === 'holiday' 
                        ? 'border-amber-500/30 dark:border-amber-500/30 bg-gradient-to-r from-amber-500/[0.03] to-transparent' 
                        : 'border-[#e6e2d6] dark:border-teal-700/50'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-stone-600 dark:text-teal-50">
                          <span className={event.type === 'holiday' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-amber-600 dark:text-amber-400'}>
                            {formatDate(event.date, event.rawStart)}
                          </span>
                          {(event.endDate || event.rawEnd) && (
                            <>
                              <span className="text-stone-300 dark:text-teal-700/80">-</span>
                              <span className={event.type === 'holiday' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-amber-600 dark:text-amber-400'}>
                                {formatDate(event.endDate || '', event.rawEnd)}
                              </span>
                            </>
                          )}
                        </div>
                        <span className={`text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-md uppercase ${getTypeColor(event.type)}`}>
                          {getTypeName(event.type)}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-[17px] text-stone-900 dark:text-white leading-snug">
                        {event.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

