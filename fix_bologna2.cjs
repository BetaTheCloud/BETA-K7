const fs = require('fs');

let bolognaCode = fs.readFileSync('src/pages/Bologna.tsx', 'utf8');

bolognaCode = bolognaCode.replace(
  `dep.courses = courseData;\n        }\n      } catch(err) {\n        console.error(err);\n      }\n      setLoading(false);\n    } else if (!dep.courses) {\n      dep.courses = [];\n    }\n    setActiveDepartment(dep);`,
  `  const newDep = { ...dep, courses: courseData };
          setActiveDepartment(newDep);
        }
      } catch(err) {
        console.error(err);
        setActiveDepartment({ ...dep, courses: [] });
      }
      setLoading(false);
    } else if (!dep.courses) {
      setActiveDepartment({ ...dep, courses: [] });
    } else {
      setActiveDepartment(dep);
    }`
);

fs.writeFileSync('src/pages/Bologna.tsx', bolognaCode);
console.log("Fixed frontend state mutation successfully");
