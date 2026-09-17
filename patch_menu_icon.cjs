const fs = require('fs');
let code = fs.readFileSync('src/pages/Menu.tsx', 'utf8');

code = code.replace(
  "import { CalendarDays, ChefHat, Sparkles } from 'lucide-react';",
  "import { CalendarDays, ChefHat, Utensils } from 'lucide-react';"
);

code = code.replace(
  "<Sparkles className=\"w-5 h-5 text-amber-500\" strokeWidth={2} />",
  "<Utensils className=\"w-5 h-5 text-amber-500\" strokeWidth={2} />"
);

fs.writeFileSync('src/pages/Menu.tsx', code);
console.log("Menu icon changed to Utensils.");
