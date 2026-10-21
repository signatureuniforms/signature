'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import type { TrustedBrandsContent } from '@/types'

interface TrustedBrandsSectionProps {
  data: TrustedBrandsContent | null
}

export default function TrustedBrandsSection({ data }: TrustedBrandsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const shouldReduceMotion = useReducedMotion()

  // Strict rule: No mock data and no fallback data.
  // If no data exists or no logos have been uploaded, do not render this section.
  if (!data || !data.logos || data.logos.length === 0) {
    return null
  }

  // Smooth editorial easing curve
  const editorialEase = [0.22, 1, 0.36, 1] as const

  return (
    <section
      ref={sectionRef}
      className="py-5 lg:py-10 bg-black w-full overflow-hidden"
      aria-labelledby="trusted-brands-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hardcoded Heading with loading animation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : isInView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 24 }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : 0.7,
            ease: editorialEase,
          }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2
            id="trusted-brands-heading"
            className="text-lg sm:text-xl md:text-2xl font-serif tracking-[0.25em] text-white uppercase text-center"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            TRUSTED BY LEADING BRANDS
          </h2>
        </motion.div>

        {/* Brand Logos Row with staggered reveal loading animation */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-14 lg:gap-16 py-2">
          {data.logos.map((brand, idx) => (
            <motion.div
              key={brand.id || idx}
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1, y: 0, scale: 1 }
                  : isInView
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 24, scale: 0.92 }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 0.6,
                delay: shouldReduceMotion ? 0 : 0.15 + Math.min(idx * 0.08, 0.6),
                ease: editorialEase,
              }}
              className="flex items-center justify-center transition-transform duration-300 hover:scale-105"
            >
              <img
                src={brand.image_url}
                alt={brand.name || 'Trusted Brand'}
                className="h-8 sm:h-10 md:h-12 w-auto max-w-[140px] sm:max-w-[170px] object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>

        {/* Dynamic Bottom Content with delayed reveal animation */}
        {data.bottom_content && data.bottom_content.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.7,
              delay: shouldReduceMotion ? 0 : 0.2 + Math.min(data.logos.length * 0.08, 0.6) + 0.1,
              ease: editorialEase,
            }}
            className="mt-10 sm:mt-12 text-center max-w-3xl mx-auto"
          >
            {/* <p className="text-[11px] sm:text-xs text-white/50 leading-relaxed font-light">
              {data.bottom_content}
            </p> */}
          </motion.div>
        )}
      </div>
    </section>
  )
}
