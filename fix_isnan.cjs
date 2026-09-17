const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/!isNaN\(num\)/g, '/^\\\\d+$/.test(num)');
code = code.replace(/!isNaN\(week\)/g, '/^\\\\d+$/.test(week)');
fs.writeFileSync('server.ts', code);
console.log("Fixed isNaN");
