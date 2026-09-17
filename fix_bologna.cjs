const fs = require('fs');

let bolognaCode = fs.readFileSync('src/pages/Bologna.tsx', 'utf8');

bolognaCode = bolognaCode.replace(
  `onClick={() => setActiveDepartment(dep)}`,
  `onClick={async () => {
    if (!dep.courses && dep.sUnitId) {
      setLoading(true);
      try {
        const res = await fetch(\`/api/bologna/courses?sunit=\${dep.sUnitId}\`);
        if (res.ok) {
          const courseData = await res.json();
          dep.courses = courseData;
        }
      } catch(err) {
        console.error(err);
      }
      setLoading(false);
    } else if (!dep.courses) {
      dep.courses = [];
    }
    setActiveDepartment(dep);
  }}`
);

fs.writeFileSync('src/pages/Bologna.tsx', bolognaCode);
console.log("Fixed frontend successfully");
