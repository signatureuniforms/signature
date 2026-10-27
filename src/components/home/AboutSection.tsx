'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { AboutSectionContent } from '@/types'

interface AboutSectionProps {
  data: AboutSectionContent | null
  showCta?: boolean
}

export default function AboutSection({ data, showCta = true }: AboutSectionProps) {
  const pathname = usePathname()
  const sectionRef = useRef<HTMLElement>(null)
  // once: false allows the animation to trigger every time the section/page comes into view
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()

  const shouldShowCta = showCta && pathname !== '/about'

  // Only render if data exists and has content (NO mock or fallback data)
  if (!data || (!data.heading && !data.description && !data.image_url)) {
    return null
  }

  // Animation easing curves (smooth, premium cinematic motion)
  const editorialEase = [0.22, 1, 0.36, 1] as const

  return (
    <section
      ref={sectionRef}
      id="about-section"
      className="w-full bg-[#0A0A0A] text-white py-10 lg:py-20 overflow-hidden"
      aria-labelledby="about-section-heading"
    >
      <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Side: Content Reveal */}
          <div
            className={data.image_url ? 'lg:col-span-6' : 'lg:col-span-8 lg:col-start-3 text-center'}
          >
            {/* Subheading */}
            {data.subheading && (
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, y: 0 }
                    : isInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 24 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : isInView ? 0.7 : 0,
                  delay: shouldReduceMotion ? 0 : isInView ? 0.05 : 0,
                  ease: editorialEase,
                }}
                className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37] block mb-4"
              >
                {data.subheading}
              </motion.span>
            )}

            {/* Main Heading */}
            {data.heading && (
              <motion.h2
                id="about-section-heading"
                initial={{ opacity: 0, y: 32 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, y: 0 }
                    : isInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 32 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : isInView ? 0.75 : 0,
                  delay: shouldReduceMotion ? 0 : isInView ? 0.15 : 0,
                  ease: editorialEase,
                }}
                className="text-lg sm:text-xl md:text-2xl  font-normal text-white uppercase leading-tight mb-5 font-serif tracking-[0.25em]"
                style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
              >
                {data.heading}
              </motion.h2>
            )}

            {/* Gold Divider Line */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1, scaleX: 1 }
                  : isInView
                    ? { opacity: 1, scaleX: 1 }
                    : { opacity: 0, scaleX: 0 }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : isInView ? 0.6 : 0,
                delay: shouldReduceMotion ? 0 : isInView ? 0.25 : 0,
                ease: editorialEase,
              }}
              style={{ transformOrigin: data.image_url ? 'left' : 'center' }}
              className={`w-12 h-[2px] bg-[#D4AF37] mb-6 ${data.image_url ? '' : 'mx-auto'}`}
              aria-hidden="true"
            />

            {/* Description */}
            {data.description && (
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, y: 0 }
                    : isInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 24 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : isInView ? 0.75 : 0,
                  delay: shouldReduceMotion ? 0 : isInView ? 0.35 : 0,
                  ease: editorialEase,
                }}
                className="text-[#A3A3A3] text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-8 max-w-2xl"
              >
                {data.description}
              </motion.p>
            )}

            {/* CTA Button */}
            {shouldShowCta && (
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
                  duration: shouldReduceMotion ? 0 : isInView ? 0.7 : 0,
                  delay: shouldReduceMotion ? 0 : isInView ? 0.45 : 0,
                  ease: editorialEase,
                }}
                className={data.image_url ? '' : 'flex justify-center'}
              >
                <Link
                  href="/about"
                  id="about-view-more-cta"
                  className="btn-gold-sweep inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-semibold text-sm rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] cursor-pointer group"
                  aria-label="View more about Signature Uniforms"
                >
                  <span>View More</span>
                  <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Right Side: Image with Normal Reveal Animation */}
          {data.image_url && (
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, y: 0 }
                    : isInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 60 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.85,
                  delay: shouldReduceMotion ? 0 : 0.2,
                  ease: editorialEase,
                }}
                className="relative overflow-hidden shadow-2xl bg-zinc-950 group rounded-xl"
                style={{ aspectRatio: '4/3' }}
              >
                <Image
                  src={data.image_url}
                  alt={data.heading || 'About Signature Uniforms'}
                  fill
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-105 rounded-xl"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={false}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none rounded-xl"
                  aria-hidden="true"
                />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
