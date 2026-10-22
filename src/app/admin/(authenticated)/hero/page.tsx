'use client'

import { useState, useEffect } from 'react'
import { Video, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

export default function AdminHeroPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [heroId, setHeroId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    desktop_video_url: '',
    mobile_video_url: '',
    primary_cta_text: 'Explore Products',
    primary_cta_link: '/products',
    secondary_cta_text: 'Chat on WhatsApp',
    is_active: true,
  })

  useEffect(() => {
    async function loadHero() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('hero_videos')
          .select(`
            *,
            desktop_asset:media_assets!desktop_asset_id(secure_url),
            mobile_asset:media_assets!mobile_asset_id(secure_url)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (data) {
          setHeroId(data.id)
          setForm({
            title: data.heading || data.title || '',
            subtitle: data.subheading || data.subtitle || '',
            desktop_video_url: data.desktop_asset?.secure_url || data.desktop_video_url || '',
            mobile_video_url: data.mobile_asset?.secure_url || data.mobile_video_url || '',
            primary_cta_text: data.primary_cta_label || data.primary_cta_text || '',
            primary_cta_link: data.primary_cta_href || data.primary_cta_link || '',
            secondary_cta_text: data.secondary_cta_label || data.secondary_cta_text || '',
            is_active: data.is_active ?? true,
          })
        }
      } catch (err: any) {
        console.warn('Error fetching hero:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHero()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      // Resolve asset IDs from media_assets table
      let desktopAssetId: string | null = null
      let mobileAssetId: string | null = null

      if (form.desktop_video_url) {
        const { data: dAsset } = await supabase
          .from('media_assets')
          .select('id')
          .eq('secure_url', form.desktop_video_url)
          .maybeSingle()
        if (dAsset?.id) desktopAssetId = dAsset.id
      }

      if (form.mobile_video_url) {
        const { data: mAsset } = await supabase
          .from('media_assets')
          .select('id')
          .eq('secure_url', form.mobile_video_url)
          .maybeSingle()
        if (mAsset?.id) mobileAssetId = mAsset.id
      }

      const payload = {
        heading: form.title,
        subheading: form.subtitle,
        desktop_asset_id: desktopAssetId,
        mobile_asset_id: mobileAssetId,
        primary_cta_label: form.primary_cta_text,
        primary_cta_href: form.primary_cta_link,
        secondary_cta_label: form.secondary_cta_text,
        is_active: true,
        updated_at: new Date().toISOString(),
      }

      if (heroId) {
        const { error } = await supabase.from('hero_videos').update(payload).eq('id', heroId)
        if (error) throw error
      } else {
        const { data: newRow, error } = await supabase
          .from('hero_videos')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single()
        if (error) throw error
        if (newRow?.id) setHeroId(newRow.id)
      }

      setMessage({ type: 'success', text: 'Hero video configuration saved successfully!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update hero video' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Hero Video Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload the main video loop directly to Cloudinary for the homepage hero showcase.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
        {/* Headlines */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            Hero Text & Headlines
          </h2>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Hero Title / Heading *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Hero Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Video Direct Cloudinary Uploads */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-[#FFD700]" />
              Upload Video (Cloudinary)
            </h2>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Full Quality Stream (Original Bitrate)
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Hero videos are streamed directly in their pristine original quality without lossy re-encoding. For best visual clarity on modern desktop screens, upload a <strong>1920x1080 (1080p Full HD)</strong> MP4 file (16:9 ratio, H.264 codec).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CloudinaryUpload
              label="Desktop Hero Video (Direct Cloudinary Upload) *"
              folder="videos"
              isVideo={true}
              accept="video/*"
              value={form.desktop_video_url}
              onChange={url => setForm(prev => ({ ...prev, desktop_video_url: url }))}
            />

            <CloudinaryUpload
              label="Mobile Hero Video (Optional Vertical Video)"
              folder="videos"
              isVideo={true}
              accept="video/*"
              value={form.mobile_video_url}
              onChange={url => setForm(prev => ({ ...prev, mobile_video_url: url }))}
            />
          </div>
        </div>

        {/* Call to Actions */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            Call to Actions (CTA)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Primary Button Text
              </label>
              <input
                type="text"
                value={form.primary_cta_text}
                onChange={(e) => setForm({ ...form, primary_cta_text: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Primary Button Link
              </label>
              <input
                type="text"
                value={form.primary_cta_link}
                onChange={(e) => setForm({ ...form, primary_cta_link: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#FFD700]" />
            <span>{saving ? 'Saving...' : 'Save Hero Video'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
