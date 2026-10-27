import type { Metadata } from 'next'
import Link from 'next/link'
import { Grid3x3, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildWhatsAppUrl } from '@/lib/constants'
import { BulkQuoteButton } from '@/components/common/BulkQuotationDrawer'
import type { Category } from '@/types'

export const metadata: Metadata = {
  title: 'Uniform Categories & Collections | Signature Uniforms by Hari',
  description:
    'Explore our complete uniform collection: School Uniforms, College Uniforms, Corporate Workwear, Hospital & Nursing Apparel, and Industrial Uniforms.',
}

export const revalidate = 60

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categoryData } = await supabase
    .from('categories')
    .select('*, image:media_assets(*)')
    .eq('is_enabled', true)
    .order('position', { ascending: true })

  const categoryList: Category[] = categoryData || []

  const generalWaUrl = buildWhatsAppUrl(
    'Hello Hari, I would like to request a quotation for uniform manufacturing.'
  )

  return (
    <div style={{ backgroundImage: 'none' }} className="bg-[#0A0A0A] text-white min-h-screen no-bg-grid" data-page="categories-page">
      {/* ─── Header: Centered Content & Equal Width Buttons ──────────────────────── */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-10 w-full">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Centered Content */}
          <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest block mb-2">
            Our Manufacturing Range
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white text-center"
            style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
          >
            Uniform Segments &amp; Collections
          </h1>
          <p className="text-[#A3A3A3] text-xs sm:text-sm mt-3 leading-relaxed max-w-2xl text-center">
            From premier school shirts and pinafores to sterile medical scrubs and corporate blazers.
          </p>

          {/* Action Buttons: Centered & Same Width */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 w-full">
            <BulkQuoteButton
              className="btn-gold-sweep w-full sm:w-60 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] whitespace-nowrap rounded-full cursor-pointer text-center"
            >
              Request a Bulk Quotation
            </BulkQuoteButton>
            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-60 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-[0_4px_16px_rgba(37,211,102,0.3)] whitespace-nowrap rounded-full cursor-pointer text-center"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Categories Grid: Full Width with Taller Portrait Cards ───────────────────── */}
      <section className="w-full px-2 sm:px-6 md:px-8 lg:px-10 py-12 sm:py-16 pb-20 sm:pb-24">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categoryList.map((cat) => {
            // Category images are stored in joined image:media_assets(*) secure_url
            const imageUrl =
              cat.image?.secure_url ||
              (cat as any).image_url ||
              ''

            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group bg-[#171717] flex flex-col overflow-hidden rounded-xl transition-all duration-300 shadow-xl hover:shadow-[0_12px_40px_rgba(212,175,55,0.18)]"
              >
                {/* Clickable Portrait Image with Increased Height & Decreased Width */}
                <div className="aspect-[3/4] bg-neutral-900 relative block overflow-hidden w-full">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A] text-zinc-600">
                      <Grid3x3 className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Heading and Description Side */}
                <div className="p-5 sm:p-6 bg-[#171717] flex flex-col flex-1 justify-start">
                  <h2
                    className="text-lg sm:text-xl font-normal text-white group-hover:text-[#D4AF37] transition-colors leading-snug mb-2 uppercase tracking-wider"
                    style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
                  >
                    {cat.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A3A3A3] line-clamp-3 leading-relaxed font-light">
                    {cat.description ||
                      'Specialized uniform solutions manufactured with premium fabrics and industrial stitch durability.'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
