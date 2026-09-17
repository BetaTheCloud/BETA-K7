const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Remove the colored span from K7AÜ
code = code.replace(
  /K7<span className="text-emerald-600 dark:text-emerald-400">AÜ<\/span>/,
  'K7AÜ'
);

// Fix Turkish uppercase issue and remove 'uppercase' Tailwind class
code = code.replace(
  /<span className="text-\[10px\] font-semibold tracking-\[0\.2em\] text-stone-400 dark:text-stone-500 uppercase mt-1">\s*Kampüs Dijital\s*<\/span>/,
  '<span className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 dark:text-stone-500 mt-1">\n              KAMPÜS DİJİTAL\n            </span>'
);

fs.writeFileSync('src/components/Header.tsx', code);
console.log("Header updated.");
