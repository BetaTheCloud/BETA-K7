const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /description: 'Ders içeriği Bologna sisteminden alınmıştır.'/g,
  `description: 'Ders içeriği Bologna sisteminden alınmıştır.',\n               outcomes: []`
);
fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts");
