import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { deleteCloudinaryAsset } from '@/lib/cloudinary/server'
import { z } from 'zod'

const requestSchema = z.object({
  asset_id: z.string().uuid(),
  force: z.boolean().default(false),
})

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const { asset_id, force } = parsed.data

    // Get asset record
    const { data: asset, error: assetErr } = await serviceClient
      .from('media_assets')
      .select('id, cloudinary_public_id, resource_type, usage_count')
      .eq('id', asset_id)
      .single()

    if (assetErr || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Check if in use (unless forced)
    if (!force && Number(asset.usage_count) > 0) {
      return NextResponse.json({
        error: 'Asset is in use',
        usage_count: asset.usage_count,
        message: 'This asset is referenced by other content. Detach it first, or use force=true.',
      }, { status: 409 })
    }

    // Attempt Cloudinary deletion
    const deleteResult = await deleteCloudinaryAsset(
      asset.cloudinary_public_id as string,
      (asset.resource_type as string) ?? 'image'
    )

    if (!deleteResult.success) {
      // Queue for retry
      await serviceClient.from('cloudinary_deletion_queue').insert({
        cloudinary_public_id: asset.cloudinary_public_id,
        resource_type: asset.resource_type,
        status: 'pending',
        queued_by: profile.id,
        error_message: deleteResult.error,
      })

      // Still remove DB record — Cloudinary cleanup will retry
      await serviceClient.from('media_assets').delete().eq('id', asset_id)

      return NextResponse.json({
        success: true,
        warning: 'Cloudinary deletion queued for retry. DB record removed.',
      })
    }

    // Delete DB record
    const { error: dbErr } = await serviceClient
      .from('media_assets')
      .delete()
      .eq('id', asset_id)

    if (dbErr) {
      // Cloudinary is deleted but DB failed — log it
      console.error('[delete-asset] DB delete failed after Cloudinary delete:', dbErr)
      return NextResponse.json({
        success: false,
        error: 'Cloudinary asset deleted but database cleanup failed. Contact support.',
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Asset deleted successfully.' })
  } catch (err) {
    console.error('[delete-asset]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
