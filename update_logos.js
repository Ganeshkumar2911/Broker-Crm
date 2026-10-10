const fs = require('fs');

function updatePlans() {
  const file = '/Users/apple/Desktop/panther-capital-admin-frontend/src/pages/cashback/tabs/PlansTab.vue';
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const newContent = [
    ...lines.slice(0, 27),
    `          <!-- Brand Logo Watermark Background with shine effect strictly inside logo vector paths -->`,
    `          <div class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">`,
    `            <div class="relative w-32 sm:w-36 h-32 sm:h-36">`,
    `              <img`,
    `                src="/gold_logo.png"`,
    `                alt="Plan Logo"`,
    `                class="absolute inset-0 w-full h-full opacity-10 object-contain grayscale-[20%]"`,
    `              />`,
    `              <div`,
    `                class="absolute inset-0 pointer-events-none"`,
    `                style="-webkit-mask-image: url(/gold_logo.png); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;"`,
    `              >`,
    `                <div class="w-[350px] h-[800px] absolute top-1/2 left-1/2 -mt-[400px] -ml-[175px] svg-shine-rect"`,
    `                     style="background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.08) 65%, rgba(255,255,255,0) 100%);">`,
    `                </div>`,
    `              </div>`,
    `            </div>`,
    `          </div>`,
    ...lines.slice(75)
  ].join('\n');
  fs.writeFileSync(file, newContent);
}

function updateTiers() {
  const file = '/Users/apple/Desktop/panther-capital-admin-frontend/src/pages/loyalty/tabs/TiersTab.vue';
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  // Find where the image is
  const startIdx = lines.findIndex(l => l.includes('<!-- Brand Logo Watermark Background with shine effect strictly inside logo vector paths -->'));
  const endIdx = startIdx + 8; // image div is 8 lines long
  
  if (startIdx > -1) {
    const newContent = [
      ...lines.slice(0, startIdx),
      `          <!-- Brand Logo Watermark Background with shine effect strictly inside logo vector paths -->`,
      `          <div class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">`,
      `            <div class="relative w-32 sm:w-36 h-32 sm:h-36">`,
      `              <img`,
      `                src="/gold_logo.png"`,
      `                alt="Tier Logo"`,
      `                class="absolute inset-0 w-full h-full opacity-10 object-contain grayscale-[20%]"`,
      `              />`,
      `              <div`,
      `                class="absolute inset-0 pointer-events-none"`,
      `                style="-webkit-mask-image: url(/gold_logo.png); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;"`,
      `              >`,
      `                <div class="w-[350px] h-[800px] absolute top-1/2 left-1/2 -mt-[400px] -ml-[175px] svg-shine-rect"`,
      `                     style="background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.08) 65%, rgba(255,255,255,0) 100%);">`,
      `                </div>`,
      `              </div>`,
      `            </div>`,
      `          </div>`,
      ...lines.slice(endIdx)
    ].join('\n');
    fs.writeFileSync(file, newContent);
  }
}

updatePlans();
updateTiers();
console.log('done');
