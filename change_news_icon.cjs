const fs = require('fs');

const replaceInFile = (file, from, to) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
  fs.writeFileSync(file, content);
}

replaceInFile('src/pages/Home.tsx', 'Flame', 'Newspaper');
replaceInFile('src/components/BottomNav.tsx', 'Flame', 'Newspaper');
replaceInFile('src/components/Layout.tsx', 'Flame', 'Newspaper');

console.log("News icon changed to Newspaper.");
