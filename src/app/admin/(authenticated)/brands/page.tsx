'use client'

import { useState, useEffect } from 'react'
import {
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'
import type { BrandLogo, TrustedBrandsContent } from '@/types'

export default function AdminBrandsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Empty initial state - NO mock or fallback data
  const [logos, setLogos] = useState<BrandLogo[]>([])
  const [bottomContent, setBottomContent] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  // New logo form state
  const [newLogoName, setNewLogoName] = useState('')
  const [newLogoUrl, setNewLogoUrl] = useState('')
  const [logoInputError, setLogoInputError] = useState('')

  useEffect(() => {
    async function loadBrandsContent() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', 'home')
          .eq('section_key', 'trusted_brands')
          .maybeSingle()

        if (error) {
          console.warn('Error fetching trusted brands content:', error)
        }

        if (data && data.content) {
          const c = data.content as TrustedBrandsContent
          setBottomContent(typeof c.bottom_content === 'string' ? c.bottom_content : '')
          setLogos(Array.isArray(c.logos) ? c.logos : [])
          setIsPublished(typeof data.is_published === 'boolean' ? data.is_published : true)
        }
      } catch (err: any) {
        console.warn('Failed to load trusted brands content:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBrandsContent()
  }, [])

  const handleAddLogo = () => {
    setLogoInputError('')
    if (!newLogoUrl.trim()) {
      setLogoInputError('Please upload or select a logo image first.')
      return
    }

    const newBrand: BrandLogo = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `logo_${Date.now()}`,
      name: newLogoName.trim() || 'Brand Partner',
      image_url: newLogoUrl.trim(),
    }

    setLogos((prev) => [...prev, newBrand])
    setNewLogoName('')
    setNewLogoUrl('')
  }

  const handleRemoveLogo = (id: string) => {
    setLogos((prev) => prev.filter((item) => item.id !== id))
  }

  const handleMoveLogo = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= logos.length) return
    const updated = [...logos]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setLogos(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const payload = {
        page_key: 'home',
        section_key: 'trusted_brands',
        content: {
          bottom_content: bottomContent.trim(),
          logos,
        },
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('page_content').upsert(payload, {
        onConflict: 'page_key,section_key',
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Trusted brands section saved successfully!' })
    } catch (err: any) {
      console.error('Error saving trusted brands section:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to save section.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Trusted by Leading Brands
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
              <Award className="w-3 h-3 text-[#FFD700]" />
              Black Section
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage client/partner brand logos and the bottom footnote displayed directly below the Categories section.
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
          {/* Section Info Card */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-black text-white rounded-2xl p-6 border border-neutral-800 shadow-md">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-neutral-800 rounded-xl border border-neutral-700">
                <Award className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div className="flex-1">
                <span className="text-xs uppercase tracking-widest text-[#FFD700] font-semibold">
                  Section Header Specification
                </span>
                <h3 className="text-lg font-serif tracking-widest mt-1 text-white">
                  TRUSTED BY LEADING BRANDS
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  The heading is permanently hardcoded in the website code to ensure brand consistency. The logos, their display order, and the bottom footnote text below them are dynamically managed here.
                </p>
              </div>
            </div>
          </div>

          {/* Add Brand Logo Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Add Brand Logo</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload transparent PNG, SVG, or WEBP logos for optimal display on the black section.
                </p>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {logos.length} logo{logos.length === 1 ? '' : 's'} added
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Brand Name Input */}
              <div className="md:col-span-5 space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Brand Name / Label
                </label>
                <input
                  type="text"
                  value={newLogoName}
                  onChange={(e) => setNewLogoName(e.target.value)}
                  placeholder="e.g. Hero, Dabur, Kia, Organic India"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
                <p className="text-[11px] text-gray-400">Used as the image alt attribute for accessibility.</p>
              </div>

              {/* Logo Upload Component */}
              <div className="md:col-span-7 space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Logo Image (Transparent recommended) *
                </label>
                <CloudinaryUpload
                  value={newLogoUrl}
                  onChange={(url) => {
                    setNewLogoUrl(url)
                    setLogoInputError('')
                  }}
                  folder="brands"
                  label="Upload Brand Logo"
                />

                {newLogoUrl && (
                  <div className="mt-3 relative rounded-xl border border-neutral-700 bg-neutral-900 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center p-1.5">
                        <img
                          src={newLogoUrl}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium text-neutral-200">Logo Selected</p>
                        <p className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                          {newLogoUrl}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewLogoUrl('')}
                      className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg transition-colors"
                      title="Clear"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {logoInputError && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {logoInputError}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAddLogo}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add to Logo List
              </button>
            </div>
          </div>

          {/* Current Logos List */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Current Brand Logos</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Drag or use arrows to change the display order. Logos render against the black section.
                </p>
              </div>
            </div>

            {logos.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-gray-300 text-gray-400">
                <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No brand logos added yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Upload client logos above to display them in this section.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {logos.map((logo, index) => (
                  <div
                    key={logo.id || index}
                    className="flex flex-col justify-between p-4 rounded-xl border border-neutral-700 bg-neutral-950 text-white shadow-sm"
                  >
                    {/* Dark Preview Container */}
                    <div className="h-20 w-full rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-center justify-center p-3 mb-3">
                      <img
                        src={logo.image_url}
                        alt={logo.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-neutral-800/80 pt-3">
                      <div className="truncate flex-1">
                        <p className="text-xs font-semibold text-neutral-200 truncate">{logo.name}</p>
                        <p className="text-[10px] text-neutral-500">Position #{index + 1}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveLogo(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 rounded transition-colors"
                          title="Move left/up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveLogo(index, 'down')}
                          disabled={index === logos.length - 1}
                          className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 rounded transition-colors"
                          title="Move right/down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveLogo(logo.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded transition-colors ml-1"
                          title="Delete logo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Content / Footnote */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Bottom Disclaimer / Footnote Text
              </label>
              <p className="text-xs text-gray-500 mb-3">
                This text appears directly beneath the brand logos on the homepage.
              </p>
              <textarea
                rows={4}
                value={bottomContent}
                onChange={(e) => setBottomContent(e.target.value)}
                placeholder="The logos and brand names displayed are the trademarks of their respective owners. Their inclusion on this website is solely for reference purposes to indicate clients served directly by us or through authorized dealers/channel partners."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors leading-relaxed"
              />
            </div>

            {/* Publish Toggle */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-900 block">
                  Publish on Homepage
                </span>
                <span className="text-xs text-gray-500">
                  When enabled and logos exist, the section will display below the Categories section.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
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
              {saving ? 'Saving Changes...' : 'Save Trusted Brands Section'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
