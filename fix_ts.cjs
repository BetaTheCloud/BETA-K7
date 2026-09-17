const fs = require('fs');
let code = fs.readFileSync('src/pages/Calendar.tsx', 'utf8');

code = code.replace(
  /Object\.entries\(groupedEvents\)\.map\(\(\[term, termEvents\]\) => \(/,
  'Object.entries(groupedEvents).map(([term, termEvents]: [string, CalendarEvent[]]) => ('
);

fs.writeFileSync('src/pages/Calendar.tsx', code);
console.log("Calendar.tsx typescript fixed.");
