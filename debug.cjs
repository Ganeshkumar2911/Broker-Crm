const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:60035/cashback?tab=enrollments', { waitUntil: 'networkidle2' });
  
  // wait for any requests to finish
  await new Promise(r => setTimeout(r, 2000));
  
  const text = await page.evaluate(() => {
    return document.body.innerText;
  });
  console.log("Body text includes 'Enroll Account':", text.includes('Enroll Account'));
  console.log("Body text includes 'There are no records available':", text.includes('There are no records available'));
  console.log("Body text includes 'Gold Rebate':", text.includes('Gold Rebate') || text.includes('Silver Cashback'));
  
  await browser.close();
})();
