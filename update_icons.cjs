const fs = require('fs');

// 1. Rewrite Header.tsx
const headerCode = `import { Sun, Moon, Landmark } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <div className="absolute inset-0 bg-white/20 rounded-2xl mix-blend-overlay"></div>
            <Landmark className="w-6 h-6 relative z-10" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-display font-extrabold tracking-tight text-stone-900 dark:text-white leading-none">
              K7<span className="text-emerald-600 dark:text-emerald-400">AÜ</span>
            </span>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 dark:text-stone-500 uppercase mt-1">
              Kampüs Dijital
            </span>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" strokeWidth={1.5} />
          ) : (
            <Moon className="w-5 h-5" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </header>
  );
}
`;
fs.writeFileSync('src/components/Header.tsx', headerCode);


// 2. Update Layout.tsx
let layoutCode = fs.readFileSync('src/components/Layout.tsx', 'utf8');
layoutCode = layoutCode.replace(/Grid2X2, BellDot, Newspaper, UtensilsCrossed, CalendarClock, BookOpen/, 'Compass, Radio, Globe, Coffee, Landmark');
layoutCode = layoutCode.replace(
  /icon: Grid2X2[^\]]*icon: BellDot[^\]]*icon: Newspaper[^\]]*icon: UtensilsCrossed[^\]]*icon: BookOpen/g, 
  (match) => {
      let replaced = match.replace(/Grid2X2/g, 'Compass')
                          .replace(/BellDot/g, 'Radio')
                          .replace(/Newspaper/g, 'Globe')
                          .replace(/UtensilsCrossed/g, 'Coffee')
                          .replace(/BookOpen/g, 'Landmark');
      return replaced;
  }
);
fs.writeFileSync('src/components/Layout.tsx', layoutCode);


// 3. Update BottomNav.tsx
let bottomNavCode = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');
bottomNavCode = bottomNavCode.replace(/Grid2X2, BellDot, Newspaper, UtensilsCrossed, CalendarClock, BookOpen/, 'Compass, Radio, Globe, Coffee, Landmark');
bottomNavCode = bottomNavCode.replace(
  /icon: Grid2X2[^\]]*icon: BellDot[^\]]*icon: Newspaper[^\]]*icon: UtensilsCrossed[^\]]*icon: BookOpen/g, 
  (match) => {
      let replaced = match.replace(/Grid2X2/g, 'Compass')
                          .replace(/BellDot/g, 'Radio')
                          .replace(/Newspaper/g, 'Globe')
                          .replace(/UtensilsCrossed/g, 'Coffee')
                          .replace(/BookOpen/g, 'Landmark');
      return replaced;
  }
);
fs.writeFileSync('src/components/BottomNav.tsx', bottomNavCode);


// 4. Update Home.tsx
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace(/BellDot, Newspaper, UtensilsCrossed/, 'Radio, Globe, Coffee');
homeCode = homeCode.replace(/<BellDot /g, '<Radio ');
homeCode = homeCode.replace(/<Newspaper /g, '<Globe ');
homeCode = homeCode.replace(/<UtensilsCrossed /g, '<Coffee ');
fs.writeFileSync('src/pages/Home.tsx', homeCode);


// 5. Update Menu.tsx
let menuCode = fs.readFileSync('src/pages/Menu.tsx', 'utf8');
menuCode = menuCode.replace(/UtensilsCrossed/, 'Coffee');
menuCode = menuCode.replace(/<UtensilsCrossed /g, '<Coffee ');
fs.writeFileSync('src/pages/Menu.tsx', menuCode);

console.log("Header redesigned and icons replaced.");
