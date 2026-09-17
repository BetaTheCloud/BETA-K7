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
            
            // 1. Color replacements
            content = content.replace(/slate-/g, 'stone-');
            content = content.replace(/indigo-/g, 'emerald-');
            content = content.replace(/blue-/g, 'emerald-'); // Any remaining blue to emerald
            
            // Fix stroke widths for any direct lucide-react components
            // A simple regex for <IconName className="..." />
            // To make sure we don't mess up non-icons, we can just replace `<` + capital letter + ` ` to add strokeWidth
            // But an easier way: find all import from 'lucide-react', extract the names, and add strokeWidth={1.5} to them.
            
            const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
            if (importMatch) {
                const icons = importMatch[1].split(',').map(s => s.trim().split(' as ')[0]);
                // Some might have aliases like `Calendar as CalendarIcon`
                const activeIcons = importMatch[1].split(',').map(s => {
                    const parts = s.trim().split(' as ');
                    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
                });
                
                for (const icon of activeIcons) {
                    if (!icon) continue;
                    // Replace `<IconName ` with `<IconName strokeWidth={1.5} ` if it doesn't already have it
                    const regex = new RegExp(`<${icon}\\s+(?!.*strokeWidth)`, 'g');
                    content = content.replace(regex, `<${icon} strokeWidth={1.5} `);
                }
            }
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

processDir('src');
console.log("Theme and icons updated.");
