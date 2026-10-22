'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Headset,
  MessageCircle,
} from 'lucide-react'
import type { HeroVideo } from '@/types'
import { buildWhatsAppUrl } from '@/lib/constants'
import { BulkQuoteButton } from '@/components/common/BulkQuotationDrawer'

interface HeroSectionProps {
  hero: HeroVideo | null
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const rawDesktop =
    hero?.desktop_asset?.secure_url ||
    hero?.desktop_video_url ||
    ''

  const rawMobile =
    hero?.mobile_asset?.secure_url ||
    hero?.mobile_video_url ||
    ''

  const cleanVideoUrl = (url: string) => {
    if (!url) return ''
    // Strip aggressive Cloudinary lossy compression parameters (f_auto, q_auto)
    // so the video is delivered in 100% full original quality and bitrate
    let cleaned = url
      .replace(/\/video\/upload\/[^/]*q_auto[^/]*\//, '/video/upload/')
      .replace(/\/video\/upload\/f_auto,q_auto\//, '/video/upload/')
      .replace(/\/video\/upload\/f_auto\//, '/video/upload/')

    // Ensure universal cross-browser playback if uploaded as .mov
    if (cleaned.includes('cloudinary.com') && cleaned.endsWith('.mov')) {
      cleaned = cleaned.replace(/\.mov$/i, '.mp4')
    }
    return cleaned
  }

  const desktopVideoUrl = cleanVideoUrl(rawDesktop)
  const mobileVideoUrl = cleanVideoUrl(rawMobile)

  const title = hero?.heading || hero?.title || ''
  const subtitle = hero?.subheading || hero?.subtitle || ''
  const ctaText = hero?.primary_cta_label || hero?.primary_cta_text || ''
  const ctaLink = hero?.primary_cta_href || hero?.primary_cta_link || ''

  const waUrl = buildWhatsAppUrl('Hello, I would like to enquire about bulk uniform pricing.')

  return (
    <section
      id="hero-section"
      className="relative w-full overflow-hidden bg-black text-white select-none h-[78vh] sm:h-[85vh] lg:h-screen min-h-[520px] sm:min-h-[580px] lg:min-h-[660px]"
      aria-label="Hero Video Showcase"
    >
      {/* ── Full-Screen Video Background ─────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {desktopVideoUrl ? (
          <video
            key={desktopVideoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            {mobileVideoUrl && (
              <source src={mobileVideoUrl} media="(max-width: 768px)" type="video/mp4" />
            )}
            <source src={desktopVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#0c0c0e] via-[#050507] to-black flex items-center justify-center">
            <div className="w-[500px] h-[500px] bg-[#FFD700]/[0.04] rounded-full blur-[140px] pointer-events-none" />
          </div>
        )}

        {/* Dark shade overlay across entire video */}
        <div
          className="absolute inset-0 bg-black/10 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* ── Hero Content (Bottom Center) ─────────────────────────────────── */}
      {(title || subtitle || (ctaText && ctaLink)) && (
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-end p-2 sm:px-12 sm:pb-16 md:pb-20 sm:pt-0 text-center pointer-events-none">
          <motion.div
            id="hero-content-block"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto flex flex-col items-center pointer-events-auto mb-2"
          >
            {/* Main Headline */}
            {title && (
              <h1
                className="text-3xl sm:text-4xl  font-normal leading-[1.2] md:leading-[56px] font-serif tracking-[0.25em] text-white uppercase mb-3 text-center drop-shadow-md"
                style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
              >
                {title}
              </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-white/90 font-sans text-xs sm:text-sm tracking-[0.22em] uppercase font-light mb-6">
                {subtitle}
              </p>
            )}

            {/* CTA Button with Underline */}
            {ctaText && ctaLink && (
              <Link
                href={ctaLink}
                className="group relative inline-flex flex-col items-center text-xs tracking-[0.25em] text-white uppercase transition-colors"
                id="hero-discover-more-cta"
              >
                <span className="pb-1 transition-opacity group-hover:opacity-85 font-medium">
                  {ctaText}
                </span>
                <span className="w-full h-[1.5px] bg-white transition-all duration-300 group-hover:scale-x-110 group-hover:bg-[#FFD700]" />
              </Link>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Fixed Floating WhatsApp Button ───────────────────────────────── */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        id="hero-floating-whatsapp"
        className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200 border border-black/10"
      >
        <MessageCircle size={26} className="fill-[#25D366] text-[#25D366]" />
      </a>

      {/* ── Sticky Right Edge: "Request a call" Tab (Hidden on mobile) ──── */}
      <div className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <BulkQuoteButton
          className="btn-gold-sweep flex items-center gap-2 px-2.5 py-4 bg-white text-black rounded-r-sm shadow-2xl transition-all duration-200 cursor-pointer group border border-r-0 border-white/30"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          aria-label="Request a Call"
          id="hero-sticky-request-call"
        >
          <Headset size={16} className="text-black rotate-90 shrink-0" />
          <span className="text-[12px] font-medium tracking-wide text-black whitespace-nowrap">
            Request a call
          </span>
        </BulkQuoteButton>
      </div>
    </section>
  )
}
