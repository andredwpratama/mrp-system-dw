/**
 * Setup Page Tests
 * Form input data sebelum kalkulasi (hanya untuk user yang login)
 */
import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Setup page — user login', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page)
  })

  test('login → visit /demo/forecast → redirect ke /demo/setup', async ({ page }) => {
    await page.goto('/demo/forecast')
    await expect(page).toHaveURL('/demo/setup', { timeout: 8000 })
  })

  test('setup page render dua section (demand + parameter)', async ({ page }) => {
    await page.goto('/demo/setup')
    await expect(page.getByText(/data permintaan historis/i)).toBeVisible()
    await expect(page.getByText(/parameter sistem/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /mulai kalkulasi/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /isi contoh/i })).toBeVisible()
  })

  test('form demand memiliki tepat 12 baris input', async ({ page }) => {
    await page.goto('/demo/setup')
    // Setiap baris punya: label input + number input
    const labelInputs = page.locator('input[placeholder*="cth:"]')
    await expect(labelInputs).toHaveCount(12)
  })

  test('tombol "Isi Contoh" mengisi semua field dengan data default', async ({ page }) => {
    await page.goto('/demo/setup')
    await page.getByRole('button', { name: /isi contoh/i }).click()

    // Baris pertama harus terisi (Agt 24)
    const firstLabel = page.locator('input[placeholder*="cth:"]').first()
    await expect(firstLabel).not.toHaveValue('')

    // Parameter harus terisi (misal orderCost = 20000)
    const orderCostInput = page.locator('#orderCost')
    await expect(orderCostInput).toHaveValue('20000')
  })

  test('submit tanpa data → error validasi muncul', async ({ page }) => {
    await page.goto('/demo/setup')
    await page.getByRole('button', { name: /mulai kalkulasi/i }).click()
    await expect(page.locator('main').getByRole('alert')).toBeVisible()
    // Tetap di setup
    await expect(page).toHaveURL('/demo/setup')
  })

  test('submit dengan data contoh → redirect ke /demo/forecast', async ({ page }) => {
    await page.goto('/demo/setup')
    await page.getByRole('button', { name: /isi contoh/i }).click()
    await page.getByRole('button', { name: /mulai kalkulasi/i }).click()
    await expect(page).toHaveURL('/demo/forecast', { timeout: 8000 })
  })

  test('setelah submit, link "Setup Data" muncul di sidebar', async ({ page }) => {
    await page.goto('/demo/setup')
    await page.getByRole('button', { name: /isi contoh/i }).click()
    await page.getByRole('button', { name: /mulai kalkulasi/i }).click()
    await expect(page).toHaveURL('/demo/forecast', { timeout: 8000 })
    await expect(page.getByRole('link', { name: /setup data/i })).toBeVisible()
  })

  test('setelah setup, tidak ada banner "Mode Demo"', async ({ page }) => {
    await page.goto('/demo/setup')
    await page.getByRole('button', { name: /isi contoh/i }).click()
    await page.getByRole('button', { name: /mulai kalkulasi/i }).click()
    await expect(page).toHaveURL('/demo/forecast', { timeout: 8000 })
    await expect(page.getByText(/mode demo/i)).not.toBeVisible()
  })

  test('input nilai demand negatif → error validasi', async ({ page }) => {
    await page.goto('/demo/setup')
    // Isi label
    const firstLabel = page.locator('input[placeholder*="cth:"]').first()
    await firstLabel.fill('Test')
    // Isi value negatif
    const firstValue = page.locator('input[type="number"]').first()
    await firstValue.fill('-5')
    await page.getByRole('button', { name: /mulai kalkulasi/i }).click()
    await expect(page.locator('main').getByRole('alert')).toBeVisible()
  })
})
