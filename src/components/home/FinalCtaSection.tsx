'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/constants'

export default function FinalCtaSection() {
  const waUrl = buildWhatsAppUrl('Hello, I would like to discuss a bulk uniform order.')

  return (
    <section className="py-24 lg:py-32 bg-black w-full" aria-labelledby="final-cta-heading">
      <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
        >
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#FFD700] block mb-5">Get Started</span>
          <h2
            id="final-cta-heading"
            className="text-white mb-5 leading-tight mx-auto max-w-2xl font-display text-3xl sm:text-4xl lg:text-5xl font-normal"
            style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
          >
            Planning Your Next Uniform Order?
          </h2>
          <p className="text-white/65 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Tell us what you need. We will help you plan the right uniform solution — from fabric selection to institution-wide delivery.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/enquiry/school-bulk"
              className="btn-gold-sweep inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-semibold text-sm rounded-none tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_4px_16px_rgba(255,215,0,0.3)] cursor-pointer"
              id="final-cta-primary"
            >
              Request Bulk Pricing
              <ArrowRight size={17} />
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 text-white font-semibold text-sm rounded-2xl border border-white/60 hover:border-white tracking-wide transition-all duration-200 cursor-pointer"
              id="final-cta-whatsapp"
            >
              <MessageCircle size={17} />
              WhatsApp Enquiry
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
