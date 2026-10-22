import Link from 'next/link'
import Image from 'next/image'
import { BRAND } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import FooterFeaturesBar from '@/components/layout/FooterFeaturesBar'
import FooterSections from '@/components/layout/FooterSections'
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

      <footer className="bg-[#0A0A0A] text-white" role="contentinfo">
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
              <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-sm">
                {footerDesc}
              </p>
            </div>

            {/* Navigation and Contact Sections (Mobile accordion, Desktop grid columns) */}
            <FooterSections
              quickLinks={QUICK_LINKS}
              categoryLinks={CATEGORY_LINKS}
              contact={{
                phone,
                secondaryPhone,
                whatsappNumber,
                email,
                address,
                mapsUrl,
                workingHours,
              }}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2A2A2A]">
          <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <p className="text-[11px] text-[#A3A3A3]/70 text-center sm:text-left">{copyright}</p>
            <div className="flex items-center gap-5">
              <Link href="/privacy-policy" className="text-[11px] text-[#A3A3A3]/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[11px] text-[#A3A3A3]/70 hover:text-white transition-colors">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
