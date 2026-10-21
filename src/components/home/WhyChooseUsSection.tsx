'use client'

import { useState } from 'react'
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
        /* 2-COLUMN LAYOUT: Left Image + Right Accordion */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
            {/* Left Column: Image (Animated in from left) */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 xl:col-span-5 relative w-full rounded-none overflow-hidden bg-neutral-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] aspect-[4/5] max-w-lg mx-auto lg:max-w-none group"
            >
              <img
                src={content?.image_url || ''}
                alt={headingText}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              {/* Subtle gold line & dark gradient overlays for luxury aesthetic */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700]/70 via-[#FFE066]/30 to-transparent pointer-events-none" />
            </motion.div>

            {/* Right Column: Header & Accordion List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
              className="lg:col-span-7 xl:col-span-7"
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
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
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
