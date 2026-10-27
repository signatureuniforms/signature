'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  MessageCircle,
  Clock,
} from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/constants'

interface LinkItem {
  label: string
  href: string
}

interface FooterContactProps {
  phone: string
  secondaryPhone?: string | null
  whatsappNumber?: string | null
  email: string
  address: string
  mapsUrl: string
  workingHours?: string | null
}

interface FooterSectionsProps {
  quickLinks: LinkItem[]
  categoryLinks: LinkItem[]
  contact: FooterContactProps
}

export default function FooterSections({
  quickLinks,
  categoryLinks,
  contact,
}: FooterSectionsProps) {
  // Mobile accordion active section key: null | 'quick' | 'categories' | 'contact'
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key))
  }

  const { phone, secondaryPhone, whatsappNumber, email, address, mapsUrl, workingHours } = contact

  return (
    <>
      {/* ── MOBILE ACCORDION (Hidden on md and up) ────────────────────────── */}
      <div className="md:hidden col-span-1 mt-6 pt-1">
        {/* 1. Quick Links Accordion Item */}
        <div className="border-b border-[#2A2A2A]">
          <button
            type="button"
            onClick={() => toggleSection('quick')}
            className="w-full py-4 flex items-center justify-between text-left group cursor-pointer"
            aria-expanded={openSection === 'quick'}
          >
            <span className="text-xs font-semibold text-white group-hover:text-[#D4AF37] uppercase tracking-[0.2em] transition-colors">
              Quick Links
            </span>
            <ChevronDown
              size={16}
              className={`text-[#D4AF37] transition-transform duration-300 ${
                openSection === 'quick' ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {openSection === 'quick' && (
              <motion.div
                key="quick-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <ul className="space-y-3 pb-5 pt-1 pl-1">
                  {quickLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors duration-200 inline-flex items-center gap-1.5 group"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight
                          size={11}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. Uniform Categories Accordion Item (Only shown if categories available) */}
        {categoryLinks.length > 0 && (
          <div className="border-b border-[#2A2A2A]">
            <button
              type="button"
              onClick={() => toggleSection('categories')}
              className="w-full py-4 flex items-center justify-between text-left group cursor-pointer"
              aria-expanded={openSection === 'categories'}
            >
              <span className="text-xs font-semibold text-white group-hover:text-[#D4AF37] uppercase tracking-[0.2em] transition-colors">
                Uniform Categories
              </span>
              <ChevronDown
                size={16}
                className={`text-[#D4AF37] transition-transform duration-300 ${
                  openSection === 'categories' ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSection === 'categories' && (
                <motion.div
                  key="categories-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="space-y-3 pb-5 pt-1 pl-1">
                    {categoryLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors duration-200 inline-flex items-center gap-1.5 group"
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight
                            size={11}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 3. Contact Details Accordion Item */}
        <div className="border-b border-[#2A2A2A]">
          <button
            type="button"
            onClick={() => toggleSection('contact')}
            className="w-full py-4 flex items-center justify-between text-left group cursor-pointer"
            aria-expanded={openSection === 'contact'}
          >
            <span className="text-xs font-semibold text-white group-hover:text-[#D4AF37] uppercase tracking-[0.2em] transition-colors">
              Contact Details
            </span>
            <ChevronDown
              size={16}
              className={`text-[#D4AF37] transition-transform duration-300 ${
                openSection === 'contact' ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {openSection === 'contact' && (
              <motion.div
                key="contact-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <ul className="space-y-3.5 pb-5 pt-1 pl-1">
                  <li>
                    <a
                      href={`tel:${phone}`}
                      className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
                    >
                      <Phone size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                      <span>{phone.startsWith('+') ? phone : `(+91) ${phone}`}</span>
                    </a>
                  </li>
                  {secondaryPhone && secondaryPhone !== phone && (
                    <li>
                      <a
                        href={`tel:${secondaryPhone}`}
                        className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
                      >
                        <Phone size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                        <span>{secondaryPhone.startsWith('+') ? secondaryPhone : `(+91) ${secondaryPhone}`}</span>
                      </a>
                    </li>
                  )}
                  {whatsappNumber && (
                    <li>
                      <a
                        href={buildWhatsAppUrl('Hello, I would like to make an enquiry from your website.', whatsappNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
                      >
                        <MessageCircle size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                        <span>{whatsappNumber}</span>
                      </a>
                    </li>
                  )}
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors break-all"
                    >
                      <Mail size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                      <span>{email}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
                    >
                      <MapPin size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                      <span className="leading-relaxed">{address}</span>
                    </a>
                  </li>
                  {workingHours && (
                    <li className="flex items-start gap-2.5 text-xs text-[#A3A3A3]">
                      <Clock size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                      <span>{workingHours}</span>
                    </li>
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── DESKTOP GRID COLUMNS (Hidden on mobile, visible on md and up) ─── */}
      <div className="hidden md:contents">
        {/* Quick links */}
        <div className="lg:col-span-2">
          <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors duration-200 inline-flex items-center gap-1 group"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight
                    size={11}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Uniform Categories (Only shown if categories available) */}
        {categoryLinks.length > 0 && (
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] mb-4">
              Uniform Categories
            </h3>
            <ul className="space-y-2.5">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight
                      size={11}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact */}
        <div className="lg:col-span-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] mb-4">
            Contact Details
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href={`tel:${phone}`}
                className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
              >
                <Phone size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                <span>{phone.startsWith('+') ? phone : `(+91) ${phone}`}</span>
              </a>
            </li>
            {secondaryPhone && secondaryPhone !== phone && (
              <li>
                <a
                  href={`tel:${secondaryPhone}`}
                  className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
                >
                  <Phone size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                  <span>{secondaryPhone.startsWith('+') ? secondaryPhone : `(+91) ${secondaryPhone}`}</span>
                </a>
              </li>
            )}
            {whatsappNumber && (
              <li>
                <a
                  href={buildWhatsAppUrl('Hello, I would like to make an enquiry from your website.', whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
                >
                  <MessageCircle size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                  <span>{whatsappNumber}</span>
                </a>
              </li>
            )}
            <li>
              <a
                href={`mailto:${email}`}
                className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors break-all"
              >
                <Mail size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                <span>{email}</span>
              </a>
            </li>
            <li>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-xs text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
              >
                <MapPin size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                <span className="leading-relaxed">{address}</span>
              </a>
            </li>
            {workingHours && (
              <li className="flex items-start gap-2.5 text-xs text-[#A3A3A3]">
                <Clock size={13} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                <span>{workingHours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  )
}
