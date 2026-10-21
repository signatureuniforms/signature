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
  { label: 'Uniform Categories', href: '/categories' },
  { label: 'Products', href: '/products' },
  { label: 'Gallery', href: '/gallery' },
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
  const isSolid = scrolled || mobileOpen

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: 'var(--navbar-height)' }}
        initial={false}
        animate={{
          boxShadow: isSolid ? '0 4px 20px rgba(0,0,0,0.5)' : '0 0px 0px rgba(0,0,0,0)',
          borderBottomColor: isSolid ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0)',
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Solid Black Animated Background (Smooth Bottom-to-Top Reveal) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
          aria-hidden="true"
        >
          <motion.div
            className="w-full h-full bg-black"
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

        <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-10 h-full flex items-center justify-between gap-8">
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
                height={72}
                className="h-14 sm:h-16 md:h-[68px] w-auto object-contain"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1.5 !font-sans" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-[14px] uppercase transition-colors duration-200 rounded-xl hover:text-[#FFD700] !font-sans"
                  style={{
                    color: isActive ? '#ffd900ff' : '#ffffff',
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
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="navbar-whatsapp-cta"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-white hover:bg-[#FFD700] text-black font-semibold text-[15px] rounded-2xl tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_4px_16px_rgba(255,215,0,0.3)] cursor-pointer"
              aria-label="WhatsApp Enquiry"
            >
              Enquiry Now
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl transition-colors text-white"
            style={{
              backgroundColor: mobileOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-0 z-40 bg-black/95 border-b border-zinc-800 backdrop-blur-md"
            style={{ top: 'var(--navbar-height)' }}
          >
            <nav className="w-full px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors"
                      style={{
                        color: isActive ? '#FFD700' : '#ffffff',
                        backgroundColor: isActive ? 'rgba(255,215,0,0.1)' : 'transparent',
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.04 + 0.05 }}
                className="pt-4 pb-2"
              >
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-[#FFD700] text-black font-semibold text-sm rounded-2xl tracking-wide transition-all duration-200 active:translate-y-0 cursor-pointer"
                  id="mobile-whatsapp-cta"
                >
                  <MessageCircle size={18} />
                  WhatsApp Enquiry
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            style={{ top: 'var(--navbar-height)' }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  )
}
