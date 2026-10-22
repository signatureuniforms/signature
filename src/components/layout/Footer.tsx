import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, ArrowUpRight, MessageCircle, Clock } from 'lucide-react'
import { BRAND, buildWhatsAppUrl } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import FooterFeaturesBar from '@/components/layout/FooterFeaturesBar'
import type { FooterFeatureItem, FooterFeaturesContent } from '@/types'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Uniform Categories', href: '/categories' },
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
        .select('key, value'),
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

  const brandName = settings.site_name || settings.business_name || BRAND.name
  const phone = settings.phone_primary || settings.phone || BRAND.phone
  const secondaryPhone = settings.phone_secondary
  const whatsappNumber = settings.whatsapp_number || BRAND.whatsappNumber
  const email = settings.email_primary || settings.email || BRAND.email
  const workingHours = settings.working_hours

  // Format address seamlessly from site_settings fields
  const addressParts: string[] = []
  if (settings.factory_address) addressParts.push(settings.factory_address)
  if (settings.city && (!settings.factory_address || !settings.factory_address.toLowerCase().includes(settings.city.toLowerCase()))) {
    addressParts.push(settings.city)
  }
  if (settings.state) addressParts.push(settings.state)
  if (settings.pincode) addressParts.push(settings.pincode)
  const formattedAddress = addressParts.join(', ')
  const address = formattedAddress || settings.address || BRAND.address

  const mapsUrl = settings.google_maps_url || (address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : BRAND.mapsUrl)
  const footerDesc = settings.footer_description || settings.tagline || 'Premium uniform manufacturer and wholesale supplier for schools, colleges, corporate offices, hospitals, and industries across Kerala.'
  const copyright = settings.copyright_text || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`

  return (
    <>
      {/* Footer Top Features Bar */}
      <FooterFeaturesBar items={features} />

      <footer className="bg-black text-white border-t border-neutral-900" role="contentinfo">
        {/* Main footer content */}
        <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Brand column */}
            <div className="lg:col-span-4 space-y-4">
              <Link href="/" className="inline-block" aria-label="Signature Uniforms Home">
                <Image
                  src="/logo/logo.png"
                  alt="Signature Uniforms by Hari"
                  width={200}
                  height={80}
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </Link>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                {footerDesc}
              </p>
            </div>

            {/* Quick links */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/55 hover:text-[#FFD700] transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight
                        size={11}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Uniform Categories */}
            <div className="lg:col-span-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] mb-4">
                Uniform Categories
              </h3>
              <ul className="space-y-2.5">
                {CATEGORY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/55 hover:text-[#FFD700] transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight
                        size={11}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] mb-4">
                Contact Details
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`tel:${phone}`}
                    className="flex items-start gap-2.5 text-xs text-white/55 hover:text-[#FFD700] transition-colors"
                  >
                    <Phone size={13} className="mt-0.5 flex-shrink-0 text-[#FFD700]" />
                    <span>{phone.startsWith('+') ? phone : `(+91) ${phone}`}</span>
                  </a>
                </li>
                {secondaryPhone && secondaryPhone !== phone && (
                  <li>
                    <a
                      href={`tel:${secondaryPhone}`}
                      className="flex items-start gap-2.5 text-xs text-white/55 hover:text-[#FFD700] transition-colors"
                    >
                      <Phone size={13} className="mt-0.5 flex-shrink-0 text-[#FFD700]" />
                      <span>{secondaryPhone.startsWith('+') ? secondaryPhone : `(+91) ${secondaryPhone}`}</span>
                    </a>
                  </li>
                )}
                {whatsappNumber && (
                  <li>
                    <a
                      href={buildWhatsAppUrl('Hello, I would like to make an enquiry from your website.', whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 text-xs text-white/55 hover:text-[#FFD700] transition-colors"
                    >
                      <MessageCircle size={13} className="mt-0.5 flex-shrink-0 text-[#FFD700]" />
                      <span>{whatsappNumber}</span>
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-start gap-2.5 text-xs text-white/55 hover:text-[#FFD700] transition-colors break-all"
                  >
                    <Mail size={13} className="mt-0.5 flex-shrink-0 text-[#FFD700]" />
                    <span>{email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-xs text-white/55 hover:text-[#FFD700] transition-colors"
                  >
                    <MapPin size={13} className="mt-0.5 flex-shrink-0 text-[#FFD700]" />
                    <span className="leading-relaxed">{address}</span>
                  </a>
                </li>
                {workingHours && (
                  <li className="flex items-start gap-2.5 text-xs text-white/55">
                    <Clock size={13} className="mt-0.5 flex-shrink-0 text-[#FFD700]" />
                    <span>{workingHours}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <p className="text-[11px] text-white/40 text-center sm:text-left">{copyright}</p>
            <div className="flex items-center gap-5">
              <Link href="/privacy-policy" className="text-[11px] text-white/40 hover:text-white/70 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[11px] text-white/40 hover:text-white/70 transition-colors">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
