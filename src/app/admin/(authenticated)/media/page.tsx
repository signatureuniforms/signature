'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Upload, Image as ImageIcon, Video, Trash2, Copy, Check,
  ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Film
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { MediaAsset } from '@/types'

export default function AdminMediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadAssets = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setAssets(data)
    } catch (e) {
      console.warn('Error loading media assets:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    try {
      const isVideo = file.type.startsWith('video/')
      const folder = isVideo ? 'signature-uniforms/videos' : 'signature-uniforms/images'

      // 1. Get signed upload params from API
      const signRes = await fetch('/api/cloudinary/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder,
          resource_type: isVideo ? 'video' : 'image',
        }),
      })

      if (!signRes.ok) {
        throw new Error('Failed to get signed upload parameters')
      }

      const signData = await signRes.json()

      // 2. Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signData.apiKey)
      formData.append('timestamp', signData.timestamp.toString())
      formData.append('signature', signData.signature)
      formData.append('folder', signData.folder)

      const cloudName = signData.cloudName
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`

      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const errText = await uploadRes.text()
        throw new Error(`Cloudinary upload failed: ${errText}`)
      }

      const cloudResult = await uploadRes.json()

      // 3. Save asset in Supabase media_assets table
      const supabase = createClient()
      const { error: dbError } = await supabase.from('media_assets').insert({
        cloudinary_public_id: cloudResult.public_id,
        secure_url: cloudResult.secure_url,
        resource_type: isVideo ? 'video' : 'image',
        format: cloudResult.format || file.name.split('.').pop(),
        width: cloudResult.width || null,
        height: cloudResult.height || null,
        file_size: cloudResult.bytes || file.size,
        alt_text: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        folder,
        created_at: new Date().toISOString(),
      })

      if (dbError) {
        console.warn('Saved in Cloudinary but Supabase record error:', dbError.message)
      }

      setMessage({ type: 'success', text: `Uploaded "${file.name}" successfully!` })
      loadAssets()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Upload failed' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm(`Are you sure you want to delete "${asset.cloudinary_public_id}"?`)) return

    try {
      const res = await fetch('/api/cloudinary/delete-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: asset.cloudinary_public_id,
          resource_type: asset.resource_type,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to delete asset')
      }

      setAssets(assets.filter(a => a.id !== asset.id))
      setMessage({ type: 'success', text: 'Asset removed successfully' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Cloudinary Media Library
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Signed direct asset uploads. High-res imagery and hero videos with automated WebP/H.264 optimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAssets}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-black rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-[#FFD700]" />
            {uploading ? 'Uploading to Cloudinary...' : 'Upload Media File'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload Drag/Drop Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 hover:border-black rounded-xl p-8 text-center cursor-pointer transition-colors bg-white group"
      >
        <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-amber-50 flex items-center justify-center mx-auto text-gray-400 group-hover:text-[#FFD700] transition-colors mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-gray-800">
          Click to upload photos or videos
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Supported: JPG, PNG, WEBP, MP4, MOV (up to 50MB)
        </p>
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-500 shadow-sm">
          <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-sm font-semibold text-gray-700">No media uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Uploaded images and videos will be saved in your Cloudinary repository.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm group hover:border-black transition-all flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {asset.resource_type === 'video' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white">
                    <Film className="w-8 h-8 text-[#FFD700] mb-1" />
                    <span className="text-[10px] font-mono uppercase text-gray-400">Video Asset</span>
                  </div>
                ) : (
                  <img
                    src={asset.secure_url}
                    alt={asset.alt_text}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-black/75 text-white backdrop-blur-sm">
                    {asset.format || asset.resource_type}
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <div className="font-mono text-[11px] text-gray-700 truncate" title={asset.cloudinary_public_id}>
                  {asset.cloudinary_public_id.split('/').pop()}
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{asset.width && asset.height ? `${asset.width}x${asset.height}` : 'Video'}</span>
                  <span>{asset.file_size ? `${Math.round(asset.file_size / 1024)} KB` : ''}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    onClick={() => copyUrl(asset.secure_url, asset.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 hover:text-black"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={asset.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-500 hover:text-black"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(asset)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
