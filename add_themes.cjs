const fs = require('fs');
const path = require('path');

const newThemes = [
  // New Light
  { 
    id: 'peach-puff', name: 'Peach Puff', mode: 'light', 
    css: `  --color-background: #fff7ed;
  --color-card-background: #ffffff;
  --color-primary: #ea580c;
  --color-primary-hover: #c2410c;
  --color-secondary: #431407;
  --color-navbar: #fff7ed;
  --color-primary-text: #431407;
  --color-secondary-text: #9a3412;
  --color-primary-border: #ffedd5;
  --color-accent: #f97316;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #f59e0b;
  --color-primary-red: #ef4444;
  --color-primary-blue: #3b82f6;`
  },
  { 
    id: 'mint-cream', name: 'Mint Cream', mode: 'light',
    css: `  --color-background: #f0fdf4;
  --color-card-background: #ffffff;
  --color-primary: #0d9488;
  --color-primary-hover: #0f766e;
  --color-secondary: #134e4a;
  --color-navbar: #f0fdf4;
  --color-primary-text: #134e4a;
  --color-secondary-text: #115e59;
  --color-primary-border: #ccfbf1;
  --color-accent: #14b8a6;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #f59e0b;
  --color-primary-red: #ef4444;
  --color-primary-blue: #3b82f6;`
  },
  {
    id: 'lemon-drop', name: 'Lemon Drop', mode: 'light',
    css: `  --color-background: #fefce8;
  --color-card-background: #ffffff;
  --color-primary: #ca8a04;
  --color-primary-hover: #a16207;
  --color-secondary: #422006;
  --color-navbar: #fefce8;
  --color-primary-text: #422006;
  --color-secondary-text: #854d0e;
  --color-primary-border: #fef08a;
  --color-accent: #eab308;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #eab308;
  --color-primary-red: #ef4444;
  --color-primary-blue: #3b82f6;`
  },
  {
    id: 'cotton-candy', name: 'Cotton Candy', mode: 'light',
    css: `  --color-background: #fdf2f8;
  --color-card-background: #ffffff;
  --color-primary: #db2777;
  --color-primary-hover: #be185d;
  --color-secondary: #500724;
  --color-navbar: #fdf2f8;
  --color-primary-text: #500724;
  --color-secondary-text: #9d174d;
  --color-primary-border: #fbcfe8;
  --color-accent: #f472b6;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #f59e0b;
  --color-primary-red: #e11d48;
  --color-primary-blue: #3b82f6;`
  },
  {
    id: 'ice-water', name: 'Ice Water', mode: 'light',
    css: `  --color-background: #ecfeff;
  --color-card-background: #ffffff;
  --color-primary: #0891b2;
  --color-primary-hover: #0e7490;
  --color-secondary: #164e63;
  --color-navbar: #ecfeff;
  --color-primary-text: #164e63;
  --color-secondary-text: #155e75;
  --color-primary-border: #cffafe;
  --color-accent: #06b6d4;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #f59e0b;
  --color-primary-red: #ef4444;
  --color-primary-blue: #0ea5e9;`
  },
  {
    id: 'sandstone', name: 'Sandstone', mode: 'light',
    css: `  --color-background: #f5f5f4;
  --color-card-background: #ffffff;
  --color-primary: #78716c;
  --color-primary-hover: #57534e;
  --color-secondary: #1c1917;
  --color-navbar: #f5f5f4;
  --color-primary-text: #1c1917;
  --color-secondary-text: #44403c;
  --color-primary-border: #e7e5e4;
  --color-accent: #a8a29e;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #f59e0b;
  --color-primary-red: #ef4444;
  --color-primary-blue: #3b82f6;`
  },
  {
    id: 'cyber-light', name: 'Cyber Light', mode: 'light',
    css: `  --color-background: #f8fafc;
  --color-card-background: #ffffff;
  --color-primary: #c026d3;
  --color-primary-hover: #a21caf;
  --color-secondary: #020617;
  --color-navbar: #f8fafc;
  --color-primary-text: #020617;
  --color-secondary-text: #475569;
  --color-primary-border: #e2e8f0;
  --color-accent: #06b6d4;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #eab308;
  --color-primary-red: #ef4444;
  --color-primary-blue: #06b6d4;`
  },
  {
    id: 'autumn-leaf', name: 'Autumn Leaf', mode: 'light',
    css: `  --color-background: #fef3c7;
  --color-card-background: #ffffff;
  --color-primary: #b45309;
  --color-primary-hover: #92400e;
  --color-secondary: #451a03;
  --color-navbar: #fef3c7;
  --color-primary-text: #451a03;
  --color-secondary-text: #78350f;
  --color-primary-border: #fde68a;
  --color-accent: #d97706;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #16a34a;
  --color-primary-yellow: #d97706;
  --color-primary-red: #dc2626;
  --color-primary-blue: #2563eb;`
  },

  // New Dark
  {
    id: 'cyberpunk', name: 'Cyberpunk', mode: 'dark',
    css: `  --color-background: #09090b;
  --color-card-background: #18181b;
  --color-primary: #f472b6;
  --color-primary-hover: #ec4899;
  --color-secondary: #fdf4ff;
  --color-navbar: #09090b;
  --color-primary-text: #fdf4ff;
  --color-secondary-text: #fbcfe8;
  --color-primary-border: #3f3f46;
  --color-accent: #22d3ee;
  --color-btn-text-primary: #09090b;
  --color-primary-green: #4ade80;
  --color-primary-yellow: #fde047;
  --color-primary-red: #f43f5e;
  --color-primary-blue: #22d3ee;`
  },
  {
    id: 'synthwave', name: 'Synthwave', mode: 'dark',
    css: `  --color-background: #2e0249;
  --color-card-background: #570a57;
  --color-primary: #f806cc;
  --color-primary-hover: #d904b1;
  --color-secondary: #ffffff;
  --color-navbar: #2e0249;
  --color-primary-text: #ffffff;
  --color-secondary-text: #fbcfe8;
  --color-primary-border: #a91079;
  --color-accent: #22d3ee;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #4ade80;
  --color-primary-yellow: #facc15;
  --color-primary-red: #f43f5e;
  --color-primary-blue: #38bdf8;`
  },
  {
    id: 'hacker-green', name: 'Hacker Green', mode: 'dark',
    css: `  --color-background: #000000;
  --color-card-background: #0a0a0a;
  --color-primary: #22c55e;
  --color-primary-hover: #16a34a;
  --color-secondary: #ffffff;
  --color-navbar: #000000;
  --color-primary-text: #ffffff;
  --color-secondary-text: #4ade80;
  --color-primary-border: #14532d;
  --color-accent: #4ade80;
  --color-btn-text-primary: #000000;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #facc15;
  --color-primary-red: #ef4444;
  --color-primary-blue: #3b82f6;`
  },
  {
    id: 'blood-moon', name: 'Blood Moon', mode: 'dark',
    css: `  --color-background: #1a0505;
  --color-card-background: #2a0a0a;
  --color-primary: #dc2626;
  --color-primary-hover: #b91c1c;
  --color-secondary: #fef2f2;
  --color-navbar: #1a0505;
  --color-primary-text: #fef2f2;
  --color-secondary-text: #fca5a5;
  --color-primary-border: #450a0a;
  --color-accent: #ef4444;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #facc15;
  --color-primary-red: #dc2626;
  --color-primary-blue: #3b82f6;`
  },
  {
    id: 'neon-purple', name: 'Neon Purple', mode: 'dark',
    css: `  --color-background: #0f001a;
  --color-card-background: #1f0033;
  --color-primary: #a855f7;
  --color-primary-hover: #9333ea;
  --color-secondary: #faf5ff;
  --color-navbar: #0f001a;
  --color-primary-text: #faf5ff;
  --color-secondary-text: #d8b4fe;
  --color-primary-border: #3b0764;
  --color-accent: #c084fc;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #4ade80;
  --color-primary-yellow: #facc15;
  --color-primary-red: #f87171;
  --color-primary-blue: #60a5fa;`
  },
  {
    id: 'volcano', name: 'Volcano', mode: 'dark',
    css: `  --color-background: #171717;
  --color-card-background: #262626;
  --color-primary: #ea580c;
  --color-primary-hover: #c2410c;
  --color-secondary: #fff7ed;
  --color-navbar: #171717;
  --color-primary-text: #fff7ed;
  --color-secondary-text: #fdba74;
  --color-primary-border: #404040;
  --color-accent: #f97316;
  --color-btn-text-primary: #ffffff;
  --color-primary-green: #22c55e;
  --color-primary-yellow: #eab308;
  --color-primary-red: #ef4444;
  --color-primary-blue: #3b82f6;`
  },
  {
    id: 'abyss', name: 'Abyss', mode: 'dark',
    css: `  --color-background: #000000;
  --color-card-background: #09090b;
  --color-primary: #fafafa;
  --color-primary-hover: #e4e4e7;
  --color-secondary: #ffffff;
  --color-navbar: #000000;
  --color-primary-text: #ffffff;
  --color-secondary-text: #a1a1aa;
  --color-primary-border: #27272a;
  --color-accent: #d4d4d8;
  --color-btn-text-primary: #000000;
  --color-primary-green: #4ade80;
  --color-primary-yellow: #fbbf24;
  --color-primary-red: #f87171;
  --color-primary-blue: #60a5fa;`
  },
  {
    id: 'space-cadet', name: 'Space Cadet', mode: 'dark',
    css: `  --color-background: #0b0f19;
  --color-card-background: #111827;
  --color-primary: #93c5fd;
  --color-primary-hover: #60a5fa;
  --color-secondary: #ffffff;
  --color-navbar: #0b0f19;
  --color-primary-text: #ffffff;
  --color-secondary-text: #bfdbfe;
  --color-primary-border: #1e3a8a;
  --color-accent: #fde047;
  --color-btn-text-primary: #0b0f19;
  --color-primary-green: #34d399;
  --color-primary-yellow: #fde047;
  --color-primary-red: #f87171;
  --color-primary-blue: #60a5fa;`
  },
  {
    id: 'tokyo-night', name: 'Tokyo Night', mode: 'dark',
    css: `  --color-background: #1a1b26;
  --color-card-background: #24283b;
  --color-primary: #7aa2f7;
  --color-primary-hover: #8caaee;
  --color-secondary: #c0caf5;
  --color-navbar: #1a1b26;
  --color-primary-text: #c0caf5;
  --color-secondary-text: #a9b1d6;
  --color-primary-border: #414868;
  --color-accent: #bb9af7;
  --color-btn-text-primary: #1a1b26;
  --color-primary-green: #9ece6a;
  --color-primary-yellow: #e0af68;
  --color-primary-red: #f7768e;
  --color-primary-blue: #7aa2f7;`
  },
  {
    id: 'nord', name: 'Nord', mode: 'dark',
    css: `  --color-background: #2e3440;
  --color-card-background: #3b4252;
  --color-primary: #81a1c1;
  --color-primary-hover: #88c0d0;
  --color-secondary: #eceff4;
  --color-navbar: #2e3440;
  --color-primary-text: #eceff4;
  --color-secondary-text: #d8dee9;
  --color-primary-border: #4c566a;
  --color-accent: #5e81ac;
  --color-btn-text-primary: #2e3440;
  --color-primary-green: #a3be8c;
  --color-primary-yellow: #ebcb8b;
  --color-primary-red: #bf616a;
  --color-primary-blue: #81a1c1;`
  },
  {
    id: 'gruvbox-dark', name: 'Gruvbox', mode: 'dark',
    css: `  --color-background: #282828;
  --color-card-background: #3c3836;
  --color-primary: #d3869b;
  --color-primary-hover: #b16286;
  --color-secondary: #ebdbb2;
  --color-navbar: #282828;
  --color-primary-text: #ebdbb2;
  --color-secondary-text: #a89984;
  --color-primary-border: #504945;
  --color-accent: #fabd2f;
  --color-btn-text-primary: #282828;
  --color-primary-green: #b8bb26;
  --color-primary-yellow: #fabd2f;
  --color-primary-red: #fb4934;
  --color-primary-blue: #83a598;`
  }
];

