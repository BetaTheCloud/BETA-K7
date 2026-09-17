const fs = require('fs');

// Patch Header.tsx
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Ensure import for PWAInstallButton
if (!header.includes('PWAInstallButton')) {
  header = header.replace(
    "import { useTheme } from '../hooks/useTheme';",
    "import { useTheme } from '../hooks/useTheme';\nimport { PWAInstallButton } from './PWAInstallButton';"
  );
}

// Add PWAInstallButton next to theme toggle
const themeToggleBtn = `<button
          onClick={toggleTheme}
          className="relative p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Toggle theme"
        >`;
const themeToggleReplacement = `<PWAInstallButton />
        <button
          onClick={toggleTheme}
          className="relative p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Toggle theme"
        >`;

header = header.replace(themeToggleBtn, themeToggleReplacement);
// We also need to add a wrapper flex container around them
const actionsDivStart = `{/* Actions Section */}\n        <div className="flex items-center gap-3">`;
const actionsDivEnd = `</div>`;

header = header.replace(
  "{/* Theme Toggle */}",
  "{/* Actions Section */}\n        <div className=\"flex items-center gap-3\">"
);
// replace closing div of header properly... Actually let's just do a string replace carefully.
// The easiest way is to use a regex or string replacement on the block.
