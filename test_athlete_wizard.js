const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 560, height: 900 } })
  await page.goto('http://127.0.0.1:4127/onboarding-athlete-preview-tmp', { waitUntil: 'networkidle' })

  // Gate: bad code
  await page.fill('input[placeholder="ABC-123"]', 'BAD-000')
  await page.locator('button:has-text("Continue")').click()
  await page.waitForTimeout(500)
  console.log('gate error shown after bad code:', await page.locator('text=Invalid or expired invite code.').isVisible())
  await page.screenshot({ path: 'a_gate_error.png' })

  // Gate: good code
  await page.fill('input[placeholder="ABC-123"]', 'ABC-123')
  await page.locator('button:has-text("Continue")').click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'a_step0_prefilled.png' })

  const continueBtn = () => page.locator('button:has-text("Continue")')
  console.log('step0 continue disabled (prefilled, valid age):', await continueBtn().isDisabled())

  // Edit DOB to make them a minor -> should block with age error
  await page.locator('input[type="date"]').fill('2015-01-01')
  await continueBtn().click()
  await page.waitForTimeout(200)
  console.log('age error shown for minor dob:', await page.locator('text=18 and older').isVisible())
  await page.screenshot({ path: 'a_step0_age_blocked.png' })

  // Fix DOB back to an adult age
  await page.locator('input[type="date"]').fill('2000-01-01')
  await continueBtn().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'a_step1_login.png' })

  // Step 1: login — weak then strong password
  const inputs = page.locator('input:not([type="checkbox"]):not([type="date"])')
  await inputs.nth(0).fill('jordan@example.com')
  await inputs.nth(1).fill('abc')
  await page.waitForTimeout(150)
  await page.screenshot({ path: 'a_password_weak.png' })
  console.log('step1 continue disabled (short password, no confirm, no agree):', await continueBtn().isDisabled())

  await inputs.nth(1).fill('SuperSecret123!')
  await inputs.nth(2).fill('SuperSecret123!')
  await page.waitForTimeout(150)
  await page.screenshot({ path: 'a_password_strong.png' })
  console.log('step1 continue disabled (strong password, matching confirm, no agree):', await continueBtn().isDisabled())

  await page.locator('input[type="checkbox"]').click()
  await page.waitForTimeout(150)
  console.log('step1 continue disabled (agreed):', await continueBtn().isDisabled())

  // Mismatch check
  await inputs.nth(2).fill('Different123!')
  await page.waitForTimeout(150)
  console.log('step1 continue disabled (mismatched confirm):', await continueBtn().isDisabled())
  console.log('mismatch message shown:', await page.locator("text=Passwords don't match.").isVisible())
  await inputs.nth(2).fill('SuperSecret123!')
  await page.waitForTimeout(150)

  await continueBtn().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'a_step2_notifications.png' })

  await page.locator('button:has-text("Finish setup")').click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'a_confirmation.png' })

  await browser.close()
  console.log('done')
})()
