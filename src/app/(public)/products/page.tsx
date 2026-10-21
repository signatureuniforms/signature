import type { Metadata } from 'next'
import Link from 'next/link'
import { Package, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '@/lib/constants'
import type { Product, Category } from '@/types'

export const metadata: Metadata = {
  title: 'Uniform Catalogue | Signature Uniforms by Hari',
  description: 'Browse our complete catalogue of school, college, corporate, and healthcare uniforms. In-house manufacturing, custom crest embroidery, and bulk pricing.',
}

export const revalidate = 60

export default async function ProductsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: selectedCategorySlug } = await searchParams
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_enabled', true)
    .order('position', { ascending: true })

  // Build product query
  let query = supabase.from('products').select('*, category:categories(name, slug)').eq('is_published', true).order('created_at', { ascending: false })

  if (selectedCategorySlug && selectedCategorySlug !== 'all') {
    const selectedCat = categories?.find(c => c.slug === selectedCategorySlug)
    if (selectedCat) {
      query = query.eq('category_id', selectedCat.id)
    }
  }

  const { data: products } = await query
  const productList: Product[] = products || []
  const categoryList: Category[] = categories || []

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-black text-white pt-28 pb-16 px-6 sm:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-[#FFD700] font-semibold text-xs uppercase tracking-widest block">
            Direct Manufacturer Catalogue
          </span>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
            Uniform Catalogue & Wholesale Specifications
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
            Explore ready-made standards and bespoke uniform lines crafted for schools, universities, and healthcare facilities.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-12 space-y-8">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              !selectedCategorySlug || selectedCategorySlug === 'all'
                ? 'bg-black text-[#FFD700]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Uniforms
          </Link>
          {categoryList.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategorySlug === cat.slug
                  ? 'bg-black text-[#FFD700]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        {productList.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No products matching your selection</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              We fabricate bespoke uniform batches from 50 pcs to 50,000 pcs to institutional requirements.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-black text-[#FFD700] text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Request Custom Batch
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productList.map((product) => {
              const waUrl = buildWhatsAppUrl(buildProductWhatsAppMessage(product.name, product.min_order_quantity))
              return (
                <div
                  key={product.id}
                  className="group border border-gray-200 rounded-xl overflow-hidden hover:border-black transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      {product.primary_image_url ? (
                        <img
                          src={product.primary_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                      {product.min_order_quantity && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/80 text-white backdrop-blur-sm">
                          MOQ: {product.min_order_quantity} pcs
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        {(product as any).category?.name || 'Uniform'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#FFD700] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {product.short_description || product.fabric_composition || 'Premium durable stitch uniform.'}
                      </p>
                      <div className="mt-3 flex items-baseline justify-between">
                        {product.show_price && product.base_price ? (
                          <span className="font-bold text-sm text-gray-900">₹{product.base_price}</span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium italic">Wholesale Pricing on Request</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 pt-0">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-[#25D366]/10 hover:bg-[#25D366] text-emerald-800 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Enquire on WhatsApp</span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
