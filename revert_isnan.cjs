const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/\/\^\\\\d\+\$\/\.test\(num\)/g, '!Number.isNaN(Number(num))');
code = code.replace(/\/\^\\\\d\+\$\/\.test\(week\)/g, '!Number.isNaN(Number(week))');
fs.writeFileSync('server.ts', code);
console.log("Reverted isNaN");
