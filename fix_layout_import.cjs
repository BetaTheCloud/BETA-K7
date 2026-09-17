const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/Layout.tsx', 'utf8');
layoutCode = layoutCode.replace(/import { Compass, Radio, Globe, Coffee, Landmark }/, 'import { Compass, Radio, Globe, Coffee, Landmark, CalendarClock }');
fs.writeFileSync('src/components/Layout.tsx', layoutCode);

console.log("Fixed Layout.tsx import.");
