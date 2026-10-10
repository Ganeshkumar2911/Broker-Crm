const fs = require('fs');

let css = fs.readFileSync('src/style.css', 'utf-8');

function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    if (hexcolor.length === 3) {
      hexcolor = hexcolor.split('').map(c => c+c).join('');
    }
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#111827' : '#ffffff';
}

// Ensure we don't accidentally add it twice if we run it multiple times
if (!css.includes('--color-navbar-text:')) {
  css = css.replace(/--color-navbar:\s*(#[0-9a-fA-F]+);/g, (match, hex) => {
      let textColor = getContrastYIQ(hex);
      let hoverBg = textColor === '#111827' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
      let mutedColor = textColor === '#111827' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
      let borderColor = textColor === '#111827' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)';
      return `${match}\n  --color-navbar-text: ${textColor};\n  --color-navbar-text-muted: ${mutedColor};\n  --color-navbar-hover: ${hoverBg};\n  --color-navbar-border: ${borderColor};`;
  });
  fs.writeFileSync('src/style.css', css);
  console.log('Successfully injected navbar text colors!');
} else {
  console.log('Already injected.');
}
