'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Eye, Package, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Product } from '@/types'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id

  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  useEffect(() => {
    async function initData() {
      setLoading(true)
      try {
        const supabase = createClient()
        const [catsRes, prodRes] = await Promise.all([
          supabase.from('categories').select('*').order('position', { ascending: true }),
          supabase.from('products').select('*').eq('id', productId).single(),
        ])

        if (catsRes.data) {
          setCategories(catsRes.data)
        }

        if (prodRes.data) {
          const p = prodRes.data as Product
          setForm({
            name: p.name || '',
            slug: p.slug || '',
            category_id: p.category_id || '',
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
        } else {
          setMessage({ type: 'error', text: 'Product not found.' })
        }
      } catch (err: any) {
        console.warn('Error fetching product:', err)
        setMessage({ type: 'error', text: err.message || 'Failed to load product' })
      } finally {
        setLoading(false)
      }
    }

    initData()
  }, [productId])

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      const { error } = await supabase.from('products').update(payload).eq('id', productId)
      if (error) throw error

      setMessage({ type: 'success', text: 'Product updated successfully!' })
      setTimeout(() => {
        router.push('/admin/products')
      }, 1000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update product' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${form.name}"?`)) return
    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error

      router.push('/admin/products')
    } catch (err: any) {
      alert('Failed to delete product: ' + err.message)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500 font-medium">
        Loading product details...
      </div>
    )
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Product</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Update catalog details, materials, imagery, and wholesale MOQ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {form.slug && (
            <Link
              href={`/products/${form.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Page</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${message.type === 'success'
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
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
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
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono text-xs focus:border-black outline-none bg-gray-50"
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
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Fabric & Manufacturing Specs */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">
            Fabric & Tailoring Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fabric Blend / Composition</label>
              <input
                type="text"
                value={form.fabric_composition}
                onChange={e => setForm(p => ({ ...p, fabric_composition: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Care & Wash Instructions</label>
              <input
                type="text"
                value={form.care_instructions}
                onChange={e => setForm(p => ({ ...p, care_instructions: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Available Sizes (Comma-separated)</label>
              <input
                type="text"
                value={form.available_sizes}
                onChange={e => setForm(p => ({ ...p, available_sizes: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Available Colors (Comma-separated)</label>
              <input
                type="text"
                value={form.available_colors}
                onChange={e => setForm(p => ({ ...p, available_colors: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & MOQ */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">
            Wholesale & Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Order Qty (MOQ)</label>
              <input
                type="number"
                value={form.min_order_quantity}
                onChange={e => setForm(p => ({ ...p, min_order_quantity: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Starting Base Price (₹)</label>
              <input
                type="number"
                value={form.base_price}
                onChange={e => setForm(p => ({ ...p, base_price: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.show_price}
                  onChange={e => setForm(p => ({ ...p, show_price: e.target.checked }))}
                  className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                />
                <span className="text-xs font-medium text-gray-700">Display price publicly</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">
            Product Imagery
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Image URL</label>
            <input
              type="text"
              value={form.primary_image_url}
              onChange={e => setForm(p => ({ ...p, primary_image_url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Gallery Image URLs (One URL per line)</label>
            <textarea
              rows={3}
              value={form.gallery_image_urls}
              onChange={e => setForm(p => ({ ...p, gallery_image_urls: e.target.value }))}
              placeholder="https://...&#10;https://..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono text-xs focus:border-black outline-none"
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-6">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))}
              className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-800">Published (Visible in Catalog)</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
              className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-800">Feature on Homepage</span>
          </label>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#FFD700]" />
            <span>{saving ? 'Saving Changes...' : 'Save Product Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
