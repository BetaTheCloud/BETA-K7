const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            content = content.replace(/transtone-/g, 'translate-');
            
            // Hex color fixes for dark mode
            content = content.replace(/#0F172A/g, '#1c1917');
            content = content.replace(/#0B1120/g, '#0c0a09');
            content = content.replace(/#FDFBF7/g, '#fafaf9');
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

processDir('src');
console.log("Fixed transtone and hex colors.");
