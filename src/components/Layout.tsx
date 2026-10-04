import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { Compass, Megaphone, Newspaper, ChefHat, Landmark, CalendarClock, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { OfflineIndicator } from './OfflineIndicator';
import { ServerColdStartAlert } from './ServerColdStartAlert';
import { getAnnouncements } from '../mockData';

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

  useEffect(() => {
    let isMounted = true;
    
    const checkForNewAnnouncements = async () => {
      try {
        const announcements = await getAnnouncements();
        if (!isMounted || announcements.length === 0) return;
        
        const newest = announcements[0];
        const lastSeenTitle = localStorage.getItem('lastSeenAnnouncementTitle');
        
        if (lastSeenTitle) {
          if (newest.title !== lastSeenTitle) {
            toast.success(`Yeni Duyuru: ${newest.title}`, {
              duration: 6000,
              style: {
                borderRadius: '8px',
                background: '#264653',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'Inter, sans-serif'
              },
            });
            localStorage.setItem('lastSeenAnnouncementTitle', newest.title);
          }
        } else {
          // İlk açılışta bildirim gönderme, sadece son duyuruyu kaydet
          localStorage.setItem('lastSeenAnnouncementTitle', newest.title);
        }
      } catch (error) {
        console.error("Failed to check announcements", error);
      }
    };

    // İlk açılışta bir kez kontrol et
    checkForNewAnnouncements();

    // Ardından her 3 dakikada bir kontrol et
    const interval = setInterval(checkForNewAnnouncements, 3 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
        <div className="h-20 flex items-center px-6 border-b border-[#e6e2d6] dark:border-white/10 invisible">
          {/* Spacer for header logic if needed */}
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
