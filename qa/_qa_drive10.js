const { chromium } = require('playwright');
const fs = require('fs');

const SHOT_DIR = 'C:\\Users\\kings\\AppData\\Local\\Temp\\claude\\c--Users-kings-OneDrive-Desktop-farm-landing-page\\a0841805-a3d8-4ce5-b540-293f37e5dc2c\\scratchpad\\shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const CODE = 'VUU-4DL';
const EMAIL = 'qa-minor-riley@example.com';
const PASSWORD = 'TestPass123!';

async function cardWidth(page) {
  return page.evaluate(() => {
    // Find the widest plausible "card" container: look for a div with maxWidth in inline style
    const all = Array.from(document.querySelectorAll('div'));
    const candidates = all.filter(d => d.style && d.style.maxWidth);
    return candidates.map(d => ({ maxWidth: d.style.maxWidth, rectWidth: Math.round(d.getBoundingClientRect().width) }));
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });

  // Use a fresh incognito-like context (no existing session) by clearing cookies first
  await page.goto('http://localhost:3000/onboarding/athlete');
  await page.waitForSelector('text=Set up your account', { timeout: 10000 });
  await page.fill('input', CODE);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1500);
  console.log('After code submit, body snippet:', (await page.evaluate(() => document.body.innerText)).slice(0, 300));
  await page.screenshot({ path: `${SHOT_DIR}/40-minor-step0-welcome.png` });
  console.log('Step0 widths:', JSON.stringify(await cardWidth(page)));

  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR:', e); process.exit(1); });
