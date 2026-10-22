import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const {
      contact_name = 'WhatsApp Visitor',
      phone = 'Via WhatsApp Click',
      enquiry_type = 'whatsapp_general',
      product_id = null,
      message = 'Initiated WhatsApp conversation from website',
      source_page = 'website',
    } = body

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = request.headers.get('user-agent') ?? null
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        enquiry_type: enquiry_type === 'whatsapp_product' ? 'whatsapp_product' : 'whatsapp_general',
        contact_name,
        phone,
        product_id,
        message,
        source_page,
        source_url: request.headers.get('referer') ?? null,
        whatsapp_opened: true,
        whatsapp_opened_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: userAgent,
        status: 'new',
      })
      .select('id, reference')
      .single()

    if (error) {
      console.error('[whatsapp enquiry] Supabase error:', error)
      return NextResponse.json({ error: 'Failed to record WhatsApp lead' }, { status: 500 })
    }

    return NextResponse.json({ success: true, reference: data.reference })
  } catch (err) {
    console.error('[whatsapp enquiry]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
