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
  const midPoint = Math.ceil(features.length / 2)
  const leftFeatures = features.slice(0, midPoint)
  const rightFeatures = features.slice(midPoint)

  const editorialEase = [0.22, 1, 0.36, 1] as const

  const renderIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Award
    return <IconComponent className="w-6 h-6 text-[#FFD700]" strokeWidth={1.75} />
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-5 lg:pt-10 lg:pb-20 bg-black text-white w-full overflow-hidden"
      aria-labelledby="craftsmanship-heading"
    >
      {/* Background Decorative Gold Ribbon Glows */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/10 rounded-full blur-[100px] opacity-70" />

        {/* Ambient subtle golden curve waves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 800"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M-100 450 C 300 250, 700 650, 1540 350"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M-100 520 C 350 320, 650 720, 1540 420"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE066" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#B38600" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Heading comes down from top into place */}
        <motion.div
          initial={{ opacity: 0, y: -45 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : isInView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: -45 }
          }
          transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: editorialEase }}
          className="text-center max-w-4xl mx-auto mb-14 lg:mb-10"
        >
          {/* Subheading / Eyebrow */}
          {data.eyebrow && (
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FFD700] block mb-3 font-sans">
              {data.eyebrow}
            </span>
          )}

          {/* Main Heading: Matches About Section font style, family & size */}
          <h2
            id="craftsmanship-heading"
            className="text-lg sm:text-xl md:text-2xl font-normal text-white uppercase leading-tight mb-5 font-serif tracking-[0.25em]"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            {data.title || data.heading}
          </h2>

          {/* Description */}
          {data.description && (
            <p className="text-white/75 text-xs sm:text-sm leading-relaxed whitespace-pre-line max-w-2xl mx-auto">
              {data.description}
            </p>
          )}
        </motion.div>

        {/* 3-Column Content Layout (Full Width) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 items-center">
          {/* LEFT COLUMN: Feature Cards (Come from left side) */}
          <div className="lg:col-span-3 space-y-6 flex flex-col justify-center">
            {leftFeatures.map((feat, idx) => (
              <motion.div
                key={feat.id || idx}
                initial={{ opacity: 0, x: -80 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, x: 0 }
                    : isInView
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -80 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 1.15,
                  delay: shouldReduceMotion ? 0 : 0.35 + idx * 0.2,
                  ease: editorialEase,
                }}
                className="group relative rounded-2xl bg-white hover:bg-neutral-50 border border-gray-100 p-5 sm:p-6 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
              >
                {/* Glowing Circular Icon */}
                <div className="w-14 h-14 rounded-full border border-[#FFD700]/50 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.18)] group-hover:scale-105 transition-all duration-300 mb-4">
                  {renderIcon(feat.icon_name)}
                </div>

                {/* Feature Title */}
                <h3 className="text-xs font-bold tracking-wider uppercase text-gray-950 mb-2 font-sans">
                  {feat.title}
                </h3>

                {/* Feature Description */}
                <p className="text-[11px] text-gray-600 font-normal leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CENTER COLUMN: Central Visual Showcase with Inset Cards */}
          <div className="lg:col-span-6 relative flex items-center justify-center py-6 sm:py-8 lg:py-4">
            <div className="relative w-full">
              {/* 1. Large Center Image (Comes First: Small to Large in place) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : isInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.7 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 1.2,
                  delay: shouldReduceMotion ? 0 : 0.25,
                  ease: editorialEase,
                }}
                className="relative w-full aspect-[16/10] sm:aspect-[16/10] rounded-none overflow-hidden bg-neutral-900 shadow-2xl"
              >
                {data.main_image_url ? (
                  <img
                    src={data.main_image_url}
                    alt={data.title || data.heading || 'Craftsmanship Showcase'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-600">
                    <Sparkles className="w-10 h-10 opacity-30 text-[#FFD700]" />
                  </div>
                )}
                {/* Subtle dark gradient overlay on bottom for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* 2. Left-Side Inset Image (Comes Second: Small to Large at current place) */}
              {data.inset_image_1_url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.35 }}
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1, scale: 1 }
                      : isInView
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.35 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 1.05,
                    delay: shouldReduceMotion ? 0 : 0.8,
                    ease: editorialEase,
                  }}
                  style={{ transformOrigin: 'center center' }}
                  className="absolute -bottom-8 -left-3 sm:-bottom-10 sm:-left-6 w-36 sm:w-48 md:w-52 aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.85)] bg-neutral-900 z-20 group"
                >
                  <img
                    src={data.inset_image_1_url}
                    alt="Fabric selection"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </motion.div>
              )}

              {/* 3. Right-Side Inset Image (Comes Third: Small to Large at current place) */}
              {data.inset_image_2_url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.35 }}
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1, scale: 1 }
                      : isInView
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.35 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 1.05,
                    delay: shouldReduceMotion ? 0 : 1.25,
                    ease: editorialEase,
                  }}
                  style={{ transformOrigin: 'center center' }}
                  className="absolute -bottom-8 -right-3 sm:-bottom-10 sm:-right-6 w-40 sm:w-56 md:w-64 aspect-[16/10] rounded-2xl overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.85)] bg-neutral-900 z-20 group"
                >
                  <img
                    src={data.inset_image_2_url}
                    alt="Uniform collection"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Feature Cards (Come from right side) */}
          <div className="lg:col-span-3 space-y-6 flex flex-col justify-center mt-6 lg:mt-0">
            {rightFeatures.map((feat, idx) => (
              <motion.div
                key={feat.id || idx}
                initial={{ opacity: 0, x: 80 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, x: 0 }
                    : isInView
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: 80 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 1.15,
                  delay: shouldReduceMotion ? 0 : 0.35 + idx * 0.2,
                  ease: editorialEase,
                }}
                className="group relative rounded-2xl bg-white hover:bg-neutral-50 border border-gray-100 p-5 sm:p-6 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
              >
                {/* Glowing Circular Icon */}
                <div className="w-14 h-14 rounded-full border border-[#FFD700]/50 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.18)] group-hover:scale-105 transition-all duration-300 mb-4">
                  {renderIcon(feat.icon_name)}
                </div>

                {/* Feature Title */}
                <h3 className="text-xs font-bold tracking-wider uppercase text-gray-950 mb-2 font-sans">
                  {feat.title}
                </h3>

                {/* Feature Description */}
                <p className="text-[11px] text-gray-600 font-normal leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
