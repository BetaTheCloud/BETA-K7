import { NavLink } from 'react-router-dom';
import { Compass, Megaphone, Newspaper, ChefHat, Landmark, CalendarClock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BottomNav() {
  const navItems = [
    { to: '/', label: 'Ana', icon: Compass },
    { to: '/announcements', label: 'Duyuru', icon: Megaphone },
    { to: '/news', label: 'Haber', icon: Newspaper },
    { to: '/bologna', label: 'Bologna', icon: Landmark },
    { to: '/calendar', label: 'Takvim', icon: CalendarClock },
    { to: '/menu', label: 'Yemek', icon: ChefHat },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#fcfbf9]/80 dark:bg-[#1d3540]/80 backdrop-blur-xl border-t border-[#e6e2d6] dark:border-white/10 z-50 px-2 pb-safe pt-2">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                isActive
                  ? 'text-amber-600 dark:text-amber-500'
                  : 'text-stone-400 dark:text-white/40 hover:text-stone-900 dark:hover:text-stone-300'
              )
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
