'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
  Layers,
  Scissors,
  ShieldCheck,
  Truck,
  Award,
  Sparkles,
  CheckCircle,
  Clock,
  Shirt,
  LucideIcon,
  Check,
} from 'lucide-react'
import type { CraftsmanshipContent } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Scissors,
  ShieldCheck,
  Truck,
  Award,
  Sparkles,
  CheckCircle,
  Clock,
  Shirt,
}

// Helper to ensure Cloudinary images render with high fidelity and crisp detail
function getHighQualityImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
    if (trimmed.includes('/upload/f_auto') || trimmed.includes('/upload/q_')) {
      return trimmed
    }
    return trimmed.replace('/upload/', '/upload/f_auto,q_auto:best,e_sharpen:40,dpr_2.0/')
  }

  return trimmed
}

interface CraftsmanshipSectionProps {
  data: CraftsmanshipContent | null
}

export default function CraftsmanshipSection({ data }: CraftsmanshipSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()

  // Strict rule: No mock data and no fallback data.
  // If no data exists or no features have been created in the DB, do not render this section.
  if (!data || !data.features || data.features.length === 0) {
    return null
  }

  const features = data.features
  const editorialEase = [0.22, 1, 0.36, 1] as const

  const mainImageUrl = getHighQualityImageUrl(data.main_image_url)
  const insetImage1Url = getHighQualityImageUrl(data.inset_image_1_url)
  const insetImage2Url = getHighQualityImageUrl(data.inset_image_2_url)
  const hasInsetImage1 = Boolean(insetImage1Url)
  const hasInsetImage2 = Boolean(insetImage2Url)
  const hasAnyInset = hasInsetImage1 || hasInsetImage2

  const renderIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Award
    return <IconComponent className="w-5 h-5 text-[#D4AF37] transition-transform duration-300 group-hover:scale-110" strokeWidth={1.8} />
  }

  return (
    <section
      ref={sectionRef}
      style={{ backgroundImage: 'none' }}
      className="relative py-14 lg:py-24 bg-[#0A0A0A] text-white w-full overflow-hidden no-bg-grid"
      aria-labelledby="craftsmanship-heading"
    >
      {/* Background Decorative Gold Ambient Glows */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-gradient-to-r from-[#D4AF37]/10 via-[#E5C158]/5 to-[#D4AF37]/10 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -30 }
          }
          transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: editorialEase }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          {/* Eyebrow */}
          {data.eyebrow && (
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-3 font-sans">
              {data.eyebrow}
            </span>
          )}

          {/* Main Heading */}
          <h2
            id="craftsmanship-heading"
            className="text-lg sm:text-xl md:text-2xl font-normal text-white uppercase leading-tight mb-4 font-serif tracking-[0.25em]"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            {data.title || data.heading}
          </h2>

          {/* Gold Accent Divider */}
          <div className="w-12 h-[1.5px] bg-[#D4AF37] mx-auto mb-5" />

          {/* Description */}
          {data.description && (
            <p className="text-[#A3A3A3] text-xs sm:text-sm leading-relaxed whitespace-pre-line max-w-2xl mx-auto">
              {data.description}
            </p>
          )}
        </motion.div>

        {/* BENTO GRID SHOWCASE */}
        <div className="space-y-5 sm:space-y-6">
          {/* TOP ROW: Visual Mosaic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            {/* Primary Visual Hero (Factory / Workshop) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : isInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 35 }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 0.9,
                delay: shouldReduceMotion ? 0 : 0.15,
                ease: editorialEase,
              }}
              className={`group relative rounded-2xl overflow-hidden bg-[#121212] shadow-2xl ${
                hasAnyInset ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'
              } min-h-[280px] sm:min-h-[380px] lg:min-h-[440px] flex flex-col justify-end`}
            >
              {mainImageUrl ? (
                <img
                  src={mainImageUrl}
                  alt={data.title || data.heading || 'Craftsmanship Showcase'}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
                  <Sparkles className="w-12 h-12 opacity-30 text-[#D4AF37]" />
                </div>
              )}

              {/* Cinematic Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/10 pointer-events-none" />

              {/* Bottom Floating Glass Badge */}
              <div className="relative z-10 p-5 sm:p-7 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-medium tracking-wider uppercase text-[#E5C158]">
                    Master Tailoring & Manufacturing
                  </span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#A3A3A3] font-mono tracking-wide">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Industrial Standard Facility</span>
                </div>
              </div>
            </motion.div>

            {/* Inset Images Column */}
            {hasAnyInset && (
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 sm:gap-6">
                {/* Inset 1: Fabric Selection */}
                {hasInsetImage1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1, y: 0 }
                        : isInView
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 35 }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.9,
                      delay: shouldReduceMotion ? 0 : 0.25,
                      ease: editorialEase,
                    }}
                    className={`group relative rounded-2xl overflow-hidden bg-[#121212] shadow-xl ${
                      hasInsetImage2 ? 'flex-1 min-h-[190px] lg:min-h-[208px]' : 'w-full min-h-[280px] lg:min-h-[440px]'
                    } flex flex-col justify-end`}
                  >
                    <img
                      src={insetImage1Url}
                      alt="Fabric selection"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                    <div className="relative z-10 p-4 sm:p-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white shadow-md">
                        <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-[11px] font-medium tracking-wide uppercase text-[#E5C158]">
                          Premium Fabric Selection
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Inset 2: Uniform Collection */}
                {hasInsetImage2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1, y: 0 }
                        : isInView
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 35 }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.9,
                      delay: shouldReduceMotion ? 0 : 0.35,
                      ease: editorialEase,
                    }}
                    className={`group relative rounded-2xl overflow-hidden bg-[#121212] shadow-xl ${
                      hasInsetImage1 ? 'flex-1 min-h-[190px] lg:min-h-[208px]' : 'w-full min-h-[280px] lg:min-h-[440px]'
                    } flex flex-col justify-end`}
                  >
                    <img
                      src={insetImage2Url}
                      alt="Finished uniforms"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                    <div className="relative z-10 p-4 sm:p-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white shadow-md">
                        <Shirt className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-[11px] font-medium tracking-wide uppercase text-[#E5C158]">
                          Finishing & Presentation
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM ROW: Integrated Luxury Bento Feature Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {features.map((feat, idx) => {
              const numberLabel = String(idx + 1).padStart(2, '0')

              return (
                <motion.div
                  key={feat.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1, y: 0 }
                      : isInView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 30 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.8,
                    delay: shouldReduceMotion ? 0 : 0.25 + idx * 0.1,
                    ease: editorialEase,
                  }}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#141414] to-[#0D0D0D] p-5 sm:p-6 transition-all duration-400 overflow-hidden shadow-lg hover:shadow-[0_12px_30px_rgba(212,175,55,0.08)] flex flex-col justify-between"
                >
                  {/* Subtle top-right ambient gold hover glow */}
                  <div
                    className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 bg-[#D4AF37]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    aria-hidden="true"
                  />

                  <div>
                    {/* Card Top: Icon + Number Index */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#121212] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.06)]">
                        {renderIcon(feat.icon_name)}
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#D4AF37]/50 group-hover:text-[#D4AF37] transition-colors duration-300">
                        {numberLabel}
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-white mb-2.5 font-sans group-hover:text-[#F3E5AB] transition-colors duration-300">
                      {feat.title}
                    </h3>

                    {/* Card Description */}
                    <p className="text-[11px] sm:text-xs text-[#8E8E8E] group-hover:text-[#A3A3A3] font-normal leading-relaxed transition-colors duration-300">
                      {feat.description}
                    </p>
                  </div>

                  {/* Bottom Golden Hairline Accent on Hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
                    aria-hidden="true"
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

