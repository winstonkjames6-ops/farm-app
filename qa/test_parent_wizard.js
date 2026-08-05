const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 560, height: 900 } })
  await page.goto('http://127.0.0.1:4126/onboarding-parent-preview-tmp', { waitUntil: 'networkidle' })

  const continueBtn = () => page.locator('button:has-text("Continue")')
  const inputs = () => page.locator('input:not([type="file"]):not([type="checkbox"]):not([type="date"])')

  console.log('step0 continue disabled (empty):', await continueBtn().isDisabled())
  await page.screenshot({ path: 'p_step0_empty.png' })

  await inputs().nth(0).fill('Jamie')
  await inputs().nth(1).fill('Rivera')
  await inputs().nth(2).fill('jamie@example.com')
  await inputs().nth(3).fill('supersecret1')
  await page.waitForTimeout(150)
  console.log('step0 continue disabled (filled):', await continueBtn().isDisabled())
  await page.screenshot({ path: 'p_step0_filled.png' })

  await continueBtn().click()
  await page.waitForTimeout(600)

  // Step 1: athletes
  await page.screenshot({ path: 'p_step1_empty.png' })
  console.log('step1 continue disabled (empty child):', await continueBtn().isDisabled())

  await inputs().nth(0).fill('Alex')
  await inputs().nth(1).fill('Rivera')
  await page.locator('input[type="date"]').first().fill('2014-05-10')
  await page.locator('select').first().selectOption('Soccer')
  await page.waitForTimeout(150)
  console.log('step1 continue disabled (1 child filled):', await continueBtn().isDisabled())
  await page.screenshot({ path: 'p_step1_one_child.png' })

  await page.locator('button:has-text("+ Add another athlete")').click()
  await page.waitForTimeout(150)
  console.log('step1 continue disabled (2nd child empty):', await continueBtn().isDisabled())
  await page.screenshot({ path: 'p_step1_two_children_incomplete.png' })

  const dateInputs = page.locator('input[type="date"]')
  const selects = page.locator('select')
  await inputs().nth(2).fill('Sam')
  await inputs().nth(3).fill('Rivera')
  await dateInputs.nth(1).fill('2016-08-20')
  await selects.nth(1).selectOption('Tennis')
  await page.waitForTimeout(150)
  console.log('step1 continue disabled (both children filled):', await continueBtn().isDisabled())
  await page.screenshot({ path: 'p_step1_two_children_complete.png' })

  // Remove the second child, confirm remove button behavior
  await page.locator('button:has-text("Remove")').last().click()
  await page.waitForTimeout(150)
  console.log('remove buttons visible after removing 2nd (should be 0, since only 1 left):', await page.locator('button:has-text("Remove")').count())

  await continueBtn().click()
  await page.waitForTimeout(300)

  // Step 2: consent — last step, button reads "Finish setup"
  const finishBtn = () => page.locator('button:has-text("Finish setup")')
  await page.screenshot({ path: 'p_step2_unchecked.png' })
  console.log('step2 finish disabled (unchecked):', await finishBtn().isDisabled())

  await page.locator('input[type="checkbox"]').click()
  await page.waitForTimeout(150)
  console.log('step2 finish disabled (checked):', await finishBtn().isDisabled())
  await page.screenshot({ path: 'p_step2_checked.png' })

  await finishBtn().click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'p_success.png' })

  await browser.close()
  console.log('done')
})()
