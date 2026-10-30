'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Headset } from 'lucide-react'
import type { HeroVideo } from '@/types'
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

  return (
    <section
      id="hero-section"
      className="relative w-full overflow-hidden bg-[#0A0A0A] text-white select-none h-[78vh] sm:h-[85vh] lg:h-screen min-h-[520px] sm:min-h-[580px] lg:min-h-[660px]"
      aria-label="Hero Video Showcase"
    >
      {/* ── Full-Screen Video Background ─────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Desktop Video (strictly for md/lg desktop displays in full original resolution) */}
        {desktopVideoUrl && (
          <video
            key={`desktop-${desktopVideoUrl}`}
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
            src={desktopVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        )}

        {/* Mobile Video (for mobile screens, falls back to desktop video if none specified) */}
        {(mobileVideoUrl || desktopVideoUrl) && (
          <video
            key={`mobile-${mobileVideoUrl || desktopVideoUrl}`}
            className="block md:hidden absolute inset-0 w-full h-full object-cover"
            src={mobileVideoUrl || desktopVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        )}

        {!desktopVideoUrl && !mobileVideoUrl && (
          <div className="absolute inset-0 w-full h-full bg-[#0A0A0A] flex items-center justify-center">
            <div className="w-[500px] h-[500px] bg-[#D4AF37]/[0.05] rounded-full blur-[140px] pointer-events-none" />
          </div>
        )}
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
                className="text-2xl sm:text-4xl leading-[1.2] md:leading-[56px] font-serif font-bold tracking-[0.25em] text-[#D4AF37] uppercase mb-3 text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
                style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
              >
                {title}
              </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-white/95 font-sans text-xs sm:text-sm tracking-[0.22em] uppercase font-light mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                {subtitle}
              </p>
            )}

            {/* CTA Button with Underline */}
            {ctaText && ctaLink && (
              <Link
                href={ctaLink}
                className="group relative inline-flex flex-col items-center text-xs tracking-[0.25em] text-white uppercase transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                id="hero-discover-more-cta"
              >
                <span className="pb-1 transition-opacity group-hover:text-[#D4AF37] font-medium">
                  {ctaText} →
                </span>
              </Link>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Sticky Right Edge: "Request a call" Tab (Hidden on mobile) ──── */}
      <div className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <BulkQuoteButton
          className="flex items-center gap-2 px-2.5 py-4 bg-white hover:bg-neutral-100 text-black rounded-l-md shadow-2xl transition-all duration-200 cursor-pointer group border border-r-0 border-neutral-200"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          aria-label="Request a Call"
          id="hero-sticky-request-call"
        >
          <Headset size={16} className="text-black rotate-90 shrink-0 font-bold" />
          <span className="text-[12px] font-bold tracking-wider text-black uppercase whitespace-nowrap">
            Request a call
          </span>
        </BulkQuoteButton>
      </div>
    </section>
  )
}
