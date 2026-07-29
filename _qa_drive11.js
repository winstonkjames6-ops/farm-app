const { chromium } = require('playwright');
const fs = require('fs');

const SHOT_DIR = 'C:\\Users\\kings\\AppData\\Local\\Temp\\claude\\c--Users-kings-OneDrive-Desktop-farm-landing-page\\a0841805-a3d8-4ce5-b540-293f37e5dc2c\\scratchpad\\shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const CODE = 'VUU-4DL';
const EMAIL = 'qa-minor-riley@example.com';
const PASSWORD = 'TestPass123!';

async function cardWidth(page) {
  return page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('div'));
    const candidates = all.filter(d => d.style && d.style.maxWidth);
    return candidates.map(d => ({ maxWidth: d.style.maxWidth, rectWidth: Math.round(d.getBoundingClientRect().width) }));
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });

  await page.goto('http://localhost:3000/onboarding/athlete');
  await page.waitForSelector('text=Set up your account', { timeout: 10000 });
  await page.fill('input', CODE);
  await page.click('button:has-text("Continue")');
  await page.waitForSelector('text=Welcome, Riley!', { timeout: 10000 });

  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASSWORD);
  await page.click('button:has-text("Continue")');

  await page.waitForSelector('text=How should we notify you?', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOT_DIR}/41-minor-step1-notifications.png` });
  console.log('Step1 widths:', JSON.stringify(await cardWidth(page)));

  await page.click('button:has-text("Finish setup")');
  await page.waitForSelector('text=You\'re all set', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOT_DIR}/42-minor-confirmation.png` });
  console.log('Confirmation widths:', JSON.stringify(await cardWidth(page)));
  console.log('Final URL:', page.url());

  await browser.close();
})().catch(async (e) => {
  console.error('SCRIPT ERROR:', e);
  process.exit(1);
});
