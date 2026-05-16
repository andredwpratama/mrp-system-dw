import { Page } from '@playwright/test'

export const TEST_EMAIL    = process.env.TEST_USER_EMAIL    ?? 'test@garlicflow.dev'
export const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'testpassword123'

export async function loginAs(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password|kata sandi/i).fill(password)
  await page.getByRole('button', { name: /masuk|login|sign in/i }).click()
  // Allow 30s: Supabase free-tier cold-starts can take 15-30s on first call.
  // Use 'commit' so client-side router.push() is detected immediately on URL change.
  await page.waitForURL(url => !url.pathname.includes('/login'), {
    timeout: 30000,
    waitUntil: 'commit',
  })
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /keluar|logout/i }).click()
  await page.waitForURL('/')
}
