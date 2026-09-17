const fs = require('fs');
let code = fs.readFileSync('src/pages/Bologna.tsx', 'utf8');
code = code.replace(
  /activeCourse\.outcomes\.map/g,
  `(activeCourse.outcomes || []).map`
);

// Also let's safeguard faculties.map just in case
code = code.replace(
  /faculties\.map/g,
  `(Array.isArray(faculties) ? faculties : []).map`
);
fs.writeFileSync('src/pages/Bologna.tsx', code);
console.log("Fixed Bologna.tsx");
