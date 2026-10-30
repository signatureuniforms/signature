'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Our Collections', href: '/categories' },
  { label: 'Our Process', href: '/process' },
  { label: 'Contact', href: '/contact' },
]

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'school-uniforms',
    name: 'School Uniforms',
    slug: 'school-uniforms',
    description: 'Complete uniform solutions for schools — boys and girls uniforms, pinafores, and shirts.',
    image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop',
    is_enabled: true,
    is_featured: true,
  },
  {
    id: 'college-uniforms',
    name: 'College Uniforms',
    slug: 'college-uniforms',
    description: 'Professional and presentable uniform sets for colleges and higher education institutions.',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    is_enabled: true,
    is_featured: true,
  },
  {
    id: 'corporate-uniforms',
    name: 'Corporate Uniforms',
    slug: 'corporate-uniforms',
    description: 'Sophisticated staff and office attire tailored for professional business environments.',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
    is_enabled: true,
    is_featured: true,
  },
  {
    id: 'hospital-nursing-uniforms',
    name: 'Hospital & Nursing Uniforms',
    slug: 'hospital-nursing-uniforms',
    description: 'Hygienic, durable, and comfortable uniforms for healthcare staff, doctors, and nurses.',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop',
    is_enabled: true,
    is_featured: true,
  },
  {
    id: 'industrial-workwear',
    name: 'Industrial Workwear',
    slug: 'industrial-workwear',
    description: 'Heavy-duty, safety-compliant workwear for factories, warehouses, and industrial facilities.',
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=800&auto=format&fit=crop',
    is_enabled: true,
    is_featured: true,
  },
  {
    id: 'uniform-products',
    name: 'Uniform Products',
    slug: 'uniform-products',
    description: 'Ready-made uniforms, premium uniform fabrics, and garment components available in bulk.',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
    is_enabled: true,
    is_featured: false,
  },
]

function getCategoryImageUrl(cat: Category): string {
  if (cat.image?.secure_url) return cat.image.secure_url
  if (cat.image_url) return cat.image_url
  const match = FALLBACK_CATEGORIES.find(
    (f) => f.slug === cat.slug || f.name.toLowerCase() === cat.name.toLowerCase()
  )
  return (
    match?.image_url ||
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop'
  )
}

interface NavbarProps {
  initialCategories?: Category[]
}