function generatePreviewColors(cssString) {
  const vars = cssString.split('\\n');
  const getVar = (name) => {
    const line = vars.find(l => l.includes(name));
    return line ? line.split(':')[1].replace(';', '').trim() : '#000';
  };
  return [
    getVar('--color-background'),
    getVar('--color-card-background'),
    getVar('--color-primary'),
    getVar('--color-secondary')
  ];
}

newThemes.forEach(theme => {
  theme.previewColors = generatePreviewColors(theme.css);
});

const themeJsPath = path.join(__dirname, 'src/utils/theme.js');
let themeJs = fs.readFileSync(themeJsPath, 'utf-8');

// Insert new themes into theme.js
const newThemesArrayString = newThemes.map(t => 
  "  { id: '" + t.id + "', name: '" + t.name + "', mode: '" + t.mode + "', previewColors: " + JSON.stringify(t.previewColors) + " }"
).join(',\n');

themeJs = themeJs.replace(
  /export const themes = \\[[\\s\\S]*?\\]/,
  (match) => {
    const contentWithoutBracket = match.slice(0, -1);
    return contentWithoutBracket + '  // Generated new themes\\n' + newThemesArrayString + '\\n]';
  }
);
fs.writeFileSync(themeJsPath, themeJs);

const styleCssPath = path.join(__dirname, 'src/style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf-8');

// Append new themes to style.css
const newThemesCss = newThemes.map(t => 
  "\n[data-theme=\"" + t.id + "\"] {\n" + t.css + "\n}"
).join('\n');

styleCss += newThemesCss;
fs.writeFileSync(styleCssPath, styleCss);

console.log('Successfully added 19 new themes!');
