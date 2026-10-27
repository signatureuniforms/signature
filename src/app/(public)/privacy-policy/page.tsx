import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy | Signature Uniforms by Hari',
  description: 'Privacy Policy for Signature Uniforms by Hari.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-24 w-full">
      {/* Header */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 text-center pb-12 sm:pb-16 border-b border-[#2A2A2A]/60">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-2.5 font-mono">
            Legal &amp; Compliance
          </span>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-white uppercase tracking-[0.18em] leading-tight text-center"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.18em' }}
          >
            Privacy Policy
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-3 font-mono tracking-wider">
            Last updated: October 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16">
        <div className="w-full max-w-5xl mx-auto space-y-10 text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
          <p className="text-base sm:text-lg text-white/90 leading-relaxed font-light">
            At <strong className="text-white font-semibold">Signature Uniforms by Hari</strong> (accessible from <Link href="/" className="text-[#D4AF37] hover:text-[#E5C158] underline underline-offset-4">https://www.signatureuniforms.in</Link>), one of our main priorities is the privacy of our institutional visitors, school administrators, and wholesale clients. This Privacy Policy outlines the types of information that is collected and recorded by Signature Uniforms and how we use it.
          </p>

          <div className="space-y-4 pt-6 border-t border-[#2A2A2A]/60">
            <h2
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Regular-Light', serif" }}
            >
              1. Information We Collect
            </h2>
            <p>
              When you submit a contact inquiry, request a school bulk uniform quote, or connect with us via WhatsApp, we collect information including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#A3A3A3]">
              <li>Full Name and institutional designation (e.g., Principal, Administrator, Purchase Head).</li>
              <li>Contact Phone Number and WhatsApp contact number.</li>
              <li>Email address.</li>
              <li>Institution, school, or business name and delivery location.</li>
              <li>Estimated uniform quantities, size specifications, and crest embroidery details.</li>
            </ul>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#2A2A2A]/60">
            <h2
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Regular-Light', serif" }}
            >
              2. How We Use Your Information
            </h2>
            <p>We use the collected information exclusively to:</p>
            <ul className="list-disc pl-6 space-y-2 text-[#A3A3A3]">
              <li>Process your uniform quotation requests and prepare tailored price proposals.</li>
              <li>Dispatch fabric swatches, physical shade cards, and customized embroidery samples.</li>
              <li>Coordinate on-campus sizing camps and delivery schedules.</li>
              <li>Communicate order status updates and dispatch tracking numbers.</li>
            </ul>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#2A2A2A]/60">
            <h2
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Regular-Light', serif" }}
            >
              3. Information Protection
            </h2>
            <p>
              We implement strict data security measures. We do not sell, trade, or rent personal or institutional information to third-party marketing companies. Data submitted through our forms is stored securely in our enterprise database infrastructure.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#2A2A2A]/60">
            <h2
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Regular-Light', serif" }}
            >
              4. Contact Us
            </h2>
            <p>
              If you have questions about our Privacy Policy or your data, please connect directly with our specialists:
            </p>
            <div className="bg-[#141414] rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider block mb-1">Email</span>
                <a href={`mailto:${BRAND.email}`} className="text-white hover:text-[#D4AF37] text-sm break-all font-medium transition-colors">
                  {BRAND.email}
                </a>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider block mb-1">Phone</span>
                <a href={`tel:${BRAND.phone}`} className="text-white hover:text-[#D4AF37] text-sm font-medium transition-colors">
                  +91 {BRAND.phone}
                </a>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider block mb-1">Address</span>
                <p className="text-white/80 text-sm leading-snug">
                  {BRAND.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
