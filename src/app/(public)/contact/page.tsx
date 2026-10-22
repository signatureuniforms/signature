import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
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
    <div className="bg-black text-white min-h-screen pt-16 sm:pt-20 lg:pt-24">
      <HomeContactSection contactInfo={contactInfo} />
    </div>
  )
}
