'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { WhyChooseUsItem, WhyChooseUsContent } from '@/types'

interface WhyChooseUsSectionProps {
  items: WhyChooseUsItem[]
  content?: WhyChooseUsContent | null
}

// Container variant to stagger child elements coming from bottom one by one
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

// Individual item variant coming up from bottom
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

// Helper to serve Cloudinary images at maximum fidelity, sharp edges and 2x pixel density
function getHighQualityImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
    if (trimmed.includes('/upload/f_auto') || trimmed.includes('/upload/q_')) {
      return trimmed
    }
    return trimmed.replace('/upload/', '/upload/f_auto,q_auto:best,e_sharpen:50,dpr_2.0/')
  }

  return trimmed
}

export default function WhyChooseUsSection({ items, content }: WhyChooseUsSectionProps) {
  // Strict rule: No mock data and no fallback data.
  // If no items exist in DB, do not render this section.
  if (!items || items.length === 0) {
    return null
  }

  // Active accordion index (first item open by default)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleAccordion = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index))
  }

  // Ref and state to lock image height 1:1 with accordion column height on desktop
  const rightColRef = useRef<HTMLDivElement>(null)
  const [accordionHeight, setAccordionHeight] = useState<number | null>(null)

  useEffect(() => {
    const el = rightColRef.current
    if (!el) return

    const measureHeight = () => {
      if (window.innerWidth >= 1024) {
        const h = el.offsetHeight
        if (h > 0) {
          setAccordionHeight(h)
        }
      } else {
        setAccordionHeight(null)
      }
    }

    measureHeight()

    const observer = new ResizeObserver(() => {
      measureHeight()
    })

    observer.observe(el)
    window.addEventListener('resize', measureHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measureHeight)
    }
  }, [])

  const hasImage = Boolean(content?.image_url && content.image_url.trim().length > 0)
  const eyebrowText = content?.eyebrow?.trim() || 'Our Strengths'
  const headingText = content?.title?.trim() || 'Why Choose Us'

  // Accordion Header component
  const renderHeader = () => (
    <motion.div variants={itemVariants} className="mb-8 lg:mb-10 text-left">
      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FFD700] block mb-2 font-sans">
        {eyebrowText}
      </span>
      <h2
        id="why-heading"
        className="text-lg sm:text-xl md:text-2xl font-normal font-serif tracking-[0.25em] text-white uppercase leading-tight"
        style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
      >
        {headingText}
      </h2>
      <div className="w-12 h-[1.5px] bg-[#FFD700] mt-3" />
    </motion.div>
  )

  // Accordion List component
  const renderAccordion = () => (
    <motion.div
      variants={containerVariants}
      className="divide-y divide-white/10 border-y border-white/10"
    >
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <motion.div
            key={item.id || index}
            variants={itemVariants}
            className="py-1"
          >
            {/* Accordion Header Trigger */}
            <button
              type="button"
              onClick={() => toggleAccordion(index)}
              className="w-full py-4 sm:py-5 flex items-center justify-between text-left group cursor-pointer focus:outline-none transition-colors"
              aria-expanded={isOpen}
            >
              <span className="text-xs sm:text-sm font-medium tracking-wide uppercase text-white group-hover:text-[#FFD700] transition-colors pr-4">
                {item.heading}
              </span>
              <span className="shrink-0 p-1 rounded-full text-white/50 group-hover:text-white transition-colors">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#FFD700]' : ''}`}
                />
              </span>
            </button>

            {/* Accordion Body */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 sm:pb-5 pr-6">
                    <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed font-light font-sans">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </motion.div>
  )

  return (
    <section className="py-20 lg:pt-20 lg:pb-10 bg-black text-white w-full overflow-hidden" aria-labelledby="why-heading">
      {hasImage ? (
        /* 2-COLUMN LAYOUT: Left Image + Right Accordion (Exact same heights, centered on Y axis) */
        <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 xl:gap-16 items-center">
            {/* Left Column: Image (matches accordion height 1:1, centered on Y axis) */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex items-center justify-center my-auto"
            >
              <div
                className="relative w-full rounded-none overflow-hidden bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.85)] group transition-[height] duration-300 ease-out"
                style={{
                  height: accordionHeight ? `${accordionHeight}px` : undefined,
                  minHeight: accordionHeight ? `${accordionHeight}px` : undefined,
                  maxHeight: accordionHeight ? `${accordionHeight}px` : undefined,
                }}
              >
                <img
                  src={getHighQualityImageUrl(content?.image_url)}
                  alt={headingText}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                  decoding="async"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </div>
            </motion.div>

            {/* Right Column: Header & Accordion List (placed in center on Y axis) */}
            <motion.div
              ref={rightColRef}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              className="w-full flex flex-col justify-center my-auto"
            >
              {renderHeader()}
              {renderAccordion()}
            </motion.div>
          </div>
        </div>
      ) : (
        /* SINGLE COLUMN LAYOUT: When no image is uploaded in DB (Strictly no mock/fallback image) */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          className="w-full px-2 sm:px-6 md:px-8 lg:px-10"
        >
          <div className="max-w-4xl">
            {renderHeader()}
            {renderAccordion()}
          </div>
        </motion.div>
      )}
    </section>
  )
}
