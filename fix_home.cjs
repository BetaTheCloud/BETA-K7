const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Remove Kampüs Dijital Bilgi Ekranı and fix spacing
const oldHero = `<h2 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight mb-2">Kilis 7 Aralık Üniversitesi</h2>
          <p className="text-stone-400 font-medium tracking-wide">Kampüs Dijital Bilgi Ekranı</p>`;
          
const newHero = `<h2 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight">Kilis 7 Aralık Üniversitesi</h2>`;

code = code.replace(oldHero, newHero);

// Also let's make the container slightly less tall and the weather widget centered better on mobile
code = code.replace(
  `className="z-10"`,
  `className="z-10 w-full md:w-auto flex justify-center mt-6 md:mt-0"`
);

code = code.replace(
  `min-h-[140px]`,
  `min-h-[120px]`
);

fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Home updated.");
