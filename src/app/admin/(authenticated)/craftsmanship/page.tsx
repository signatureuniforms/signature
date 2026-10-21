'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Plus,
  Layers,
  Scissors,
  ShieldCheck,
  Truck,
  Award,
  CheckCircle,
  Clock,
  Shirt,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'
import type { CraftsmanshipContent, CraftsmanshipFeature } from '@/types'

const AVAILABLE_ICONS = [
  { name: 'Layers', label: 'Layers / Fabric', icon: Layers },
  { name: 'Scissors', label: 'Scissors / Tailoring', icon: Scissors },
  { name: 'ShieldCheck', label: 'Shield / Quality Assurance', icon: ShieldCheck },
  { name: 'Truck', label: 'Truck / On-Time Delivery', icon: Truck },
  { name: 'Award', label: 'Award / Excellence', icon: Award },
  { name: 'Sparkles', label: 'Sparkles / Premium', icon: Sparkles },
  { name: 'CheckCircle', label: 'Checkmark / Standards', icon: CheckCircle },
  { name: 'Clock', label: 'Clock / Punctual', icon: Clock },
  { name: 'Shirt', label: 'Shirt / Uniforms', icon: Shirt },
]

export default function AdminCraftsmanshipPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Empty initial state - STRICT RULE: No mock data and no fallback data
  const [form, setForm] = useState({
    eyebrow: '',
    title: '',
    description: '',
    main_image_url: '',
    inset_image_1_url: '',
    inset_image_2_url: '',
    is_published: true,
  })

  const [features, setFeatures] = useState<CraftsmanshipFeature[]>([])

  useEffect(() => {
    async function loadContent() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', 'home')
          .eq('section_key', 'craftsmanship')
          .maybeSingle()

        if (error) {
          console.warn('Error fetching craftsmanship content:', error)
        }

        if (data && data.content) {
          const c = data.content as any
          const resolvedTitle =
            typeof c.title === 'string'
              ? c.title
              : typeof c.heading === 'string'
              ? c.heading
              : [c.title_prefix, c.title_highlight].filter(Boolean).join(' ')

          setForm({
            eyebrow: typeof c.eyebrow === 'string' ? c.eyebrow : '',
            title: resolvedTitle,
            description: typeof c.description === 'string' ? c.description : '',
            main_image_url: typeof c.main_image_url === 'string' ? c.main_image_url : '',
            inset_image_1_url: typeof c.inset_image_1_url === 'string' ? c.inset_image_1_url : '',
            inset_image_2_url: typeof c.inset_image_2_url === 'string' ? c.inset_image_2_url : '',
            is_published: typeof data.is_published === 'boolean' ? data.is_published : true,
          })

          if (Array.isArray(c.features)) {
            setFeatures(c.features)
          }
        }
      } catch (err: any) {
        console.warn('Failed to load craftsmanship content:', err)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [])

  const handleAddFeature = () => {
    const newFeature: CraftsmanshipFeature = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `feat_${Date.now()}`,
      icon_name: 'Layers',
      title: '',
      description: '',
    }
    setFeatures((prev) => [...prev, newFeature])
  }

  const handleRemoveFeature = (id: string) => {
    setFeatures((prev) => prev.filter((item) => item.id !== id))
  }

  const handleFeatureChange = (id: string, field: 'icon_name' | 'title' | 'description', value: string) => {
    setFeatures((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const payload = {
        page_key: 'home',
        section_key: 'craftsmanship',
        content: {
          eyebrow: form.eyebrow.trim(),
          title: form.title.trim(),
          heading: form.title.trim(),
          description: form.description.trim(),
          main_image_url: form.main_image_url.trim(),
          inset_image_1_url: form.inset_image_1_url.trim(),
          inset_image_2_url: form.inset_image_2_url.trim(),
          features: features.map((f) => ({
            id: f.id,
            icon_name: f.icon_name || 'Layers',
            title: f.title.trim(),
            description: f.description.trim(),
          })),
        },
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('page_content').upsert(payload, {
        onConflict: 'page_key,section_key',
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Craftsmanship section saved successfully!' })
    } catch (err: any) {
      console.error('Error saving craftsmanship section:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to save section.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Craftsmanship & Trust Section
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
              <Sparkles className="w-3 h-3 text-[#FFD700]" />
              Under Brands
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage the &quot;Why Brands Trust Our Craftsmanship&quot; showcase section positioned directly beneath the Trusted Brands section.
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
          Loading craftsmanship content...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header Specifications */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Section Header & Typography</span>
              <span className="text-xs font-normal text-gray-400">Homepage Display</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Eyebrow / Subtitle
                </label>
                <input
                  type="text"
                  value={form.eyebrow}
                  onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                  placeholder="e.g. THE DIFFERENCE WE MAKE"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">Rendered in gold tracking uppercase.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Section Title (All White)
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Why Brands Trust Our Craftsmanship"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">Rendered in pure bold white font.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Section Description / Subtitle
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. From premium fabrics to precise stitching, we deliver uniforms that reflect quality, reliability and professionalism."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors leading-relaxed"
              />
            </div>
          </div>

          {/* Central Imagery & Overlapping Badges */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Central Showcase Visuals
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload the factory tailoring main photo, the bottom-left folded fabrics photo, and the bottom-right hanging uniform photo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Image */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Main Center Image (Factory / Tailor)
                </label>
                <CloudinaryUpload
                  value={form.main_image_url}
                  onChange={(url) => setForm({ ...form, main_image_url: url })}
                  folder="craftsmanship"
                  label="Upload Main Visual"
                />
                <p className="text-[11px] text-gray-400">Large center image of tailoring craftsmanship.</p>
              </div>

              {/* Inset Image 1: Bottom Left */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bottom-Left Inset (Folded Fabrics)
                </label>
                <CloudinaryUpload
                  value={form.inset_image_1_url}
                  onChange={(url) => setForm({ ...form, inset_image_1_url: url })}
                  folder="craftsmanship"
                  label="Upload Folded Fabrics"
                />
                <p className="text-[11px] text-gray-400">Appears overlapping the bottom-left corner.</p>
              </div>

              {/* Inset Image 2: Bottom Right */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bottom-Right Inset (Hanging Uniforms)
                </label>
                <CloudinaryUpload
                  value={form.inset_image_2_url}
                  onChange={(url) => setForm({ ...form, inset_image_2_url: url })}
                  folder="craftsmanship"
                  label="Upload Hanging Uniforms"
                />
                <p className="text-[11px] text-gray-400">Appears overlapping the bottom-right corner.</p>
              </div>
            </div>
          </div>

          {/* Feature Highlights (4 side cards) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Feature Highlight Cards</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Usually 4 cards: the first 2 appear on the left column, and the remaining appear on the right column.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFeature}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Feature Card
              </button>
            </div>

            {features.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-gray-300 text-gray-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No feature cards added</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click &quot;Add Feature Card&quot; to configure cards (e.g. Premium Fabric Selection, Expert Manufacturing, etc.)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {features.map((feat, index) => (
                  <div
                    key={feat.id || index}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Card #{index + 1} {index < 2 ? '(Left Column)' : '(Right Column)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feat.id)}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Icon Selector */}
                      <div className="md:col-span-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Select Icon
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {AVAILABLE_ICONS.map((ic) => {
                            const IconComponent = ic.icon
                            const isSelected = feat.icon_name === ic.name
                            return (
                              <button
                                type="button"
                                key={ic.name}
                                onClick={() => handleFeatureChange(feat.id, 'icon_name', ic.name)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-black text-[#FFD700] border-black font-semibold'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                                title={ic.label}
                              >
                                <IconComponent className="w-4 h-4 mb-0.5" />
                                <span className="truncate max-w-full">{ic.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Card Heading and Description */}
                      <div className="md:col-span-8 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Card Title
                          </label>
                          <input
                            type="text"
                            value={feat.title}
                            onChange={(e) => handleFeatureChange(feat.id, 'title', e.target.value)}
                            placeholder="e.g. Premium Fabric Selection"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Card Description
                          </label>
                          <textarea
                            rows={2}
                            value={feat.description}
                            onChange={(e) => handleFeatureChange(feat.id, 'description', e.target.value)}
                            placeholder="e.g. We use high-grade fabrics for long-lasting comfort, durability and a professional appearance."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publishing Option */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-900 block">
                  Publish on Homepage
                </span>
                <span className="text-xs text-gray-500">
                  When enabled, this section will be rendered under the Trusted Brands section on the homepage.
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
              {saving ? 'Saving Changes...' : 'Save Craftsmanship Section'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
