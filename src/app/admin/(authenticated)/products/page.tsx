'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Package, Edit, Trash2, Search, Filter, RefreshCw, Eye, EyeOff, X, Save, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/types'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Product Form (NO mock fallback data)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category_id: '',
    short_description: '',
    description: '',
    fabric_composition: '',
    care_instructions: '',
    available_sizes: '',
    available_colors: '',
    min_order_quantity: 50,
    show_price: false,
    base_price: '',
    primary_image_url: '',
    gallery_image_urls: '',
    is_featured: false,
    is_published: true,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const [{ data: prodData }, { data: catData }] = await Promise.all([
        supabase.from('products').select('*, category:categories(name, slug)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('position', { ascending: true })
      ])

      if (prodData) setProducts(prodData)
      if (catData) setCategories(catData)
    } catch (e) {
      console.warn('Error loading products:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm({
      name: '',
      slug: '',
      category_id: categories[0]?.id || '',
      short_description: '',
      description: '',
      fabric_composition: '',
      care_instructions: '',
      available_sizes: '',
      available_colors: '',
      min_order_quantity: 50,
      show_price: false,
      base_price: '',
      primary_image_url: '',
      gallery_image_urls: '',
      is_featured: false,
      is_published: true,
    })
    setShowProductModal(true)
  }

  const openEditModal = (p: Product) => {
    setEditingProduct(p)
    setForm({
      name: p.name || '',
      slug: p.slug || '',
      category_id: p.category_id || (categories[0]?.id || ''),
      short_description: p.short_description || '',
      description: p.description || p.full_description || '',
      fabric_composition: p.fabric_composition || '',
      care_instructions: p.care_instructions || '',
      available_sizes: Array.isArray(p.available_sizes) ? p.available_sizes.join(', ') : '',
      available_colors: Array.isArray(p.available_colors) ? p.available_colors.join(', ') : '',
      min_order_quantity: p.min_order_quantity ?? p.minimum_order_quantity ?? 50,
      show_price: Boolean(p.show_price),
      base_price: p.base_price !== null && p.base_price !== undefined ? String(p.base_price) : '',
      primary_image_url: p.primary_image_url || '',
      gallery_image_urls: Array.isArray(p.gallery_image_urls) ? p.gallery_image_urls.join('\n') : '',
      is_featured: Boolean(p.is_featured),
      is_published: p.is_published !== undefined ? Boolean(p.is_published) : true,
    })
    setShowProductModal(true)
  }

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm(prev => ({ ...prev, name, slug }))
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.category_id) {
      setMessage({ type: 'error', text: 'Product name and category are required.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const sizesArray = form.available_sizes.split(',').map(s => s.trim()).filter(Boolean)
      const colorsArray = form.available_colors.split(',').map(c => c.trim()).filter(Boolean)
      const galleryArray = form.gallery_image_urls.split('\n').map(url => url.trim()).filter(Boolean)

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category_id: form.category_id || null,
        short_description: form.short_description.trim(),
        description: form.description.trim(),
        fabric_composition: form.fabric_composition.trim(),
        care_instructions: form.care_instructions.trim(),
        available_sizes: sizesArray,
        available_colors: colorsArray,
        min_order_quantity: Number(form.min_order_quantity) || 50,
        show_price: form.show_price,
        base_price: form.base_price ? Number(form.base_price) : null,
        primary_image_url: form.primary_image_url.trim() || null,
        gallery_image_urls: galleryArray,
        is_featured: form.is_featured,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      }

      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)
        if (error) throw error
        setMessage({ type: 'success', text: 'Product updated successfully!' })
      } else {
        const { error } = await supabase.from('products').insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Product created successfully!' })
      }

      setShowProductModal(false)
      loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save product' })
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id)
      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
      setMessage({ type: 'success', text: `Product "${productToDelete.name}" deleted.` })
      setProductToDelete(null)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete product' })
    } finally {
      setDeleting(false)
    }
  }

  const togglePublish = async (prod: Product) => {
    try {
      const supabase = createClient()
      const newStatus = !prod.is_published
      await supabase.from('products').update({ is_published: newStatus }).eq('id', prod.id)
      setProducts(products.map(p => p.id === prod.id ? { ...p, is_published: newStatus } : p))
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage uniform items, specifications, wholesale MOQ, and Cloudinary media assets.
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-black rounded-xl hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Add New Product</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:border-black"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium text-gray-600">No products found</p>
            <p className="text-xs text-gray-400 mt-1">Use &ldquo;Add New Product&rdquo; above to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">MOQ</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                          {p.primary_image_url ? (
                            <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-xs">{p.name}</div>
                          <div className="font-mono text-[10px] text-gray-400">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-700">
                      {p.category?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs">
                      {p.min_order_quantity ? `${p.min_order_quantity} pcs` : '50 pcs'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {p.show_price && p.base_price ? (
                        <span className="font-semibold text-gray-900">₹{p.base_price}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Quote Only</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {p.is_featured ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Featured
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => togglePublish(p)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                          p.is_published
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {p.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                          title="Preview public page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-gray-600 hover:text-black rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* POPUP MODAL: Add / Edit Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Product Direct Cloudinary Photo Upload */}
              <CloudinaryUpload
                label="Product Main Photo (Direct Cloudinary Upload)"
                folder="products"
                value={form.primary_image_url}
                onChange={url => setForm(prev => ({ ...prev, primary_image_url: url }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Premium School Blazer"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    placeholder="e.g. premium-school-blazer"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono focus:border-black outline-none bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none bg-white"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={form.short_description}
                  onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))}
                  placeholder="One line summary for catalog grid..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Fabric details, stitching specifications, customization options..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    value={form.fabric_composition}
                    onChange={e => setForm(p => ({ ...p, fabric_composition: e.target.value }))}
                    placeholder="e.g. Polyester Viscose Blend"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Care Instructions</label>
                  <input
                    type="text"
                    value={form.care_instructions}
                    onChange={e => setForm(p => ({ ...p, care_instructions: e.target.value }))}
                    placeholder="e.g. Machine wash cold, gentle iron"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Available Sizes (Comma-separated)</label>
                  <input
                    type="text"
                    value={form.available_sizes}
                    onChange={e => setForm(p => ({ ...p, available_sizes: e.target.value }))}
                    placeholder="e.g. S, M, L, XL, XXL"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Available Colors (Comma-separated)</label>
                  <input
                    type="text"
                    value={form.available_colors}
                    onChange={e => setForm(p => ({ ...p, available_colors: e.target.value }))}
                    placeholder="e.g. Navy Blue, White, Black"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">MOQ (Pieces)</label>
                  <input
                    type="number"
                    value={form.min_order_quantity}
                    onChange={e => setForm(p => ({ ...p, min_order_quantity: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={form.base_price}
                    onChange={e => setForm(p => ({ ...p, base_price: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.show_price}
                      onChange={e => setForm(p => ({ ...p, show_price: e.target.checked }))}
                      className="w-4 h-4 text-black rounded border-gray-300"
                    />
                    <span className="text-xs font-medium text-gray-700">Display price</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))}
                    className="w-4 h-4 text-black rounded border-gray-300"
                  />
                  <span className="text-xs font-medium text-gray-700">Published in Catalog</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-black rounded border-gray-300"
                  />
                  <span className="text-xs font-medium text-gray-700">Featured on Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Delete Product Confirmation */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to permanently delete &ldquo;{productToDelete.name}&rdquo;? This will remove it from the catalog.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
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
