const fs = require('fs');

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    // using word boundaries for safety, though these are specific enough
    content = content.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
  }
  fs.writeFileSync(file, content);
}

replaceInFile('src/components/Layout.tsx', [
  ['Radio', 'Megaphone'],
  ['Globe', 'Flame'],
  ['Coffee', 'ChefHat']
]);

replaceInFile('src/components/BottomNav.tsx', [
  ['Radio', 'Megaphone'],
  ['Globe', 'Flame'],
  ['Coffee', 'ChefHat']
]);

replaceInFile('src/pages/Home.tsx', [
  ['Radio', 'Megaphone'],
  ['Globe', 'Flame'],
  ['Coffee', 'ChefHat']
]);

replaceInFile('src/pages/Menu.tsx', [
  ['Coffee', 'ChefHat']
]);

console.log("Icons updated successfully.");
