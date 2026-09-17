const fs = require('fs');

const file = './src/pages/Calendar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Colors replacement for Calendar
content = content.replace(/dark:text-stone-400/g, 'dark:text-teal-100/70');
content = content.replace(/dark:text-stone-300/g, 'dark:text-teal-50');
content = content.replace(/dark:text-stone-500/g, 'dark:text-teal-200/60');
content = content.replace(/dark:text-stone-600/g, 'dark:text-teal-700/80');

content = content.replace(/dark:bg-[#0c0a09]/g, 'dark:bg-[#1d3540]');
content = content.replace(/dark:hover:bg-stone-800/g, 'dark:hover:bg-teal-900/40');
content = content.replace(/dark:before:bg-stone-800\/40/g, 'dark:before:bg-teal-700/40');

// Borders
content = content.replace(/dark:border-stone-800\/80/g, 'dark:border-teal-700/50');
content = content.replace(/dark:border-stone-800\/60/g, 'dark:border-teal-700/50');
content = content.replace(/dark:border-stone-800\/40/g, 'dark:border-teal-700/40');

// Specific text fixes
content = content.replace(/dark:text-stone-900/g, 'dark:text-[#1d3540]'); // For active pill

fs.writeFileSync(file, content, 'utf8');
console.log('Calendar updated');
