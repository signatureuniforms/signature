import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { generateSignedUploadParams } from '@/lib/cloudinary/server'
import { z } from 'zod'

const requestSchema = z.object({
  folder: z.string().min(1).max(50),
  resource_type: z.enum(['image', 'video']).default('image'),
})

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin profile exists
    const serviceClient = createServiceClient()
    const { data: profile } = await serviceClient
      .from('admin_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { folder, resource_type } = parsed.data
    const params = generateSignedUploadParams(folder, resource_type)

    return NextResponse.json(params)
  } catch (err) {
    console.error('[cloudinary sign-upload]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
