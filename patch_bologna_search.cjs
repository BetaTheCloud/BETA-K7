const fs = require('fs');

let code = fs.readFileSync('src/pages/Bologna.tsx', 'utf8');

// 1. Import Search
code = code.replace(
  "import { BookOpen, GraduationCap, Building2, ChevronRight, ArrowLeft, Users, FileText, CheckCircle2 } from 'lucide-react';",
  "import { BookOpen, GraduationCap, Building2, ChevronRight, ArrowLeft, Users, FileText, CheckCircle2, Search } from 'lucide-react';"
);

// 2. Add state
const stateInsertPoint = "const [activeCourse, setActiveCourse] = useState<BolognaCourse | null>(null);";
const stateWithSearch = stateInsertPoint + '\n  const [searchQuery, setSearchQuery] = useState("");';
code = code.replace(stateInsertPoint, stateWithSearch);

// 3. Reset search query on navigation forward/backward
code = code.replace(
  "onClick={() => { setActiveDegreeType(null); setActiveFaculty(null); setActiveDepartment(null); setActiveCourse(null); }}",
  "onClick={() => { setActiveDegreeType(null); setActiveFaculty(null); setActiveDepartment(null); setActiveCourse(null); setSearchQuery(''); }}"
);

code = code.replace(
  "onClick={() => { setActiveFaculty(null); setActiveDepartment(null); setActiveCourse(null); }}",
  "onClick={() => { setActiveFaculty(null); setActiveDepartment(null); setActiveCourse(null); setSearchQuery(''); }}"
);

code = code.replace(
  "onClick={() => { setActiveDepartment(null); setActiveCourse(null); }}",
  "onClick={() => { setActiveDepartment(null); setActiveCourse(null); setSearchQuery(''); }}"
);

code = code.replace(
  "onClick={() => setActiveCourse(null)}",
  "onClick={() => { setActiveCourse(null); setSearchQuery(''); }}"
);

code = code.replace(
  "setActiveDegreeType(deg);\n                   loadFaculties(deg.id);",
  "setActiveDegreeType(deg);\n                   loadFaculties(deg.id);\n                   setSearchQuery('');"
);

code = code.replace(
  "onClick={() => setActiveFaculty(fac)}",
  "onClick={() => { setActiveFaculty(fac); setSearchQuery(''); }}"
);

// Let's modify handleBack to also clear the search query
code = code.replace(
  /const handleBack = \(\) => \{\n    if \(activeCourse\) \{\n      setActiveCourse\(null\);\n    \} else if \(activeDepartment\) \{\n      setActiveDepartment\(null\);\n    \} else if \(activeFaculty\) \{\n      setActiveFaculty\(null\);\n    \}\n  \};/g,
  `const handleBack = () => {
    setSearchQuery('');
    if (activeCourse) {
      setActiveCourse(null);
    } else if (activeDepartment) {
      setActiveDepartment(null);
    } else if (activeFaculty) {
      setActiveFaculty(null);
    }
  };`
);


// 4. Update Level 1 (Faculties)
const level1Target = `className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {(Array.isArray(faculties) ? faculties : []).map((fac) => (`;

const level1Replacement = `className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <button onClick={handleBack} className="p-2 hover:bg-[#f4f1ea] dark:hover:bg-stone-800 rounded-full transition-colors">
                  <ArrowLeft strokeWidth={1.5} className="w-5 h-5 text-stone-500" />
                </button>
                <h3 className="text-xl font-display font-bold text-stone-800 dark:text-stone-200">
                  Fakülte Seçiniz
                </h3>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Fakülte ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e6e2d6] dark:border-stone-800/60 bg-[#fcfbf9] dark:bg-[#1c1917] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(faculties) ? faculties : [])
              .filter(fac => fac.name.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr')))
              .map((fac) => (`;

code = code.replace(level1Target, level1Replacement);

// 5. Update Level 2 (Departments)
const level2Target = `<div className="flex items-center gap-3 mb-6">
              <button onClick={handleBack} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
                <ArrowLeft strokeWidth={1.5} className="w-5 h-5 text-stone-500" />
              </button>
              <h3 className="text-xl font-display font-bold text-stone-800 dark:text-stone-200">
                Bölüm Seçiniz
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeFaculty.departments || []).map((dep) => (`

const level2Replacement = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <button onClick={handleBack} className="p-2 hover:bg-[#f4f1ea] dark:hover:bg-stone-800 rounded-full transition-colors">
                  <ArrowLeft strokeWidth={1.5} className="w-5 h-5 text-stone-500" />
                </button>
                <h3 className="text-xl font-display font-bold text-stone-800 dark:text-stone-200">
                  Bölüm Seçiniz
                </h3>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Bölüm ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e6e2d6] dark:border-stone-800/60 bg-[#fcfbf9] dark:bg-[#1c1917] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeFaculty.departments || [])
                .filter(dep => dep.name.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr')))
                .map((dep) => (`;

code = code.replace(level2Target, level2Replacement);

fs.writeFileSync('src/pages/Bologna.tsx', code);
console.log("Bologna.tsx updated with search capabilities.");
