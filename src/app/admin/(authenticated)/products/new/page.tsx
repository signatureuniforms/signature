'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Package, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    category_id: '',
    short_description: '',
    description: '',
    fabric_composition: '65% Polyester / 35% Cotton Premium Blend',
    care_instructions: 'Machine wash warm, do not bleach, tumble dry low, warm iron if needed',
    available_sizes: '26, 28, 30, 32, 34, 36, 38, 40, S, M, L, XL, XXL',
    available_colors: 'Navy Blue, Sky Blue, Pure White, Maroon, Bottle Green',
    min_order_quantity: 50,
    show_price: false,
    base_price: '',
    primary_image_url: '',
    gallery_image_urls: '',
    is_featured: false,
    is_published: true,
  })

  useEffect(() => {
    async function fetchCats() {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').order('position', { ascending: true })
      if (data && data.length > 0) {
        setCategories(data)
        setForm(prev => ({ ...prev, category_id: data[0].id }))
      }
    }
    fetchCats()
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
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const sizesArray = form.available_sizes.split(',').map(s => s.trim()).filter(Boolean)
      const colorsArray = form.available_colors.split(',').map(c => c.trim()).filter(Boolean)
      const galleryArray = form.gallery_image_urls.split('\n').map(url => url.trim()).filter(Boolean)

      const payload = {
        name: form.name,
        slug: form.slug,
        category_id: form.category_id || null,
        short_description: form.short_description,
        description: form.description,
        fabric_composition: form.fabric_composition,
        care_instructions: form.care_instructions,
        available_sizes: sizesArray,
        available_colors: colorsArray,
        min_order_quantity: Number(form.min_order_quantity) || 50,
        show_price: form.show_price,
        base_price: form.base_price ? Number(form.base_price) : null,
        primary_image_url: form.primary_image_url || null,
        gallery_image_urls: galleryArray,
        is_featured: form.is_featured,
        is_published: form.is_published,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('products').insert(payload)
      if (error) throw error

      setMessage({ type: 'success', text: 'Product created successfully!' })
      setTimeout(() => {
        router.push('/admin/products')
      }, 1000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create product' })
    } finally {
      setLoading(false)
    }
  }

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
            Create a new uniform item with bulk specifications and WhatsApp enquiry linkage.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success'
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
                placeholder="e.g. Classic School Uniform Shirt"
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
                placeholder="classic-school-uniform-shirt"
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
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Minimum Order Quantity (MOQ)
              </label>
              <input
                type="number"
                value={form.min_order_quantity}
                onChange={(e) => setForm({ ...form, min_order_quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
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
              placeholder="e.g. Durable, crease-resistant school uniform shirt designed for year-round comfort."
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
              placeholder="Detailed description of stitch quality, pockets, buttons, hem, and fabric finish..."
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Media */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wider">
            Pricing & Images
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Primary Product Image URL
              </label>
              <input
                type="url"
                value={form.primary_image_url}
                onChange={(e) => setForm({ ...form, primary_image_url: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
                className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Base Price (₹) — Optional
              </label>
              <input
                type="number"
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                placeholder="e.g. 350"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Additional Gallery Image URLs (one URL per line)
            </label>
            <textarea
              rows={3}
              value={form.gallery_image_urls}
              onChange={(e) => setForm({ ...form, gallery_image_urls: e.target.value })}
              placeholder="https://res.cloudinary.com/...&#10;https://res.cloudinary.com/..."
              className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.show_price}
                onChange={(e) => setForm({ ...form, show_price: e.target.checked })}
                className="rounded text-black focus:ring-black"
              />
              <span className="text-xs font-semibold text-gray-700">Display Price Publicly</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="rounded text-black focus:ring-black"
              />
              <span className="text-xs font-semibold text-gray-700">Feature on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="rounded text-black focus:ring-black"
              />
              <span className="text-xs font-semibold text-gray-700">Publish Immediately</span>
            </label>
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
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-[#FFD700] font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-zinc-800 transition-colors shadow"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
