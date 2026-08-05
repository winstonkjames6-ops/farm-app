const { chromium } = require('playwright');
const EMAIL = 'qa-trainer-3@example.com';
const PASSWORD = 'TestPass123!';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text().slice(0,200)); });

  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[type=email]', { timeout: 15000 });
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });

  await page.goto('http://localhost:3000/dashboard/trainer/profile');
  await page.waitForTimeout(1500);

  const editBtn = page.locator('button, a').filter({ hasText: /Edit profile/i }).first();
  await editBtn.click({ timeout: 10000 });
  await page.waitForTimeout(800);

  const nameInput = page.locator('input[type="text"], input:not([type])').first();
  const val = await nameInput.inputValue();
  await nameInput.fill(val + 'x');
  await page.waitForTimeout(600);

  const info = await page.evaluate(() => {
    function rectOf(el) { const r = el.getBoundingClientRect(); return r; }
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => /Save changes|Saving|Saved/.test(b.textContent));
    const helpBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '?');
    return { saveBtn: saveBtn ? rectOf(saveBtn) : null, helpBtn: helpBtn ? rectOf(helpBtn) : null };
  });
  console.log('TRAINER ELEMENT INFO:', JSON.stringify(info, null, 2));

  await page.screenshot({ path: 'scratch_savebar_trainer.png', clip: { x: 900, y: 700, width: 500, height: 200 } });

  // Confirm help button still opens its popover normally
  const helpBtnLocator = page.locator('button', { hasText: '?' });
  await helpBtnLocator.first().click();
  await page.waitForTimeout(500);
  const popoverVisible = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div')).some(d => d.style && d.style.width === '300px');
  });
  console.log('HELP POPOVER OPENED:', popoverVisible);
  await page.screenshot({ path: 'scratch_savebar_trainer_popover.png' });

  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR:', e.message); process.exit(1); });
