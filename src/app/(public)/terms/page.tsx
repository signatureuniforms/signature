import type { Metadata } from 'next'
import { BRAND } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Signature Uniforms by Hari',
  description: 'Terms and conditions for bulk uniform manufacturing and supply by Signature Uniforms.',
}

export default function TermsPage() {
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
            Terms &amp; Conditions
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
            Welcome to <strong className="text-white font-semibold">Signature Uniforms by Hari</strong>. By engaging our manufacturing services, placing bulk institutional orders, or requesting customized samples, you agree to comply with and be bound by the following terms and commercial guidelines.
          </p>

          <div className="space-y-4 pt-6 border-t border-[#2A2A2A]/60">
            <h2
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Regular-Light', serif" }}
            >
              1. Quotations and Minimum Order Quantities (MOQ)
            </h2>
            <p>
              All quotations issued by Signature Uniforms are based on the fabric qualities, GSM ratings, and quantities requested. Standard MOQ for custom dyed and embroidered uniforms is 50 pieces per design unless mutually agreed otherwise. Quotations remain valid for 30 calendar days from issuance.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#2A2A2A]/60">
            <h2
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Regular-Light', serif" }}
            >
              2. Sample Approval &amp; Production Sign-Off
            </h2>
            <p>
              Before commencing bulk fabrication, a physical prototype sample featuring exact fabric weave, color tone, collar construction, and computerized logo embroidery is provided for management sign-off. Bulk manufacturing strictly proceeds in accordance with the signed approval sample.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#2A2A2A]/60">
            <h2
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Regular-Light', serif" }}
            >
              3. Sizing &amp; On-Campus Measurement Camps
            </h2>
            <p>
              For school and collegiate contracts, our master tailors can conduct structured on-campus measurement sizing sessions. Alterations arising from natural student growth post-measurement follow standard manufacturing tolerances.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#2A2A2A]/60">
            <h2
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Regular-Light', serif" }}
            >
              4. Delivery Timelines &amp; Logistics
            </h2>
            <p>
              We pride ourselves on meeting academic opening term dates. Production schedules are locked upon sample sign-off and advance deposit. Goods are dispatched class-segregated and properly packed for distribution.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#2A2A2A]/60">
            <h2
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Regular-Light', serif" }}
            >
              5. Contact Information
            </h2>
            <p>
              For inquiries regarding contracts, ongoing production batches, or supply agreements:
            </p>
            <div className="bg-[#141414] rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider block mb-1">Business Name</span>
                <p className="text-white text-sm font-medium">Signature Uniforms by Hari</p>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider block mb-1">Phone / WhatsApp</span>
                <a href={`tel:${BRAND.phone}`} className="text-white hover:text-[#D4AF37] text-sm font-medium transition-colors">
                  +91 {BRAND.phone}
                </a>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider block mb-1">Email</span>
                <a href={`mailto:${BRAND.email}`} className="text-white hover:text-[#D4AF37] text-sm break-all font-medium transition-colors">
                  {BRAND.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
