import type { Metadata } from 'next'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Signature Uniforms by Hari',
  description: 'Terms and conditions for bulk uniform manufacturing and supply by Signature Uniforms.',
}

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-16 px-4 sm:px-6 md:px-8 lg:px-10 w-full">
      <div className="w-full space-y-8">
        <div>
          <span className="text-xs font-bold text-[#FFD700] uppercase tracking-wider block mb-1">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-normal text-gray-900" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
            Terms & Conditions of Supply
          </h1>
          <p className="text-xs text-gray-400 mt-1">Last updated: October 2026</p>
        </div>

        <div className="prose prose-sm text-gray-600 max-w-none space-y-6 leading-relaxed">
          <p>
            Welcome to <strong>Signature Uniforms by Hari</strong>. By engaging our manufacturing services, placing bulk institutional orders, or requesting customized samples, you agree to comply with and be bound by the following terms and commercial guidelines.
          </p>

          <h2 className="text-lg font-bold text-gray-900">1. Quotations and Minimum Order Quantities (MOQ)</h2>
          <p>
            All quotations issued by Signature Uniforms are based on the fabric qualities, GSM ratings, and quantities requested. Standard MOQ for custom dyed and embroidered uniforms is 50 pieces per design unless mutually agreed otherwise. Quotations remain valid for 30 calendar days from issuance.
          </p>

          <h2 className="text-lg font-bold text-gray-900">2. Sample Approval & Production Sign-Off</h2>
          <p>
            Before commencing bulk fabrication, a physical prototype sample featuring exact fabric weave, color tone, collar construction, and computerized logo embroidery is provided for management sign-off. Bulk manufacturing strictly proceeds in accordance with the signed approval sample.
          </p>

          <h2 className="text-lg font-bold text-gray-900">3. Sizing & On-Campus Measurement Camps</h2>
          <p>
            For school and collegiate contracts, our master tailors can conduct structured on-campus measurement sizing sessions. Alterations arising from natural student growth post-measurement follow standard manufacturing tolerances.
          </p>

          <h2 className="text-lg font-bold text-gray-900">4. Delivery Timelines & Logistics</h2>
          <p>
            We pride ourselves on meeting academic opening term dates. Production schedules are locked upon sample sign-off and advance deposit. Goods are dispatched class-segregated and properly packed for distribution.
          </p>

          <h2 className="text-lg font-bold text-gray-900">5. Contact Information</h2>
          <p>
            For inquiries regarding contracts or ongoing production batches:
          </p>
          <p className="text-sm font-semibold text-gray-900">
            Signature Uniforms by Hari<br />
            Phone: {BRAND.phone}<br />
            Email: {BRAND.email}<br />
            Location: {BRAND.address}
          </p>
        </div>
      </div>
    </div>
  )
}
