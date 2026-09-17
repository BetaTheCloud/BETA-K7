import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getMenu } from '../mockData';
import { MenuItem } from '../types';
import { CalendarDays, ChefHat, Utensils } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Menu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getMenu();
      setMenu(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-neutral-500">Menü yükleniyor...</div>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).toLowerCase();
  const todayMenu = menu.find(item => item.date.toLowerCase() === todayStr);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-10 pb-8"
    >
      <header className="mb-2 border-b border-[#e6e2d6] dark:border-white/10 pb-4">
        <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-white flex items-center gap-3">
          <ChefHat className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
          Yemek Menüsü
        </h2>
        <p className="text-stone-500 dark:text-white/60 text-sm mt-2 tracking-wide font-medium">Aylık yemekhane menüsü</p>
      </header>

      {/* Hero Section for Today's Menu */}
      {todayMenu && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-amber-500" strokeWidth={2} />
            <h3 className="text-xl font-display font-bold text-stone-900 dark:text-white">Günün Menüsü</h3>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -right-8 -top-8 md:-right-4 md:-top-4 opacity-10 pointer-events-none">
              <ChefHat strokeWidth={1.5} className="w-48 h-48 md:w-64 md:h-64" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-block bg-white/20 backdrop-blur-md text-amber-50 font-semibold tracking-widest uppercase text-xs px-3 py-1.5 rounded-full mb-6">
                {todayMenu.date}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="flex flex-col justify-center">
                  <div className="text-amber-200 text-sm font-semibold uppercase tracking-widest mb-2">Ana Yemek</div>
                  <div className="text-3xl md:text-4xl font-display font-black leading-tight">{todayMenu.mainDish}</div>
                </div>
                
                <div className="space-y-5 border-t border-amber-400/30 pt-5 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-10">
                  <div>
                    <div className="text-amber-200 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">Yardımcı Yemek</div>
                    <div className="text-lg md:text-xl font-bold">{todayMenu.sideDish}</div>
                  </div>
                  <div>
                    <div className="text-amber-200 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">Çorba</div>
                    <div className="text-lg md:text-xl font-bold">{todayMenu.soup}</div>
                  </div>
                  <div>
                    <div className="text-amber-200 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">TATLI / MEYVE / İÇECEK</div>
                    <div className="text-lg md:text-xl font-bold">{todayMenu.dessertOrFruit}</div>
                  </div>
                </div>
              </div>
              
              {todayMenu.calories > 0 && (
                <div className="mt-8 pt-4 border-t border-amber-400/30 text-xs font-bold tracking-widest text-amber-100 flex items-center justify-end">
                  {todayMenu.calories} KCAL
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-stone-500" strokeWidth={2} />
          <h3 className="text-xl font-display font-bold text-stone-900 dark:text-white">Tüm Menü</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menu.map((item) => {
            const isToday = item.date.toLowerCase() === todayStr;
            
            let dayNum = '';
            let monthYear = '';
            let dayName = '';
            
            const parts = item.date.split(' ');
            if (parts.length >= 2) {
              dayNum = parts[0];
              dayName = parts[parts.length - 1];
              monthYear = parts.slice(1, parts.length - 1).join(' ');
            }

            return (
              <div 
                key={item.id} 
                className={cn(
                  "rounded-2xl p-6 transition-all border relative overflow-hidden",
                  isToday 
                    ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/60 dark:border-amber-500/30 shadow-sm" 
                    : "bg-[#fcfbf9] dark:bg-[#264653] border-[#e6e2d6] dark:border-white/10 hover:shadow-sm"
                )}
              >
                {/* If today, show a subtle accent highlight at top edge */}
                {isToday && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>}

                {/* Date Header: Calendar tear-off style */}
                <div className="flex items-center gap-4 border-b border-opacity-10 border-current pb-4 mb-4">
                  <div className={cn(
                    "flex flex-col items-center justify-center rounded-xl min-w-[3.75rem] py-2",
                    isToday 
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                      : "bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-white/80"
                  )}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">{monthYear.split(' ')[0]}</span>
                    <span className="text-2xl font-display font-black leading-none mt-1">{dayNum}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-lg font-display font-bold leading-snug", 
                      isToday ? "text-amber-900 dark:text-amber-100" : "text-stone-800 dark:text-white/90"
                    )}>
                      {dayName}
                    </span>
                    {isToday ? (
                      <span className="text-[10px] mt-0.5 font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">Bugün</span>
                    ) : (
                      <span className="text-[10px] mt-0.5 font-semibold uppercase tracking-widest text-stone-400 dark:text-white/40">{monthYear}</span>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-3.5 text-[0.95rem] font-medium tracking-wide">
                  <li className="flex items-start gap-3">
                    <div className={cn("mt-2 shrink-0 w-1.5 h-1.5 rounded-full", isToday ? "bg-amber-600 dark:bg-amber-500" : "bg-stone-900 dark:bg-[#fcfbf9]")}></div>
                    <span className={cn("font-bold", isToday ? "text-stone-900 dark:text-white" : "text-stone-800 dark:text-white/90")}>{item.mainDish}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className={cn("mt-2 shrink-0 w-1.5 h-1.5 rounded-full", isToday ? "bg-amber-400 dark:bg-amber-600" : "bg-stone-300 dark:bg-stone-600")}></div>
                    <span className="text-stone-600 dark:text-white/60">{item.sideDish}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className={cn("mt-2 shrink-0 w-1.5 h-1.5 rounded-full", isToday ? "bg-amber-400 dark:bg-amber-600" : "bg-stone-300 dark:bg-stone-600")}></div>
                    <span className="text-stone-600 dark:text-white/60">{item.soup}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className={cn("mt-2 shrink-0 w-1.5 h-1.5 rounded-full", isToday ? "bg-amber-400 dark:bg-amber-600" : "bg-stone-300 dark:bg-stone-600")}></div>
                    <span className="text-stone-600 dark:text-white/60">{item.dessertOrFruit}</span>
                  </li>
                </ul>
                
                {item.calories > 0 && (
                  <div className={cn("mt-6 pt-4 border-t border-opacity-10 border-current text-[10px] font-bold tracking-widest text-right", isToday ? "text-amber-600/80 dark:text-amber-500/80" : "text-stone-400")}>
                    {item.calories} KCAL
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
