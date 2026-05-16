import { Page } from '@playwright/test'

// Sample custom data for setup form tests
export const SAMPLE_DEMAND = [
  { label: 'Jan 25', value: 80 },
  { label: 'Feb 25', value: 75 },
  { label: 'Mar 25', value: 90 },
  { label: 'Apr 25', value: 85 },
  { label: 'Mei 25', value: 70 },
  { label: 'Jun 25', value: 95 },
  { label: 'Jul 25', value: 88 },
  { label: 'Agt 25', value: 92 },
  { label: 'Sep 25', value: 78 },
  { label: 'Okt 25', value: 83 },
  { label: 'Nov 25', value: 76 },
  { label: 'Des 25', value: 69 },
]

export const SAMPLE_PARAMS = {
  orderCost: 20000,
  holdingCostPerUnit: 500,
  processTime: 0.2,
  availableHours: 7,
  machineUtilization: 0.9,
  machineEfficiency: 0.95,
  conversionRate: 0.76,
  fermentationDays: 12,
  onHandInventory: 10,
  safetyStock: 10,
  leadTime: 2,
}

// Fill the setup form with sample data
export async function fillSetupForm(page: Page) {
  await page.goto('/demo/setup')

  // Click "Isi Contoh" to populate with default data
  await page.getByRole('button', { name: /isi contoh/i }).click()
}

// Fill setup with custom demand + params row by row
export async function fillSetupFormManually(page: Page) {
  await page.goto('/demo/setup')

  const labelInputs = page.locator('input[placeholder*="cth:"]')
  const valueInputs = page.locator('input[type="number"]').filter({ hasNot: page.locator('[id]') })

  for (let i = 0; i < SAMPLE_DEMAND.length; i++) {
    await labelInputs.nth(i).fill(SAMPLE_DEMAND[i].label)
    await labelInputs.nth(i).press('Tab')
  }

  // Use "Isi Contoh" for params since it's faster
  await page.getByRole('button', { name: /isi contoh/i }).click()
}
