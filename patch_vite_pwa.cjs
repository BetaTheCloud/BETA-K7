const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(
  /devOptions: {\s*enabled: true,\s*type: 'module',\s*},/,
  "devOptions: { enabled: false, type: 'module' },"
);

fs.writeFileSync('vite.config.ts', code);
console.log("Disabled PWA devOptions");
