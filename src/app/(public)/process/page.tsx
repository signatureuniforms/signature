import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProcessSection from '@/components/process/ProcessSection'
import type { ProcessSectionContent, ProcessStep } from '@/types'

export const metadata: Metadata = {
  title: 'Our Process | Signature Uniforms by Hari',
  description:
    'Discover the step-by-step service workflow at Signature Uniforms by Hari — from design and fabric selection to final delivery of your premium corporate uniforms.',
}

export const revalidate = 60

async function getProcessPageData() {
  const supabase = await createClient()

  const [headerRes, stepsRes] = await Promise.allSettled([
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'process')
      .eq('section_key', 'header')
      .eq('is_published', true)
      .maybeSingle(),

    supabase
      .from('process_steps')
      .select('*')
      .eq('is_published', true)
      .order('position', { ascending: true }),
  ])

  return {
    header:
      headerRes.status === 'fulfilled' && headerRes.value.data
        ? (headerRes.value.data.content as ProcessSectionContent)
        : null,
    steps:
      stepsRes.status === 'fulfilled' && stepsRes.value.data
        ? (stepsRes.value.data as ProcessStep[])
        : [],
  }
}

export default async function ProcessPage() {
  const { header, steps } = await getProcessPageData()

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen pt-14 sm:pt-16 lg:pt-20 pb-16 sm:pb-24">
      <ProcessSection header={header} steps={steps} />
    </div>
  )
}