export default function Navbar({ initialCategories }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null)

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  // Use DB categories if present, otherwise fallback
  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES
  const activeCategory = hoveredCategory || displayCategories[0] || null
  const activeImageUrl = activeCategory ? getCategoryImageUrl(activeCategory) : ''

  // Client-side fetch fallback if initialCategories wasn't provided or empty
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories)
      return
    }

    try {
      const supabase = createClient()
      supabase
        .from('categories')
        .select('*, image:media_assets(*)')
        .eq('is_enabled', true)
        .order('position', { ascending: true })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setCategories(data)
          }
        })
    } catch {
      // Keep fallback categories
    }
  }, [initialCategories])

  // Scroll detection
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolledNow = window.scrollY > 40
          setScrolled((prev) => (prev !== isScrolledNow ? isScrolledNow : prev))
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [pathname])

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setIsDropdownOpen(false)
  }, [pathname])

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setIsDropdownOpen(true)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 180)
  }

  const isHome = pathname === '/'
  const isSolid = scrolled || mobileOpen || isDropdownOpen || !isHome

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: 'var(--navbar-height)' }}
        initial={false}
        animate={{
          boxShadow: isSolid ? '0 4px 20px rgba(0,0,0,0.6)' : '0 0px 0px rgba(0,0,0,0)',
          borderBottomColor: isSolid ? '#2A2A2A' : 'rgba(255,255,255,0)',
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Solid Black Animated Background */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
          aria-hidden="true"
        >
          <motion.div
            className="w-full h-full bg-[#0A0A0A]"
            initial={false}
            animate={{
              y: isSolid ? '0%' : '100%',
            }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        <div className="relative z-10 w-full px-2 sm:px-6 md:px-8 lg:px-10 h-full flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3" aria-label="Signature Uniforms Home">
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Image
                src="/logo/logo.png"
                alt="Signature Uniforms by Hari"
                width={200}
                height={56}
                className="h-10 sm:h-12 md:h-[50px] w-auto object-contain"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 !font-sans" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isCollections = link.href === '/categories'
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))

              if (isCollections) {
                return (
                  <div
                    key={link.href}
                    className="relative py-2"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsDropdownOpen(false)}
                      className="relative px-3.5 py-1.5 text-[13px] sm:text-[14px] uppercase transition-colors duration-200 rounded-lg hover:text-[#E5C158] !font-sans inline-flex items-center gap-1.5 cursor-pointer"
                      style={{
                        color: isActive || isDropdownOpen ? '#D4AF37' : '#ffffff',
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          isDropdownOpen ? 'rotate-180 text-[#D4AF37]' : 'text-white/60'
                        }`}
                      />
                    </Link>

                    {/* Desktop Hover Mega-Dropdown */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 w-[780px] xl:w-[840px] max-w-[calc(100vw-32px)]"
                          onMouseEnter={handleDropdownEnter}
                          onMouseLeave={handleDropdownLeave}
                        >
                          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] flex gap-6 overflow-hidden">
                            {/* Left Column: Category List with Thumbnails */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-3 px-2">
                                  <span className="text-[11px] font-semibold text-[#B8860B] tracking-[0.2em] uppercase">
                                    Our Collections
                                  </span>
                                  <span className="text-[11px] text-gray-400 font-mono">
                                    {displayCategories.length} Categories
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  {displayCategories.map((cat) => {
                                    const isCatActive =
                                      activeCategory?.id === cat.id || activeCategory?.slug === cat.slug
                                    const catImg = getCategoryImageUrl(cat)

                                    return (
                                      <Link
                                        key={cat.id || cat.slug}
                                        href={`/categories/${cat.slug}`}
                                        onMouseEnter={() => setHoveredCategory(cat)}
                                        onClick={() => setIsDropdownOpen(false)}
                                        className={`group/cat flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                                          isCatActive
                                            ? 'bg-[#F8F5EE] text-[#B8860B]'
                                            : 'hover:bg-gray-50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                          {/* Category Thumbnail Image */}
                                          <div
                                            className={`relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 transition-all duration-200 ${
                                              isCatActive ? 'scale-105 shadow-sm' : ''
                                            }`}
                                          >
                                            <img
                                              src={catImg}
                                              alt={cat.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>

                                          <div className="min-w-0 text-left">
                                            <p
                                              className={`text-sm tracking-wide transition-colors truncate ${
                                                isCatActive
                                                  ? 'text-[#B8860B] font-semibold'
                                                  : 'text-gray-900 group-hover/cat:text-[#B8860B] font-medium'
                                              }`}
                                            >
                                              {cat.name}
                                            </p>
                                            {cat.description && (
                                              <p className="text-[11px] text-gray-500 truncate max-w-[220px]">
                                                {cat.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Right subtle arrow indicator */}
                                        <ChevronRight
                                          size={16}
                                          className={`shrink-0 transition-all duration-200 ${
                                            isCatActive
                                              ? 'text-[#B8860B] translate-x-0.5 opacity-100'
                                              : 'text-gray-300 opacity-0 group-hover/cat:opacity-100'
                                          }`}
                                        />
                                      </Link>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Footer: View All Collections */}
                              <div className="pt-3.5 mt-2 border-t border-gray-100">
                                <Link
                                  href="/categories"
                                  onClick={() => setIsDropdownOpen(false)}
                                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#B8860B] hover:text-[#996515] transition-colors rounded-lg hover:bg-gray-50 group/all"
                                >
                                  <span className="tracking-wide">View All Uniform Collections</span>
                                  <ArrowRight
                                    size={14}
                                    className="group-hover/all:translate-x-1 transition-transform duration-200"
                                  />
                                </Link>
                              </div>
                            </div>

                            {/* Right Column: Active Category Showcase & Large Image Preview */}
                            <div className="w-[310px] xl:w-[340px] shrink-0 flex flex-col">
                              <div className="relative flex-1 rounded-xl overflow-hidden bg-neutral-900 flex flex-col justify-end p-5 min-h-[310px]">
                                {/* Animated Image Display */}
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={activeCategory?.id || activeCategory?.slug}
                                    initial={{ opacity: 0, scale: 1.04 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    className="absolute inset-0"
                                  >
                                    <img
                                      src={activeImageUrl}
                                      alt={activeCategory?.name || 'Category'}
                                      className="w-full h-full object-cover"
                                    />
                                    {/* Gradients for high contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
                                    <div className="absolute inset-0 bg-black/20" />
                                  </motion.div>
                                </AnimatePresence>

                                {/* Active Category Info */}
                                <div className="relative z-10 flex flex-col items-start text-left">
                                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#D4AF37] mb-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md">
                                    Signature Range
                                  </span>
                                  <h3
                                    className="text-lg font-normal text-white mb-1.5 leading-snug tracking-wide"
                                    style={{ fontFamily: "'Regular-Light', serif" }}
                                  >
                                    {activeCategory?.name}
                                  </h3>
                                  <p className="text-xs text-white/75 line-clamp-2 mb-4 leading-relaxed font-light">
                                    {activeCategory?.description ||
                                      'Custom tailored uniform solutions manufactured with premium institutional fabrics.'}
                                  </p>

                                  <Link
                                    href={`/categories/${activeCategory?.slug}`}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="btn-gold-sweep inline-flex items-center gap-2 py-2 px-4 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold rounded-full tracking-wide transition-all shadow-[0_4px_14px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                                  >
                                    <span>Explore Collection</span>
                                    <ArrowRight size={13} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3.5 py-1.5 text-[13px] sm:text-[14px] uppercase transition-colors duration-200 rounded-lg hover:text-[#E5C158] !font-sans cursor-pointer"
                  style={{
                    color: isActive ? '#D4AF37' : '#ffffff',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/contact"
              id="navbar-enquiry-now-cta"
              className="btn-gold-sweep inline-flex items-center justify-center gap-2 py-2 px-5 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-[14px] font-medium rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              Enquiry Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl transition-colors text-white cursor-pointer"
            style={{
              backgroundColor: mobileOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.header>

      {/* Full-Screen Mobile Menu with Bottom-to-Top Reveal & Staggered Centered Items */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="fullscreen-mobile-menu"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-[#0A0A0A] text-white flex flex-col justify-between h-[100dvh] w-full overflow-hidden p-6 sm:p-8 lg:hidden select-none"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Top Bar with Brand Logo & Circular Close Button */}
            <div className="w-full flex items-center justify-between shrink-0 z-10">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
                aria-label="Signature Uniforms Home"
              >
                <Image
                  src="/logo/logo.png"
                  alt="Signature Uniforms by Hari"
                  width={180}
                  height={60}
                  className="h-12 sm:h-14 w-auto object-contain"
                  priority
                />
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-[#2A2A2A]"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Vertically Centered Scrollable Mobile Content */}
            <motion.nav
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.07,
                    delayChildren: 0.18,
                  },
                },
                exit: {
                  opacity: 0,
                  transition: {
                    staggerChildren: 0.04,
                    staggerDirection: -1,
                  },
                },
              }}
              className="flex-1 flex flex-col items-center justify-center text-center my-auto w-full max-w-sm mx-auto space-y-3 overflow-y-auto py-4"
              aria-label="Mobile Navigation Links"
            >
              {NAV_LINKS.map((link) => {
                const isCollections = link.href === '/categories'
                const isActive =
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))

                if (isCollections) {
                  return (
                    <motion.div
                      key={link.href}
                      variants={{
                        hidden: { opacity: 0, y: 22 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.45,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                        exit: {
                          opacity: 0,
                          y: 12,
                          transition: { duration: 0.2 },
                        },
                      }}
                      className="w-full flex flex-col items-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`inline-block py-2 text-base sm:text-lg uppercase transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'text-[#D4AF37] font-normal'
                              : 'text-white/85 hover:text-[#E5C158]'
                          }`}
                          style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {link.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileCollectionsOpen((prev) => !prev)}
                          className="p-1 text-[#D4AF37] hover:text-[#E5C158] transition-colors cursor-pointer"
                          aria-label="Toggle collection categories"
                        >
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-300 ${
                              mobileCollectionsOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Expandable Mobile Categories with Images */}
                      <AnimatePresence>
                        {mobileCollectionsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full overflow-hidden mt-1 mb-2 bg-[#141414] border border-[#262626] rounded-xl p-2.5 max-h-56 overflow-y-auto"
                          >
                            <div className="space-y-1">
                              {displayCategories.map((cat) => {
                                const catImg = getCategoryImageUrl(cat)
                                return (
                                  <Link
                                    key={`mob-${cat.id || cat.slug}`}
                                    href={`/categories/${cat.slug}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 text-left transition-colors"
                                  >
                                    <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-white/10">
                                      <img
                                        src={catImg}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="text-xs text-white/90 truncate font-light tracking-wide">
                                      {cat.name}
                                    </span>
                                  </Link>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                }

                return (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, y: 22 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                      exit: {
                        opacity: 0,
                        y: 12,
                        transition: { duration: 0.2 },
                      },
                    }}
                    className="w-full flex justify-center"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`inline-block py-2 px-4 text-base sm:text-lg uppercase transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'text-[#D4AF37] font-normal'
                          : 'text-white/85 hover:text-[#E5C158]'
                      }`}
                      style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}

              {/* Enquiry Now Button */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                  exit: {
                    opacity: 0,
                    y: 12,
                    transition: { duration: 0.2 },
                  },
                }}
                className="w-full max-w-xs pt-3"
              >
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="btn-gold-sweep flex items-center justify-center w-full py-3.5 px-6 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-semibold text-sm rounded-full tracking-widest uppercase transition-all duration-300 shadow-xl active:scale-98 cursor-pointer"
                  id="mobile-enquiry-now-cta"
                >
                  <span>Enquiry Now</span>
                </Link>
              </motion.div>
            </motion.nav>

            {/* Bottom Subtle Brand Mark */}
            <div className="shrink-0 text-center pb-2 pointer-events-none">
              <p className="text-[11px] text-white/35 tracking-widest uppercase font-light">
                Signature Uniforms by Hari
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
