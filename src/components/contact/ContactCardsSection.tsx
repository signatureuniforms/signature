'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Building2, PhoneCall, Headphones, MessageCircle, ArrowUpRight } from 'lucide-react'
import { BRAND, buildWhatsAppUrl } from '@/lib/constants'

interface ContactCardsSectionProps {
  contactInfo?: Record<string, string>
}

export default function ContactCardsSection({ contactInfo = {} }: ContactCardsSectionProps) {
  // Office address
  let cleanCorp = (contactInfo.office_address || contactInfo.corporate_address || contactInfo.address || '')
    .replace(/\btrisur\b[,.\s-]*/gi, '')
    .trim()
  const corporateAddress =
    cleanCorp.length > 10
      ? cleanCorp
      : 'SKM Road, Kodakara, Thrissur, Kerala - 680684'

  const mapsUrl =
    contactInfo.google_maps_url ||
    contactInfo.maps_url ||
    BRAND.mapsUrl ||
    `https://maps.google.com/?q=${encodeURIComponent(corporateAddress)}`

  // Contact numbers
  const salesPhone = contactInfo.phone_primary || contactInfo.phone || BRAND.phone
  const supportPhone = contactInfo.phone_secondary || contactInfo.phone_primary || contactInfo.phone || BRAND.phone

  // Emails
  const salesEmail = contactInfo.sales_email || contactInfo.email_primary || contactInfo.email || BRAND.email
  const supportEmail = contactInfo.support_email || contactInfo.email || BRAND.email

  // WhatsApp
  const waUrl = buildWhatsAppUrl(
    'Hello Signature Uniforms, I would like to inquire about bulk uniforms.'
  )

  const unitTitle =
    contactInfo.unit_name ||
    contactInfo.parent_company ||
    'Kottayils Signature Uniform by Hari'

  return (
    <section
      style={{ backgroundImage: 'none' }}
      className="w-full bg-[#0A0A0A] text-white pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 overflow-hidden no-bg-grid"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Top Logo & Brand Title (Hidden in mobile view as requested) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex flex-col items-center justify-center text-center mb-10 sm:mb-14"
        >
          {/* Real Logo */}
          <div className="flex justify-center items-center mb-4">
            <Image
              src="/logo/logo.png"
              alt="Kottayils Signature Uniform by Hari"
              width={260}
              height={90}
              priority
              className="h-14 sm:h-16 md:h-20 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Unit / Company Heading */}
          <h1
            className="text-center font-serif text-sm sm:text-base md:text-lg tracking-[0.24em] text-white uppercase font-normal max-w-xl leading-relaxed"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            {unitTitle}
          </h1>
        </motion.div>

        {/* 2-Column Editorial Contact & Address Section (Centered, No Boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-16 pt-4 pb-8 sm:pb-12 max-w-4xl mx-auto">
          {/* LEFT SIDE: Contact Details ("WANT TO TALK?" & "SOCIAL MEDIA") */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center text-center space-y-10"
          >
            {/* WANT TO TALK? */}
            <div className="flex flex-col items-start text-center w-full">
              <h2
                className="text-base sm:text-lg md:text-xl font-serif tracking-[0.2em] text-white uppercase font-bold mb-4 text-center"
                style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.2em' }}
              >
                Want to Talk?
              </h2>

              <div className="space-y-2.5 flex flex-col items-center">
                <a
                  href={`tel:${salesPhone.replace(/\s+/g, '')}`}
                  className="text-2xl sm:text-3xl md:text-4xl font-serif text-white hover:text-[#D4AF37] transition-colors block font-normal tracking-wide leading-tight text-center"
                  style={{ fontFamily: "'Regular-Light', serif" }}
                >
                  {salesPhone.startsWith('+') ? salesPhone : `+91 ${salesPhone}`}
                </a>

                {supportPhone && supportPhone !== salesPhone && (
                  <a
                    href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                    className="text-2xl sm:text-3xl md:text-4xl font-serif text-white hover:text-[#D4AF37] transition-colors block font-normal tracking-wide leading-tight text-center"
                    style={{ fontFamily: "'Regular-Light', serif" }}
                  >
                    {supportPhone.startsWith('+') ? supportPhone : `+91 ${supportPhone}`}
                  </a>
                )}
              </div>

              {/* Email & WhatsApp Link */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3.5 text-xs sm:text-sm text-[#A3A3A3]">
                <a
                  href={`mailto:${salesEmail}`}
                  className="hover:text-[#D4AF37] transition-colors underline-offset-4 hover:underline"
                >
                  {salesEmail}
                </a>
                <span className="text-[#333]">•</span>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#25D366] hover:text-[#32E675] font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>

            {/* SOCIAL MEDIA */}
            <div className="flex flex-col items-start text-center w-full pt-1">
              <h2
                className="text-base sm:text-lg md:text-xl font-serif tracking-[0.2em] text-white uppercase font-bold mb-4 text-center"
                style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.2em' }}
              >
                Social Media
              </h2>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-sm text-[#A3A3A3]">
                <a
                  href={contactInfo.instagram_url || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors uppercase tracking-wider text-xs font-medium"
                >
                  Instagram
                </a>
                <span className="text-[#333]">/</span>
                <a
                  href={contactInfo.facebook_url || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors uppercase tracking-wider text-xs font-medium"
                >
                  Facebook
                </a>
                <span className="text-[#333]">/</span>
                <a
                  href={contactInfo.linkedin_url || 'https://linkedin.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors uppercase tracking-wider text-xs font-medium"
                >
                  LinkedIn
                </a>
                <span className="text-[#333]">/</span>
                <a
                  href={contactInfo.whatsapp_url || waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors uppercase tracking-wider text-xs font-medium"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="flex flex-col items-start text-center w-full">
              <h2
                className="text-base sm:text-lg md:text-xl font-serif tracking-[0.2em] text-white uppercase font-bold mb-4 text-center"
                style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.2em' }}
              >
                Address
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-neutral-300 font-light leading-relaxed whitespace-pre-line max-w-sm text-center">
                {corporateAddress}
              </p>
            </div>


            {/* {contactInfo.working_hours && (
              <div className="pt-4 flex flex-col items-start text-start w-full max-w-xs">
                <span className="text-xs uppercase tracking-wider text-[#737373] block mb-1">
                  Working Hours
                </span>
                <p className="text-sm text-neutral-400 font-light text-start">
                  {contactInfo.working_hours}
                </p>
              </div>
            )} */}
          </motion.div>
        </div>
      </div>

      {/* 100% Edge-to-Edge Full-Width Location Map */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mt-12 sm:mt-16 w-full"
      >
        <div className="relative w-full h-[420px] sm:h-[500px] md:h-[560px] overflow-hidden bg-[#171717] shadow-2xl">
          {/* Embedded Google Map */}
          <iframe
            src={resolveMapEmbedUrl(contactInfo.map_embed_url || contactInfo.google_maps_embed, corporateAddress)}
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.1) brightness(0.95)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Kottayils Signature Uniform by Hari Location Map"
            className="w-full h-full"
          />

          {/* Floating Location Directions Pill */}
          <div className="absolute bottom-6 left-4 sm:left-8 md:left-12 lg:left-16 z-10 bg-[#0A0A0A]/95 backdrop-blur-md p-4 sm:p-5 rounded-none shadow-2xl max-w-sm flex items-start justify-between gap-4 border border-[#2A2A2A]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] block mb-1">
                Our Location
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                {corporateAddress}
              </p>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2.5 rounded-none bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-bold transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
              aria-label="Open in Google Maps"
              title="Get Directions on Google Maps"
            >
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function resolveMapEmbedUrl(rawEmbedUrl?: string, address?: string): string {
  if (rawEmbedUrl && rawEmbedUrl.trim()) {
    const trimmed = rawEmbedUrl.trim()
    // Extract src if admin pasted full <iframe> embed tag
    if (trimmed.includes('<iframe')) {
      const match = trimmed.match(/src=["']([^"']+)["']/)
      if (match && match[1]) return match[1]
    }
    // If it's already an embed URL
    if (trimmed.includes('google.com/maps/embed')) {
      return trimmed
    }
    // If it's a URL with a query parameter
    try {
      if (trimmed.includes('q=')) {
        const url = new URL(trimmed)
        const q = url.searchParams.get('q')
        if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
      }
    } catch {}
    return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
  }

  // Fallback using address or default location
  const query = address || 'SKM Road, Kodakara, Thrissur, Kerala - 680684'
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
}
