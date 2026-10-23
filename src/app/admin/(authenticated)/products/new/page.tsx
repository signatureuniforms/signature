'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Subcategory } from '@/types'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(false)
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
    async function fetchData() {
      const supabase = createClient()
      const [{ data: catData }, { data: subcatData }] = await Promise.all([
        supabase.from('categories').select('*').order('position', { ascending: true }),
        supabase.from('subcategories').select('*').order('position', { ascending: true }),
      ])
      if (catData && catData.length > 0) {
        setCategories(catData)
        setForm(prev => ({ ...prev, category_id: prev.category_id || catData[0].id }))
      }
      if (subcatData) {
        setSubcategories(subcatData)
      }
    }
    fetchData()
  }, [])

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.category_id) {
      setMessage({ type: 'error', text: 'Product name and category are required.' })
      return
    }

    setLoading(true)
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
        is_featured: false,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: newProd, error } = await supabase.from('products').insert(payload).select('id').single()
      if (error) throw error

      if (form.primary_image_url && newProd?.id) {
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
              product_id: newProd.id,
              asset_id: asset.id,
              is_primary: true
            })
          }
        } catch (mediaErr) {
          console.warn('Could not link media asset:', mediaErr)
        }
      }

      setMessage({ type: 'success', text: 'Product created successfully!' })
      setTimeout(() => {
        router.push('/admin/products')
      }, 800)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create product' })
    } finally {
      setLoading(false)
    }
  }

  const availableSubcats = subcategories.filter(s => !form.category_id || s.category_id === form.category_id)

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Add New Uniform Product
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create a new uniform item with bulk specifications and WhatsApp direct enquiry.
          </p>
        </div>
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

          {/* Main Photo */}
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
                className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:border-black"
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
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value, short_description: e.target.value })}
              placeholder="Enter product description"
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
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-[#FFD700] font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-zinc-800 transition-colors shadow cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
