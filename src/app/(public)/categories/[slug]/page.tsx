import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '@/lib/constants'
import type { Product } from '@/types'
import { BulkQuoteButton } from '@/components/common/BulkQuotationDrawer'

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
    .select('*, image:media_assets(*)')
    .eq('slug', slug)
    .maybeSingle()

  if (!category) {
    notFound()
  }

  const categoryImageUrl =
    category.image?.secure_url ||
    (category as any).image_url ||
    ''

  const categoryWhatsAppUrl = buildWhatsAppUrl(
    `Hello Hari, I would like to request a quotation for ${category.name}.`
  )

  // Fetch Products in Category
  const { data: rawProducts } = await supabase
    .from('products')
    .select('*, product_media(*, asset:media_assets(*))')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const productList: Product[] = (rawProducts || []).map((p: any) => ({
    ...p,
    primary_image_url:
      p.primary_image_url ||
      p.specifications?.primary_image_url ||
      p.product_media?.find((m: any) => m.is_primary)?.asset?.secure_url ||
      p.product_media?.[0]?.asset?.secure_url ||
      '',
  }))

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen">
      {/* Category Header */}
      <section className="relative bg-[#0A0A0A] text-white pt-32 sm:pt-36 pb-14 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-10 w-full overflow-hidden min-h-[300px] flex items-center">
        {/* Background Category Image with Vignette & Gradients */}
        {categoryImageUrl && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={categoryImageUrl}
              alt={category.name}
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Multi-layered dark gradients for readability and seamless navbar blending */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
          </div>
        )}

        <div className="relative z-10 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          {/* Left: Navigation, Title & Description */}
          {/* Left: Navigation, Title & Description */}
          <div className="flex-1 w-full space-y-4">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>All Categories</span>
            </Link>
            <div>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white"
                style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
              >
                {category.name}
              </h1>
              <p className="text-[#A3A3A3] text-xs sm:text-sm mt-3 leading-relaxed max-w-3xl">
                {category.description || 'Precision crafted uniform apparel designed for long-lasting performance and maximum comfort.'}
              </p>
            </div>
          </div>

          {/* Right Side End: Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <BulkQuoteButton
              category={category.name}
              className="btn-gold-sweep inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] whitespace-nowrap cursor-pointer"
            >
              Request a Bulk Quotation
            </BulkQuoteButton>
            <a
              href={categoryWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-[0_4px_16px_rgba(37,211,102,0.3)] whitespace-nowrap cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="w-full px-2 sm:px-6 md:px-8 lg:px-10 py-14 sm:py-16 pb-20 sm:pb-24">
        {/* Count Bar */}
        <div className="flex items-center justify-between mb-8 pb-4">
          <span className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">
            Showing {productList.length} {productList.length === 1 ? 'product' : 'products'}
          </span>
        </div>

        {productList.length === 0 ? (
          <div className="py-20 text-center text-[#A3A3A3]">
            <Package className="w-12 h-12 mx-auto text-[#A3A3A3]/40 mb-3" />
            <h3 className="text-base font-semibold text-white">No products currently listed in this category</h3>
            <p className="text-xs text-[#A3A3A3] mt-1 max-w-sm mx-auto">
              We manufacture customized uniforms to your exact school or corporate specifications. Contact us directly to discuss patterns and swatches.
            </p>
            <Link
              href="/contact"
              className="btn-gold-sweep mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] text-xs font-semibold rounded-none cursor-pointer"
            >
              <span>Submit Specification</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productList.map((product) => {
              const moq = (product as any).minimum_order_quantity ?? product.min_order_quantity ?? null
              const waUrl = buildWhatsAppUrl(buildProductWhatsAppMessage(product.name, moq))
              return (
                <div
                  key={product.id}
                  className="group bg-[#171717] rounded-xl transition-all duration-300 rounded-none flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)]"
                >
                  <div className="block">
                    <div className="aspect-[4/3] bg-neutral-900 relative overflow-hidden rounded-none">
                      {product.primary_image_url ? (
                        <img
                          src={product.primary_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-none"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 rounded-none">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Content Section with Charcoal Background */}
                    <div className="p-4 sm:p-5 pb-3 bg-[#171717]">
                      <h3 className="font-semibold text-white text-base group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#A3A3A3] mt-1.5 line-clamp-2 leading-relaxed font-light">
                        {product.short_description || product.fabric_composition || 'Premium durable stitch uniform.'}
                      </p>
                    </div>
                  </div>

                  {/* Two Buttons: Request a Quotation and WhatsApp */}
                  <div className="p-4 sm:p-5 pt-0 mt-auto bg-[#171717]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <BulkQuoteButton
                        category={category.name}
                        productName={product.name}
                        className="btn-gold-sweep inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#0A0A0A] hover:bg-[#D4AF37] text-white hover:text-[#0A0A0A] font-semibold text-xs tracking-wide transition-all duration-200 rounded-md text-center cursor-pointer whitespace-nowrap shadow-sm border border-[#2A2A2A]"
                      >
                        <span>Request a Quotation</span>
                      </BulkQuoteButton>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs tracking-wide transition-all duration-200 rounded-md text-center cursor-pointer whitespace-nowrap shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
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
