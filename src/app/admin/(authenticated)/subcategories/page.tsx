'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X, ChevronRight, RefreshCw, AlertCircle, CheckCircle2, Search, Filter, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Subcategory } from '@/types'

interface SubcategoryWithCategory extends Omit<Subcategory, 'category'> {
  category?: { id: string; name: string } | null
}

export default function AdminSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<SubcategoryWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryWithCategory | null>(null)
  const [subcatToDelete, setSubcatToDelete] = useState<SubcategoryWithCategory | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    slug: '',
    description: '',
    position: 0,
    is_enabled: true,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      const [catsRes, subcatsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('subcategories')
          .select('*, category:categories(id, name)')
          .order('position', { ascending: true }),
      ])

      if (catsRes.data) {
        setCategories(catsRes.data)
      }
      if (subcatsRes.data) {
        setSubcategories(subcatsRes.data as SubcategoryWithCategory[])
      }
    } catch (e: any) {
      console.warn('Error loading subcategories:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm(prev => ({ ...prev, name, slug }))
  }

  const openCreateModal = () => {
    setEditingSubcategory(null)
    setForm({
      category_id: categories[0]?.id || '',
      name: '',
      slug: '',
      description: '',
      position: subcategories.length + 1,
      is_enabled: true,
    })
    setShowModal(true)
  }

  const openEditModal = (subcat: SubcategoryWithCategory) => {
    setEditingSubcategory(subcat)
    setForm({
      category_id: subcat.category_id,
      name: subcat.name,
      slug: subcat.slug,
      description: subcat.description || '',
      position: subcat.position ?? 0,
      is_enabled: subcat.is_enabled,
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.category_id) {
      setMessage({ type: 'error', text: 'Category and Name are required.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const payload = {
        category_id: form.category_id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        position: Number(form.position) || 0,
        is_enabled: form.is_enabled,
        updated_at: new Date().toISOString(),
      }

      if (editingSubcategory) {
        const { error } = await supabase
          .from('subcategories')
          .update(payload)
          .eq('id', editingSubcategory.id)
        if (error) throw error
        setMessage({ type: 'success', text: 'Subcategory updated successfully!' })
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          })
        if (error) throw error
        setMessage({ type: 'success', text: 'Subcategory created successfully!' })
      }

      setShowModal(false)
      loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' })
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (subcat: SubcategoryWithCategory) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('subcategories')
        .update({ is_enabled: !subcat.is_enabled })
        .eq('id', subcat.id)

      if (error) throw error
      setSubcategories(prev =>
        prev.map(item => (item.id === subcat.id ? { ...item, is_enabled: !item.is_enabled } : item))
      )
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update status: ' + err.message })
    }
  }

  const confirmDelete = async () => {
    if (!subcatToDelete) return
    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('subcategories').delete().eq('id', subcatToDelete.id)
      if (error) throw error

      setSubcategories(prev => prev.filter(item => item.id !== subcatToDelete.id))
      setMessage({ type: 'success', text: `Subcategory "${subcatToDelete.name}" deleted.` })
      setSubcatToDelete(null)
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete: ' + err.message })
    } finally {
      setDeleting(false)
    }
  }

  const filteredSubcategories = subcategories.filter(sub => {
    const matchesCategory = selectedCategoryFilter === 'all' || sub.category_id === selectedCategoryFilter
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subcategories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize catalog products under specific department and school categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white font-medium text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFD700]" />
            <span>Add Subcategory</span>
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

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subcategory by name, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading subcategories...</div>
        ) : filteredSubcategories.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <ChevronRight className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium text-gray-600">No subcategories found</p>
            <p className="text-xs text-gray-400 mt-1">Create one using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subcategory</th>
                  <th className="py-3 px-4">Parent Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4 text-center">Position</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubcategories.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div>{sub.name}</div>
                      {sub.description && (
                        <div className="text-xs font-normal text-gray-400 line-clamp-1 mt-0.5">{sub.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {sub.category?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-500">{sub.slug}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">{sub.position ?? 0}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleStatus(sub)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          sub.is_enabled
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {sub.is_enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>{sub.is_enabled ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSubcatToDelete(sub)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL: Add / Edit Subcategory */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Category *</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:border-black outline-none bg-white"
                >
                  <option value="" disabled>Select parent category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Primary School Blazers"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. primary-school-blazers"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono text-xs text-gray-900 focus:border-black outline-none bg-gray-50 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Short description for this subcategory..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Display Position</label>
                  <input
                    type="number"
                    value={form.position}
                    onChange={e => setForm(prev => ({ ...prev, position: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_enabled}
                      onChange={e => setForm(prev => ({ ...prev, is_enabled: e.target.checked }))}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                    />
                    <span className="text-xs font-medium text-gray-700">Active / Enabled</span>
                  </label>
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
                  {saving ? 'Saving...' : editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Delete Confirmation */}
      {subcatToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Subcategory?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete &ldquo;{subcatToDelete.name}&rdquo;?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubcatToDelete(null)}
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
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
