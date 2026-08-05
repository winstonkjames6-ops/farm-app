const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 700, height: 900 } })
  await page.goto('http://127.0.0.1:4124/settings-preview-tmp', { waitUntil: 'networkidle' })

  // Toggle the "Promotional updates" switch (4th toggle in Notifications) and screenshot before/after
  const toggles = page.locator('div[style*="border-radius: 999px"][style*="width: 44px"]')
  await toggles.nth(3).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'settings_toggle_on.png', clip: { x: 20, y: 100, width: 660, height: 380 } })

  // Open the delete-account modal
  await page.locator('button:has-text("Delete")').click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'settings_delete_modal.png' })

  // Try clicking "Delete my account" while confirm text is empty -> should be disabled/no-op
  const deleteBtn = page.locator('button:has-text("Delete my account")')
  const isDisabled = await deleteBtn.isDisabled()
  console.log('delete button disabled when empty:', isDisabled)

  await page.fill('input[placeholder="DELETE"]', 'delete')
  await page.waitForTimeout(100)
  const isDisabledLower = await deleteBtn.isDisabled()
  console.log('delete button disabled with lowercase "delete":', isDisabledLower)

  await browser.close()
  console.log('done')
})()
