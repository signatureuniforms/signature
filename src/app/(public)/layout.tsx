import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { BulkQuoteProvider } from '@/components/common/BulkQuotationDrawer'
import FloatingWhatsAppButton from '@/components/common/FloatingWhatsAppButton'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <BulkQuoteProvider>
      <Navbar />
      <main>
        {children}
      </main>
      <FloatingWhatsAppButton />
      <Footer />
    </BulkQuoteProvider>
  )
}
