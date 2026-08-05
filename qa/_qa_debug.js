const { chromium } = require('playwright');
const fs = require('fs');
const SHOT_DIR = 'C:\\Users\\kings\\AppData\\Local\\Temp\\claude\\c--Users-kings-OneDrive-Desktop-farm-landing-page\\a0841805-a3d8-4ce5-b540-293f37e5dc2c\\scratchpad\\shots';

const EMAIL = 'qa-trainer-3@example.com';
const PASSWORD = 'TestPass123!';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()));

  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('text=Sign in to your FARM account');
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/dashboard/**', { timeout: 15000 });

  await page.goto('http://localhost:3000/dashboard/trainer/profile');
  await page.waitForSelector('text=Your Name', { timeout: 10000 });
  await page.waitForTimeout(1500);

  console.log('URL:', page.url());
  const buttons = await page.$$eval('button', els => els.map(e => ({ text: e.innerText, visible: e.offsetParent !== null })));
  console.log('BUTTONS:', JSON.stringify(buttons, null, 2));
  const bodyLen = await page.evaluate(() => document.body.innerHTML.length);
  console.log('BODY HTML LENGTH:', bodyLen);
  await page.screenshot({ path: `${SHOT_DIR}/debug-pre-click.png` });

  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR:', e); process.exit(1); });
