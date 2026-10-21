'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import type { VideoBannerContent } from '@/types'

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

  // Strict rule: No mock data and no fallback data.
  // If no content or video exists in DB, do not render this section.
  if (!data || !data.video_url || data.video_url.trim().length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black text-white py-5 lg:py-10 h-[60vh] sm:h-[70vh] min-h-[480px] max-h-[750px]"
      aria-label={data.heading || 'Video Showcase'}
    >
      {/* Background Video (Only fetched from DB once on server, no mock/fallback) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          src={data.video_url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Dual gradients for contrast on bottom left */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Foreground Content - Placed on Left Side Bottom */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <Link
                href="/contact"
                className="group relative inline-flex flex-col items-start text-xs tracking-[0.25em] text-white uppercase transition-colors"
                id="video-banner-contact-cta"
              >
                <span className="pb-1 transition-opacity group-hover:opacity-85 font-medium">
                  CONTACT NOW
                </span>
                <span className="w-full h-[1.5px] bg-white transition-all duration-300 group-hover:scale-x-110 group-hover:bg-[#FFD700]" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
