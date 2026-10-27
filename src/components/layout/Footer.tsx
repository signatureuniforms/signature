import Link from 'next/link'
import Image from 'next/image'
import { BRAND, buildWhatsAppUrl } from '@/lib/constants'
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

async function getFooterData() {
  try {
    const supabase = await createClient()

    const [settingsRes, featuresRes, categoriesRes] = await Promise.allSettled([
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
      supabase
        .from('categories')
        .select('name, slug')
        .eq('is_enabled', true)
        .order('position', { ascending: true }),
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

    let categoryLinks: { label: string; href: string }[] = []
    if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data) {
      categoryLinks = categoriesRes.value.data.map((cat: { name: string; slug: string }) => ({
        label: cat.name,
        href: `/categories/${cat.slug}`,
      }))
    }

    return { settings, features, categoryLinks }
  } catch {
    return { settings: {}, features: [], categoryLinks: [] }
  }
}

export default async function Footer() {
  const { settings, features, categoryLinks } = await getFooterData()

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
  const instagramUrl = settings.instagram_url || 'https://instagram.com'
  const facebookUrl = settings.facebook_url || 'https://facebook.com'
  const whatsappUrl = buildWhatsAppUrl('Hello Signature Uniforms, I would like to get in touch.', whatsappNumber)

  return (
    <>
      {/* Footer Top Features Bar */}
      {/* <FooterFeaturesBar items={features} /> */}

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

              {/* Social Media Links: WhatsApp, Instagram, Facebook */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  title="WhatsApp"
                  className="w-9 h-9 rounded-full bg-[#161616] border border-[#2A2A2A] flex items-center justify-center text-[#A3A3A3] hover:text-[#25D366] hover:border-[#25D366]/50 hover:bg-[#1E1E1E] hover:scale-110 transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  title="Instagram"
                  className="w-9 h-9 rounded-full bg-[#161616] border border-[#2A2A2A] flex items-center justify-center text-[#A3A3A3] hover:text-[#E4405F] hover:border-[#E4405F]/50 hover:bg-[#1E1E1E] hover:scale-110 transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  title="Facebook"
                  className="w-9 h-9 rounded-full bg-[#161616] border border-[#2A2A2A] flex items-center justify-center text-[#A3A3A3] hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:bg-[#1E1E1E] hover:scale-110 transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Navigation and Contact Sections (Mobile accordion, Desktop grid columns) */}
            <FooterSections
              quickLinks={QUICK_LINKS}
              categoryLinks={categoryLinks}
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
        <div className="">
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
