import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Signature Uniforms by Hari',
  description: 'Terms and conditions for bulk uniform manufacturing and supply by Signature Uniforms.',
}

export default function TermsPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-16 px-4 sm:px-6 md:px-8 lg:px-10 w-full">
      <div className="max-w-4xl mx-auto bg-[#171717] border border-[#2A2A2A] rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-normal text-white" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
            Terms & Conditions of Supply
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">Last updated: October 2026</p>
        </div>

        <div className="text-[#A3A3A3] space-y-6 leading-relaxed text-sm">
          <p>
            Welcome to <strong className="text-white">Signature Uniforms by Hari</strong>. By engaging our manufacturing services, placing bulk institutional orders, or requesting customized samples, you agree to comply with and be bound by the following terms and commercial guidelines.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2 border-t border-[#2A2A2A]">1. Quotations and Minimum Order Quantities (MOQ)</h2>
          <p>
            All quotations issued by Signature Uniforms are based on the fabric qualities, GSM ratings, and quantities requested. Standard MOQ for custom dyed and embroidered uniforms is 50 pieces per design unless mutually agreed otherwise. Quotations remain valid for 30 calendar days from issuance.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2 border-t border-[#2A2A2A]">2. Sample Approval & Production Sign-Off</h2>
          <p>
            Before commencing bulk fabrication, a physical prototype sample featuring exact fabric weave, color tone, collar construction, and computerized logo embroidery is provided for management sign-off. Bulk manufacturing strictly proceeds in accordance with the signed approval sample.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2 border-t border-[#2A2A2A]">3. Sizing & On-Campus Measurement Camps</h2>
          <p>
            For school and collegiate contracts, our master tailors can conduct structured on-campus measurement sizing sessions. Alterations arising from natural student growth post-measurement follow standard manufacturing tolerances.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2 border-t border-[#2A2A2A]">4. Delivery Timelines & Logistics</h2>
          <p>
            We pride ourselves on meeting academic opening term dates. Production schedules are locked upon sample sign-off and advance deposit. Goods are dispatched class-segregated and properly packed for distribution.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2 border-t border-[#2A2A2A]">5. Contact Information</h2>
          <p>
            For inquiries regarding contracts or ongoing production batches:
          </p>
          <p className="text-sm text-white font-medium bg-[#0A0A0A] p-4 rounded-xl border border-[#2A2A2A] leading-relaxed">
            Signature Uniforms by Hari<br />
            Phone: <span className="text-[#D4AF37]">{BRAND.phone}</span><br />
            Email: <span className="text-[#D4AF37]">{BRAND.email}</span><br />
            Location: <span className="text-[#A3A3A3]">{BRAND.address}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
