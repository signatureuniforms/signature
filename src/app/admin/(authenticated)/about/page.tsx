'use client'

import { useState, useEffect } from 'react'
import { Info, Save, CheckCircle2, AlertCircle, Eye, ArrowRight, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Empty initial state - NO mock or fallback data
  const [form, setForm] = useState({
    subheading: '',
    heading: '',
    description: '',
    image_url: '',
    is_published: true,
  })

  useEffect(() => {
    async function loadAboutContent() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', 'home')
          .eq('section_key', 'about')
          .maybeSingle()

        if (error) {
          console.warn('Error fetching about section content:', error)
        }

        if (data && data.content) {
          const c = data.content as Record<string, any>
          setForm({
            subheading: typeof c.subheading === 'string' ? c.subheading : '',
            heading: typeof c.heading === 'string' ? c.heading : '',
            description: typeof c.description === 'string' ? c.description : '',
            image_url: typeof c.image_url === 'string' ? c.image_url : '',
            is_published: typeof data.is_published === 'boolean' ? data.is_published : true,
          })
        }
      } catch (err: any) {
        console.warn('Failed to load about section content:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAboutContent()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const payload = {
        page_key: 'home',
        section_key: 'about',
        content: {
          subheading: form.subheading.trim(),
          heading: form.heading.trim(),
          description: form.description.trim(),
          image_url: form.image_url.trim(),
        },
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('page_content').upsert(payload, {
        onConflict: 'page_key,section_key',
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'About section saved successfully!' })
    } catch (err: any) {
      console.error('Error saving about section:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to save about section.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Info className="w-6 h-6 text-black" />
            About Section Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the About section on the homepage directly below the hero section. Content and image appear in a luxury black theme.
          </p>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Loading about section content...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Edit Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Content Details
              </h2>

              {/* Subheading */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Subheading
                </label>
                <input
                  type="text"
                  value={form.subheading}
                  onChange={(e) => setForm({ ...form, subheading: e.target.value })}
                  placeholder="e.g. Craftsmanship & Heritage"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">Small gold uppercase label above the main heading.</p>
              </div>

              {/* Heading */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Heading *
                </label>
                <input
                  type="text"
                  value={form.heading}
                  onChange={(e) => setForm({ ...form, heading: e.target.value })}
                  placeholder="e.g. Two Decades of Manufacturing Excellence"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Description *
                </label>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter detailed description about the company, heritage, tailoring process, etc."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors leading-relaxed"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Section Image (Right Side)
                </label>
                <CloudinaryUpload
                  value={form.image_url}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                  folder="about"
                  label="Upload or Select About Image"
                />

                {form.image_url && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 border border-gray-200">
                        <img
                          src={form.image_url}
                          alt="About preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-gray-600 truncate max-w-[240px]">
                        {form.image_url}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image_url: '' })}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Published on Homepage</span>
                  <span className="text-xs text-gray-500">Enable or disable rendering of the about section.</span>
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

              {/* Save Button */}
              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition-all shadow hover:shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save About Section'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Live Preview (Black Theme)
              </span>
              <span className="text-[11px] text-gray-400">Homepage appearance</span>
            </div>

            <div className="bg-black text-white p-6 sm:p-7 rounded-2xl border border-zinc-800 shadow-xl space-y-6">
              {/* Preview Content */}
              <div>
                {form.subheading && (
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#FFD700] block mb-2">
                    {form.subheading}
                  </span>
                )}
                <h3
                  className="text-xl sm:text-2xl font-normal text-white leading-tight mb-3"
                  style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
                >
                  {form.heading || 'Heading will appear here'}
                </h3>
                <div className="w-8 h-[2px] bg-[#FFD700] mb-4" />
                <p className="text-xs text-white/75 leading-relaxed line-clamp-4 whitespace-pre-line mb-5">
                  {form.description || 'Description will appear here as you type in the editor.'}
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl shadow-sm">
                  <span>View More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Preview Image */}
              {form.image_url ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[4/3] bg-zinc-900">
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-700 aspect-[4/3] flex flex-col items-center justify-center p-4 text-center text-zinc-500 text-xs">
                  <span>No image uploaded yet</span>
                  <span className="text-[10px] text-zinc-600 mt-1">Upload on the left to see preview</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
