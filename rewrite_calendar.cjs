const fs = require('fs');

const code = `import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getCalendarEvents } from '../mockData';
import { CalendarEvent } from '../types';
import { Calendar as CalendarIcon, BookOpen, AlertCircle, Bookmark, CheckCircle2, ChevronDown, ListFilter } from 'lucide-react';

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<string>('Tümü');

  useEffect(() => {
    async function load() {
      const data = await getCalendarEvents();
      // Tarihe göre sırala
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-stone-500">Takvim yükleniyor...</div>
      </div>
    );
  }

  const getTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return <BookOpen strokeWidth={1.5} className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case 'registration': return <Bookmark strokeWidth={1.5} className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      case 'holiday': return <AlertCircle strokeWidth={1.5} className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      default: return <CheckCircle2 strokeWidth={1.5} className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    }
  };

  const getTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20';
      case 'registration': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20';
      case 'holiday': return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
      default: return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
    }
  };

  const getTypeName = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return 'Sınav';
      case 'registration': return 'Kayıt / Başvuru';
      case 'holiday': return 'Tatil';
      default: return 'Eğitim';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Grouping logic
  const terms = ['Tümü', ...Array.from(new Set(events.map(e => e.term || 'Diğer')))];
  
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
      <header className="mb-8 border-b border-stone-200 dark:border-stone-800/60 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-stone-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
              <CalendarIcon className="w-6 h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            </div>
            Akademik Takvim
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-3 font-medium tracking-wide">
            2026-2027 Eğitim Öğretim Yılı (Lisans & Lisansüstü)
          </p>
        </div>
        
        {/* Term Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <ListFilter className="w-4 h-4 text-stone-400 mr-1 shrink-0" strokeWidth={2} />
          {terms.map(term => (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={\`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors \${
                selectedTerm === term 
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-[#1c1917] dark:text-stone-400 dark:hover:bg-stone-800 border border-transparent dark:border-stone-800/80'
              }\`}
            >
              {term}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-10">
        {Object.entries(groupedEvents).map(([term, termEvents]) => (
          <div key={term} className="space-y-6">
            <h3 className="text-xl font-display font-bold text-stone-900 dark:text-white border-b border-stone-200/60 dark:border-stone-800/40 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {term}
            </h3>
            
            <div className="relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-100 dark:before:bg-stone-800/40 space-y-6">
              {termEvents.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-[32.5px] bg-white dark:bg-[#0c0a09] p-1.5 rounded-full border-2 border-stone-100 dark:border-stone-800/80 z-10 text-stone-500 transition-colors group-hover:border-emerald-500/30 dark:group-hover:border-emerald-500/30">
                    {getTypeIcon(event.type)}
                  </div>
                  
                  <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800/60 rounded-2xl p-5 ml-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-stone-600 dark:text-stone-300">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {formatDate(event.date)}
                        </span>
                        {event.endDate && (
                          <>
                            <span className="text-stone-300 dark:text-stone-600">-</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {formatDate(event.endDate)}
                            </span>
                          </>
                        )}
                      </div>
                      <span className={\`text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-md uppercase \${getTypeColor(event.type)}\`}>
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
        ))}
      </div>
    </motion.div>
  );
}
`;
fs.writeFileSync('src/pages/Calendar.tsx', code);
console.log("Calendar.tsx rewritten completely.");
