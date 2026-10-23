'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X, Grid3x3, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    image_id: null as string | null,
    position: 0,
    is_enabled: true,
    is_featured: false,
  })

  const loadCategories = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*, image:media_assets(*)')
        .order('position', { ascending: true })

      if (error) {
        console.warn('Error loading categories:', error)
        setMessage({ type: 'error', text: error.message })
      } else if (data) {
        setCategories(data)
      }
    } catch (e: any) {
      console.warn('Error loading categories:', e)
      setMessage({ type: 'error', text: e.message || 'Error loading categories' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const openCreateModal = () => {
    setEditingCategory(null)
    setForm({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      image_id: null,
      position: categories.length + 1,
      is_enabled: true,
      is_featured: false,
    })
    setShowModal(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image_url: cat.image?.secure_url || cat.image_url || '',
      image_id: cat.image_id || null,
      position: cat.position ?? cat.display_order ?? 0,
      is_enabled: cat.is_enabled ?? true,
      is_featured: cat.is_featured ?? false,
    })
    setShowModal(true)
  }

  const handleNameChange = (name: string) => {
    if (!editingCategory) {
      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      setForm(prev => ({ ...prev, name, slug }))
    } else {
      setForm(prev => ({ ...prev, name }))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Category name is required.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      // Resolve image_id from media_assets if image_url is provided
      let resolvedImageId = form.image_id
      if (form.image_url.trim()) {
        const { data: asset } = await supabase
          .from('media_assets')
          .select('id')
          .eq('secure_url', form.image_url.trim())
          .limit(1)
          .maybeSingle()

        if (asset?.id) {
          resolvedImageId = asset.id
        } else {
          // If not in media_assets yet, insert it
          const { data: newAsset } = await supabase
            .from('media_assets')
            .insert({
              cloudinary_public_id: `cat-${form.slug || Date.now()}`,
              secure_url: form.image_url.trim(),
              resource_type: 'image',
              alt_text: form.name.trim(),
              folder: 'categories',
            })
            .select('id')
            .maybeSingle()

          if (newAsset?.id) {
            resolvedImageId = newAsset.id
          }
        }
      } else {
        resolvedImageId = null
      }

      // Exact database table schema columns: position, image_id (not display_order or image_url)
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        image_id: resolvedImageId,
        position: Number(form.position) || 0,
        is_enabled: form.is_enabled,
        is_featured: form.is_featured,
        updated_at: new Date().toISOString(),
      }

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id)

        if (error) throw error
        setMessage({ type: 'success', text: `Category "${form.name}" updated successfully.` })
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })

        if (error) throw error
        setMessage({ type: 'success', text: `Category "${form.name}" created successfully.` })
      }

      setShowModal(false)
      loadCategories()
    } catch (err: any) {
      console.error('Save category error:', err)
      setMessage({ type: 'error', text: err.message || 'Operation failed' })
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('categories').delete().eq('id', categoryToDelete.id)
      if (error) throw error
      setMessage({ type: 'success', text: `Category "${categoryToDelete.name}" deleted.` })
      setCategoryToDelete(null)
      loadCategories()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Uniform Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage uniform sectors: School, College, Corporate, Hospital, Industrial.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadCategories}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-black rounded-xl hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
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
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Grid3x3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium text-gray-600">No categories found</p>
            <p className="text-xs text-gray-400 mt-1">Add your first uniform sector using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 text-gray-700 font-semibold border-b border-gray-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Order</th>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => {
                  const displayImg = cat.image?.secure_url || cat.image_url
                  const displayPos = cat.position ?? cat.display_order ?? 0

                  return (
                    <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-gray-500 text-center">#{displayPos}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                            {displayImg ? (
                              <img
                                src={displayImg}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Grid3x3 className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-xs">{cat.name}</div>
                            {cat.description && (
                              <div className="text-[11px] text-gray-400 truncate max-w-xs">{cat.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">{cat.slug}</td>
                      <td className="py-3 px-4">
                        {cat.is_featured ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Featured
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            cat.is_enabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {cat.is_enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {cat.is_enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setCategoryToDelete(cat)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL: Add / Edit Category */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingCategory ? 'Edit Uniform Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Cloudinary Cover Photo Upload */}
              <CloudinaryUpload
                label="Cover Image (Direct Cloudinary Upload)"
                folder="categories"
                value={form.image_url}
                onChange={url => setForm(prev => ({ ...prev, image_url: url }))}
                onAssetChange={assetId => setForm(prev => ({ ...prev, image_id: assetId }))}
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Hotel Uniform"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. hotel-uniform"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 bg-gray-50 placeholder:text-gray-400 focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Wholesale Hotel Uniform Manufacturer & Supplier"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Display Order (Position)
                  </label>
                  <input
                    type="number"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black outline-none"
                  />
                </div>
                <div className="flex flex-col justify-end space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="rounded text-black focus:ring-black"
                    />
                    <span className="text-gray-700 font-medium">Feature on Homepage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_enabled}
                      onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })}
                      className="rounded text-black focus:ring-black"
                    />
                    <span className="text-gray-700 font-medium">Visible / Enabled</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-black text-[#FFD700] font-semibold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Delete Category Confirmation */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Category?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete category &ldquo;{categoryToDelete.name}&rdquo;? Products under this category may be affected.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
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
