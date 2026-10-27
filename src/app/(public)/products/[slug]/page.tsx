import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, ShieldCheck, Factory, Truck, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '@/lib/constants'
import { BulkQuoteButton } from '@/components/common/BulkQuotationDrawer'
import type { Product } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description, specifications')
    .eq('slug', slug)
    .maybeSingle()

  if (!product) return { title: 'Product Not Found' }

  const ogImage = (product as any).specifications?.primary_image_url

  return {
    title: `${product.name} | Signature Uniforms by Hari`,
    description: product.short_description || `Manufacture and wholesale supply of ${product.name} by Signature Uniforms.`,
    openGraph: ogImage ? { images: [ogImage] } : undefined,
  }
}

export const revalidate = 60

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch product
  const { data: rawProduct } = await supabase
    .from('products')
    .select('*, category:categories(name, slug), subcategory:subcategories(name, slug), product_media(*, asset:media_assets(*))')
    .eq('slug', slug)
    .maybeSingle()

  if (!rawProduct) {
    notFound()
  }

  const primaryImg =
    (rawProduct as any).primary_image_url ||
    (rawProduct as any).specifications?.primary_image_url ||
    (rawProduct as any).product_media?.find((m: any) => m.is_primary)?.asset?.secure_url ||
    (rawProduct as any).product_media?.[0]?.asset?.secure_url ||
    null

  const product = {
    ...rawProduct,
    primary_image_url: primaryImg,
    description: (rawProduct as any).full_description || (rawProduct as any).description || '',
    fabric_composition: (rawProduct as any).specifications?.fabric_composition || (rawProduct as any).fabric_composition || '',
    care_instructions: (rawProduct as any).specifications?.care_instructions || (rawProduct as any).care_instructions || '',
  }

  const moq =
    (product as any).minimum_order_quantity ??
    (product as any).min_order_quantity ??
    null

  const waUrl = buildWhatsAppUrl(buildProductWhatsAppMessage(product.name, moq))

  const galleryImages: string[] = [
    product.primary_image_url,
    ...(Array.isArray(product.gallery_image_urls) ? product.gallery_image_urls : [])
  ].filter(Boolean) as string[]

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen pt-[var(--navbar-height)]">
      {/* Main Content */}
      <section className="w-full px-2 sm:px-6 md:px-8 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Images Left */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/3] bg-[#171717] border border-[#2A2A2A] rounded-xl overflow-hidden relative shadow-2xl">
              {product.primary_image_url ? (
                <img
                  src={product.primary_image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  <Package className="w-16 h-16" />
                </div>
              )}

            </div>

            {/* Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-[#171717] border border-[#2A2A2A] rounded-lg overflow-hidden cursor-pointer hover:border-[#D4AF37] transition-all"
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Manufacturer Trust Badges */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 text-center">
              <div className="p-3.5 bg-[#171717] border border-[#2A2A2A] rounded-xl">
                <ShieldCheck className="w-5 h-5 mx-auto text-[#D4AF37] mb-1.5" />
                <span className="text-[11px] font-semibold text-white block">Double Reinforced</span>
                <span className="text-[10px] text-[#A3A3A3]">Twin-needle seams</span>
              </div>
              <div className="p-3.5 bg-[#171717] border border-[#2A2A2A] rounded-xl">
                <Factory className="w-5 h-5 mx-auto text-[#D4AF37] mb-1.5" />
                <span className="text-[11px] font-semibold text-white block">Tirupur Mill Sourced</span>
                <span className="text-[10px] text-[#A3A3A3]">Colorfast & pre-shrunk</span>
              </div>
              <div className="p-3.5 bg-[#171717] border border-[#2A2A2A] rounded-xl">
                <Truck className="w-5 h-5 mx-auto text-[#D4AF37] mb-1.5" />
                <span className="text-[11px] font-semibold text-white block">Pan-India Dispatch</span>
                <span className="text-[10px] text-[#A3A3A3]">Doorstep delivery</span>
              </div>
            </div>
          </div>

          {/* Product Details Right */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {product.category && (
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
                  {product.category.name}
                </span>
              )}
              <h1
                className="text-2xl sm:text-4xl font-normal text-white leading-tight"
                style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
              >
                {product.name}
              </h1>
              <p className="text-xs font-mono text-[#A3A3A3] mt-1">Ref: {product.slug}</p>
            </div>

            {/* Wholesale Procurement Status */}
            <div className="p-4 bg-[#171717] border border-[#2A2A2A] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] block">
                  Wholesale Procurement
                </span>
                <div className="text-xl font-bold text-white mt-0.5">
                  {product.show_price && product.base_price ? (
                    <span>₹{product.base_price} <span className="text-xs font-normal text-[#A3A3A3]">/ piece</span></span>
                  ) : (
                    <span className="text-base text-white font-medium">Custom Institutional Quotation</span>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-xs font-semibold">
                Batch Manufacturing
              </span>
            </div>

            {/* Description */}
            <div className="space-y-3 text-sm text-[#A3A3A3] leading-relaxed font-light">
              {product.short_description && <p>{product.short_description}</p>}
              {product.description && (
                <div className="whitespace-pre-wrap text-[#A3A3A3] text-xs sm:text-sm">{product.description}</div>
              )}
            </div>

            {/* Available Sizes */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-white uppercase tracking-wider block mb-2">
                  Available Sizing Spectrum
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.available_sizes.map((sz: string) => (
                    <span
                      key={sz}
                      className="px-3 py-1 bg-[#171717] border border-[#2A2A2A] rounded-lg text-xs font-mono font-semibold text-white"
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
                <span className="text-xs font-semibold text-white uppercase tracking-wider block mb-2">
                  Standard School & Corporate Colorways
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.available_colors.map((color: string) => (
                    <span
                      key={color}
                      className="px-3 py-1 bg-[#171717] border border-[#2A2A2A] rounded-lg text-xs font-medium text-[#A3A3A3]"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specs Table */}
            <div className="bg-[#171717] border border-[#2A2A2A] rounded-xl overflow-hidden text-xs">
              <div className="bg-[#0A0A0A] border-b border-[#2A2A2A] p-3 font-bold text-white uppercase tracking-wider">
                Technical Specifications
              </div>
              <div className="divide-y divide-[#2A2A2A]">
                {product.fabric_composition && (
                  <div className="p-3 grid grid-cols-3">
                    <span className="text-[#A3A3A3] font-medium">Fabric Composition</span>
                    <span className="col-span-2 text-white font-semibold">{product.fabric_composition}</span>
                  </div>
                )}
                {moq ? (
                  <div className="p-3 grid grid-cols-3">
                    <span className="text-[#A3A3A3] font-medium">Min Order Quantity</span>
                    <span className="col-span-2 text-white font-semibold">{moq} pieces</span>
                  </div>
                ) : null}
                {product.care_instructions && (
                  <div className="p-3 grid grid-cols-3">
                    <span className="text-[#A3A3A3] font-medium">Care Standard</span>
                    <span className="col-span-2 text-[#A3A3A3]">{product.care_instructions}</span>
                  </div>
                )}
                <div className="p-3 grid grid-cols-3">
                  <span className="text-[#A3A3A3] font-medium">Customization</span>
                  <span className="col-span-2 text-[#A3A3A3]">
                    Computerized crest embroidery, screen printing, custom woven labels
                  </span>
                </div>
              </div>
            </div>

            {/* Conversion CTAs: WhatsApp + Request a Bulk Quotation (drawer trigger) */}
            <div className="space-y-3 pt-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm tracking-wide rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white text-white" />
                <span>Enquire via WhatsApp</span>
              </a>

              <BulkQuoteButton
                productName={product.name}
                category={product.category?.name || 'Uniform Manufacturing'}
                className="w-full inline-flex items-center justify-center gap-2 py-4 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-bold text-xs sm:text-sm tracking-widest uppercase rounded-full shadow-lg cursor-pointer transition-colors"
              >
                <span>Request a Bulk Quotation</span>
              </BulkQuoteButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
