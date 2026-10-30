import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { BulkQuoteProvider } from '@/components/common/BulkQuotationDrawer'
import FloatingWhatsAppButton from '@/components/common/FloatingWhatsAppButton'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let categories: Category[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('categories')
      .select('*, image:media_assets(*)')
      .eq('is_enabled', true)
      .order('position', { ascending: true })
    if (data && data.length > 0) {
      categories = data
    }
  } catch (error) {
    console.error('Failed to load categories in PublicLayout:', error)
  }

  return (
    <BulkQuoteProvider>
      <Navbar initialCategories={categories} />
      <main>
        {children}
      </main>
      <FloatingWhatsAppButton />
      <Footer />
    </BulkQuoteProvider>
  )
}

