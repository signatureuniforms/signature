/** Cloudinary server-side utilities — NEVER import in client components */
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  resource_type: string
  format: string
  width: number
  height: number
  bytes: number
  folder: string
}

/**
 * Generate a signed upload signature for client-side uploads.
 * The secret never leaves the server.
 */
export function generateSignedUploadParams(folder: string, resourceType: string = 'image') {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = {
    folder: `signature-uniforms/${folder}`,
    timestamp,
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: `signature-uniforms/${folder}`,
  }
}

/**
 * Delete a Cloudinary asset by public ID.
 * Returns success/failure without throwing — use deletion queue for retries.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: string = 'image'
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as 'image' | 'video' | 'raw',
    })
    if (result.result === 'ok' || result.result === 'not found') {
      return { success: true }
    }
    return { success: false, error: result.result }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Build a Cloudinary transformation URL.
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {}
): string {
  return cloudinary.url(publicId, {
    ...options,
    secure: true,
    fetch_format: options.format ?? 'auto',
    quality: options.quality ?? 'auto',
  })
}
