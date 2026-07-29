const { chromium } = require('playwright');
const fs = require('fs');

const SHOT_DIR = 'C:\\Users\\kings\\AppData\\Local\\Temp\\claude\\c--Users-kings-OneDrive-Desktop-farm-landing-page\\a0841805-a3d8-4ce5-b540-293f37e5dc2c\\scratchpad\\shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const EMAIL = 'qa-parent-1@example.com';
const PASSWORD = 'TestPass123!';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });

  // Sign up as a parent (age 30)
  await page.goto('http://localhost:3000/signup');
  await page.waitForSelector('text=How old are you?');
  await page.fill('input[type=date]', '1994-01-01');
  await page.click('text=Continue');

  await page.waitForSelector('text=Create your account');
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASSWORD);
  await page.click('text=Continue');

  await page.waitForSelector('text=I am a...');
  await page.click('p:text-is("Parent")');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(2000);
  console.log('URL after parent signup:', page.url());
  await page.screenshot({ path: `${SHOT_DIR}/30-after-parent-signup.png` });

  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR:', e); process.exit(1); });
