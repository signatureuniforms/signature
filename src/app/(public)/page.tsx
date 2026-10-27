import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import AboutSection from '@/components/home/AboutSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import TrustedBrandsSection from '@/components/home/TrustedBrandsSection'
import VideoBannerSection from '@/components/home/VideoBannerSection'
import CraftsmanshipSection from '@/components/home/CraftsmanshipSection'
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection'
import ProcessGetInTouchSection from '@/components/process/ProcessGetInTouchSection'
import FeaturedProductsSection from '@/components/home/FeaturedProductsSection'
import type { AboutSectionContent, TrustedBrandsContent, VideoBannerContent, CraftsmanshipContent, WhyChooseUsContent } from '@/types'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'Signature Uniforms by Hari | Premium Uniform Supplier Kerala',
  description:
    'Wholesale uniform manufacturer for schools, colleges, corporate offices, hospitals, and industries. Bulk orders, quality fabrics, institution-wide supply from Kodakara, Thrissur, Kerala.',
}

async function getHomePageData() {
  const supabase = await createClient()

  const [
    heroRes,
    aboutRes,
    categoriesRes,
    brandsRes,
    craftsmanshipRes,
    videoBannerRes,
    productsRes,
    whyContentRes,
    whyRes,
    settingsRes,
  ] = await Promise.allSettled([
    // Hero video
    supabase
      .from('hero_videos')
      .select(`
        *,
        desktop_asset:media_assets!desktop_asset_id(*),
        mobile_asset:media_assets!mobile_asset_id(*),
        poster_image:media_assets!poster_image_id(*),
        fallback_image:media_assets!fallback_image_id(*)
      `)
      .eq('is_active', true)
      .limit(1)
      .single(),

    // About section content
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'about')
      .eq('is_published', true)
      .maybeSingle(),

    // Categories
    supabase
      .from('categories')
      .select('*, image:media_assets(*)')
      .eq('is_enabled', true)
      .order('position', { ascending: true })
      .limit(12),

    // Trusted Brands
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'trusted_brands')
      .eq('is_published', true)
      .maybeSingle(),

    // Craftsmanship & Trust section (under Brands)
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'craftsmanship')
      .eq('is_published', true)
      .maybeSingle(),

    // Video Banner
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'video_banner')
      .eq('is_published', true)
      .maybeSingle(),

    // Featured products
    supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        media:product_media(*, asset:media_assets(*))
      `)
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('position', { ascending: true })
      .limit(8),

    // Why choose us section settings & left-side image
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'why_choose_us')
      .eq('is_published', true)
      .maybeSingle(),

    // Why choose us items
    supabase
      .from('why_choose_us_items')
      .select('*, image:media_assets(*)')
      .eq('is_published', true)
      .order('position', { ascending: true }),

    // Site settings for contact info
    supabase
      .from('site_settings')
      .select('key, value'),
  ])

  const contactInfo: Record<string, string> = {}
  if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
    settingsRes.value.data.forEach((s: { key: string; value: string | null }) => {
      if (s.value) contactInfo[s.key] = s.value
    })
  }

  return {
    hero: heroRes.status === 'fulfilled' ? heroRes.value.data : null,
    about:
      aboutRes.status === 'fulfilled' && aboutRes.value.data
        ? (aboutRes.value.data.content as AboutSectionContent)
        : null,
    categories: categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data ?? []) : [],
    brands:
      brandsRes.status === 'fulfilled' && brandsRes.value.data
        ? (brandsRes.value.data.content as TrustedBrandsContent)
        : null,
    craftsmanship:
      craftsmanshipRes.status === 'fulfilled' && craftsmanshipRes.value.data
        ? (craftsmanshipRes.value.data.content as CraftsmanshipContent)
        : null,
    videoBanner:
      videoBannerRes.status === 'fulfilled' && videoBannerRes.value.data
        ? (videoBannerRes.value.data.content as VideoBannerContent)
        : null,
    products: productsRes.status === 'fulfilled' ? (productsRes.value.data ?? []) : [],
    whyContent:
      whyContentRes.status === 'fulfilled' && whyContentRes.value.data
        ? (whyContentRes.value.data.content as WhyChooseUsContent)
        : null,
    whyItems: whyRes.status === 'fulfilled' ? (whyRes.value.data ?? []) : [],
    contactInfo,
  }
}

export default async function HomePage() {
  const { hero, about, categories, brands, craftsmanship, videoBanner, products, whyContent, whyItems, contactInfo } = await getHomePageData()

  return (
    <>
      {/* 1. Hero Video */}
      <HeroSection hero={hero} />

      {/* 2. About Section (Directly below Hero) */}
      <AboutSection data={about} />

      {/* 3. Main Uniform Categories */}
      <CategoriesSection categories={categories} />

      {/* 4. Trusted by Leading Brands (Directly below Categories) */}
      <TrustedBrandsSection data={brands} />

         {/* 6. Video Banner (Directly below Craftsmanship) */}
      <VideoBannerSection data={videoBanner} />

      {/* 5. Craftsmanship & Trust Section (Directly under Brands) */}
      <CraftsmanshipSection data={craftsmanship} />

   

      {/* 7. Why Choose Us (Black theme Accordion with left-side image) */}
      <WhyChooseUsSection items={whyItems} content={whyContent} />

      {/* 8. Contact Section (Directly at Why Choose Us bottom) */}
      <ProcessGetInTouchSection contactInfo={contactInfo} />

      {/* 9. Featured Products */}
      <FeaturedProductsSection products={products} />
    </>
  )
}
