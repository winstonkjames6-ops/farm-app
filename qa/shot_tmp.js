const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 500, height: 2400 } })
  await page.goto('http://127.0.0.1:4123/pc-preview-tmp', { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(__dirname, 'profilecard_preview.png'), fullPage: true })
  await browser.close()
  console.log('done')
})()
