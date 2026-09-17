const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // App Background
  content = content.replace(/bg-\[#fafaf9\]/g, 'bg-[#f4f1ea]');

  // Card & Surface Backgrounds (replacing bg-white exactly, without touching bg-white/20, text-white etc)
  content = content.replace(/\bbg-white\b(?!\/)/g, 'bg-[#fcfbf9]');

  // Hover states on surfaces
  content = content.replace(/\bhover:bg-stone-50\b/g, 'hover:bg-[#f4f1ea]');
  
  // Specific bg-stone-50 used statically
  content = content.replace(/\bbg-stone-50\b/g, 'bg-[#f4f1ea]');

  // Header and BottomNav have bg-white/80, let's change to bg-[#fcfbf9]/80
  content = content.replace(/\bbg-white\/80\b/g, 'bg-[#fcfbf9]/80');
  
  // Borders (border-stone-200 -> border-[#e8e4db])
  content = content.replace(/\bborder-stone-200\b/g, 'border-[#e6e2d6]');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated theme in ${file}`);
  }
});
console.log("Theme update complete.");
