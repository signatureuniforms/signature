import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildWhatsAppUrl } from '@/lib/constants'
import type { AboutSectionContent } from '@/types'

export const metadata: Metadata = {
  title: 'About Us | Signature Uniforms by Hari',
  description: 'Learn about Signature Uniforms by Hari — premier uniform manufacturer and wholesale supplier.',
}

export const revalidate = 60

export default async function AboutPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_key', 'home')
    .eq('section_key', 'about')
    .eq('is_published', true)
    .maybeSingle()

  const about: AboutSectionContent | null = data?.content
    ? (data.content as AboutSectionContent)
    : null

  const whatsappUrl = buildWhatsAppUrl('Hello, I would like to enquire about your uniform manufacturing services.')

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 md:px-8 lg:px-10 text-center border-b border-white/10">
        <div className="max-w-4xl mx-auto space-y-4">
          {about?.subheading && (
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FFD700] block">
              {about.subheading}
            </span>
          )}
          <h1
            className="text-3xl sm:text-5xl font-normal tracking-tight font-display text-white"
            style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
          >
            {about?.heading || 'About Us'}
          </h1>
          <div className="w-12 h-[2px] bg-[#FFD700] mx-auto mt-4" />
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-16 lg:py-24">
        {about && (about.description || about.image_url) ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className={about.image_url ? 'lg:col-span-6 space-y-6' : 'lg:col-span-8 lg:col-start-3 text-center space-y-6'}>
              {about.description && (
                <p className="text-white/80 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                  {about.description}
                </p>
              )}

              <div className={`pt-4 flex flex-wrap items-center gap-4 ${about.image_url ? '' : 'justify-center'}`}>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold text-sm rounded-2xl tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_4px_16px_rgba(255,215,0,0.3)] cursor-pointer"
                >
                  <span>Request Quotation</span>
                  <ArrowRight size={16} />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 text-white font-semibold text-sm rounded-2xl border border-white/60 hover:border-white tracking-wide transition-all duration-200 cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Enquiry</span>
                </a>
              </div>
            </div>

            {/* Right Image */}
            {about.image_url && (
              <div className="lg:col-span-6">
                <div
                  className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950"
                  style={{ aspectRatio: '4/3' }}
                >
                  <Image
                    src={about.image_url}
                    alt={about.heading || 'About Signature Uniforms'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center py-12 space-y-6">
            <p className="text-white/60 text-base">
              Details will be updated shortly by the administrator.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD700] text-black font-semibold text-sm rounded-xl hover:bg-[#E6C200] transition-colors"
              >
                <span>Contact Us</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
