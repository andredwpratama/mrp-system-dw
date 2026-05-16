/**
 * Authentication Tests
 * Login, logout, register flow
 */
import { test, expect } from '@playwright/test'
import { loginAs, TEST_EMAIL, TEST_PASSWORD } from './helpers/auth'

test.describe('Halaman Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('form login render dengan benar', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password|kata sandi/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /daftar|register/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /demo tanpa akun/i })).toBeVisible()
  })

  test('error muncul jika email kosong', async ({ page }) => {
    await page.getByRole('button', { name: /masuk/i }).click()
    // Browser native validation atau custom error
    const emailInput = page.getByLabel(/email/i)
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).not.toBe('')
  })

  test('error muncul untuk kredensial salah', async ({ page }) => {
    await page.getByLabel(/email/i).fill('salah@email.com')
    await page.getByLabel(/password|kata sandi/i).fill('passwordsalah')
    await page.getByRole('button', { name: /masuk/i }).click()
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 })
  })

  test('link "Coba demo tanpa akun" mengarah ke /demo', async ({ page }) => {
    await page.getByRole('link', { name: /demo tanpa akun/i }).click()
    await expect(page).toHaveURL(/\/demo/)
  })
})

test.describe('Halaman Register', () => {
  test('form register render dengan benar', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password|kata sandi/i)).toBeVisible()
    // Tombol submit register: "Buat Akun"
    await expect(page.getByRole('button', { name: /buat akun|daftar|register/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /masuk/i }).first()).toBeVisible()
  })

  test('link ke login berfungsi', async ({ page }) => {
    await page.goto('/register')
    // Scope ke main agar tidak clash dengan navbar "Masuk"
    await page.locator('main').getByRole('link', { name: /masuk/i }).click()
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Login sukses', () => {
  test('login berhasil → redirect ke dashboard', async ({ page }) => {
    await loginAs(page)
    await expect(page).toHaveURL('/dashboard')
    // Nama email atau avatar muncul
    await expect(page.getByText(new RegExp(TEST_EMAIL.split('@')[0], 'i')).first()).toBeVisible({ timeout: 5000 })
  })

  test('setelah login, navbar tampil tombol Dashboard', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /masuk/i })).not.toBeVisible()
  })

  test('logout berfungsi → kembali ke homepage tanpa auth', async ({ page }) => {
    await loginAs(page)
    // Buka dropdown avatar → klik keluar
    await page.locator('header').getByRole('button').last().click()
    await page.getByRole('menuitem', { name: /keluar/i }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('link', { name: /masuk/i })).toBeVisible()
  })
})
