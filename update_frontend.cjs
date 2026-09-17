const fs = require('fs');

// Update Types
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(
  'courses: BolognaCourse[];',
  'courses?: BolognaCourse[];\n  sUnitId?: string;'
);
fs.writeFileSync('src/types.ts', types);

// Update Bologna.tsx
let bolognaCode = fs.readFileSync('src/pages/Bologna.tsx', 'utf8');

// Replace imports
bolognaCode = bolognaCode.replace(
  "import { getBolognaData } from '../mockData';",
  ""
);

// Replace useEffect for faculties
bolognaCode = bolognaCode.replace(
  /useEffect\(\(\) => \{\s*async function load\(\) \{\s*const data = await getBolognaData\(\);\s*setFaculties\(data\);\s*setLoading\(false\);\s*\}\s*load\(\);\s*\}, \[\]\);/g,
  `useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/bologna/faculties');
        if (response.ok) {
          const data = await response.json();
          setFaculties(data);
        }
      } catch (err) {
        console.error("Failed to load faculties", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);`
);

// Update department selection to load courses if not present
const selectDeptRegex = /<div\s+key=\{dept\.id\}\s+onClick=\{[^}]+\}\s+className="[^"]+"/;

// Wait, looking for onClick={() => setActiveDepartment(dept)}
bolognaCode = bolognaCode.replace(
  `onClick={() => setActiveDepartment(dept)}`,
  `onClick={async () => {
    if (!dept.courses && dept.sUnitId) {
      setLoading(true);
      try {
        const res = await fetch(\`/api/bologna/courses?sunit=\${dept.sUnitId}\`);
        if (res.ok) {
          const courseData = await res.json();
          dept.courses = courseData;
        }
      } catch(err) {
        console.error(err);
      }
      setLoading(false);
    } else if (!dept.courses) {
      dept.courses = [];
    }
    setActiveDepartment(dept);
  }}`
);

fs.writeFileSync('src/pages/Bologna.tsx', bolognaCode);
console.log("Updated frontend successfully");
