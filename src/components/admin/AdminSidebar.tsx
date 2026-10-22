'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Video, Grid3x3, Package,
  MessageSquare, Settings, LogOut, ChevronDown,
  ChevronRight, FileText, Star, Menu, X, Info, Award, Film,
  ShieldCheck, Sparkles, Target
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Enquiries',
    items: [
      { label: 'All Enquiries', href: '/admin/enquiries', icon: MessageSquare },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { label: 'Categories', href: '/admin/categories', icon: Grid3x3 },
      { label: 'Subcategories', href: '/admin/subcategories', icon: ChevronRight },
      { label: 'Products', href: '/admin/products', icon: Package },
    ],
  },
  {
    label: 'Website Content',
    items: [
      { label: 'Hero Videos', href: '/admin/hero', icon: Video },
      { label: 'Why Choose Us', href: '/admin/why-choose-us', icon: Star },
      { label: 'About Section', href: '/admin/about', icon: Info },
      { label: 'Vision & Mission', href: '/admin/about?tab=vision-mission', icon: Target },
      { label: 'Trusted Brands', href: '/admin/brands', icon: Award },
      { label: 'Craftsmanship', href: '/admin/craftsmanship', icon: Sparkles },
      { label: 'Video Banner', href: '/admin/video-banner', icon: Film },
      { label: 'Footer Features', href: '/admin/footer-features', icon: ShieldCheck },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Admin Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin')
    router.refresh()
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        {!collapsed ? (
          <div className="flex items-center justify-center gap-3">
            <img src="/logo/logo.png" alt="Signature Uniforms" className="h-10 w-auto object-contain" />
       
          </div>
        ) : (
          <img src="/logo/logo.png" alt="Signature Uniforms" className="h-8 w-auto mx-auto object-contain" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-6">
            {!collapsed && (
              <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-2">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        active
                          ? 'text-white bg-[#C59B27] shadow-md'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={17} className="flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer w-full text-left text-white/70 hover:text-red-400 hover:bg-white/5"
          aria-label="Sign out"
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col bg-black h-screen sticky top-0 flex-shrink-0 transition-all duration-300"
        style={{ width: collapsed ? '72px' : '240px' }}
      >
        {renderSidebarContent()}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight size={12} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-black h-14 flex items-center justify-between px-4 border-b border-white/10">
        <span style={{ fontFamily: 'Playfair Display, serif', color: '#FFD700', fontWeight: 700 }}>Signature Admin</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-black overflow-y-auto"
            >
              {renderSidebarContent()}
            </motion.div>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
