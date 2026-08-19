const { chromium } = require('playwright');
const EMAIL = 'qa-parent-1@example.com';
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

  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(1500);

  const editBtn = page.locator('button, a').filter({ hasText: /Edit profile/i }).first();
  await editBtn.click({ timeout: 10000 });
  await page.waitForTimeout(800);

  const firstNameInput = page.locator('input[type="text"], input:not([type])').first();
  const val = await firstNameInput.inputValue();
  await firstNameInput.fill(val + 'x');
  await page.waitForTimeout(600);

  const info = await page.evaluate(() => {
    function rectOf(el) { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { rect: r, zIndex: cs.zIndex, position: cs.position, parentTag: el.parentElement ? el.parentElement.tagName : null }; }
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => /Save changes|Saving|Saved/.test(b.textContent));
    const helpBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '?');
    return {
      saveBtn: saveBtn ? rectOf(saveBtn) : null,
      helpBtn: helpBtn ? rectOf(helpBtn) : null,
    };
  });
  console.log('ELEMENT INFO:', JSON.stringify(info, null, 2));

  await page.screenshot({ path: 'scratch_savebar_parent.png', clip: { x: 900, y: 700, width: 500, height: 200 } });

  const saveClickable = await page.evaluate(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => /Save changes/.test(b.textContent));
    if (!saveBtn) return 'NOT FOUND';
    const r = saveBtn.getBoundingClientRect();
    const topEl = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
    return { isSelfOrChild: saveBtn.contains(topEl) || topEl === saveBtn, topElTag: topEl ? topEl.tagName + '.' + topEl.className : null };
  });
  console.log('SAVE BTN HIT-TEST:', JSON.stringify(saveClickable));

  const helpClickable = await page.evaluate(() => {
    const helpBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '?');
    if (!helpBtn) return 'NOT FOUND';
    const r = helpBtn.getBoundingClientRect();
    const topEl = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
    return { isSelfOrChild: helpBtn.contains(topEl) || topEl === helpBtn, topElTag: topEl ? topEl.tagName + '.' + topEl.className : null };
  });
  console.log('HELP BTN HIT-TEST:', JSON.stringify(helpClickable));

  const saveBtnLocator = page.locator('button', { hasText: 'Save changes' });
  if (await saveBtnLocator.count() > 0) {
    await saveBtnLocator.first().click();
    await page.waitForTimeout(1000);
    const statusText = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(b => /Save changes|Saving|Saved/.test(b.textContent));
      return b ? b.textContent : 'GONE';
    });
    console.log('POST-CLICK SAVE BUTTON TEXT:', statusText);
  }

  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR:', e.message); process.exit(1); });
