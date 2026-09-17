const fs = require('fs');

let code = fs.readFileSync('src/pages/Bologna.tsx', 'utf8');

const oldHandleBack = `  const handleBack = () => {
    setSearchQuery('');
    if (activeCourse) {
      setActiveCourse(null);
    } else if (activeDepartment) {
      setActiveDepartment(null);
    } else if (activeFaculty) {
      setActiveFaculty(null);
    }
  };`;

const newHandleBack = `  const handleBack = () => {
    setSearchQuery('');
    if (activeCourse) {
      setActiveCourse(null);
    } else if (activeDepartment) {
      setActiveDepartment(null);
    } else if (activeFaculty) {
      setActiveFaculty(null);
    } else if (activeDegreeType) {
      setActiveDegreeType(null);
    }
  };`;

code = code.replace(oldHandleBack, newHandleBack);

// One tiny UI fix: In Level 1, there's an unclosed div?
// Let's verify closing divs for Level 1 replacement.
fs.writeFileSync('src/pages/Bologna.tsx', code);
console.log("handleBack updated.");
