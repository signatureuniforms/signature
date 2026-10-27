'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/constants'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Our Collections', href: '/categories' },
  { label: 'Our Process', href: '/process' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const waUrl = buildWhatsAppUrl('Hello, I would like to enquire about your uniforms.')
  const isHome = pathname === '/'
  const isSolid = scrolled || mobileOpen || !isHome

  // Lock body scroll when full-screen mobile menu is open
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
        {/* Solid Black Animated Background (Smooth Bottom-to-Top Reveal) */}
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
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3.5 py-1.5 text-[13px] sm:text-[14px] uppercase transition-colors duration-200 rounded-lg hover:text-[#E5C158] !font-sans"
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

            {/* Vertically and Horizontally Centered Content (Staggered Animation One by One) */}
            <motion.nav
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.22,
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
              className="flex-1 flex flex-col items-center justify-center text-center my-auto w-full max-w-sm mx-auto space-y-4"
              aria-label="Mobile Navigation Links"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, y: 26 },
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
                      className={`inline-block py-2.5 px-4 text-base sm:text-lg uppercase transition-all duration-200 cursor-pointer ${
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

              {/* Enquiry Now Button (Redirects to /contact, border-radius: none) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 26 },
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
                className="w-full max-w-xs pt-4"
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
