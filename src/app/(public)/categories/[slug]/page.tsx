import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Package, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '@/lib/constants'
import type { Category, Product } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle()

  if (!category) return { title: 'Category Not Found' }

  return {
    title: `${category.name} | Signature Uniforms by Hari`,
    description: category.description || `Wholesale & bulk manufacturing of ${category.name} by Signature Uniforms.`,
  }
}

export const revalidate = 60

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch Category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!category) {
    notFound()
  }

  // Fetch Products in Category
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const productList: Product[] = products || []

  return (
    <div className="bg-white min-h-screen">
      {/* Category Header */}
      <section className="bg-black text-white py-16 px-4 sm:px-6 md:px-8 lg:px-10 w-full">
        <div className="w-full space-y-4">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
              {category.name}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm mt-3 leading-relaxed">
              {category.description || 'Precision crafted uniform apparel designed for long-lasting performance and maximum comfort.'}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Showing {productList.length} products
          </span>
          <Link
            href="/contact"
            className="text-xs font-semibold text-black hover:text-[#FFD700] transition-colors flex items-center gap-1"
          >
            <span>Request Custom Batch Design</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {productList.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No products currently listed in this category</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              We manufacture customized uniforms to your exact school or corporate specifications. Contact us directly to discuss patterns and swatches.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-black text-[#FFD700] text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Submit Specification
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
