const fs = require('fs');
let bottomNav = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');

// I might have failed the replace earlier due to exact string mismatch. Let's do a regex replace.
bottomNav = bottomNav.replace(
    /import \{([^}]+)\} from 'lucide-react';/,
    (match, p1) => {
        if (!p1.includes('CalendarClock')) {
            return `import { ${p1.trim()}, CalendarClock } from 'lucide-react';`;
        }
        return match;
    }
);

fs.writeFileSync('src/components/BottomNav.tsx', bottomNav);
console.log("BottomNav CalendarClock imported.");
