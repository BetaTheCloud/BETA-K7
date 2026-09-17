const fs = require('fs');
let code = fs.readFileSync('src/pages/Bologna.tsx', 'utf8');
code = code.replace(
  /activeFaculty\.departments\.map/g,
  `(activeFaculty.departments || []).map`
);
fs.writeFileSync('src/pages/Bologna.tsx', code);
console.log("Fixed Bologna.tsx deps map");
