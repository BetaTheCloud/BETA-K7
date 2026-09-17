const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      replaceColors(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // We want to replace the old dark background colors with #264653.
      // The old primary background was #1c1917 or #151312
      // We also replace stone-900 (often used as dark background) with #264653
      // We also replace stone-800 for slightly lighter elevated surfaces? Maybe we use a slightly lighter version like #2a9d8f or just opacity
      // Actually, #264653 is quite rich. Let's replace the core bg with #264653.
      
      let modified = content
        .replace(/#1c1917/g, '#264653')
        .replace(/#151312/g, '#264653') // Home hero
        // we'll leave borders alone for now or use a suitable color. stone-800/60 might still look okay, but let's change dark:bg-stone-900 to dark:bg-[#264653]
        .replace(/dark:bg-stone-900/g, 'dark:bg-[#264653]');
        
      if (content !== modified) {
        fs.writeFileSync(filePath, modified, 'utf-8');
        console.log('Updated', filePath);
      }
    }
  }
}

replaceColors('./src');

// Also update index.html
let index = fs.readFileSync('./index.html', 'utf-8');
index = index.replace(/#1c1917/g, '#264653');
fs.writeFileSync('./index.html', index, 'utf-8');
console.log('Updated index.html');

// Also update vite.config.ts
let vite = fs.readFileSync('./vite.config.ts', 'utf-8');
vite = vite.replace(/#1c1917/g, '#264653');
fs.writeFileSync('./vite.config.ts', vite, 'utf-8');
console.log('Updated vite.config.ts');
