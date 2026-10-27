'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import type { VideoBannerContent } from '@/types'
import { useBulkQuote } from '@/components/common/BulkQuotationDrawer'

interface VideoBannerSectionProps {
  data: VideoBannerContent | null
}

// Container orchestrates children to slide in one by one from left to right
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
}

// Content elements slide in from left to right (x: -60 -> 0)
const slideInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export default function VideoBannerSection({ data }: VideoBannerSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const { openDrawer } = useBulkQuote()

  // Strict rule: No mock data and no fallback data.
  // If no content or video exists in DB, do not render this section.
  if (!data || !data.video_url || data.video_url.trim().length === 0) {
    return null
  }

  // Strip aggressive lossy compression parameters (f_auto, q_auto)
  // so the video is delivered in 100% full original quality and bitrate
  let videoSrc = data.video_url
    .replace(/\/video\/upload\/[^/]*q_auto[^/]*\//, '/video/upload/')
    .replace(/\/video\/upload\/f_auto,q_auto\//, '/video/upload/')
    .replace(/\/video\/upload\/f_auto\//, '/video/upload/')

  if (videoSrc.includes('cloudinary.com') && videoSrc.endsWith('.mov')) {
    videoSrc = videoSrc.replace(/\.mov$/i, '.mp4')
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#0A0A0A] text-white py-5 lg:py-10 h-[60vh] sm:h-[60vh] min-h-[480px] max-h-[750px]"
      aria-label={data.heading || 'Video Showcase'}
    >
      {/* Background Video (Buffered once and looped from browser cache) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Foreground Content - Placed on Left Side Bottom */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6 md:px-8 lg:px-10 pointer-events-none">
        <div className="w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            className="max-w-2xl space-y-3 sm:space-y-2 pointer-events-auto text-left"
          >
            {/* Main Heading (Slides in from left first) */}
            {data.heading && (
              <motion.h2
                variants={slideInLeftVariants}
                className="text-2xl sm:text-3xl md:text-4xl font-normal font-serif tracking-[0.25em] text-white uppercase drop-shadow-md leading-tight"
                style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
              >
                {data.heading}
              </motion.h2>
            )}

            {/* Description (Slides in from left second) */}
            {data.description && (
              <motion.p
                variants={slideInLeftVariants}
                className="text-white/90 text-xs sm:text-sm font-sans font-light leading-relaxed max-w-xl drop-shadow"
              >
                {data.description}
              </motion.p>
            )}

            {/* Contact CTA (Slides in from left third) */}
            <motion.div
              variants={slideInLeftVariants}
              className="pt-2"
            >
              <button
                type="button"
                onClick={() => openDrawer({ category: data.heading || 'Custom Uniform Embroidery' })}
                className="group relative inline-flex flex-col items-start text-xs tracking-[0.25em] text-white uppercase transition-colors cursor-pointer"
                id="video-banner-contact-cta"
              >
                <span className="pb-1 transition-opacity group-hover:text-[#D4AF37] font-medium">
                  CONTACT NOW
                </span>
                <span className="w-full h-[1.5px] bg-white transition-all duration-300 group-hover:scale-x-110 group-hover:bg-[#D4AF37]" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
