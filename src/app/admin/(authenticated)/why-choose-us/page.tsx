'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Award,
  Shield,
  Truck,
  Sparkles,
  Scissors,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Save,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'
import type { WhyChooseUsItem, WhyChooseUsContent } from '@/types'

const AVAILABLE_ICONS = [
  { name: 'Award', label: 'Award / Quality', icon: Award },
  { name: 'Shield', label: 'Shield / Durability', icon: Shield },
  { name: 'Scissors', label: 'Scissors / Custom Tailoring', icon: Scissors },
  { name: 'Truck', label: 'Truck / Swift Delivery', icon: Truck },
  { name: 'Sparkles', label: 'Sparkles / Premium Fabric', icon: Sparkles },
  { name: 'Clock', label: 'Clock / 20+ Years Heritage', icon: Clock },
  { name: 'Users', label: 'Users / Wholesale Capacity', icon: Users },
  { name: 'CheckCircle', label: 'Check / Quality Guaranteed', icon: CheckCircle },
]

export default function AdminWhyChooseUsPage() {
  const [items, setItems] = useState<WhyChooseUsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<WhyChooseUsItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<WhyChooseUsItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Section Banner / Left-Side Image state
  const [bannerForm, setBannerForm] = useState({
    image_url: '',
    eyebrow: '',
    title: '',
    is_published: true,
  })
  const [bannerLoading, setBannerLoading] = useState(true)
  const [bannerSaving, setBannerSaving] = useState(false)
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    heading: '',
    description: '',
    icon_name: 'Award',
    position: 0,
    is_published: true,
  })

  const loadBannerContent = async () => {
    setBannerLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', 'home')
        .eq('section_key', 'why_choose_us')
        .maybeSingle()

      if (error) {
        console.warn('Error loading why choose us section content:', error)
      }

      if (data && data.content) {
        const c = data.content as WhyChooseUsContent
        setBannerForm({
          image_url: typeof c.image_url === 'string' ? c.image_url : '',
          eyebrow: typeof c.eyebrow === 'string' ? c.eyebrow : '',
          title: typeof c.title === 'string' ? c.title : '',
          is_published: typeof data.is_published === 'boolean' ? data.is_published : true,
        })
      }
    } catch (err: any) {
      console.warn('Error fetching why choose us banner:', err)
    } finally {
      setBannerLoading(false)
    }
  }

  const loadItems = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('why_choose_us_items')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw error
      if (data) {
        setItems(data)
      }
    } catch (e: any) {
      console.warn('Error loading why choose us items:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBannerContent()
    loadItems()
  }, [])

  const openCreateModal = () => {
    setEditingItem(null)
    setForm({
      heading: '',
      description: '',
      icon_name: 'Award',
      position: items.length + 1,
      is_published: true,
    })
    setShowModal(true)
  }

  const openEditModal = (item: WhyChooseUsItem) => {
    setEditingItem(item)
    setForm({
      heading: item.heading,
      description: item.description || '',
      icon_name: item.icon_name || 'Award',
      position: item.position ?? 0,
      is_published: item.is_published,
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.heading.trim()) {
      setMessage({ type: 'error', text: 'Heading is required.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const payload = {
        heading: form.heading.trim(),
        description: form.description.trim(),
        icon_name: form.icon_name,
        position: Number(form.position) || 0,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      }

      if (editingItem) {
        const { error } = await supabase
          .from('why_choose_us_items')
          .update(payload)
          .eq('id', editingItem.id)
        if (error) throw error
        setMessage({ type: 'success', text: 'Item updated successfully!' })
      } else {
        const { error } = await supabase
          .from('why_choose_us_items')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
        if (error) throw error
        setMessage({ type: 'success', text: 'Item created successfully!' })
      }

      setShowModal(false)
      loadItems()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save item' })
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = async (item: WhyChooseUsItem) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('why_choose_us_items')
        .update({ is_published: !item.is_published })
        .eq('id', item.id)

      if (error) throw error
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, is_published: !i.is_published } : i))
      )
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update status: ' + err.message })
    }
  }

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return
    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('why_choose_us_items').delete().eq('id', itemToDelete.id)
      if (error) throw error

      setItems(prev => prev.filter(i => i.id !== itemToDelete.id))
      setMessage({ type: 'success', text: `Item "${itemToDelete.heading}" removed.` })
      setItemToDelete(null)
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete: ' + err.message })
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    setBannerSaving(true)
    setBannerMessage(null)

    try {
      const supabase = createClient()
      const payload = {
        page_key: 'home',
        section_key: 'why_choose_us',
        content: {
          image_url: bannerForm.image_url.trim(),
          eyebrow: bannerForm.eyebrow.trim(),
          title: bannerForm.title.trim(),
        },
        is_published: bannerForm.is_published,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('page_content').upsert(payload, {
        onConflict: 'page_key,section_key',
      })

      if (error) throw error
      setBannerMessage({ type: 'success', text: 'Section left-side image and settings saved successfully!' })
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to save section image.' })
    } finally {
      setBannerSaving(false)
    }
  }

  const renderIcon = (name: string | null) => {
    const found = AVAILABLE_ICONS.find(i => i.name === name)
    const IconComp = found ? found.icon : Award
    return <IconComp className="w-5 h-5 text-[#FFD700]" />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Why Choose Us Section</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your left-side feature image, heading, and accordion trust reasons on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadBannerContent()
              loadItems()
            }}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading || bannerLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white font-medium text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFD700]" />
            <span>Add Reason Card</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            message.type === 'success'
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
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: Left-Side Image & Section Banner Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#FFD700]" />
              <span>Section Left-Side Image & Settings</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Upload an image to appear on the left side of the &quot;Why Choose Us&quot; accordion on the homepage. If no image is uploaded, the section cleanly displays without any placeholder.
            </p>
          </div>
        </div>

        {bannerMessage && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center justify-between mb-6 ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {bannerMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{bannerMessage.text}</span>
            </div>
            <button type="button" onClick={() => setBannerMessage(null)} className="text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSaveBanner} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left side: Cloudinary Image Uploader */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-2 uppercase tracking-wider">
                  Left-Side Image (Cloudinary)
                </label>
                <CloudinaryUpload
                  value={bannerForm.image_url}
                  onChange={(url) => setBannerForm(prev => ({ ...prev, image_url: url }))}
                  folder="signature-uniforms/why-choose-us"
                  label="Upload Left-Side Image"
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  Recommended: High-resolution vertical image (aspect ratio ~4:5 or 3:4, e.g. 800x1000px).
                </p>
              </div>

              {bannerForm.image_url && (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-neutral-900 aspect-[4/5] max-w-xs shadow-md">
                  <img
                    src={bannerForm.image_url}
                    alt="Why Choose Us Left"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setBannerForm(prev => ({ ...prev, image_url: '' }))}
                    className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white p-1.5 rounded-full shadow transition-all cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right side: Optional Section Header Text */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5 uppercase tracking-wider">
                  Eyebrow Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="OUR STRENGTHS"
                  value={bannerForm.eyebrow}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, eyebrow: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1">Leave empty to use default &quot;OUR STRENGTHS&quot;.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5 uppercase tracking-wider">
                  Section Heading (Optional)
                </label>
                <input
                  type="text"
                  placeholder="WHY CHOOSE US"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-serif"
                />
                <p className="text-[11px] text-gray-400 mt-1">Leave empty to use default &quot;WHY CHOOSE US&quot;.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={bannerSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium text-xs rounded-xl transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#FFD700]" />
                  <span>{bannerSaving ? 'Saving...' : 'Save Section Image & Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* SECTION 2: Accordion items header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Accordion Strength Items</h2>
          <p className="text-xs text-gray-500">Each item appears as an interactive accordion row on the right side.</p>
        </div>
      </div>

      {/* Grid of items */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading cards...</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="font-medium text-gray-700">No feature cards found</p>
          <p className="text-xs text-gray-400 mt-1">Add reason cards using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                    {renderIcon(item.icon_name)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      Pos: {item.position}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-2">{item.heading}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setItemToDelete(item)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP MODAL: Add / Edit Item */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Edit Feature Card' : 'Add Feature Card'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Icon</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map(ic => {
                    const IconComp = ic.icon
                    const isSelected = form.icon_name === ic.name
                    return (
                      <button
                        type="button"
                        key={ic.name}
                        onClick={() => setForm(prev => ({ ...prev, icon_name: ic.name }))}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-[#FFD700] border-black shadow-sm'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                        }`}
                      >
                        <IconComp className="w-5 h-5 mb-1" />
                        <span className="text-[10px] truncate max-w-full">{ic.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Heading *</label>
                <input
                  type="text"
                  required
                  value={form.heading}
                  onChange={e => setForm(prev => ({ ...prev, heading: e.target.value }))}
                  placeholder="e.g. Master Tailoring & Perfect Fit"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Explain why institutions choose Signature Uniforms..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Display Position</label>
                  <input
                    type="number"
                    value={form.position}
                    onChange={e => setForm(prev => ({ ...prev, position: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Card' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Delete Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Card?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to remove &ldquo;{itemToDelete.heading}&rdquo;?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
