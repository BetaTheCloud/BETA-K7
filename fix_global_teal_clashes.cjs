const fs = require('fs');
const path = require('path');

function fixColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fixColors(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      let modified = content
        // Borders
        .replace(/dark:border-stone-800\/60/g, 'dark:border-white/10')
        .replace(/dark:border-stone-800\/80/g, 'dark:border-white/10')
        .replace(/dark:border-stone-800\/40/g, 'dark:border-white/5')
        .replace(/dark:border-stone-800/g, 'dark:border-white/10')
        // Backgrounds
        .replace(/dark:bg-stone-800\/80/g, 'dark:bg-white/10')
        .replace(/dark:bg-stone-800\/50/g, 'dark:bg-white/5')
        .replace(/dark:bg-stone-800\/30/g, 'dark:bg-white/5')
        .replace(/dark:bg-stone-800/g, 'dark:bg-white/10')
        // Hovers
        .replace(/dark:hover:bg-stone-800\/50/g, 'dark:hover:bg-white/10')
        .replace(/dark:hover:bg-stone-800\/30/g, 'dark:hover:bg-white/5')
        .replace(/dark:hover:bg-stone-800/g, 'dark:hover:bg-white/10')
        // Text
        .replace(/dark:text-stone-200/g, 'dark:text-white/90')
        .replace(/dark:text-stone-300/g, 'dark:text-white/80')
        .replace(/dark:text-stone-400/g, 'dark:text-white/60')
        .replace(/dark:text-stone-500/g, 'dark:text-white/40')
        .replace(/dark:text-stone-600/g, 'dark:text-white/30')
        // Specific fixes for #0c0a09 (very dark brown) -> #1d3540 (darker teal)
        .replace(/dark:bg-\[#0c0a09\]/g, 'dark:bg-[#1d3540]');
        
      if (content !== modified) {
        fs.writeFileSync(filePath, modified, 'utf-8');
        console.log('Fixed', filePath);
      }
    }
  }
}

fixColors('./src');
