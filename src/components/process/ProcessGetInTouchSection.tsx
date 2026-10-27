'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react'
import { BRAND, buildWhatsAppUrl } from '@/lib/constants'
import { useBulkQuote } from '@/components/common/BulkQuotationDrawer'

interface ProcessGetInTouchSectionProps {
  contactInfo?: Record<string, string> | null
  drawerCategory?: string
  whatsappMessage?: string
}

export default function ProcessGetInTouchSection({
  contactInfo,
  drawerCategory = 'Custom Uniform Design & Manufacturing',
  whatsappMessage = 'Hello Signature Uniforms, I would like to discuss our uniform requirements.',
}: ProcessGetInTouchSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()
  const { openDrawer } = useBulkQuote()

  const editorialEase = [0.22, 1, 0.36, 1] as const

  const rawPhone = (contactInfo?.phone_primary || contactInfo?.phone || BRAND.phone).replace(/\s+/g, '')
  const displayPhone = rawPhone.startsWith('+91')
    ? `+91 ${rawPhone.slice(3).trim()}`
    : rawPhone.startsWith('+')
      ? rawPhone
      : `+91 ${rawPhone}`
  const phoneTel = rawPhone.replace(/[^0-9+]/g, '')

  const email = contactInfo?.email_primary || contactInfo?.email || BRAND.email
  const whatsappNum = contactInfo?.whatsapp_number || BRAND.whatsappNumber

  const whatsappUrl = buildWhatsAppUrl(
    whatsappMessage,
    whatsappNum
  )

  return (
    <section
      ref={sectionRef}
      style={{ backgroundImage: 'none' }}
      className="py-14 sm:pt-20 sm:pb-28 bg-[#0A0A0A] w-full no-bg-grid"
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
            className="text-lg sm:text-2xl md:text-3xl font-serif tracking-[0.24em] text-white uppercase text-center mb-3 sm:mb-4"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            LET&apos;S CRAFT YOUR UNIFORMS
          </h2>
          <p className="text-[#A3A3A3] text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Ready to initiate your custom uniform order or have questions about our manufacturing process? Connect directly with our specialists.
          </p>
        </motion.div>

        {/* Minimal Touchpoints Grid (No borders) */}
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
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10"
        >
          {/* 1. Phone Call */}
          <a
            href={`tel:${phoneTel}`}
            className="group p-4 sm:p-5 rounded-2xl bg-[#141414]/90 transition-all duration-300 flex flex-col items-center text-center hover:bg-[#181818]"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[#D4AF37] mb-2.5 sm:mb-3 group-hover:scale-110 transition-all">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white group-hover:text-[#D4AF37] transition-colors mb-0.5">
              Call Us Directly
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#A3A3A3] font-mono">
              {displayPhone}
            </span>
          </a>

          {/* 2. WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 sm:p-5 rounded-2xl bg-[#141414]/90 transition-all duration-300 flex flex-col items-center text-center hover:bg-[#181818]"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[#25D366] mb-2.5 sm:mb-3 group-hover:scale-110 transition-all">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white group-hover:text-[#25D366] transition-colors mb-0.5">
              WhatsApp Chat
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#A3A3A3]">
              Instant Consultation
            </span>
          </a>

          {/* 3. Email (Bottom full width on mobile) */}
          <a
            href={`mailto:${email}`}
            className="col-span-2 sm:col-span-1 group p-4 sm:p-5 rounded-2xl bg-[#141414]/90 transition-all duration-300 flex flex-col items-center text-center hover:bg-[#181818]"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[#D4AF37] mb-2.5 sm:mb-3 group-hover:scale-110 transition-all">
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

        {/* Minimal Action CTA: Request a Custom Quote only */}
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
          className="flex items-center justify-center w-full"
        >
          <button
            type="button"
            onClick={() => openDrawer({ category: drawerCategory })}
            className="w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-[#D4AF37] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#E5C158] transition-all duration-300 shadow-lg shadow-[#D4AF37]/15 cursor-pointer"
          >
            <span>Request a Custom Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
