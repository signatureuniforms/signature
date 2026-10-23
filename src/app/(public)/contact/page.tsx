import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ContactCardsSection from '@/components/contact/ContactCardsSection'
import HomeContactSection from '@/components/home/HomeContactSection'

export const metadata: Metadata = {
  title: 'Contact Us | Signature Uniforms by Hari',
  description:
    'Get in touch with Signature Uniforms by Hari. Request a wholesale quote, institutional samples, or connect via WhatsApp for school, college, and corporate uniforms.',
}

export const revalidate = 60

async function getContactPageData() {
  const supabase = await createClient()

  const { data: settingsData } = await supabase
    .from('site_settings')
    .select('key, value')

  const contactInfo: Record<string, string> = {}
  if (settingsData) {
    settingsData.forEach((s: { key: string; value: string | null }) => {
      if (s.value) contactInfo[s.key] = s.value
    })
  }

  return { contactInfo }
}

export default async function ContactPage() {
  const { contactInfo } = await getContactPageData()

  return (
    <div style={{ backgroundImage: 'none' }} className="bg-[#0A0A0A] text-white min-h-screen no-bg-grid" data-page="contact-page">
      {/* 1. Brand Unit & Contact Cards */}
      <ContactCardsSection contactInfo={contactInfo} />

      {/* 2. Contact & Enquiry Form */}
      <HomeContactSection contactInfo={contactInfo} />
    </div>
  )
}
