/**
 * Guest Mode Tests
 * Tidak login → data default skripsi tampil + banner "Mode Demo"
 */
import { test, expect } from '@playwright/test'

test.describe('Guest mode — tidak login', () => {
  test('landing page render dengan benar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /MRP II/i })).toBeVisible()
    // Navbar dan hero sama-sama punya link "Coba Demo" — pakai first()
    await expect(page.getByRole('link', { name: /coba demo/i }).first()).toBeVisible()
  })

  test('navbar tampil tanpa nama user', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header').getByRole('link', { name: /masuk/i })).toBeVisible()
    await expect(page.locator('header').getByRole('link', { name: /coba demo/i })).toBeVisible()
    // Tidak ada tombol "Dashboard"
    await expect(page.locator('header').getByRole('link', { name: /dashboard/i })).not.toBeVisible()
  })

  test('demo/forecast tampil data default tanpa redirect ke setup', async ({ page }) => {
    await page.goto('/demo/forecast')
    // Tidak redirect ke /demo/setup
    await expect(page).toHaveURL('/demo/forecast')
    // Halaman forecast render
    await expect(page.getByRole('heading', { name: /peramalan/i })).toBeVisible()
  })

  test('banner "Mode Demo" muncul di semua halaman demo', async ({ page }) => {
    for (const path of ['/demo/forecast', '/demo/mps', '/demo/mrp']) {
      await page.goto(path)
      await expect(page.getByText(/mode demo/i)).toBeVisible()
      await expect(page.getByRole('link', { name: /login untuk data/i })).toBeVisible()
    }
  })

  test('tidak ada link "Setup Data" di sidebar untuk guest', async ({ page }) => {
    await page.goto('/demo/forecast')
    await expect(page.getByRole('link', { name: /setup data/i })).not.toBeVisible()
  })

  test('8 step modul terlihat di sidebar', async ({ page }) => {
    await page.goto('/demo/forecast')
    const steps = ['Peramalan', 'Perencanaan', 'RRP', 'MPS', 'RCCP', 'MRP', 'CRP', 'PAC']
    for (const step of steps) {
      await expect(page.getByRole('link', { name: new RegExp(step, 'i') }).first()).toBeVisible()
    }
  })

  test('forecast page menampilkan tabel perbandingan metode', async ({ page }) => {
    await page.goto('/demo/forecast')
    // Tunggu kalkulasi selesai (tabel muncul)
    await expect(page.getByText(/DMA|DES|Regresi|Linear/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('MPS page menampilkan data default (12 baris)', async ({ page }) => {
    await page.goto('/demo/mps')
    // Tabel MPS harus ada setidaknya 1 baris data
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 8000 })
    const rowCount = await page.locator('table tbody tr').count()
    expect(rowCount).toBeGreaterThanOrEqual(12)
  })

  test('RCCP page menampilkan status FEASIBLE atau overload count', async ({ page }) => {
    await page.goto('/demo/rccp')
    await expect(page.getByText(/FEASIBLE|Overload/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('MRP page menampilkan 4 tab LFL/EOQ/POQ/FPR', async ({ page }) => {
    await page.goto('/demo/mrp')
    await expect(page.getByRole('tab', { name: 'LFL' })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('tab', { name: 'EOQ' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'POQ' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'FPR' })).toBeVisible()
  })

  test('PAC page menampilkan data contoh (tidak editable)', async ({ page }) => {
    await page.goto('/demo/pac')
    // DataTable harus ada
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 8000 })
    // Tidak ada tombol "Tambah Batch"
    await expect(page.getByRole('button', { name: /tambah batch/i })).not.toBeVisible()
  })

  test('/dashboard redirect ke login untuk guest', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })

  test('halaman story, methodology, results dapat diakses tanpa login', async ({ page }) => {
    for (const path of ['/story', '/methodology', '/results']) {
      await page.goto(path)
      await expect(page).toHaveURL(path)
      await expect(page.locator('h1').first()).toBeVisible()
    }
  })
})
