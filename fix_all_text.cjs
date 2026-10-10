const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
walkDir('./src', function(filePath) {
  if (filePath.endsWith('.vue')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let lines = content.split('\n');
    let changed = false;
    for(let i=0; i<lines.length; i++) {
       // Match bg-primary, bg-primary/20, bg-primary-hover but NOT bg-primary-green
       let hasStrictBgPrimary = /(?:['"\s:\[])(?:bg-primary|bg-primary-hover)(?:['"\s\]]|\/[0-9]+)/.test(lines[i]);
       if (hasStrictBgPrimary && lines[i].includes('text-white')) {
           lines[i] = lines[i].replace(/text-white/g, 'text-btn-text-primary');
           changed = true;
       }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, lines.join('\n'));
      modifiedFiles++;
    }
  }
});

console.log('Fixed text-white on ' + modifiedFiles + ' files.');
