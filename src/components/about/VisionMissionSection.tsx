'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Eye, Compass } from 'lucide-react'
import type { VisionMissionContent } from '@/types'

interface VisionMissionSectionProps {
  data: VisionMissionContent | null
}

export default function VisionMissionSection({ data }: VisionMissionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()

  // Strict rule: No mock data and no fallback data.
  // If neither vision nor mission exists, do not render this section.
  if (!data || (!data.vision_description && !data.mission_description)) {
    return null
  }

  const editorialEase = [0.22, 1, 0.36, 1] as const

  return (
    <section
      ref={sectionRef}
      id="vision-mission-section"
      className="w-full bg-[#0A0A0A] text-white py-14 sm:py-20 lg:py-24 overflow-hidden relative"
      aria-label="Vision and Mission"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4AF37]/[0.025] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10 relative z-10">
        {/* Optional Section Header */}
        {(data.section_subheading || data.section_heading) && (
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            {data.section_subheading && (
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? { opacity: 1, y: 0 } : isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, ease: editorialEase }}
                className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-3"
              >
                {data.section_subheading}
              </motion.span>
            )}
            {data.section_heading && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? { opacity: 1, y: 0 } : isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.1, ease: editorialEase }}
                className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-white font-serif"
                style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
              >
                {data.section_heading}
              </motion.h2>
            )}
          </div>
        )}

        {/* Vision & Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Vision Card */}
          {data.vision_description && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={shouldReduceMotion ? { opacity: 1, y: 0 } : isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.15, ease: editorialEase }}
              className="group relative rounded-none p-8 sm:p-10 bg-[#171717]  transition-all duration-300 shadow-xl hover:shadow-[0_8px_32px_rgba(212,175,55,0.08)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]/50 transition-colors">
                    <Eye className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                    Vision
                  </span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-normal text-white mb-3 leading-tight"
                  style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
                >
                  {data.vision_heading || 'Our Vision'}
                </h3>
                <div className="w-12 h-[2px] bg-[#D4AF37] mb-6" />

                <p className="text-[#A3A3A3] text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
                  {data.vision_description}
                </p>
              </div>
            </motion.div>
          )}

          {/* Mission Card */}
          {data.mission_description && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={shouldReduceMotion ? { opacity: 1, y: 0 } : isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.25, ease: editorialEase }}
              className="group relative rounded-none p-8 sm:p-10 bg-[#171717] transition-all duration-300 shadow-xl hover:shadow-[0_8px_32px_rgba(212,175,55,0.08)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]/50 transition-colors">
                    <Compass className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                    Mission
                  </span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-normal text-white mb-3 leading-tight"
                  style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
                >
                  {data.mission_heading || 'Our Mission'}
                </h3>
                <div className="w-12 h-[2px] bg-[#D4AF37] mb-6" />

                <p className="text-[#A3A3A3] text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
                  {data.mission_description}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
