const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 560, height: 820 } })
  await page.goto('http://127.0.0.1:4125/onboarding-preview-tmp', { waitUntil: 'networkidle' })

  // Step 1: Basics — Continue should start disabled
  const continueBtn = page.locator('button:has-text("Continue")')
  console.log('step1 continue disabled (empty):', await continueBtn.isDisabled())
  await page.screenshot({ path: 'w_step1_empty.png' })

  const inputs = page.locator('input:not([type="file"])')
  await inputs.nth(0).fill('Jordan')
  await inputs.nth(1).fill('Smith')
  await inputs.nth(2).fill('5')
  await page.waitForTimeout(200)
  console.log('step1 continue disabled (filled):', await continueBtn.isDisabled())
  await page.screenshot({ path: 'w_step1_filled.png' })

  await continueBtn.click()
  await page.waitForTimeout(200)

  // Step 2: Specialties
  await page.screenshot({ path: 'w_step2_empty.png' })
  console.log('step2 continue disabled (0 selected):', await page.locator('button:has-text("Continue")').isDisabled())

  await page.locator('button:has-text("Soccer")').click()
  await page.waitForTimeout(100)
  console.log('step2 continue disabled (1 selected):', await page.locator('button:has-text("Continue")').isDisabled())

  await page.locator('button:has-text("Speed & Agility")').click()
  await page.waitForTimeout(100)
  console.log('step2 continue disabled (2 selected):', await page.locator('button:has-text("Continue")').isDisabled())

  await page.locator('button:has-text("Youth Coaching")').click()
  await page.waitForTimeout(100)
  console.log('step2 continue disabled (3 selected):', await page.locator('button:has-text("Continue")').isDisabled())
  await page.screenshot({ path: 'w_step2_3selected.png' })

  // Test "+ Add your own"
  await page.locator('button:has-text("+ Add your own")').click()
  await page.waitForTimeout(100)
  await page.fill('input[placeholder="e.g. Goalkeeper Training"]', 'Goalkeeper Training')
  await page.locator('button:has-text("Add")').click()
  await page.waitForTimeout(100)
  console.log('step2 continue disabled (4 selected incl custom):', await page.locator('button:has-text("Continue")').isDisabled())
  await page.screenshot({ path: 'w_step2_custom_added.png' })

  // Add 2 more to exceed 5 and check the counter turns red / stays enabled or disabled per spec (3-5 required)
  await page.locator('button:has-text("Strength Training")').click()
  await page.waitForTimeout(100)
  console.log('step2 continue disabled (5 selected):', await page.locator('button:has-text("Continue")').isDisabled())
  await page.locator('button:has-text("Swimming")').click()
  await page.waitForTimeout(100)
  console.log('step2 continue disabled (6 selected, over max):', await page.locator('button:has-text("Continue")').isDisabled())
  await page.screenshot({ path: 'w_step2_over_max.png' })

  // Deselect back to 3 (Swimming, Strength Training off) then continue
  await page.locator('button:has-text("Swimming")').click()
  await page.locator('button:has-text("Strength Training")').click()
  await page.waitForTimeout(100)

  await page.locator('button:has-text("Continue")').click()
  await page.waitForTimeout(200)

  // Step 3: Reach
  await page.screenshot({ path: 'w_step3_empty.png' })
  console.log('step3 continue disabled (empty):', await page.locator('button:has-text("Finish setup")').isDisabled())

  const reachInputs = page.locator('input')
  await reachInputs.nth(0).fill('6')
  await reachInputs.nth(1).fill('14')
  await reachInputs.nth(2).fill('15')
  await reachInputs.nth(3).fill('Austin, TX')
  await reachInputs.nth(4).fill('65')
  await page.waitForTimeout(200)
  console.log('step3 finish disabled (filled valid):', await page.locator('button:has-text("Finish setup")').isDisabled())
  await page.screenshot({ path: 'w_step3_filled.png' })

  // invalid: min > max
  await reachInputs.nth(0).fill('20')
  await page.waitForTimeout(100)
  console.log('step3 finish disabled (min>max invalid):', await page.locator('button:has-text("Finish setup")').isDisabled())
  await reachInputs.nth(0).fill('6')
  await page.waitForTimeout(100)

  await page.locator('button:has-text("Finish setup")').click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'w_finished.png' })

  await browser.close()
  console.log('done')
})()
