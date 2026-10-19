/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavLink } from 'react-router-dom';
import { Compass, Megaphone, Newspaper, LayoutGrid, Landmark } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BottomNav() {
  const navItems = [
    { to: '/', label: 'Ana Sayfa', shortLabel: 'Ana Sayfa', icon: Compass },
    { to: '/news', label: 'Haberler', shortLabel: 'Haberler', icon: Newspaper },
    { to: '/campus', label: 'Hizmetler', shortLabel: 'Hizmetler', icon: LayoutGrid },
    { to: '/announcements', label: 'Duyurular', shortLabel: 'Duyurular', icon: Megaphone },
    { to: '/bologna', label: 'Bologna', shortLabel: 'Bologna', icon: Landmark },
  ];

  return (
    <nav 
      aria-label="Mobil Gezinme Menüsü"
      className="md:hidden fixed bottom-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] inset-x-3.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-40"
    >
      <div className="relative backdrop-blur-xl bg-[#fcfbf9]/95 dark:bg-[#264653]/95 rounded-2xl border border-[#e6e2d6] dark:border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] px-1.5 py-1.5 transition-colors">
        <div className="flex justify-around items-center h-12">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 select-none relative group',
                  isActive
                    ? 'bg-[#8a2a43]/10 dark:bg-white/12 text-[#8a2a43] dark:text-white font-bold shadow-2xs'
                    : 'text-stone-600/80 dark:text-white/65 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/50 dark:hover:bg-white/5'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'w-4.5 h-4.5 transition-transform duration-200',
                      isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.7] group-hover:scale-105'
                    )}
                  />
                  <span className="text-[10px] tracking-tight leading-none mt-1 font-sans">
                    {item.shortLabel}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#8a2a43] dark:bg-white shadow-xs" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
