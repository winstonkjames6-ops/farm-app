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

  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('text=Sign in to your FARM account');
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(1500);

  await page.goto('http://localhost:3000/onboarding/parent');
  await page.waitForSelector('text=Add your athletes', { timeout: 10000 });

  await page.fill('input[placeholder=""] >> nth=0', '').catch(() => {});
  // First/last name inputs (no placeholder), locate via label proximity
  const inputs = await page.locator('input:not([type=date])').all();
  await inputs[0].fill('Riley');
  await inputs[1].fill('Test');
  await page.fill('input[type=date]', '2013-05-10'); // ~13yo, clearly a minor
  await page.selectOption('select', { label: 'Soccer' });
  await page.screenshot({ path: `${SHOT_DIR}/32-athlete-filled.png` });

  await page.click('button:has-text("Continue")');
  await page.waitForSelector('text=Consent', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOT_DIR}/33-consent-step.png` });

  await page.click('input[type=checkbox]');
  await page.click('button:has-text("Finish setup")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SHOT_DIR}/34-invite-code-screen.png`, fullPage: true });
  console.log('URL:', page.url());

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT:', bodyText.slice(0, 1500));

  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR:', e); process.exit(1); });
