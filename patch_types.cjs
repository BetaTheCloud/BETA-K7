const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /export interface CalendarEvent {\s*id: string;\s*title: string;\s*date: string;\s*type: 'exam' \| 'holiday' \| 'registration' \| 'other';\s*}/,
  `export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  term?: 'Güz Yarıyılı' | 'Bahar Yarıyılı' | 'Genel' | 'Lisansüstü';
  type: 'exam' | 'holiday' | 'registration' | 'other';
}`
);

fs.writeFileSync('src/types.ts', code);
console.log("types.ts patched");
