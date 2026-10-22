import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy | Signature Uniforms by Hari',
  description: 'Privacy Policy for Signature Uniforms by Hari.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-16 px-4 sm:px-6 md:px-8 lg:px-10 w-full">
      <div className="max-w-4xl mx-auto bg-[#171717] border border-[#2A2A2A] rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-normal text-white" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
            Privacy Policy
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">Last updated: October 2026</p>
        </div>

        <div className="text-[#A3A3A3] space-y-6 leading-relaxed text-sm">
          <p>
            At <strong className="text-white">Signature Uniforms by Hari</strong> (accessible from <Link href="/" className="text-[#D4AF37] hover:text-[#E5C158] underline underline-offset-2">https://www.signatureuniforms.in</Link>), one of our main priorities is the privacy of our institutional visitors, school administrators, and wholesale clients. This Privacy Policy outlines the types of information that is collected and recorded by Signature Uniforms and how we use it.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2 border-t border-[#2A2A2A]">1. Information We Collect</h2>
          <p>
            When you submit a contact inquiry, request a school bulk uniform quote, or connect with us via WhatsApp, we collect information including:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#A3A3A3]">
            <li>Full Name and institutional designation (e.g., Principal, Administrator, Purchase Head).</li>
            <li>Contact Phone Number and WhatsApp contact number.</li>
            <li>Email address.</li>
            <li>Institution, school, or business name and delivery location.</li>
            <li>Estimated uniform quantities, size specifications, and crest embroidery details.</li>
          </ul>

          <h2 className="text-lg font-semibold text-white pt-2 border-t border-[#2A2A2A]">2. How We Use Your Information</h2>
          <p>We use the collected information exclusively to:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#A3A3A3]">
            <li>Process your uniform quotation requests and prepare tailored price proposals.</li>
            <li>Dispatch fabric swatches, physical shade cards, and customized embroidery samples.</li>
            <li>Coordinate on-campus sizing camps and delivery schedules.</li>
            <li>Communicate order status updates and dispatch tracking numbers.</li>
          </ul>

          <h2 className="text-lg font-semibold text-white pt-2 border-t border-[#2A2A2A]">3. Information Protection</h2>
          <p>
            We implement strict data security measures. We do not sell, trade, or rent personal or institutional information to third-party marketing companies. Data submitted through our forms is stored securely in our enterprise database infrastructure.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2 border-t border-[#2A2A2A]">4. Contact Us</h2>
          <p>
            If you have questions about our Privacy Policy or your data, please contact Hari directly at:
          </p>
          <p className="text-sm text-white font-medium bg-[#0A0A0A] p-4 rounded-xl border border-[#2A2A2A] leading-relaxed">
            Email: <span className="text-[#D4AF37]">{BRAND.email}</span><br />
            Phone: <span className="text-[#D4AF37]">{BRAND.phone}</span><br />
            Address: <span className="text-[#A3A3A3]">{BRAND.address}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
