'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react'
import { BRAND, buildWhatsAppUrl } from '@/lib/constants'

interface ProcessGetInTouchSectionProps {
  contactInfo?: Record<string, string> | null
}

export default function ProcessGetInTouchSection({ contactInfo }: ProcessGetInTouchSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()

  const editorialEase = [0.22, 1, 0.36, 1] as const

  const phone = contactInfo?.phone_primary || contactInfo?.phone || BRAND.phone
  const email = contactInfo?.email_primary || contactInfo?.email || BRAND.email
  const whatsappNum = contactInfo?.whatsapp_number || BRAND.whatsappNumber

  const whatsappUrl = buildWhatsAppUrl(
    'Hello Signature Uniforms, I have reviewed your manufacturing process and would like to discuss our uniform requirements.',
    whatsappNum
  )

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-20 bg-[#0A0A0A] w-full border-t border-[#1C1C1C]"
      aria-labelledby="get-in-touch-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading with smooth editorial fade */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 24 }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : 0.75,
            ease: editorialEase,
          }}
          className="text-center mb-10 sm:mb-12"
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#D4AF37] block mb-2 font-medium">
            Get In Touch
          </span>
          <h2
            id="get-in-touch-heading"
            className="text-lg sm:text-2xl md:text-3xl font-serif tracking-[0.24em] text-white uppercase text-center"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            LET&apos;S CRAFT YOUR UNIFORMS
          </h2>
          <div className="w-12 h-[1.5px] bg-[#D4AF37] mx-auto mt-4 mb-4" />
          <p className="text-[#A3A3A3] text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Ready to initiate your custom uniform order or have questions about our manufacturing process? Connect directly with our specialists.
          </p>
        </motion.div>

        {/* Minimal Touchpoints Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : 0.75,
            delay: shouldReduceMotion ? 0 : 0.15,
            ease: editorialEase,
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {/* 1. Phone Call */}
          <a
            href={`tel:${phone}`}
            className="group p-5 rounded-2xl bg-[#141414]/90 border border-[#262626] hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col items-center text-center hover:bg-[#181818]"
          >
            <div className="w-11 h-11 rounded-full bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#D4AF37] mb-3 group-hover:scale-110 group-hover:border-[#D4AF37]/40 transition-all">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white group-hover:text-[#D4AF37] transition-colors mb-0.5">
              Call Us Directly
            </span>
            <span className="text-[11px] text-[#A3A3A3] font-mono">
              +91 {phone}
            </span>
          </a>

          {/* 2. WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-[#141414]/90 border border-[#262626] hover:border-[#25D366]/50 transition-all duration-300 flex flex-col items-center text-center hover:bg-[#181818]"
          >
            <div className="w-11 h-11 rounded-full bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#25D366] mb-3 group-hover:scale-110 group-hover:border-[#25D366]/40 transition-all">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white group-hover:text-[#25D366] transition-colors mb-0.5">
              WhatsApp Chat
            </span>
            <span className="text-[11px] text-[#A3A3A3]">
              Instant Consultation
            </span>
          </a>

          {/* 3. Email */}
          <a
            href={`mailto:${email}`}
            className="group p-5 rounded-2xl bg-[#141414]/90 border border-[#262626] hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col items-center text-center hover:bg-[#181818]"
          >
            <div className="w-11 h-11 rounded-full bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#D4AF37] mb-3 group-hover:scale-110 group-hover:border-[#D4AF37]/40 transition-all">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white group-hover:text-[#D4AF37] transition-colors mb-0.5">
              Email Consultation
            </span>
            <span className="text-[11px] text-[#A3A3A3] truncate max-w-full px-2">
              {email}
            </span>
          </a>
        </motion.div>

        {/* Minimal Action CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 15 }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : 0.75,
            delay: shouldReduceMotion ? 0 : 0.25,
            ease: editorialEase,
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#D4AF37] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#E5C158] transition-all duration-300 shadow-lg shadow-[#D4AF37]/10"
          >
            <span>Request a Custom Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#333333] hover:border-[#D4AF37] text-white hover:text-[#D4AF37] text-xs font-medium tracking-wider uppercase transition-all duration-300 bg-[#121212]"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Chat With Us</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
