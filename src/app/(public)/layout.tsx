import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { BulkQuoteProvider } from '@/components/common/BulkQuotationDrawer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <BulkQuoteProvider>
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </BulkQuoteProvider>
  )
}
