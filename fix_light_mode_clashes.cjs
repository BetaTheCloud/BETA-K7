const fs = require('fs');
const path = require('path');

function fixLightModeColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fixLightModeColors(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      let modified = content
        // 1. Convert specific emerald backgrounds/borders/text to amber (our main accent in light mode)
        .replace(/emerald-600/g, 'amber-600')
        .replace(/emerald-500/g, 'amber-500')
        .replace(/emerald-400/g, 'amber-400')
        .replace(/emerald-300/g, 'amber-300')
        .replace(/emerald-200/g, 'amber-200')
        .replace(/emerald-100/g, 'amber-100')
        .replace(/emerald-50/g, 'amber-50')
        .replace(/emerald-900/g, 'amber-900');
        
        // Let's re-add "dark:" to the hero section background in Home.tsx if it was wrongly stone-900
        // Wait, Home.tsx already has: bg-stone-900 dark:bg-[#264653]
        // Let's change light mode Home hero to `#264653` so it's consistent.
        
        if (filePath.includes('Home.tsx')) {
          modified = modified.replace(/bg-stone-900 dark:bg-\[#264653\]/g, 'bg-[#264653]');
          // Remove dark: prefix on the background decorations since it's now always dark hero
          // But wait, the background decorations use Rose! The user liked Rose-900 to Rose-500.
          // Let's keep it as bg-[#264653] for the main section.
        }

      if (content !== modified) {
        fs.writeFileSync(filePath, modified, 'utf-8');
        console.log('Fixed', filePath);
      }
    }
  }
}

fixLightModeColors('./src');
