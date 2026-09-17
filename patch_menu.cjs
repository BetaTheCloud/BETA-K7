const fs = require('fs');

// Patch Layout.tsx
let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');
const oldLayoutNav = `  const navItems = [
    { to: '/', label: 'Ana Sayfa', icon: Compass },
    { to: '/announcements', label: 'Duyurular', icon: Megaphone },
    { to: '/news', label: 'Haberler', icon: Flame },
    { to: '/menu', label: 'Yemek', icon: ChefHat },
    { to: '/calendar', label: 'Takvim', icon: CalendarClock },
    { to: '/bologna', label: 'Bologna', icon: Landmark },
  ];`;
const newLayoutNav = `  const navItems = [
    { to: '/', label: 'Ana Sayfa', icon: Compass },
    { to: '/announcements', label: 'Duyurular', icon: Megaphone },
    { to: '/news', label: 'Haberler', icon: Flame },
    { to: '/bologna', label: 'Bologna', icon: Landmark },
    { to: '/calendar', label: 'Takvim', icon: CalendarClock },
    { to: '/menu', label: 'Yemek', icon: ChefHat },
  ];`;
layout = layout.replace(oldLayoutNav, newLayoutNav);
fs.writeFileSync('src/components/Layout.tsx', layout);

// Patch BottomNav.tsx
let bottomNav = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');
const oldBottomNavNav = `  const navItems = [
    { to: '/', label: 'Ana', icon: Compass },
    { to: '/announcements', label: 'Duyuru', icon: Megaphone },
    { to: '/news', label: 'Haber', icon: Flame },
    { to: '/menu', label: 'Yemek', icon: ChefHat },
    { to: '/bologna', label: 'Bologna', icon: Landmark },
  ];`;
const newBottomNavNav = `  const navItems = [
    { to: '/', label: 'Ana', icon: Compass },
    { to: '/announcements', label: 'Duyuru', icon: Megaphone },
    { to: '/news', label: 'Haber', icon: Flame },
    { to: '/bologna', label: 'Bologna', icon: Landmark },
    { to: '/calendar', label: 'Takvim', icon: CalendarClock },
    { to: '/menu', label: 'Yemek', icon: ChefHat },
  ];`;

// Also need to import CalendarClock if it's not imported in BottomNav
if (!bottomNav.includes('CalendarClock')) {
    bottomNav = bottomNav.replace(
        "import { Compass, Flame, Landmark, ChefHat, Megaphone } from 'lucide-react';",
        "import { Compass, Flame, Landmark, ChefHat, Megaphone, CalendarClock } from 'lucide-react';"
    );
}
bottomNav = bottomNav.replace(oldBottomNavNav, newBottomNavNav);

// To ensure 6 items fit nicely on mobile, let's slightly adjust the classes for text size if needed.
// actually text-[10px] is already quite small, might just work. Wait, the class is:
// <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
// Let's make it text-[9px] just to be safe it doesn't wrap awkwardly.
bottomNav = bottomNav.replace(
    'text-[10px] font-medium tracking-wide',
    'text-[9px] font-medium tracking-wide'
);

fs.writeFileSync('src/components/BottomNav.tsx', bottomNav);

console.log("Menus patched successfully.");
