'use client'

import { motion, type Variants } from 'framer-motion'
import type { FooterFeatureItem } from '@/types'

interface FooterFeaturesBarProps {
  items: FooterFeatureItem[] | null | undefined
}

// Container orchestrates items to animate in sequentially one by one
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
}

// Each feature item slides up smoothly from bottom
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export default function FooterFeaturesBar({ items }: FooterFeaturesBarProps) {
  // Strict rule: No mock data and no fallback data.
  // If no items are present in DB, do not render this section.
  if (!items || items.length === 0) {
    return null
  }

  // Display only up to 4 items as requested
  const displayItems = items.slice(0, 4)

  // Dynamic layout: distributes items with space-between across the container
  const getLayoutClass = (count: number) => {
    if (count === 1) {
      return 'flex justify-center items-center w-full'
    }
    return 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8 w-fit max-w-full mx-auto sm:w-full sm:mx-0'
  }

  return (
    <section
      className="w-full bg-[#EBEBEB] text-black border-t border-neutral-300 py-6 sm:py-8 overflow-hidden"
      aria-label="Features and Benefits"
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className={getLayoutClass(displayItems.length)}
        >
          {displayItems.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              variants={itemVariants}
              className="flex items-center gap-3.5 sm:gap-4 group shrink-0 w-full sm:w-auto"
            >
              {/* Icon */}
              {item.icon_url && (
                <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={item.icon_url}
                    alt={item.heading || 'Feature Icon'}
                    className="max-h-full max-w-full object-contain filter contrast-125"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Text: Heading + Description */}
              <div className="min-w-0 text-left">
                <h3 className="text-xs sm:text-[13px] font-bold tracking-wide uppercase text-black leading-snug">
                  {item.heading}
                </h3>
                <p className="text-[11px] sm:text-xs text-black/75 leading-relaxed mt-0.5 font-sans font-normal">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
