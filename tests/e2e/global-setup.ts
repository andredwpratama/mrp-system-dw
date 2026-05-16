/**
 * Playwright Global Setup
 * Membuat test user di Supabase sebelum semua E2E tests berjalan.
 * Dijalankan sekali sebelum seluruh test suite.
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function globalSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('YOUR_PROJECT')) {
    console.warn('\n⚠  Supabase credentials belum diisi — auth tests akan di-skip\n')
    return
  }

  const testEmail = process.env.TEST_USER_EMAIL ?? 'test@garlicflow.dev'
  const testPassword = process.env.TEST_USER_PASSWORD ?? 'testpassword123'

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  })

  if (error) {
    if (error.message.toLowerCase().includes('already') || error.message.includes('duplicate')) {
      console.log(`✓ Test user already exists: ${testEmail}`)
    } else {
      console.error('✘ Gagal membuat test user:', error.message)
    }
  } else {
    console.log(`✓ Test user created: ${testEmail}`)
  }
}

export default globalSetup
