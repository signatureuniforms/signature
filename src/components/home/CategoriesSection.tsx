'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Category } from '@/types'

interface CategoriesSectionProps {
  categories: Category[]
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  // Mock data removed as requested. Only render if categories are present.
  if (!categories || categories.length === 0) {
    return null
  }

  const sectionRef = useRef<HTMLElement>(null)
  // once: true ensures entrance animation plays once and never resets/returns backward
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()

  const scrollRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const animFrameRef = useRef<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Smooth editorial curve for cards sliding in from right to left
  const slideInEase = [0.22, 1, 0.36, 1] as const

  // Quadruple categories to provide an infinite forward buffer that never runs out or returns back
  const repeatedCategories = useMemo(() => {
    if (categories.length === 0) return []
    return [
      ...categories.map((c) => ({ ...c, _copy: 0 })),
      ...categories.map((c) => ({ ...c, _copy: 1 })),
      ...categories.map((c) => ({ ...c, _copy: 2 })),
      ...categories.map((c) => ({ ...c, _copy: 3 })),
    ]
  }, [categories])

  // Calculate dynamic step (card width + gap) with subpixel precision
  const getCardStep = useCallback(() => {
    if (!scrollRef.current) return 0
    const firstChild = scrollRef.current.firstElementChild as HTMLElement
    if (!firstChild) return 0
    const style = window.getComputedStyle(scrollRef.current)
    const gap = parseFloat(style.columnGap || style.gap || '12') || 12
    return firstChild.getBoundingClientRect().width + gap
  }, [])

  // Controlled, silky-smooth animated scroll function (custom duration & easing)
  // Eliminates sudden jerky/speedy native browser scrolling and guarantees 1 card per transition
  const smoothScrollTo = useCallback((element: HTMLElement, target: number, duration = 650) => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
    }

    const start = element.scrollLeft
    const change = target - start
    if (Math.abs(change) < 0.5) {
      isAnimatingRef.current = false
      return
    }

    const startTime = performance.now()
    isAnimatingRef.current = true

    // Smooth quartic ease-out for a calm, controlled, luxurious glide
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutQuart(progress)

