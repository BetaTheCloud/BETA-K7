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
            
            // Remove any duplicate strokeWidth={1.5} attributes
            content = content.replace(/strokeWidth=\{1\.5\}\s+(.*?)\s+strokeWidth=\{1\.5\}/g, 'strokeWidth={1.5} $1');
            // Try in reverse if they are close
            content = content.replace(/strokeWidth=\{1\.5\}\s+strokeWidth=\{1\.5\}/g, 'strokeWidth={1.5}');
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

processDir('src');
console.log("Fixed duplicate stroke widths.");
