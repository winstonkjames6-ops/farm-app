const { chromium } = require('playwright');
const fs = require('fs');

const SHOT_DIR = 'C:\\Users\\kings\\AppData\\Local\\Temp\\claude\\c--Users-kings-OneDrive-Desktop-farm-landing-page\\a0841805-a3d8-4ce5-b540-293f37e5dc2c\\scratchpad\\shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const EMAIL = 'qa-trainer-1@example.com';
const PASSWORD = 'TestPass123!';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('text=Sign in to your FARM account');
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASSWORD);
  await page.click('button:has-text("Sign in")');

  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
  console.log('Logged in, landed on:', page.url());

  await page.goto('http://localhost:3000/dashboard/trainer/profile');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOT_DIR}/01-trainer-profile-light-nobanner.png`, fullPage: true });
  console.log('Screenshot 1 done:', page.url());

  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR:', e); process.exit(1); });
