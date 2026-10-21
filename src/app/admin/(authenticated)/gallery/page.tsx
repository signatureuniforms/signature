'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, BookImage, RefreshCw, Eye, EyeOff, X, Save, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { GalleryItem } from '@/types'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    title: '',
    caption: '',
    image_url: '',
    category: 'school',
    display_order: 0,
    is_featured: false,
    is_published: true,
  })

  const loadGallery = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true })

      if (data) setItems(data)
    } catch (e) {
      console.warn('Error fetching gallery:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGallery()
  }, [])

  const openCreateModal = () => {
    setEditingItem(null)
    setForm({
      title: '',
      caption: '',
      image_url: '',
      category: 'school',
      display_order: items.length + 1,
      is_featured: false,
      is_published: true,
    })
    setShowModal(true)
  }

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item)
    setForm({
      title: item.title || '',
      caption: item.caption || '',
      image_url: item.image_url || '',
      category: item.category || 'school',
      display_order: item.display_order ?? 0,
      is_featured: item.is_featured,
      is_published: item.is_published,
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.image_url) {
      setMessage({ type: 'error', text: 'Please upload an image for the gallery.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const payload = {
        title: form.title.trim(),
        caption: form.caption.trim(),
        image_url: form.image_url,
        category: form.category,
        display_order: Number(form.display_order) || 0,
        is_featured: form.is_featured,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      }

      if (editingItem) {
        const { error } = await supabase.from('gallery_items').update(payload).eq('id', editingItem.id)
        if (error) throw error
        setMessage({ type: 'success', text: 'Gallery photo updated successfully!' })
      } else {
        const { error } = await supabase.from('gallery_items').insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Gallery photo added successfully!' })
      }

      setShowModal(false)
      loadGallery()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('gallery_items').delete().eq('id', itemToDelete.id)
      if (error) throw error

      setItems(prev => prev.filter(i => i.id !== itemToDelete.id))
      setMessage({ type: 'success', text: 'Gallery photo removed successfully.' })
      setItemToDelete(null)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete photo' })
    } finally {
      setDeleting(false)
    }
  }

  const togglePublish = async (item: GalleryItem) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('gallery_items')
        .update({ is_published: !item.is_published })
        .eq('id', item.id)

      if (error) throw error
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, is_published: !i.is_published } : i))
      )
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gallery Showcase</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and organize authentic customer and institution photographs directly to Cloudinary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadGallery}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white font-medium text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFD700]" />
            <span>Upload New Photo</span>
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

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading gallery photos...</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <BookImage className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="font-medium text-gray-700">No gallery photos uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Click &ldquo;Upload New Photo&rdquo; to add your first uniform photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm group hover:border-black transition-all flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title || 'Uniform gallery image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-black/80 text-[#FFD700] backdrop-blur-sm">
                    {item.category}
                  </span>
                  {item.is_featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-white">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3">
                <div className="font-semibold text-gray-900 text-xs truncate">{item.title || 'Untitled Image'}</div>
                {item.caption && <div className="text-[11px] text-gray-400 truncate mt-0.5">{item.caption}</div>}

                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-100">
                  <button
                    onClick={() => togglePublish(item)}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.is_published
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.is_published ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                    <span>{item.is_published ? 'Visible' : 'Hidden'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
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

      {/* Upload / Edit Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingItem ? 'Edit Gallery Photo' : 'Upload Gallery Photo'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Direct Cloudinary Upload Component */}
              <CloudinaryUpload
                label="Photo (Direct Cloudinary Upload) *"
                folder="gallery"
                value={form.image_url}
                onChange={url => setForm(prev => ({ ...prev, image_url: url }))}
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Photo Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. St. Joseph Public School Uniforms"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Caption / Notes</label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={e => setForm(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="e.g. Complete blazer and trousers tailoring batch"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category Tag</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none bg-white"
                  >
                    <option value="school">School Uniforms</option>
                    <option value="college">College Uniforms</option>
                    <option value="corporate">Corporate Uniforms</option>
                    <option value="hospital">Hospital & Medical</option>
                    <option value="industrial">Industrial Workwear</option>
                    <option value="factory">Factory & Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={e => setForm(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={e => setForm(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                  />
                  <span className="text-xs font-medium text-gray-700">Published on site</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                  />
                  <span className="text-xs font-medium text-gray-700">Feature on homepage</span>
                </label>
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
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Upload to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Gallery Photo?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete this photo{itemToDelete.title ? ` ("${itemToDelete.title}")` : ''}? This action cannot be undone.
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
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
