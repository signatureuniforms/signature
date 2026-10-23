'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { ProcessSectionContent, ProcessStep } from '@/types'

interface ProcessSectionProps {
  header: ProcessSectionContent | null
  steps: ProcessStep[]
}

function getCloudinaryUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const t = url.trim()
  if (!t) return ''
  if (t.includes('res.cloudinary.com') && t.includes('/upload/')) {
    if (t.includes('/upload/f_auto') || t.includes('/upload/q_')) return t
    return t.replace('/upload/', '/upload/f_auto,q_auto:best,dpr_2.0/')
  }
  return t
}

function StepCard({ step, index }: { step: ProcessStep; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const isOdd = index % 2 !== 0

  const imgUrl = getCloudinaryUrl(step.image_url)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 items-center"
    >
      {/* Left column: alternates between content and image */}
      <div className={`${isOdd ? 'lg:order-2' : 'lg:order-1'} flex items-center justify-center p-8 lg:p-12`}>
        {/* Content card */}
        <div className="max-w-[420px] w-full">
          {/* Step number */}
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="text-3xl font-normal tabular-nums leading-none text-white/20" style={{ fontFamily: "'Regular-Light', serif" }}>
              {String(step.step_number).padStart(2, '0')}
            </span>
            <div className="h-[2px] w-12 bg-[#D4AF37]" />
          </div>

          {/* Heading — matches About section exactly */}
          <h3
            className="text-lg sm:text-xl md:text-2xl font-normal text-white uppercase leading-tight mb-4"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            {step.heading}
          </h3>

          {/* Description — matches About section */}
          <p className="text-[#A3A3A3] text-xs sm:text-sm leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* Right column: image */}
      <div className={`${isOdd ? 'lg:order-1' : 'lg:order-2'} relative`}>
        {imgUrl ? (
          <div className="relative overflow-hidden rounded-2xl mx-6 lg:mx-8 my-6 lg:my-8 aspect-[4/3] bg-neutral-900 border border-[#2A2A2A]">
            <img
              src={imgUrl}
              alt={step.heading}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
            {/* Gold accent corner */}
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37] opacity-75" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37] opacity-75" />
          </div>
        ) : (
          <div className="mx-6 lg:mx-8 my-6 lg:my-8 aspect-[4/3] rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center">
            <span className="text-white/20 text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Center step number connector (desktop) */}
      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-[#0A0A0A] border-4 border-[#D4AF37] flex items-center justify-center shadow-2xl">
          <span className="text-white text-xs font-bold tabular-nums">
            {String(step.step_number).padStart(2, '0')}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProcessSection({ header, steps }: ProcessSectionProps) {
  // No fallback data. If nothing is published, render nothing.
  const hasHeader = header && (header.heading || header.subheading || header.description)
  const publishedSteps = steps.filter((s) => s.is_published)

  if (!hasHeader && publishedSteps.length === 0) return null

  return (
    <section className="bg-[#0A0A0A] min-h-screen w-full" aria-labelledby="process-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">

        {/* Section Header — same style as About section */}
        {hasHeader && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16 lg:mb-24"
          >
            {header.subheading && (
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37] block mb-4">
                {header.subheading}
              </span>
            )}
            {header.heading && (
              <h2
                id="process-heading"
                className="text-lg sm:text-xl md:text-2xl font-normal text-white uppercase leading-tight mb-5"
                style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
              >
                {header.heading}
              </h2>
            )}
            {/* Gold divider — matches About section */}
            <div className="w-12 h-[2px] bg-[#D4AF37] mx-auto mb-6" aria-hidden="true" />
            {header.description && (
              <p className="text-[#A3A3A3] text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                {header.description}
              </p>
            )}
          </motion.div>
        )}

        {/* Steps */}
        {publishedSteps.length > 0 && (
          <div className="relative">
            {/* Vertical timeline line (desktop) */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent -translate-x-1/2" />

            <div className="space-y-4">
              {publishedSteps.map((step, idx) => (
                <div key={step.id} className="relative">
                  {/* Divider between steps */}
                  {idx > 0 && (
                    <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 -top-2 h-4 w-px bg-[#D4AF37]/30" />
                  )}
                  <div className="bg-[#171717] rounded-2xl overflow-hidden  transition-colors duration-500 shadow-xl">
                    <StepCard step={step} index={idx} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

