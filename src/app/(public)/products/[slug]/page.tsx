import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, ShieldCheck, Factory, Truck, Check, Package, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildProductWhatsAppMessage, buildWhatsAppUrl, BRAND } from '@/lib/constants'
import type { Product } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description, primary_image_url')
    .eq('slug', slug)
    .maybeSingle()

  if (!product) return { title: 'Product Not Found' }

  return {
    title: `${product.name} | Signature Uniforms by Hari`,
    description: product.short_description || `Manufacture and wholesale supply of ${product.name} by Signature Uniforms.`,
    openGraph: product.primary_image_url ? { images: [product.primary_image_url] } : undefined,
  }
}

export const revalidate = 60

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('slug', slug)
    .maybeSingle()

  if (!product) {
    notFound()
  }

  // Fetch related products in same category
  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .eq('is_published', true)
    .limit(4)

  const waUrl = buildWhatsAppUrl(buildProductWhatsAppMessage(product.name, product.min_order_quantity))
  const galleryImages: string[] = [
    product.primary_image_url,
    ...(Array.isArray(product.gallery_image_urls) ? product.gallery_image_urls : [])
  ].filter(Boolean) as string[]

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100 bg-zinc-50 py-3.5 px-4 sm:px-6 md:px-8 lg:px-10 w-full">
        <div className="w-full flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-black">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Images Left */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
              {product.primary_image_url ? (
                <img
                  src={product.primary_image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package className="w-16 h-16" />
                </div>
              )}
              {product.min_order_quantity && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-black text-[#FFD700] shadow">
                  MOQ: {product.min_order_quantity} Units
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:border-black transition-colors"
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Manufacturer Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center">
              <div className="p-3 bg-zinc-50 rounded-xl">
                <ShieldCheck className="w-5 h-5 mx-auto text-[#FFD700] mb-1.5" />
                <span className="text-[11px] font-semibold text-gray-900 block">Double Reinforced</span>
                <span className="text-[10px] text-gray-500">Twin-needle seams</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl">
                <Factory className="w-5 h-5 mx-auto text-[#FFD700] mb-1.5" />
                <span className="text-[11px] font-semibold text-gray-900 block">Tirupur Mill Sourced</span>
                <span className="text-[10px] text-gray-500">Colorfast & pre-shrunk</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl">
                <Truck className="w-5 h-5 mx-auto text-[#FFD700] mb-1.5" />
                <span className="text-[11px] font-semibold text-gray-900 block">Pan-India Dispatch</span>
                <span className="text-[10px] text-gray-500">Doorstep delivery</span>
              </div>
            </div>
          </div>

          {/* Product Details Right */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {product.category && (
                <span className="text-xs font-bold text-[#FFD700] uppercase tracking-wider block mb-1">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl font-normal text-gray-900" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
                {product.name}
              </h1>
              <p className="text-xs font-mono text-gray-400 mt-1">Ref: {product.slug}</p>
            </div>

            {/* Price / Quote Status */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
                  Wholesale Procurement
                </span>
                <div className="text-xl font-bold text-gray-900 mt-0.5">
                  {product.show_price && product.base_price ? (
                    <span>₹{product.base_price} <span className="text-xs font-normal text-gray-500">/ piece</span></span>
                  ) : (
                    <span className="text-base text-gray-900">Custom Institutional Quotation</span>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold">
                Batch Manufacturing
              </span>
            </div>

            {/* Description */}
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>{product.short_description}</p>
              {product.description && (
                <div className="whitespace-pre-wrap">{product.description}</div>
              )}
            </div>

            {/* Available Sizes */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div>
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block mb-2">
                  Available Sizing Spectrum
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.available_sizes.map((sz: string) => (
                    <span
                      key={sz}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-mono font-semibold text-gray-800"
                    >
                      {sz}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available Colors */}
            {product.available_colors && product.available_colors.length > 0 && (
              <div>
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block mb-2">
                  Standard School & Corporate Colorways
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.available_colors.map((color: string) => (
                    <span
                      key={color}
                      className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-gray-800 border border-gray-200"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specs Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-gray-50 p-3 font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200">
                Technical Specifications
              </div>
              <div className="divide-y divide-gray-100">
                <div className="p-3 grid grid-cols-3">
                  <span className="text-gray-500 font-medium">Fabric Composition</span>
                  <span className="col-span-2 text-gray-900 font-semibold">{product.fabric_composition || '65/35 Polycotton Blend'}</span>
                </div>
                <div className="p-3 grid grid-cols-3">
                  <span className="text-gray-500 font-medium">Min Order Quantity</span>
                  <span className="col-span-2 text-gray-900 font-semibold">{product.min_order_quantity || 50} pieces</span>
                </div>
                {product.care_instructions && (
                  <div className="p-3 grid grid-cols-3">
                    <span className="text-gray-500 font-medium">Care Standard</span>
                    <span className="col-span-2 text-gray-900">{product.care_instructions}</span>
                  </div>
                )}
                <div className="p-3 grid grid-cols-3">
                  <span className="text-gray-500 font-medium">Customization</span>
                  <span className="col-span-2 text-gray-900">Computerized crest embroidery, screen printing, custom woven labels</span>
                </div>
              </div>
            </div>

            {/* Conversion CTAs */}
            <div className="space-y-3 pt-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm tracking-wide rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enquire via WhatsApp for {product.name}</span>
              </a>

              <Link
                href={`/contact?product=${encodeURIComponent(product.name)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-black hover:bg-zinc-800 text-[#FFD700] font-semibold text-xs tracking-wider uppercase rounded-xl transition-all"
              >
                <span>Request Institutional Quote & Fabric Swatches</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
