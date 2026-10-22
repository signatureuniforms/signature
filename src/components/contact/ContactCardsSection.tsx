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
    <section className="w-full bg-[#0A0A0A] text-white pt-28 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Top Logo & Brand Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center text-center mb-10 sm:mb-14"
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

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {/* Card 1: Office */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-[#171717] rounded-none p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl group min-h-[220px]"
          >
            <div>
              <div className="flex items-center gap-2.5 text-white font-medium text-base mb-3.5">
                <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[#D4AF37] shrink-0 transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="tracking-wide">Office</span>
              </div>
              <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                {corporateAddress}
              </p>
            </div>

            <div className="pt-6 mt-auto">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white hover:text-[#D4AF37] transition-colors cursor-pointer group/link"
              >
                <span>Get Directions</span>
                <ArrowUpRight className="w-4 h-4 text-[#D4AF37] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* Card 2: Contact Sales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[#171717] rounded-none p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl group min-h-[220px]"
          >
            <div>
              <div className="flex items-center gap-2.5 text-white font-medium text-base mb-3.5">
                <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[#D4AF37] shrink-0 transition-colors">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span className="tracking-wide">Contact Sales</span>
              </div>

              <a
                href={`tel:${salesPhone.replace(/\s+/g, '')}`}
                className="text-xs sm:text-sm text-white hover:text-[#D4AF37] transition-colors block mb-3 font-mono font-medium"
              >
                {salesPhone.startsWith('+') ? salesPhone : `+91 ${salesPhone}`}
              </a>

              {/* Dedicated WhatsApp Pill Button (border-radius: none) */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0A0A0A] hover:bg-[#25D366] text-[#A3A3A3] hover:text-white rounded-none text-xs font-semibold transition-all mb-3 group/wa shadow-inner cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] group-hover/wa:text-white transition-colors" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="pt-2 mt-auto">
              <a
                href={`mailto:${salesEmail}`}
                className="text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors block truncate"
                title={salesEmail}
              >
                {salesEmail}
              </a>
            </div>
          </motion.div>

          {/* Card 3: Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#171717] rounded-none p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl group min-h-[220px]"
          >
            <div>
              <div className="flex items-center gap-2.5 text-white font-medium text-base mb-3.5">
                <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[#D4AF37] shrink-0 transition-colors">
                  <Headphones className="w-4 h-4" />
                </div>
                <span className="tracking-wide">Contact Support</span>
              </div>

              <a
                href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                className="text-xs sm:text-sm text-white hover:text-[#D4AF37] transition-colors block mb-3 font-mono font-medium"
              >
                {supportPhone.startsWith('+') ? supportPhone : `+91 ${supportPhone}`}
              </a>

              <a
                href={`mailto:${supportEmail}`}
                className="text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors block break-all mb-2"
                title={supportEmail}
              >
                {supportEmail}
              </a>
            </div>

            <div className="pt-2 mt-auto">
              <span className="text-[11px] text-[#A3A3A3]/60 block">
                {contactInfo.working_hours || 'Mon - Sat: 9:00 AM - 7:00 PM'}
              </span>
            </div>
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
