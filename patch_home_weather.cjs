const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

if (!code.includes('WeatherWidget')) {
    code = code.replace(
        "import DetailModal from '../components/DetailModal';",
        "import DetailModal from '../components/DetailModal';\nimport WeatherWidget from '../components/WeatherWidget';"
    );
    
    // Replace the Hero section
    const oldHero = `<section className="bg-[#1c1917] rounded-xl p-8 text-white flex flex-col items-center justify-center min-h-[140px] border border-stone-800">
        <h2 className="text-3xl font-display font-bold text-center text-amber-500">Kilis 7 Aralık Üniversitesi</h2>
      </section>`;
      
    const newHero = `<section className="bg-gradient-to-br from-stone-900 to-[#1c1917] dark:from-[#1c1917] dark:to-black rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between min-h-[140px] border border-stone-800/80 shadow-xl overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
        
        <div className="flex flex-col items-center md:items-start z-10 text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight mb-2">Kilis 7 Aralık Üniversitesi</h2>
          <p className="text-stone-400 font-medium tracking-wide">Kampüs Dijital Bilgi Ekranı</p>
        </div>
        
        <div className="z-10">
          <WeatherWidget />
        </div>
      </section>`;
      
    code = code.replace(oldHero, newHero);
    
    fs.writeFileSync('src/pages/Home.tsx', code);
    console.log("Patched Home.tsx");
} else {
    console.log("WeatherWidget already imported.");
}
