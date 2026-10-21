import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { schoolBulkEnquirySchema } from '@/lib/validations'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schoolBulkEnquirySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const headersList = await headers()
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? null
    const userAgent = headersList.get('user-agent') ?? null

    const supabase = createServiceClient()

    const { data: enquiry, error } = await supabase
      .from('enquiries')
      .insert({
        enquiry_type: 'school_bulk',
        contact_name: data.contact_name,
        phone: data.phone,
        email: data.email || null,
        institution_name: data.institution_name,
        location: data.location,
        quantity: data.quantity ?? null,
        requirements: data.requirements || null,
        preferred_timeline: data.preferred_timeline || null,
        message: data.message || null,
        source_page: 'homepage',
        source_url: request.headers.get('referer') ?? null,
        ip_address: ip,
        user_agent: userAgent,
        status: 'new',
      })
      .select('id, reference')
      .single()

    if (error) {
      console.error('[school-bulk enquiry] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save enquiry. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reference: enquiry.reference,
      message: 'Enquiry submitted successfully.',
    })
  } catch (err) {
    console.error('[school-bulk enquiry] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
