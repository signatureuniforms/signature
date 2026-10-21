import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react'
import { BRAND } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import FooterFeaturesBar from '@/components/layout/FooterFeaturesBar'
import type { FooterFeatureItem, FooterFeaturesContent } from '@/types'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Uniform Categories', href: '/categories' },
  { label: 'Products', href: '/products' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact Us', href: '/contact' },
]

const CATEGORY_LINKS = [
  { label: 'School Uniforms', href: '/categories/school-uniforms' },
  { label: 'College Uniforms', href: '/categories/college-uniforms' },
  { label: 'Corporate Uniforms', href: '/categories/corporate-uniforms' },
  { label: 'Hospital & Nursing', href: '/categories/hospital-nursing-uniforms' },
  { label: 'Industrial Workwear', href: '/categories/industrial-workwear' },
  { label: 'Uniform Products', href: '/categories/uniform-products' },
]

async function getFooterData() {
  try {
    const supabase = await createClient()

    const [settingsRes, featuresRes] = await Promise.allSettled([
      supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['footer_description', 'copyright_text', 'phone', 'email', 'address', 'whatsapp_number', 'google_maps_url']),
      supabase
        .from('page_content')
        .select('*')
        .eq('page_key', 'global')
        .eq('section_key', 'footer_features')
        .eq('is_published', true)
        .maybeSingle(),
    ])
    
    const settings: Record<string, string> = {}
    if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
      settingsRes.value.data.forEach((s: { key: string; value: string | null }) => {
        if (s.value) settings[s.key] = s.value
      })
    }

    let features: FooterFeatureItem[] = []
    if (featuresRes.status === 'fulfilled' && featuresRes.value.data?.content) {
      const c = featuresRes.value.data.content as FooterFeaturesContent
      if (Array.isArray(c.items)) {
        features = c.items
      }
    }

    return { settings, features }
  } catch {
    return { settings: {}, features: [] }
  }
}

export default async function Footer() {
  const { settings, features } = await getFooterData()

  const phone = settings.phone ?? BRAND.phone
  const email = settings.email ?? BRAND.email
  const address = settings.address ?? BRAND.address
  const whatsapp = settings.whatsapp_number ?? BRAND.whatsapp
  const mapsUrl = settings.google_maps_url ?? BRAND.mapsUrl
  const footerDesc = settings.footer_description ?? 'Premium uniform manufacturer and wholesale supplier for schools, colleges, corporate offices, hospitals, and industries across Kerala.'
  const copyright = settings.copyright_text ?? '© 2024 Signature Uniforms by Hari. All rights reserved.'

  const waUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello, I would like to enquire about your uniforms.')}`

  return (
    <>
      {/* Footer Top Features Bar */}
      <FooterFeaturesBar items={features} />

      <footer className="bg-black text-white" role="contentinfo">
        {/* Main footer */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Link href="/" className="inline-block" aria-label="Signature Uniforms Home">
                <Image
                  src="/logo/logo.png"
                  alt="Signature Uniforms by Hari"
                  width={220}
                  height={88}
                  className="h-16 sm:h-20 w-auto object-contain"
                />
              </Link>
            </div>
            <p className="text-sm text-white/65 leading-relaxed mb-6">
              {footerDesc}
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="footer-whatsapp-cta"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold text-sm rounded-2xl tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_4px_16px_rgba(255,215,0,0.3)] cursor-pointer"
            >
              <MessageCircle size={15} />
              WhatsApp Enquiry
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Uniform Categories
            </h3>
            <ul className="space-y-3">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${phone}`}
                  className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Phone size={15} className="mt-0.5 flex-shrink-0 text-brand-gold" style={{ color: '#FFD700' }} />
                  <span>{phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors break-all"
                >
                  <Mail size={15} className="mt-0.5 flex-shrink-0" style={{ color: '#FFD700' }} />
                  <span>{email}</span>
                </a>
              </li>
              <li>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: '#FFD700' }} />
                  <span>{address}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">{copyright}</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}
