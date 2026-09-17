const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf8');
code = code.replace(/"credit":\s*(\d+)/g, '"credit": "$1"');
fs.writeFileSync('src/mockData.ts', code);
console.log("Fixed mockData.ts");
