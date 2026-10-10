const fs = require('fs');
let file = fs.readFileSync('src/components/default/NavBar.vue', 'utf-8');

file = file
  .replace(/hover:text-white/g, 'hover:text-navbar-text')
  .replace(/class="text-white text-xs font-bold"/g, 'class="text-btn-text-primary text-xs font-bold"')
  .replace(/class="text-white text-xs font-semibold truncate"/g, 'class="text-navbar-text text-xs font-semibold truncate"')
  .replace(/class="text-white text-\[11px\] capitalize truncate"/g, 'class="text-navbar-text text-[11px] capitalize truncate"');

fs.writeFileSync('src/components/default/NavBar.vue', file);
console.log('NavBar.vue final updates successful!');
