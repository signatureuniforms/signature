import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAdminAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('admin_profiles')
    .select('id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!profile) {
    return { error: 'Forbidden: Admin access required', status: 403 }
  }

  return { user, serviceClient }
}

export async function GET() {
  try {
    const auth = await verifyAdminAuth()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { serviceClient } = auth
    const { data, error } = await serviceClient.from('site_settings').select('*')
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
    const auth = await verifyAdminAuth()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await req.json()
    const { form } = body

    if (!form || typeof form !== 'object') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const { serviceClient } = auth
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
      const { error } = await serviceClient.from('site_settings').upsert(item, { onConflict: 'key' })
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
