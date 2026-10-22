import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = serviceRoleKey
      ? createSupabaseAdmin(supabaseUrl, serviceRoleKey)
      : await createServerClient()

    const { data, error } = await supabase.from('site_settings').select('*')
    if (error) throw error

    const settings: Record<string, string> = {}
    if (data) {
      data.forEach((item: { key: string; value: string | null }) => {
        settings[item.key] = item.value || ''
      })
    }

    return NextResponse.json({ settings })
  } catch (err: any) {
    console.error('Admin settings GET error:', err)
    return NextResponse.json({ error: err.message || 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { form } = body

    if (!form || typeof form !== 'object') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = serviceRoleKey
      ? createSupabaseAdmin(supabaseUrl, serviceRoleKey)
      : await createServerClient()

    const now = new Date().toISOString()
    const updates: Array<{ key: string; value: string; category: string; updated_at: string }> = []

    for (const [key, value] of Object.entries(form)) {
      updates.push({
        key,
        value: String(value ?? ''),
        category: 'general',
        updated_at: now,
      })
    }

    // Keep aliases synchronized so footer and contact page receive live values immediately
    const fullAddress = [form.factory_address, form.city, form.state, form.pincode].filter(Boolean).join(', ')
    if (form.phone_primary) {
      updates.push({ key: 'phone', value: String(form.phone_primary), category: 'general', updated_at: now })
    }
    if (form.email_primary) {
      updates.push({ key: 'email', value: String(form.email_primary), category: 'general', updated_at: now })
    }
    if (form.site_name) {
      updates.push({ key: 'business_name', value: String(form.site_name), category: 'general', updated_at: now })
    }
    if (fullAddress || form.factory_address) {
      updates.push({ key: 'address', value: String(fullAddress || form.factory_address), category: 'general', updated_at: now })
    }

    for (const item of updates) {
      const { error } = await supabase.from('site_settings').upsert(item, { onConflict: 'key' })
      if (error) {
        console.error('Error saving setting:', item.key, error)
        throw new Error(`Failed to save ${item.key}: ${error.message}`)
      }
    }

    // Revalidate public layouts and pages
    try {
      revalidatePath('/', 'layout')
      revalidatePath('/contact')
      revalidatePath('/about')
    } catch {}

    return NextResponse.json({ success: true, message: 'Settings saved successfully' })
  } catch (err: any) {
    console.error('Admin settings POST error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save settings' }, { status: 500 })
  }
}
