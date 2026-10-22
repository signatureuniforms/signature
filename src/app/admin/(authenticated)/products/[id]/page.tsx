'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Subcategory, Product } from '@/types'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id

  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    category_id: '',
    subcategory_id: '',
    short_description: '',
    description: '',
    fabric_composition: '',
    care_instructions: '',
    available_sizes: '',
    available_colors: '',
    min_order_quantity: '50',
    primary_image_url: '',
  })

  useEffect(() => {
    async function initData() {
      setLoading(true)
      try {
        const supabase = createClient()
        const [catsRes, subcatsRes, prodRes] = await Promise.all([
          supabase.from('categories').select('*').order('position', { ascending: true }),
          supabase.from('subcategories').select('*').order('position', { ascending: true }),
          supabase.from('products').select('*, product_media(*, asset:media_assets(*))').eq('id', productId).single(),
        ])

        if (catsRes.data) {
          setCategories(catsRes.data)
        }
        if (subcatsRes.data) {
          setSubcategories(subcatsRes.data)
        }

        if (prodRes.data) {
          const p = prodRes.data as any
          const primaryImg =
            p.primary_image_url ||
            p.specifications?.primary_image_url ||
            p.product_media?.find((m: any) => m.is_primary)?.asset?.secure_url ||
            p.product_media?.[0]?.asset?.secure_url ||
            ''

          const moqVal = p.minimum_order_quantity ?? p.min_order_quantity

          setForm({
            name: p.name || '',
            slug: p.slug || '',
            category_id: p.category_id || '',
            subcategory_id: p.subcategory_id || '',
            short_description: p.short_description || '',
            description: p.full_description || p.description || '',
            fabric_composition: p.specifications?.fabric_composition || p.fabric_composition || '',
            care_instructions: p.specifications?.care_instructions || p.care_instructions || '',
            available_sizes: Array.isArray(p.available_sizes) ? p.available_sizes.join(', ') : '',
            available_colors: Array.isArray(p.available_colors) ? p.available_colors.join(', ') : '',
            min_order_quantity: moqVal !== null && moqVal !== undefined ? String(moqVal) : '50',
            primary_image_url: primaryImg,
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

      const specifications: Record<string, any> = {
        primary_image_url: form.primary_image_url.trim() || null,
        fabric_composition: form.fabric_composition.trim() || null,
        care_instructions: form.care_instructions.trim() || null,
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
        short_description: form.short_description.trim(),
        full_description: form.description.trim(),
        specifications,
        available_sizes: sizesArray,
        available_colors: colorsArray,
        minimum_order_quantity: form.min_order_quantity ? Number(form.min_order_quantity) : 50,
        show_price: false,
        price_from: null,
        is_published: true,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('products').update(payload).eq('id', productId)
      if (error) throw error

      if (form.primary_image_url) {
        try {
          const cleanUrl = form.primary_image_url.trim()
          const publicId = cleanUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '')
          const { data: asset } = await supabase.from('media_assets').insert({
            cloudinary_public_id: publicId,
            secure_url: cleanUrl,
            resource_type: 'image',
            format: cleanUrl.split('.').pop() || 'jpg',
            alt_text: form.name,
            folder: 'products',
            usage_count: 1
          }).select().single()

          if (asset?.id) {
            await supabase.from('product_media').insert({
              product_id: productId,
              asset_id: asset.id,
              is_primary: true
            })
          }
        } catch (mediaErr) {
          console.warn('Could not link media asset:', mediaErr)
        }
      }

      setMessage({ type: 'success', text: 'Product updated successfully!' })
      setTimeout(() => {
        router.push('/admin/products')
      }, 800)
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
      setMessage({ type: 'error', text: err.message || 'Failed to delete product' })
      setDeleting(false)
    }
  }

  const availableSubcats = subcategories.filter(s => !form.category_id || s.category_id === form.category_id)

  if (loading) {
    return <div className="py-20 text-center text-gray-400">Loading product details...</div>
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
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Edit Uniform Product
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Update product specs, subcategory, and catalog visibility.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
        {/* Core Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wider">
            Basic Information
          </h2>

          <CloudinaryUpload
            label="Product Main Photo (Direct Cloudinary Upload)"
            folder="products"
            value={form.primary_image_url}
            onChange={(url) => setForm(prev => ({ ...prev, primary_image_url: url }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Slug (URL identifier) *
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="Enter product slug"
                className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Uniform Category *
              </label>
              <select
                value={form.category_id}
                onChange={(e) => {
                  const newCat = e.target.value
                  setForm({ ...form, category_id: newCat, subcategory_id: '' })
                }}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="" disabled>Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Subcategory (Optional)
              </label>
              <select
                value={form.subcategory_id}
                onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">None / Select Subcategory</option>
                {availableSubcats.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Short Description / Highlight
            </label>
            <input
              type="text"
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              placeholder="Enter short description"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Full Product Specifications & Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter full description"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wider">
            Technical & Fabric Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Fabric Composition
              </label>
              <input
                type="text"
                value={form.fabric_composition}
                onChange={(e) => setForm({ ...form, fabric_composition: e.target.value })}
                placeholder="Enter fabric composition"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Care Instructions
              </label>
              <input
                type="text"
                value={form.care_instructions}
                onChange={(e) => setForm({ ...form, care_instructions: e.target.value })}
                placeholder="Enter care instructions"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Available Sizes (comma separated)
              </label>
              <input
                type="text"
                value={form.available_sizes}
                onChange={(e) => setForm({ ...form, available_sizes: e.target.value })}
                placeholder="Enter available sizes (e.g. S, M, L, XL)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Available Colors (comma separated)
              </label>
              <input
                type="text"
                value={form.available_colors}
                onChange={(e) => setForm({ ...form, available_colors: e.target.value })}
                placeholder="Enter available colors (e.g. Navy Blue, White)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Min Order Quantity */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Min Order Quantity (Pieces)
            </label>
            <input
              type="number"
              min="1"
              value={form.min_order_quantity}
              onChange={(e) => setForm({ ...form, min_order_quantity: e.target.value })}
              placeholder="Enter min order quantity (e.g. 50)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-[#FFD700] font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-zinc-800 transition-colors shadow cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
