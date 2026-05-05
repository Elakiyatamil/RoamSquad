import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changed = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    const original = content;
    
    // Replace URL declarations like const API_BASE = 'http://localhost:5000/api/public';
    content = content.replace(/['"]http:\/\/localhost:5000([^'"]*)['"]/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
    
    // Replace inline socket logic
    content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        changed++;
        console.log('Updated ' + f);
    }
});
console.log('Done! Updated ' + changed + ' files.');
