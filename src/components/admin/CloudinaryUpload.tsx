'use client'

import { useState, useRef, useEffect } from 'react'
import { UploadCloud, X, Loader2, Image as ImageIcon, Check, Film, Library } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CloudinaryUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  accept?: string
  label?: string
  isVideo?: boolean
  onAssetChange?: (assetId: string) => void
}

interface MediaAssetItem {
  id: string
  secure_url: string
  alt_text: string
  resource_type: string
}

export default function CloudinaryUpload({
  value,
  onChange,
  folder = 'images',
  accept = 'image/*',
  label = 'Upload Image to Cloudinary',
  isVideo = false,
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [mediaAssets, setMediaAssets] = useState<MediaAssetItem[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // 1. Get signed params
      const signRes = await fetch('/api/cloudinary/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: folder.replace(/^signature-uniforms\//, ''),
          resource_type: isVideo ? 'video' : 'image',
        }),
      })

      if (!signRes.ok) {
        const errJson = await signRes.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to authenticate Cloudinary upload request')
      }

      const signData = await signRes.json()

      // 2. Direct upload to Cloudinary API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signData.api_key || signData.apiKey)
      formData.append('timestamp', String(signData.timestamp))
      formData.append('signature', signData.signature)
      formData.append('folder', signData.folder)

      const cloudName = signData.cloud_name || signData.cloudName
      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`

      const uploadRes = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const errText = await uploadRes.text()
        throw new Error(`Upload failed (${uploadRes.status}): ${errText}`)
      }

      const cloudResult = await uploadRes.json()
      const secureUrl = cloudResult.secure_url

      // 3. Register in Supabase media_assets table
      const supabase = createClient()
      await supabase.from('media_assets').insert({
        cloudinary_public_id: cloudResult.public_id,
        secure_url: secureUrl,
        resource_type: isVideo ? 'video' : 'image',
        format: cloudResult.format || file.name.split('.').pop(),
        width: cloudResult.width || null,
        height: cloudResult.height || null,
        file_size: cloudResult.bytes || file.size,
        alt_text: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        folder: signData.folder,
        created_at: new Date().toISOString(),
      })

      onChange(secureUrl)
    } catch (err: any) {
      console.error('Cloudinary upload error:', err)
      setError(err.message || 'Cloudinary upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const openMediaLibrary = async () => {
    setShowMediaModal(true)
    setLoadingMedia(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('media_assets')
        .select('id, secure_url, alt_text, resource_type')
        .eq('resource_type', isVideo ? 'video' : 'image')
        .order('created_at', { ascending: false })
        .limit(36)

      if (data) {
        setMediaAssets(data)
      }
    } catch (e: any) {
      console.warn('Media fetch error:', e)
    } finally {
      setLoadingMedia(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700">{label}</label>
        <button
          type="button"
          onClick={openMediaLibrary}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-black cursor-pointer"
        >
          <Library className="w-3.5 h-3.5" />
          <span>Pick from Media Library</span>
        </button>
      </div>

      {value ? (
        <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-2 flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 relative border border-gray-300">
            {isVideo ? (
              <video src={value} className="w-full h-full object-cover" />
            ) : (
              <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-600 truncate">{value}</p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Replace file
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-300 hover:border-black rounded-xl p-5 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center ${
            uploading ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="w-6 h-6 animate-spin text-black mb-1.5" />
              <p className="text-xs font-semibold text-gray-700">Uploading directly to Cloudinary...</p>
              <p className="text-[10px] text-gray-400">Optimizing and storing asset</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 mb-2 shadow-sm">
                <UploadCloud className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-xs font-semibold text-gray-900">
                Click to upload {isVideo ? 'video' : 'photo'} to Cloudinary
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WebP, SVG supported</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Media Library Picker Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-gray-700" />
                <h3 className="font-bold text-gray-900 text-sm">Select from Cloudinary Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingMedia ? (
                <div className="py-12 text-center text-gray-400 text-xs">Loading media library...</div>
              ) : mediaAssets.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No assets uploaded in Cloudinary library yet. Upload using the file box.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaAssets.map(asset => (
                    <button
                      type="button"
                      key={asset.id}
                      onClick={() => {
                        onChange(asset.secure_url)
                        setShowMediaModal(false)
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-black transition-all bg-gray-100 cursor-pointer"
                    >
                      <img
                        src={asset.secure_url}
                        alt={asset.alt_text || 'Media'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                        Select
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
