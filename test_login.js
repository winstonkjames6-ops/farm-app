const { chromium } = require('playwright')

const email = process.argv[2]
const password = process.argv[3]
const base = process.argv[4] || 'http://127.0.0.1:4125'

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } })
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'login_page.png' })

  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]')
  await emailInput.fill(email)
  await passwordInput.fill(password)

  await page.locator('button:has-text("Sign in")').click()
  await page.waitForTimeout(3000)
  console.log('URL after login attempt:', page.url())
  await page.screenshot({ path: 'login_result.png' })

  const bodyText = await page.textContent('body')
  console.log('Body snippet:', bodyText?.slice(0, 500))

  await browser.close()
})()
