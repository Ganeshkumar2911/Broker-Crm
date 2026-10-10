const fs = require('fs');
let css = fs.readFileSync('src/style.css', 'utf-8');

if (!css.includes('--display-logo-light')) {
  css = css.replace(/--color-navbar-text:\s*#111827;/g, match => {
    return match + '\n  --display-logo-light: block;\n  --display-logo-dark: none;';
  });

  css = css.replace(/--color-navbar-text:\s*#ffffff;/g, match => {
    return match + '\n  --display-logo-light: none;\n  --display-logo-dark: block;';
  });

  css += `\n
.hidden-on-light-nav { display: var(--display-logo-dark, block) !important; }
.hidden-on-dark-nav { display: var(--display-logo-light, none) !important; }
`;

  fs.writeFileSync('src/style.css', css);
  console.log('Logo variables injected');
} else {
  console.log('Already injected');
}
