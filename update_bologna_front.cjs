const fs = require('fs');

let code = fs.readFileSync('src/pages/Bologna.tsx', 'utf8');

// Add DEGREE_TYPES
const degreeTypesConst = `
const DEGREE_TYPES = [
  { id: 'myo', name: 'Ön Lisans', icon: 'Award' },
  { id: 'lis', name: 'Lisans', icon: 'GraduationCap' },
  { id: 'yls', name: 'Yüksek Lisans', icon: 'BookOpen' },
  { id: 'dok', name: 'Doktora', icon: 'Library' }
];
`;

code = code.replace("export default function Bologna() {", degreeTypesConst + "\nexport default function Bologna() {");

// Add activeDegreeType state
code = code.replace(
  "const [activeFaculty, setActiveFaculty] = useState<BolognaFaculty | null>(null);",
  "const [activeDegreeType, setActiveDegreeType] = useState<{id: string, name: string} | null>(null);\n  const [activeFaculty, setActiveFaculty] = useState<BolognaFaculty | null>(null);"
);

// We need to fetch faculties when a degree type is selected. So we'll remove the initial useEffect load and make a function for it.
code = code.replace(
  /useEffect\(\(\) => \{\s*async function load\(\) \{[\s\S]*?load\(\);\s*\}, \[\]\);/,
  `// Faculties are now loaded when a degree type is selected
  const loadFaculties = async (typeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(\`/api/bologna/faculties?type=\${typeId}\`);
      if (response.ok) {
        const data = await response.json();
        setFaculties(data);
      }
    } catch (err) {
      console.error("Failed to load faculties", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Set initial loading to false since we start at degree selection
  useEffect(() => { setLoading(false); }, []);
  `
);

// handleBack
code = code.replace(
  /const handleBack = \(\) => \{[\s\S]*?\}\s*;\s*}/,
  `const handleBack = () => {
    if (activeCourse) {
      setActiveCourse(null);
    } else if (activeDepartment) {
      setActiveDepartment(null);
    } else if (activeFaculty) {
      setActiveFaculty(null);
    } else if (activeDegreeType) {
      setActiveDegreeType(null);
    }
  };`
);

// Breadcrumb changes
code = code.replace(
  /<div className="flex flex-wrap items-center gap-2 mt-5 text-sm font-semibold tracking-wide">([\s\S]*?)<\/div>/,
  `<div className="flex flex-wrap items-center gap-2 mt-5 text-sm font-semibold tracking-wide">
          <button 
            onClick={() => { setActiveDegreeType(null); setActiveFaculty(null); setActiveDepartment(null); setActiveCourse(null); }}
            className={cn(
              "transition-colors",
              (!activeDegreeType) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Akademik Birimler
          </button>
          
          {activeDegreeType && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <button 
                onClick={() => { setActiveFaculty(null); setActiveDepartment(null); setActiveCourse(null); }}
                className={cn(
                  "transition-colors",
                  (activeDegreeType && !activeFaculty) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {activeDegreeType.name}
              </button>
            </>
          )}
          
          {activeFaculty && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <button 
                onClick={() => { setActiveDepartment(null); setActiveCourse(null); }}
                className={cn(
                  "transition-colors",
                  (activeFaculty && !activeDepartment) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {activeFaculty.name}
              </button>
            </>
          )}

          {activeDepartment && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <button 
                onClick={() => setActiveCourse(null)}
                className={cn(
                  "transition-colors",
                  (activeDepartment && !activeCourse) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {activeDepartment.name}
              </button>
            </>
          )}
        </div>`
);

// Level 0: DEGREE TYPES
// We'll replace the `<AnimatePresence mode="wait">` block's beginning with Level 0.
code = code.replace(
  `{/* LEVEL 1: FACULTIES */}
        {!activeFaculty && (`,
  `{/* LEVEL 0: DEGREE TYPES */}
        {!activeDegreeType && (
          <motion.div 
            key="degrees"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {DEGREE_TYPES.map((deg) => (
              <button
                key={deg.id}
                onClick={() => {
                   setActiveDegreeType(deg);
                   loadFaculties(deg.id);
                }}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {deg.id === 'myo' && <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
                  {deg.id === 'lis' && <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
                  {deg.id === 'yls' && <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
                  {deg.id === 'dok' && <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {deg.name}
                </h3>
              </button>
            ))}
          </motion.div>
        )}

        {/* LEVEL 1: FACULTIES */}
        {activeDegreeType && !activeFaculty && (`
);

fs.writeFileSync('src/pages/Bologna.tsx', code);
console.log("Updated Bologna.tsx logic");
