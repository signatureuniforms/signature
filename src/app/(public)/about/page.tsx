import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AboutSection from '@/components/home/AboutSection'
import VisionMissionSection from '@/components/about/VisionMissionSection'
import TrustedBrandsSection from '@/components/home/TrustedBrandsSection'
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection'
import HomeContactSection from '@/components/home/HomeContactSection'
import type { AboutSectionContent, VisionMissionContent, TrustedBrandsContent, WhyChooseUsContent } from '@/types'

export const metadata: Metadata = {
  title: 'About Us | Signature Uniforms by Hari',
  description:
    'Learn about Signature Uniforms by Hari — premier uniform manufacturer and wholesale supplier for schools, colleges, corporate offices, and healthcare in Kerala.',
}

export const revalidate = 60

async function getAboutPageData() {
  const supabase = await createClient()

  const [aboutRes, vmRes, brandsRes, whyContentRes, whyRes, settingsRes] = await Promise.allSettled([
    // 1. About section content
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'about')
      .eq('is_published', true)
      .maybeSingle(),

    // 2. Vision & Mission section content (About page only)
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'about')
      .eq('section_key', 'vision_mission')
      .eq('is_published', true)
      .maybeSingle(),

    // 3. Trusted Brands
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'trusted_brands')
      .eq('is_published', true)
      .maybeSingle(),

    // 4. Why choose us section content & left-side image
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'why_choose_us')
      .eq('is_published', true)
      .maybeSingle(),

    // 5. Why choose us items
    supabase
      .from('why_choose_us_items')
      .select('*, image:media_assets(*)')
      .eq('is_published', true)
      .order('position', { ascending: true }),

    // 6. Site settings for contact info
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['phone', 'email', 'address', 'whatsapp_number', 'city', 'state', 'pincode', 'website']),
  ])

  const contactInfo: Record<string, string> = {}
  if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
    settingsRes.value.data.forEach((s: { key: string; value: string | null }) => {
      if (s.value) contactInfo[s.key] = s.value
    })
  }

  return {
    about:
      aboutRes.status === 'fulfilled' && aboutRes.value.data
        ? (aboutRes.value.data.content as AboutSectionContent)
        : null,
    visionMission:
      vmRes.status === 'fulfilled' && vmRes.value.data
        ? (vmRes.value.data.content as VisionMissionContent)
        : null,
    brands:
      brandsRes.status === 'fulfilled' && brandsRes.value.data
        ? (brandsRes.value.data.content as TrustedBrandsContent)
        : null,
    whyContent:
      whyContentRes.status === 'fulfilled' && whyContentRes.value.data
        ? (whyContentRes.value.data.content as WhyChooseUsContent)
        : null,
    whyItems: whyRes.status === 'fulfilled' ? (whyRes.value.data ?? []) : [],
    contactInfo,
  }
}

export default async function AboutPage() {
  const { about, visionMission, brands, whyContent, whyItems, contactInfo } = await getAboutPageData()

  return (
    <div className="bg-black text-white min-h-screen pt-14 sm:pt-16 lg:pt-20">
      {/* 1. About Section (Reused from Home page) */}
      <AboutSection data={about} showCta={false} />

      {/* 2. Vision & Mission Section (Directly at About section bottom, About page only) */}
      <VisionMissionSection data={visionMission} />

      {/* 3. Trusted Brands Section (Reused) */}
      <TrustedBrandsSection data={brands} />

      {/* 4. Why Choose Us Section (Reused) */}
      <WhyChooseUsSection items={whyItems} content={whyContent} />

      {/* 5. Contact Section (Reused from Home page) */}
      <HomeContactSection contactInfo={contactInfo} />
    </div>
  )
}
