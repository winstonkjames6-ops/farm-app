const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 700, height: 900 } })
  await page.goto('http://127.0.0.1:4124/settings-preview-tmp', { waitUntil: 'networkidle' })
  const html = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'))
    const toggle = divs.find(d => d.style.borderRadius === '999px' && d.style.width === '44px')
    return toggle ? toggle.outerHTML : 'NOT FOUND'
  })
  console.log(html)
  await browser.close()
})()
