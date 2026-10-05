import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { Compass, Megaphone, Newspaper, ChefHat, Landmark, CalendarClock, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { OfflineIndicator } from './OfflineIndicator';
import { ServerColdStartAlert } from './ServerColdStartAlert';
import K7Logo from './K7Logo';

export default function Layout() {
  const { pathname, search } = useLocation();

  // Scroll to top on every menu/page/tab navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  const navItems = [
    { to: '/', label: 'Ana Sayfa', icon: Compass },
    { to: '/announcements', label: 'Duyurular', icon: Megaphone },
    { to: '/campus', label: 'Kampüs Hizmetleri', icon: LayoutGrid },
    { to: '/news', label: 'Haberler', icon: Newspaper },
    { to: '/bologna', label: 'Bologna', icon: Landmark },
    { to: '/calendar', label: 'Takvim', icon: CalendarClock },
    { to: '/menu', label: 'Yemek Menüsü', icon: ChefHat },
  ];

  return (
    <div className="min-h-screen bg-[#f4f1ea] dark:bg-[#1d3540] text-stone-800 dark:text-white/90 font-sans flex flex-col md:flex-row">
      <Toaster 
        position="top-center" 
        containerStyle={{ 
          top: 'calc(env(safe-area-inset-top, 0px) + 4.5rem)' 
        }} 
      />
      <OfflineIndicator />
      <ServerColdStartAlert />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-[#fcfbf9] dark:bg-[#264653] border-r border-[#e6e2d6] dark:border-white/10 z-40">
        <div className="h-20 flex items-center px-6 border-b border-[#e6e2d6] dark:border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <K7Logo className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-xl font-display font-extrabold tracking-tight text-stone-900 dark:text-white leading-none">
                K7AÜ
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] text-stone-400 dark:text-white/40 mt-1">
                KAMPÜS DİJİTAL
              </span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium tracking-wide text-sm',
                  isActive
                    ? 'bg-stone-100 text-stone-900 dark:bg-white/5 dark:text-amber-500'
                    : 'text-stone-500 hover:bg-[#f4f1ea] hover:text-stone-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-stone-200'
                )
              }
            >
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64 relative min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-5 pb-20 md:pb-8 max-w-4xl mx-auto w-full">
          <Outlet />
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}
