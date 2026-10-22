import type { Metadata } from 'next'
import Link from 'next/link'
import { Grid3x3, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildWhatsAppUrl } from '@/lib/constants'
import HomeContactSection from '@/components/home/HomeContactSection'
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

  const [categoriesRes, settingsRes] = await Promise.allSettled([
    // Categories with joined media asset image
    supabase
      .from('categories')
      .select('*, image:media_assets(*)')
      .eq('is_enabled', true)
      .order('position', { ascending: true }),

    // Contact info for bottom HomeContactSection
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['phone', 'email', 'address', 'whatsapp_number', 'city', 'state', 'pincode', 'website']),
  ])

  const categoryList: Category[] =
    categoriesRes.status === 'fulfilled' && categoriesRes.value.data
      ? categoriesRes.value.data
      : []

  const contactInfo: Record<string, string> = {}
  if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
    settingsRes.value.data.forEach((s: { key: string; value: string | null }) => {
      if (s.value) contactInfo[s.key] = s.value
    })
  }

  const generalWaUrl = buildWhatsAppUrl(
    'Hello Hari, I would like to request a quotation for uniform manufacturing.'
  )

  return (
    <div className="bg-black text-white min-h-screen">
      {/* ─── Header: Content Left, Actions Right ────────────────────────────── */}
      <section className="pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-10 w-full">
        <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          {/* Left Side Content */}
          <div className="flex-1 w-full space-y-3">
            <span className="text-[#FFD700] font-semibold text-xs uppercase tracking-widest block">
              Our Manufacturing Range
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white"
              style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
            >
              Uniform Segments &amp; Collections
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm mt-3 leading-relaxed">
              From premier school shirts and pinafores to sterile medical scrubs and corporate blazers.
            </p>
          </div>

          {/* Right Side Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <BulkQuoteButton
              className="btn-gold-sweep inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-[0_4px_16px_rgba(255,215,0,0.3)] whitespace-nowrap rounded-none cursor-pointer"
            >
              Request a Bulk Quotation
            </BulkQuoteButton>
            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-[0_4px_16px_rgba(37,211,102,0.3)] whitespace-nowrap rounded-none cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Categories Grid: Full Width with Taller Portrait Cards ───────────────────── */}
      <section className="w-full px-2 sm:px-6 md:px-8 lg:px-10 py-12 sm:py-16">
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
                className="group bg-white flex flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(255,215,0,0.18)]"
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
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                      <Grid3x3 className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Heading and Description Side: Clean White Background */}
                <div className="p-5 sm:p-6 bg-white flex flex-col flex-1 justify-start">
                  <h2
                    className="text-lg sm:text-xl font-normal text-black group-hover:text-[#C59B27] transition-colors leading-snug mb-2 uppercase tracking-wider"
                    style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
                  >
                    {cat.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed font-light">
                    {cat.description ||
                      'Specialized uniform solutions manufactured with premium fabrics and industrial stitch durability.'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ─── Bottom Contact Section Reused from Homepage ───────────────────── */}
      <HomeContactSection contactInfo={contactInfo} />
    </div>
  )
}
