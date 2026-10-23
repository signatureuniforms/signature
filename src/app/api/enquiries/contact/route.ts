import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { contactEnquirySchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Anti-bot honeypot check
    if (body.company_website_hp || body.hp_field) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    const parsed = contactEnquirySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = request.headers.get('user-agent') ?? null

    const supabase = createServiceClient()

    const { data: enquiry, error } = await supabase
      .from('enquiries')
      .insert({
        enquiry_type: 'contact',
        contact_name: data.contact_name,
        phone: data.phone && data.phone.trim() ? data.phone.trim() : 'N/A',
        email: data.email || null,
        message: data.message,
        source_page: 'contact',
        source_url: request.headers.get('referer') ?? null,
        ip_address: ip,
        user_agent: userAgent,
        status: 'new',
      })
      .select('id, reference')
      .single()

    if (error) {
      console.error('[contact enquiry] Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save enquiry. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, reference: enquiry.reference })
  } catch (err) {
    console.error('[contact enquiry]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
