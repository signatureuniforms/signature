import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cloudinary } from '@/lib/cloudinary/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const contact_name = (formData.get('contact_name') as string)?.trim() || ''
    const institution_name = (formData.get('institution_name') as string)?.trim() || ''
    const phone = (formData.get('phone') as string)?.trim() || ''
    const category = (formData.get('category') as string)?.trim() || ''
    const quantityRaw = (formData.get('quantity') as string)?.trim() || ''
    const notes = (formData.get('notes') as string)?.trim() || ''
    const source_page = (formData.get('source_page') as string)?.trim() || 'categories'

    // Validation
    if (!contact_name) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
    }
    if (!institution_name) {
      return NextResponse.json({ error: 'Company or institution name is required.' }, { status: 400 })
    }
    if (!phone) {
      return NextResponse.json({ error: 'Mobile number is required.' }, { status: 400 })
    }
    if (!category) {
      return NextResponse.json({ error: 'Please select a uniform category.' }, { status: 400 })
    }

    // Anti-bot honeypot check
    const honeypot = (formData.get('company_hp') || formData.get('hp_field')) as string | null
    if (honeypot && honeypot.trim().length > 0) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    const quantity = quantityRaw && !isNaN(parseInt(quantityRaw, 10)) ? parseInt(quantityRaw, 10) : null

    // Upload optional reference image to Cloudinary
    let referenceImageUrl: string | null = null
    const imageFile = formData.get('image') as File | null

    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === 'function') {
      // Maximum 10MB limit
      const MAX_FILE_SIZE = 10 * 1024 * 1024
      if (imageFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Uploaded image file must be smaller than 10MB.' }, { status: 400 })
      }

      // Valid image mime types only
      const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif']
      if (imageFile.type && !ALLOWED_MIME_TYPES.includes(imageFile.type.toLowerCase())) {
        return NextResponse.json({ error: 'Please upload a valid image file (JPG, PNG, WEBP).' }, { status: 400 })
      }

      try {
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Data = `data:${imageFile.type || 'image/jpeg'};base64,${buffer.toString('base64')}`

        const uploadRes = await cloudinary.uploader.upload(base64Data, {
          folder: 'signature-uniforms/enquiries',
          resource_type: 'image',
        })

        if (uploadRes && uploadRes.secure_url) {
          referenceImageUrl = uploadRes.secure_url
        }
      } catch (uploadErr) {
        console.error('[bulk-quote] Cloudinary upload error:', uploadErr)
        // Proceed without blocking enquiry creation
      }
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null
    const userAgent = request.headers.get('user-agent') ?? null

    const messageLines: string[] = []
    messageLines.push(`Requested Category: ${category}`)
    if (quantity) {
      messageLines.push(`Quantity Required: ${quantity} units`)
    }
    if (referenceImageUrl) {
      messageLines.push(`Reference Image: ${referenceImageUrl}`)
    }
    if (notes) {
      messageLines.push(`Additional Notes: ${notes}`)
    }

    const supabase = createServiceClient()

    const { data: enquiry, error: insertError } = await supabase
      .from('enquiries')
      .insert({
        enquiry_type: 'product_quote',
        contact_name,
        phone,
        institution_name,
        quantity,
        requirements: `Category: ${category}${referenceImageUrl ? ' [Ref Image Attached]' : ''}`,
        message: messageLines.join('\n\n'),
        source_page,
        source_url: request.headers.get('referer') ?? null,
        ip_address: ip,
        user_agent: userAgent,
        status: 'new',
      })
      .select('id, reference')
      .single()

    if (insertError) {
      console.error('[bulk-quote] Supabase insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save enquiry. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reference: enquiry.reference,
      message: 'Quotation request submitted successfully.',
    })
  } catch (err) {
    console.error('[bulk-quote] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
