const { chromium } = require('playwright');
const fs = require('fs');

const SHOT_DIR = 'C:\\Users\\kings\\AppData\\Local\\Temp\\claude\\c--Users-kings-OneDrive-Desktop-farm-landing-page\\a0841805-a3d8-4ce5-b540-293f37e5dc2c\\scratchpad\\shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const EMAIL = 'qa-trainer-3@example.com';
const PASSWORD = 'TestPass123!';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });

  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('text=Sign in to your FARM account');
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/dashboard/**', { timeout: 15000 });

  await page.goto('http://localhost:3000/dashboard/trainer/profile');
  await page.waitForSelector('text=Your Name', { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Enter edit mode via role locator (more robust than legacy selector strings)
  await page.getByRole('button', { name: 'Edit profile', exact: true }).click();
  await page.waitForSelector('div:text-is("Dark mode")', { timeout: 10000 });
  console.log('Entered edit mode');

  const toggle = page.locator('div:text-is("Dark mode")').locator('xpath=../..').locator('> div').last();
  await toggle.click();
  await page.waitForSelector('text=Saved', { timeout: 10000 });
  console.log('Dark mode toggled and saved');

  await page.getByRole('button', { name: /Done editing/ }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SHOT_DIR}/11-banner-dark.png` });
  console.log('Shot: banner + dark done');

  await browser.close();
})().catch(async (e) => {
  console.error('SCRIPT ERROR:', e);
  process.exit(1);
});
