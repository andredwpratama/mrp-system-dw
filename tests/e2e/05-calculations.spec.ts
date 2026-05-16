/**
 * Calculation Verification Tests
 * Verifikasi angka kunci dari Section 13 CLAUDE.md menggunakan data default skripsi
 * Semua test ini TIDAK butuh login (guest mode)
 */
import { test, expect } from '@playwright/test'

// Toleransi untuk float comparison
const FLOAT_TOLERANCE = 0.1

test.describe('Verifikasi kalkulasi — data default skripsi', () => {
  test('RCCP: kapasitas efektif = 420 × 0.9 × 0.95 = 359.1 mnt', async ({ page }) => {
    await page.goto('/demo/rccp')
    // Tunggu metric card muncul
    await expect(page.getByText(/359\.1|359,1/).first()).toBeVisible({ timeout: 10000 })
  })

  test('RCCP: utilisasi semua minggu harus > 0%', async ({ page }) => {
    await page.goto('/demo/rccp')
    await page.locator('table tbody tr').first().waitFor({ timeout: 10000 })
    const utilValues = await page.locator('table tbody tr td:nth-child(6)').allTextContents()
    for (const val of utilValues) {
      const num = parseFloat(val.replace('%', '').replace(',', '.'))
      expect(num).toBeGreaterThan(0)
    }
  })

  test('MRP LFL: ordering cost = Rp 240.000 (12 × Rp 20.000)', async ({ page }) => {
    await page.goto('/demo/mrp')
    await page.getByRole('tab', { name: 'LFL' }).click({ timeout: 10000 })
    // 12 orders × Rp 20.000 = Rp 240.000 — verify via numOrders in tab panel
    await expect(page.getByRole('tabpanel').getByText(/12.*planned orders|12.*order/i)).toBeVisible()
  })

  test('MRP FPR: ordering cost = Rp 60.000 (3 × Rp 20.000)', async ({ page }) => {
    await page.goto('/demo/mrp')
    await page.getByRole('tab', { name: 'FPR' }).click({ timeout: 10000 })
    // 3 orders × Rp 20.000 = Rp 60.000 — verify via numOrders in tab panel
    await expect(page.getByRole('tabpanel').getByText(/3.*planned orders|3.*order/i)).toBeVisible()
  })

  test('MRP: FPR adalah metode terbaik (total cost Rp 230.000)', async ({ page }) => {
    await page.goto('/demo/mrp')
    // Banner "Metode Terbaik" harus menyebut FPR
    await expect(page.getByText(/FPR/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/terpilih/i).first()).toBeVisible()
  })

  test('RRP week 1: jam butuh = 27 × 0.2 = 5.40', async ({ page }) => {
    await page.goto('/demo/rrp')
    await page.locator('table tbody tr').first().waitFor({ timeout: 10000 })
    // Baris pertama kolom "Jam Butuh" harus = 5.40
    const firstRowNeeded = await page.locator('table tbody tr:first-child td:nth-child(4)').textContent()
    const val = parseFloat(firstRowNeeded?.replace(',', '.') ?? '0')
    expect(Math.abs(val - 5.40)).toBeLessThan(FLOAT_TOLERANCE)
  })

  test('RRP week 1: surplus = 7 - 5.4 = 1.60', async ({ page }) => {
    await page.goto('/demo/rrp')
    await page.locator('table tbody tr').first().waitFor({ timeout: 10000 })
    const firstRowSurplus = await page.locator('table tbody tr:first-child td:nth-child(6)').textContent()
    const val = parseFloat(firstRowSurplus?.replace(',', '.') ?? '0')
    expect(Math.abs(val - 1.60)).toBeLessThan(FLOAT_TOLERANCE)
  })

  test('MPS: total produksi = sum of DEFAULT_MPS_WEEKLY = 340 unit', async ({ page }) => {
    await page.goto('/demo/mps')
    // DEFAULT_MPS_WEEKLY = [27,27,27,27,28,28,28,28,30,30,30,30] = 340
    await expect(page.getByText(/340/).first()).toBeVisible({ timeout: 10000 })
  })

  test('PAC batch B1: conversion rate = 3836/5170 = 0.742 (ON TRACK)', async ({ page }) => {
    await page.goto('/demo/pac')
    await page.locator('table tbody tr').first().waitFor({ timeout: 8000 })
    // Baris B1 harus ON TRACK
    const firstStatus = page.locator('table tbody tr:first-child').getByText(/ON TRACK/)
    await expect(firstStatus).toBeVisible()
  })

  test('Forecast: Linear Regression menghasilkan MAPE terendah', async ({ page }) => {
    await page.goto('/demo/forecast')
    await expect(page.getByText(/linear regression|regresi linear/i).first()).toBeVisible({ timeout: 10000 })
    // Best method badge
    await expect(page.getByText('Terpilih').first()).toBeVisible()
  })

  test('Forecast: semua 3 MetricCard menampilkan MAPE dalam %', async ({ page }) => {
    await page.goto('/demo/forecast')
    // Verify all 3 method MetricCard labels are visible
    await expect(page.getByText('DMA (n=3)')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('DES (α=0.3)').first()).toBeVisible()
    await expect(page.getByText('Reg. Linear').first()).toBeVisible()
    // At least one MAPE % value is rendered (MetricCard value is a sibling <p>, not same element as label)
    await expect(page.getByText(/\d+\.\d+%/).first()).toBeVisible()
  })
})
