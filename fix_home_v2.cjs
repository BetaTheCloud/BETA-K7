const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const oldHero = `<section className="bg-gradient-to-br from-stone-900 to-[#1c1917] dark:from-[#1c1917] dark:to-black rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between min-h-[120px] border border-stone-800/80 shadow-xl overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
        
        <div className="flex flex-col items-center md:items-start z-10 text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight">Kilis 7 Aralık Üniversitesi</h2>
          
        </div>
        
        <div className="z-10 w-full md:w-auto flex justify-center mt-6 md:mt-0">
          <WeatherWidget />
        </div>
      </section>`;
          
const newHero = `<section className="bg-gradient-to-r from-stone-900 via-[#292524] to-[#1c1917] dark:from-[#1c1917] dark:via-black dark:to-[#0c0a09] rounded-2xl p-4 md:p-6 text-white flex flex-col md:flex-row items-center justify-between border border-stone-800/80 shadow-md relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
        
        <div className="flex flex-col items-center md:items-start z-10 text-center md:text-left w-full md:w-auto mb-4 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight drop-shadow-sm">Kilis 7 Aralık Üniversitesi</h2>
        </div>
        
        <div className="z-10 w-full md:w-auto flex justify-center md:justify-end">
          <WeatherWidget />
        </div>
      </section>`;

code = code.replace(oldHero, newHero);

fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Home updated.");
