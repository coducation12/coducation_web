import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/tech_ha/Desktop/Project Files/Coducation Web/src';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const tables = new Set();
const regex = /\.from\(['"]([a-zA-Z0-9_-]+)['"]\)/g;

walkDir(srcDir, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        let match;
        while ((match = regex.exec(content)) !== null) {
            tables.add(match[1]);
        }
    }
});

console.log('All Unique Tables referenced in src/:');
console.log(Array.from(tables).sort());
