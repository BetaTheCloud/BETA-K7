const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!code.includes('OfflineIndicator')) {
  code = code.replace(
    "import { useEffect } from 'react';",
    "import { useEffect } from 'react';\nimport { OfflineIndicator } from './OfflineIndicator';"
  );
  
  code = code.replace(
    '<Toaster position="top-center" />',
    '<Toaster position="top-center" />\n      <OfflineIndicator />'
  );
  
  fs.writeFileSync('src/components/Layout.tsx', code);
}
console.log("Layout.tsx patched with OfflineIndicator.");
