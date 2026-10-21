'use client'

import { useState, useEffect } from 'react'
import {
  ShieldCheck,
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
import type { FooterFeatureItem, FooterFeaturesContent } from '@/types'

const MAX_ITEMS = 4

export default function AdminFooterFeaturesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Empty initial state - NO mock or fallback data
  const [items, setItems] = useState<FooterFeatureItem[]>([])
  const [isPublished, setIsPublished] = useState(true)

  // New item form
  const [newHeading, setNewHeading] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newIconUrl, setNewIconUrl] = useState('')
  const [inputError, setInputError] = useState('')

  useEffect(() => {
    async function loadFeatures() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', 'global')
          .eq('section_key', 'footer_features')
          .maybeSingle()

        if (error) {
          console.warn('Error fetching footer features:', error)
        }

        if (data && data.content) {
          const c = data.content as FooterFeaturesContent
          setItems(Array.isArray(c.items) ? c.items.slice(0, MAX_ITEMS) : [])
          setIsPublished(typeof data.is_published === 'boolean' ? data.is_published : true)
        }
      } catch (err: any) {
        console.warn('Failed to load footer features:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFeatures()
  }, [])

  const handleAddItem = () => {
    setInputError('')

    if (items.length >= MAX_ITEMS) {
      setInputError(`You can only add up to ${MAX_ITEMS} items.`)
      return
    }

    if (!newHeading.trim()) {
      setInputError('Please enter a heading.')
      return
    }

    if (!newDescription.trim()) {
      setInputError('Please enter a description.')
      return
    }

    if (!newIconUrl.trim()) {
      setInputError('Please upload an icon image.')
      return
    }

    const newItem: FooterFeatureItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `feat_${Date.now()}`,
      heading: newHeading.trim(),
      description: newDescription.trim(),
      icon_url: newIconUrl.trim(),
    }

    setItems((prev) => [...prev, newItem])
    setNewHeading('')
    setNewDescription('')
    setNewIconUrl('')
  }

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= items.length) return
    const updated = [...items]
    const temp = updated[index]
    updated[index] = updated[target]
    updated[target] = temp
    setItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const payload = {
        page_key: 'global',
        section_key: 'footer_features',
        content: {
          items: items.slice(0, MAX_ITEMS),
        },
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('page_content').upsert(payload, {
        onConflict: 'page_key,section_key',
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Footer features section saved successfully!' })
    } catch (err: any) {
      console.error('Error saving footer features:', err)
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
              Footer Features Bar
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
              <ShieldCheck className="w-3 h-3 text-[#FFD700]" />
              Website Footer Top
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage up to 4 value highlights (icon, heading, description) displayed at the top of the website footer.
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
                <ShieldCheck className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-semibold text-white">
                  Footer Highlights Specification
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  This bar appears on the light grey strip directly above the black website footer. Exactly up to <strong>4 items</strong> can be configured (e.g. Bulk Order, Pan India Delivery, Easy Procurement, Custom Embroidery).
                </p>
                <div className="pt-2 text-xs text-[#FFD700] flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Items limit: <strong>{items.length} / {MAX_ITEMS}</strong> items added.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add New Feature Item Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Add Feature Item</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload an icon and specify the title and short description.
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${items.length >= MAX_ITEMS ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                {items.length} / {MAX_ITEMS} items
              </span>
            </div>

            {items.length >= MAX_ITEMS ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>You have reached the maximum limit of {MAX_ITEMS} feature items. Delete an item below if you wish to add a different one.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Heading */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Heading *
                    </label>
                    <input
                      type="text"
                      value={newHeading}
                      onChange={(e) => setNewHeading(e.target.value)}
                      placeholder="e.g. BULK ORDER"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="e.g. Get a good discount on bulk orders."
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {/* Icon Upload */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Icon Image (SVG / PNG recommended) *
                  </label>
                  <CloudinaryUpload
                    value={newIconUrl}
                    onChange={(url) => {
                      setNewIconUrl(url)
                      setInputError('')
                    }}
                    folder="features"
                    label="Upload Feature Icon"
                  />

                  {newIconUrl && (
                    <div className="mt-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-1.5">
                          <img
                            src={newIconUrl}
                            alt="Icon preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <span className="text-xs text-gray-600 truncate max-w-sm">{newIconUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewIconUrl('')}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {inputError && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {inputError}
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature ({items.length + 1} of {MAX_ITEMS})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Feature Items List */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Current Items</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Items render horizontally from left to right across the footer top bar.
                </p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-gray-300 text-gray-400">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No feature items added yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Add up to 4 items above to activate this section.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/80 shadow-xs"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon preview */}
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-2 shrink-0">
                        <img
                          src={item.icon_url}
                          alt={item.heading}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                            {item.heading}
                          </span>
                          <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                            Column #{index + 1}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 rounded hover:bg-gray-200 transition-colors"
                        title="Move Left"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === items.length - 1}
                        className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 rounded hover:bg-gray-200 transition-colors"
                        title="Move Right"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors ml-1"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Publish Toggle */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-900 block">
                  Publish on Footer
                </span>
                <span className="text-xs text-gray-500">
                  When enabled and items exist, this section will display above the footer across the website.
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
              {saving ? 'Saving Changes...' : 'Save Footer Features Bar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