      element.scrollLeft = start + change * easedProgress

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateScroll)
      } else {
        element.scrollLeft = target
        isAnimatingRef.current = false
        animFrameRef.current = null
      }
    }

    animFrameRef.current = requestAnimationFrame(animateScroll)
  }, [])

  // Slide forward EXACTLY 1 CARD AT A TIME at a calm, smooth, controlled pace
  const handleNext = useCallback(() => {
    const container = scrollRef.current
    // Guard against spam clicking and double-firing
    if (!container || isAnimatingRef.current) return
    const step = getCardStep()
    if (step <= 0) return

    const singleSetWidth = step * categories.length
    if (singleSetWidth <= 0) return

    // If we have advanced past one full set, seamlessly normalize back to set 1 in 0ms
    let currentScroll = container.scrollLeft
    if (currentScroll >= singleSetWidth) {
      currentScroll -= singleSetWidth
      container.scrollLeft = currentScroll
    }

    // Always target EXACTLY the very next card (current + 1), never multiple cards
    const currentCardIndex = Math.round(currentScroll / step)
    const targetScroll = (currentCardIndex + 1) * step

    smoothScrollTo(container, targetScroll, 650)
  }, [getCardStep, categories.length, smoothScrollTo])

  // Slide backward EXACTLY 1 CARD AT A TIME
  const handlePrev = useCallback(() => {
    const container = scrollRef.current
    if (!container || isAnimatingRef.current) return
    const step = getCardStep()
    if (step <= 0) return

    const singleSetWidth = step * categories.length
    if (singleSetWidth <= 0) return

    // If near the start, jump forward by singleSetWidth in 0ms so backward slide works infinitely
    let currentScroll = container.scrollLeft
    if (currentScroll < step * 0.5) {
      currentScroll += singleSetWidth
      container.scrollLeft = currentScroll
    }

    // Always target EXACTLY the previous card (current - 1)
    const currentCardIndex = Math.round(currentScroll / step)
    const targetScroll = (currentCardIndex - 1) * step

    smoothScrollTo(container, targetScroll, 650)
  }, [getCardStep, categories.length, smoothScrollTo])

  // Clean up any ongoing animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  const isPausedRef = useRef(false)

  // Pause sliding immediately on hover and halt any ongoing scroll animation
  const handlePause = useCallback(() => {
    isPausedRef.current = true
    setIsPaused(true)
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    isAnimatingRef.current = false
  }, [])

  const handleResume = useCallback(() => {
    isPausedRef.current = false
    setIsPaused(false)
  }, [])

  // Continuous auto-slide forward 1 card at a time (paused on user hover/interaction)
  useEffect(() => {
    if (isPaused || !isInView || categories.length <= 1) return

    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        handleNext()
      }
    }, 3800)

    return () => clearInterval(interval)
  }, [isPaused, isInView, categories.length, handleNext])

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-5 lg:py-10 bg-black w-full overflow-hidden"
      aria-labelledby="shop-categories-heading"
    >
      <div className="w-full mx-auto">
        {/* Header: Title text-start on mobile, centered on desktop */}
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-6 sm:mb-12 gap-4">
          {/* Spacer to keep heading perfectly centered on desktop */}
          <div className="hidden sm:block w-20 shrink-0" aria-hidden="true" />

          {/* Main Heading & Description: text-left on mobile, centered on desktop */}
          <div className="flex-1 text-left sm:text-center">
            <h2
              id="shop-categories-heading"
              className="text-lg sm:text-xl md:text-2xl font-normal font-serif tracking-[0.25em] text-white uppercase leading-tight mb-2 sm:mb-2.5"
              style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
            >
              Uniforms We Specialize In
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light font-sans max-w-xl mx-auto leading-relaxed">
              Explore our range of bespoke uniforms tailored for schools, colleges, healthcare, corporate, and industry.
            </p>
          </div>

          {/* Right Arrow Controls: hidden on mobile, visible on sm and up */}
          <div className="hidden sm:flex items-center justify-end gap-3 sm:gap-4 shrink-0 sm:w-20">
            <button
              type="button"
              onClick={handlePrev}
              onMouseEnter={handlePause}
              onMouseLeave={handleResume}
              aria-label="Previous category"
              className="p-1.5 sm:p-2 text-white hover:text-[#FFD700] transition-colors cursor-pointer select-none"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              onMouseEnter={handlePause}
              onMouseLeave={handleResume}
              aria-label="Next category"
              className="p-1.5 sm:p-2 text-white hover:text-[#FFD700] transition-colors cursor-pointer select-none"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Carousel Slider:
            Controlled step-by-step smooth scrolling with 1 card per click and custom glide easing */}
        <div
          ref={scrollRef}
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
          className="w-full flex gap-3 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {repeatedCategories.map((cat, index) => {
            const imageUrl = cat.image?.secure_url || cat.image_url
            const isInitialBatch = cat._copy === 0
            const staggerDelay = shouldReduceMotion ? 0 : isInitialBatch ? Math.min(index * 0.12, 0.48) : 0

            return (
              <motion.div
                key={`${cat.id}-${cat._copy}-${index}`}
                className="w-[85%] sm:w-[calc((100%-12px)/2)] lg:w-[calc((100%-24px)/3)] shrink-0"
                initial={isInitialBatch ? { opacity: 0, x: 80 } : { opacity: 1, x: 0 }}
                animate={
                  shouldReduceMotion || !isInitialBatch
                    ? { opacity: 1, x: 0 }
                    : isInView
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: 80 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.8,
                  delay: staggerDelay,
                  ease: slideInEase,
                }}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  onMouseEnter={handlePause}
                  onMouseLeave={handleResume}
                  className="group relative block w-full h-[460px] sm:h-[500px] lg:h-[540px] overflow-hidden bg-neutral-900 cursor-pointer"
                  aria-label={cat.name}
                >
                  {/* Background Image - Served in pristine full-resolution directly from Cloudinary CDN */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={cat.image?.alt_text || cat.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
                      <span
                        className="text-white/15 text-7xl font-normal font-display select-none"
                        style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
                      >
                        {cat.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Black gradient only in content place */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-36 sm:h-44 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Bottom Text Content (Title & Subtitle centered) */}
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col items-center justify-end text-center z-10 pointer-events-none">
                    <h3
                      className="text-2xl sm:text-2xl text-white font-normal font-display tracking-wide mb-1.5 transition-colors group-hover:text-[#FFD700]"
                      style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
                    >
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-white/85 text-xs sm:text-sm font-normal leading-relaxed line-clamp-2 max-w-sm mx-auto">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
