/**
 * Demo Flow Tests (Login Mode)
 * Full flow: Setup → Forecast → Aggregate → RRP → MPS → RCCP → MRP → CRP → PAC
 */
import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

// Gunakan satu auth state untuk seluruh describe block ini
test.describe('Full demo flow — user dengan data custom', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page)
    // Setup dengan data contoh (satu kali cukup karena Zustand in-memory)
    await page.goto('/demo/setup')
    await page.getByRole('button', { name: /isi contoh/i }).click()
    await page.getByRole('button', { name: /mulai kalkulasi/i }).click()
    await expect(page).toHaveURL('/demo/forecast', { timeout: 8000 })
    // Wait for forecast calculation useEffect to complete
    await expect(page.getByText('Terpilih').first()).toBeVisible({ timeout: 10000 })
  })

  // ── Forecast ──────────────────────────────────────────────────────────
  test('Forecast: menampilkan 3 metode dan best method banner', async ({ page }) => {
    await expect(page.getByText(/metode terbaik/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('DMA').first()).toBeVisible()
    await expect(page.getByText('DES').first()).toBeVisible()
    await expect(page.getByText(/regresi|linear/i).first()).toBeVisible()
  })

  test('Forecast: tabel error tiap metode dapat ditampilkan via Tabs', async ({ page }) => {
    const tabs = page.getByRole('tablist')
    await expect(tabs).toBeVisible({ timeout: 10000 })
    // Tab pertama aktif (metode terbaik)
    const firstTab = tabs.getByRole('tab').first()
    await expect(firstTab).toHaveAttribute('aria-selected', 'true')
  })

  test('Forecast: grafik aktual vs forecast render', async ({ page }) => {
    // Recharts render sebagai SVG
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 10000 })
  })

  // ── Aggregate ─────────────────────────────────────────────────────────
  test('Aggregate: Chase vs Level tabs tersedia', async ({ page }) => {
    // Soft nav via sidebar to preserve forecastResult in Zustand store
    await page.locator('aside').getByRole('link', { name: /perencanaan/i }).click()
    await page.waitForURL('**/demo/aggregate', { timeout: 8000 })
    await expect(page.getByRole('tab', { name: /chase/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('tab', { name: /level/i })).toBeVisible()
  })

  test('Aggregate: pilih Level Strategy mengubah label "Dipilih"', async ({ page }) => {
    // Soft nav via sidebar to preserve forecastResult in Zustand store
    await page.locator('aside').getByRole('link', { name: /perencanaan/i }).click()
    await page.waitForURL('**/demo/aggregate', { timeout: 8000 })
    await page.getByRole('tab', { name: /level/i }).click()
    await expect(page.getByText(/dipilih.*level/i)).toBeVisible()
  })

  // ── RRP ───────────────────────────────────────────────────────────────
  test('RRP: grafik kebutuhan vs kapasitas tampil', async ({ page }) => {
    await page.goto('/demo/rrp')
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/jam tersedia/i).first()).toBeVisible()
  })

  test('RRP: tabel memiliki kolom Surplus dan Status', async ({ page }) => {
    await page.goto('/demo/rrp')
    await expect(page.getByRole('columnheader', { name: /surplus/i })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible()
  })

  // ── MPS ───────────────────────────────────────────────────────────────
  test('MPS: tabel menampilkan kolom GR, MPS, PAB', async ({ page }) => {
    await page.goto('/demo/mps')
    await expect(page.getByRole('columnheader', { name: 'GR' })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('columnheader', { name: 'MPS' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /PAB/i }).first()).toBeVisible()
  })

  // ── RCCP ──────────────────────────────────────────────────────────────
  test('RCCP: metric "Status RCCP" menampilkan FEASIBLE atau overload', async ({ page }) => {
    await page.goto('/demo/rccp')
    await expect(page.getByText(/FEASIBLE|Overload/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('RCCP: grafik kapasitas vs kebutuhan render', async ({ page }) => {
    await page.goto('/demo/rccp')
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 8000 })
  })

  // ── MRP ───────────────────────────────────────────────────────────────
  test('MRP: 4 tab metode tersedia', async ({ page }) => {
    await page.goto('/demo/mrp')
    for (const method of ['LFL', 'EOQ', 'POQ', 'FPR']) {
      await expect(page.getByRole('tab', { name: method })).toBeVisible({ timeout: 10000 })
    }
  })

  test('MRP: banner "Metode Terbaik" menampilkan salah satu dari 4 metode', async ({ page }) => {
    await page.goto('/demo/mrp')
    const banner = page.getByText(/metode terbaik/i)
    await expect(banner).toBeVisible({ timeout: 10000 })
    // Salah satu metode harus ada badge "Terpilih"
    await expect(page.getByText('Terpilih').first()).toBeVisible()
  })

  test('MRP: benchmark skripsi TIDAK muncul saat custom data', async ({ page }) => {
    await page.goto('/demo/mrp')
    await expect(page.getByText(/benchmark skripsi/i)).not.toBeVisible({ timeout: 8000 })
  })

  test('MRP: klik tab menampilkan tabel periode yang sesuai', async ({ page }) => {
    await page.goto('/demo/mrp')
    await page.getByRole('tab', { name: 'FPR' }).click()
    // Tabel harus muncul untuk FPR
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  // ── CRP ───────────────────────────────────────────────────────────────
  test('CRP: dua tab Fermentasi dan Pengemasan tersedia', async ({ page }) => {
    await page.goto('/demo/crp')
    await expect(page.getByRole('tab', { name: /fermentasi/i })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('tab', { name: /pengemasan/i })).toBeVisible()
  })

  test('CRP: grafik load vs kapasitas render di tiap tab', async ({ page }) => {
    await page.goto('/demo/crp')
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 8000 })
    await page.getByRole('tab', { name: /pengemasan/i }).click()
    await expect(page.locator('svg').first()).toBeVisible()
  })

  // ── PAC ───────────────────────────────────────────────────────────────
  test('PAC: form input batch muncul saat custom data (login)', async ({ page }) => {
    // Soft nav via sidebar to preserve isCustomData=true in Zustand store
    await page.locator('aside').getByRole('link', { name: /PAC/i }).click()
    await page.waitForURL('**/demo/pac', { timeout: 8000 })
    await expect(page.getByRole('button', { name: /tambah batch/i })).toBeVisible({ timeout: 8000 })
  })

  test('PAC: tombol "+ Tambah Batch" menambah baris baru', async ({ page }) => {
    // Soft nav via sidebar to preserve isCustomData=true in Zustand store
    await page.locator('aside').getByRole('link', { name: /PAC/i }).click()
    await page.waitForURL('**/demo/pac', { timeout: 8000 })
    const addBtn = page.getByRole('button', { name: /tambah batch/i })
    await addBtn.click()
    await addBtn.click()
    // Sekarang ada 3 baris (1 awal + 2 tambahan)
    const rows = page.locator('input[placeholder="B1"], input[placeholder="B2"], input[placeholder="B3"]')
    expect(await rows.count()).toBeGreaterThanOrEqual(2)
  })

  test('PAC: input batch otomatis kalkulasi konversi', async ({ page }) => {
    // Soft nav via sidebar to preserve isCustomData=true in Zustand store
    await page.locator('aside').getByRole('link', { name: /PAC/i }).click()
    await page.waitForURL('**/demo/pac', { timeout: 8000 })
    // Isi baris pertama
    const batchCodeInput = page.locator('input[placeholder="B1"]')
    await batchCodeInput.fill('B-Test')

    const dateInput = page.locator('input[type="date"]').first()
    await dateInput.fill('2025-08-01')

    // Input grams
    const numberInputs = page.locator('input[type="number"]')
    await numberInputs.nth(0).fill('5000')  // input grams
    await numberInputs.nth(1).fill('3800')  // output grams
    await numberInputs.nth(2).fill('38')    // estimated output

    // Tabel hasil harus muncul dengan konversi
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/ON TRACK|BELOW TARGET/i).first()).toBeVisible()
  })

  // ── Sidebar Navigation ─────────────────────────────────────────────────
  test('sidebar: step ditandai "completed" setelah modul dijalankan', async ({ page }) => {
    // Soft nav to aggregate to view sidebar from a different page (preserves completedSteps=[0])
    await page.locator('aside').getByRole('link', { name: /perencanaan/i }).click()
    await page.waitForURL('**/demo/aggregate', { timeout: 8000 })
    // Step 1 (Peramalan) should be completed since forecast ran in beforeEach
    const forecastLink = page.locator('aside').getByRole('link', { name: /peramalan/i })
    await expect(forecastLink).not.toHaveClass(/text-muted-foreground/)
  })
})
