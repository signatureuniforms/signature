'use client'

import { useState, useEffect } from 'react'
import {
  Film,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'
import type { VideoBannerContent } from '@/types'

export default function AdminVideoBannerPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Empty initial state - NO mock or fallback data
  const [form, setForm] = useState({
    heading: '',
    description: '',
    video_url: '',
    is_published: true,
  })

  useEffect(() => {
    async function loadBannerContent() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', 'home')
          .eq('section_key', 'video_banner')
          .maybeSingle()

        if (error) {
          console.warn('Error fetching video banner content:', error)
        }

        if (data && data.content) {
          const c = data.content as VideoBannerContent
          setForm({
            heading: typeof c.heading === 'string' ? c.heading : '',
            description: typeof c.description === 'string' ? c.description : '',
            video_url: typeof c.video_url === 'string' ? c.video_url : '',
            is_published: typeof data.is_published === 'boolean' ? data.is_published : true,
          })
        }
      } catch (err: any) {
        console.warn('Failed to load video banner content:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBannerContent()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const payload = {
        page_key: 'home',
        section_key: 'video_banner',
        content: {
          heading: form.heading.trim(),
          description: form.description.trim(),
          video_url: form.video_url.trim(),
        },
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('page_content').upsert(payload, {
        onConflict: 'page_key,section_key',
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Video banner section saved successfully!' })
    } catch (err: any) {
      console.error('Error saving video banner section:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to save section.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Video Banner Section
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
              <Film className="w-3 h-3 text-[#FFD700]" />
              Brand Bottom
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage the background video, heading, and description displayed directly below the Trusted Brands section.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            View Website
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mx-auto mb-3" />
          Loading content...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Information Card */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-black text-white rounded-2xl p-6 border border-neutral-800 shadow-md">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-neutral-800 rounded-xl border border-neutral-700 shrink-0">
                <Film className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-semibold text-white">
                  Video Banner Specification
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  This section displays a cinematic looping video (e.g. logo embroidery / manufacturing) with overlay text and an audio mute/unmute button.
                </p>
                <div className="pt-2 text-xs text-[#FFD700] flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>The <strong>&quot;CONTACT NOW&quot;</strong> link button is hardcoded in the frontend code and directs users to the contact page.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Section Content
            </h2>

            {/* Video Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Background Video (MP4 / WebM) *
              </label>
              <CloudinaryUpload
                value={form.video_url}
                onChange={(url) => setForm({ ...form, video_url: url })}
                folder="videos"
                accept="video/*"
                isVideo={true}
                label="Upload Background Video"
              />

              {form.video_url && (
                <div className="mt-4 p-4 rounded-xl border border-neutral-200 bg-neutral-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-300 truncate max-w-md">
                      {form.video_url}
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, video_url: '' })}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-neutral-800 transition-colors"
                      title="Remove video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="aspect-video max-h-72 w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    <video
                      src={form.video_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Heading *
              </label>
              <input
                type="text"
                value={form.heading}
                onChange={(e) => setForm({ ...form, heading: e.target.value })}
                placeholder="e.g. LOGO EMBROIDERY"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                required
              />
              <p className="text-[11px] text-gray-400">
                Rendered with uppercase styling, serif font, and elegant tracking.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description *
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Have your business logo embroidered onto your uniform."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors leading-relaxed"
                required
              />
            </div>

            {/* Hardcoded Contact CTA notice */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Call to Action (CTA)</span>
                <span className="text-xs text-gray-500">
                  Button is hardcoded in code as <strong>CONTACT NOW</strong> &rarr; links directly to <code>/contact</code>.
                </span>
              </div>
              <span className="px-3 py-1 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg shadow-xs">
                CONTACT NOW
              </span>
            </div>

            {/* Publish Toggle */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-900 block">
                  Publish on Homepage
                </span>
                <span className="text-xs text-gray-500">
                  When enabled and content is saved, this section will display beneath the Trusted Brands section.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl transition-all shadow hover:shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Video Banner Section'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
