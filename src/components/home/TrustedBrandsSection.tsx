'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import type { TrustedBrandsContent } from '@/types'

interface TrustedBrandsSectionProps {
  data: TrustedBrandsContent | null
}

export default function TrustedBrandsSection({ data }: TrustedBrandsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  // Trigger animation EVERY TIME user scrolls to this section (once: false)
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 })
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
      className="py-12 sm:py-16 lg:py-20 bg-black w-full overflow-hidden"
      aria-labelledby="trusted-brands-heading"
    >
      <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10">
        {/* Section Heading with animation that triggers every time */}
        <motion.div
          initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : isInView
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: 28, filter: 'blur(6px)' }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : 0.8,
            ease: editorialEase,
          }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#FFD700]/80 block mb-2 font-medium">
            Partners & Fabric Mills
          </span>
          <h2
            id="trusted-brands-heading"
            className="text-lg sm:text-2xl md:text-3xl font-serif tracking-[0.24em] text-white uppercase text-center"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            TRUSTED BY LEADING BRANDS
          </h2>
          <div className=" mt-4" />
        </motion.div>

        {/* Brand Logos Row with staggered reveal every time in view */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 py-4 max-w-6xl mx-auto">
          {data.logos.map((brand, idx) => (
            <motion.div
              key={brand.id || idx}
              initial={{ opacity: 0, y: 32, scale: 0.88 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1, y: 0, scale: 1 }
                  : isInView
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 32, scale: 0.88 }
              }
              whileHover={{
                scale: 1.1,
                y: -4,
                transition: { duration: 0.25, ease: 'easeOut' },
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.65,
                delay: shouldReduceMotion ? 0 : 0.1 + idx * 0.08,
                ease: editorialEase,
              }}
              className="flex items-center justify-center p-3 rounded-none transition-all duration-300 group cursor-default"
            >
              <img
                src={brand.image_url}
                alt={brand.name || 'Trusted Brand'}
                className="h-9 sm:h-11 md:h-12 lg:h-14 w-auto max-w-[150px] sm:max-w-[180px] object-contain opacity-75 group-hover:opacity-100 transition-all duration-300 filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)] group-hover:drop-shadow-[0_4px_16px_rgba(255,215,0,0.15)]"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>

        {/* Dynamic Bottom Disclaimer with smooth fade-in */}
        {data.bottom_content && data.bottom_content.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : isInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.75,
              delay: shouldReduceMotion ? 0 : 0.2 + data.logos.length * 0.08,
              ease: editorialEase,
            }}
            className="mt-12 sm:mt-16 text-center max-w-3xl mx-auto"
          >
            <p className="text-[11px] sm:text-xs text-white/45 leading-relaxed font-light">
              {data.bottom_content}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
