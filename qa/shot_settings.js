const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 700, height: 1400 } })
  await page.goto('http://127.0.0.1:4124/settings-preview-tmp', { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'settings_full.png', fullPage: true })
  await browser.close()
  console.log('done')
})()
