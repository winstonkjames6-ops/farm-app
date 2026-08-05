const { chromium } = require('playwright');
const fs = require('fs');

const SHOT_DIR = 'C:\\Users\\kings\\AppData\\Local\\Temp\\claude\\c--Users-kings-OneDrive-Desktop-farm-landing-page\\a0841805-a3d8-4ce5-b540-293f37e5dc2c\\scratchpad\\shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const EMAIL = 'qa-trainer-1@example.com';
const PASSWORD = 'TestPass123!';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });

  await page.goto('http://localhost:3000/signup');
  await page.waitForSelector('text=How old are you?');
  await page.fill('input[type=date]', '1990-01-01');
  await page.click('text=Continue');

  await page.waitForSelector('text=Create your account');
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASSWORD);
  await page.click('text=Continue');

  await page.waitForSelector('text=I am a...');
  await page.click('text=Trainer');
  await page.click('button:has-text("Continue")');

  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SHOT_DIR}/00-signup-checkemail.png` });
  console.log('Signup submitted for', EMAIL);

  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR:', e); process.exit(1); });
