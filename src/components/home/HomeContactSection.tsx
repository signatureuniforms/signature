'use client'

import { useState, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { BRAND, buildWhatsAppUrl } from '@/lib/constants'

interface HomeContactSectionProps {
  contactInfo?: Record<string, string> | null
}

export default function HomeContactSection({ contactInfo }: HomeContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()

  const [form, setForm] = useState({
    name: '',
    email: '',
    enquiry: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const editorialEase = [0.22, 1, 0.36, 1] as const

  const phone = contactInfo?.phone || BRAND.phone
  const email = contactInfo?.email || BRAND.email
  const address =
    contactInfo?.address ||
    (contactInfo?.city
      ? `${contactInfo.address || ''}, ${contactInfo.city}, ${contactInfo.state || ''} ${contactInfo.pincode || ''}`
      : BRAND.address)
  const web = contactInfo?.website || 'www.signatureuniforms.in'
  const whatsappNumber = contactInfo?.whatsapp_number || BRAND.whatsappNumber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setResult({ type: 'error', text: 'Please enter your name.' })
      return
    }
    if (!form.enquiry.trim()) {
      setResult({ type: 'error', text: 'Please enter your enquiry message.' })
      return
    }

    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/enquiries/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: form.name.trim(),
          email: form.email.trim() || undefined,
          message: form.enquiry.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit your enquiry.')
      }

      setResult({
        type: 'success',
        text: `Thank you! Your enquiry has been sent successfully${data.reference ? ` (Ref: ${data.reference})` : ''}. Our team will contact you shortly.`,
      })
      setForm({ name: '', email: '', enquiry: '' })
    } catch (err: any) {
      setResult({
        type: 'error',
        text: err.message || 'Unable to submit right now. Please connect directly via WhatsApp or Phone.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="home-contact-section"
      className="relative w-full bg-black text-white py-12 lg:py-20 overflow-hidden border-t border-neutral-900"
      aria-labelledby="home-contact-heading"
    >
      {/* Background Subtle Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Styled identically to About Section */}
        <div className="mb-10 lg:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.7,
              ease: editorialEase,
            }}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FFD700] block mb-3 font-sans"
          >
            Get In Touch
          </motion.span>

          <motion.h2
            id="home-contact-heading"
            initial={{ opacity: 0, y: 25 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 25 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.75,
              delay: shouldReduceMotion ? 0 : 0.1,
              ease: editorialEase,
            }}
            className="text-lg sm:text-xl md:text-2xl font-normal text-white uppercase leading-tight mb-4 font-serif tracking-[0.25em]"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            CONTACT
          </motion.h2>

          {/* Underline / Gold Accent Line matching About Section */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1, scaleX: 1 }
                : isInView
                ? { opacity: 1, scaleX: 1 }
                : { opacity: 0, scaleX: 0 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.6,
              delay: shouldReduceMotion ? 0 : 0.2,
              ease: editorialEase,
            }}
            style={{ transformOrigin: 'left' }}
            className="w-16 h-[2px] bg-[#FFD700]"
            aria-hidden="true"
          />
        </div>

        {/* 2-Column Main Layout: Left Form + Right Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
          {/* LEFT COLUMN: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.8,
              delay: shouldReduceMotion ? 0 : 0.25,
              ease: editorialEase,
            }}
            className="lg:col-span-8 space-y-4"
          >
            {result && (
              <div
                className={`p-4 rounded-lg text-xs sm:text-sm flex items-start gap-3 transition-all ${
                  result.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/40'
                    : 'bg-red-950/60 text-red-200 border border-red-500/40'
                }`}
                role="alert"
              >
                {result.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <span className="flex-1 leading-relaxed">{result.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name Input */}
              <div>
                <input
                  type="text"
                  name="name"
                  id="contact-form-name"
                  placeholder="your name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 sm:py-3.5 bg-neutral-900/60 hover:bg-neutral-900 focus:bg-neutral-900 border border-neutral-700/80 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] rounded text-white placeholder:text-neutral-500 text-xs sm:text-sm font-sans transition-all duration-200 outline-none"
                />
              </div>

              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="email"
                  id="contact-form-email"
                  placeholder="your e-mail"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 sm:py-3.5 bg-neutral-900/60 hover:bg-neutral-900 focus:bg-neutral-900 border border-neutral-700/80 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] rounded text-white placeholder:text-neutral-500 text-xs sm:text-sm font-sans transition-all duration-200 outline-none"
                />
              </div>

              {/* Message / Enquiry Textarea */}
              <div>
                <textarea
                  name="enquiry"
                  id="contact-form-enquiry"
                  rows={6}
                  placeholder="your enquiry"
                  value={form.enquiry}
                  onChange={(e) => setForm(prev => ({ ...prev, enquiry: e.target.value }))}
                  required
                  className="w-full px-4 py-3 sm:py-3.5 bg-neutral-900/60 hover:bg-neutral-900 focus:bg-neutral-900 border border-neutral-700/80 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] rounded text-white placeholder:text-neutral-500 text-xs sm:text-sm font-sans transition-all duration-200 outline-none resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  id="contact-form-submit"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#131b26] hover:bg-[#1f2b3c] active:scale-[0.99] border border-neutral-700/90 hover:border-[#FFD700]/70 text-white hover:text-[#FFD700] font-semibold text-xs uppercase tracking-widest rounded transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD700]" />}
                  <span>{submitting ? 'Sending...' : 'Sent Now'}</span>
                </button>
              </div>
            </form>
          </motion.div>

          {/* RIGHT COLUMN: Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.8,
              delay: shouldReduceMotion ? 0 : 0.35,
              ease: editorialEase,
            }}
            className="lg:col-span-4 space-y-6 pt-2"
          >
            {/* Contact Info Header */}
            <h3
              className="text-base sm:text-lg font-serif tracking-[0.18em] text-white uppercase leading-tight font-normal"
              style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.18em' }}
            >
              Contact Info
            </h3>

            {/* Address */}
            {address && (
              <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                {address}
              </p>
            )}

            {/* Detailed Info Lines matching the reference screenshot */}
            <div className="space-y-2.5 text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              {phone && (
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-normal">Phone :</span>
                  <a
                    href={`tel:${phone}`}
                    className="text-neutral-300 hover:text-[#FFD700] transition-colors"
                  >
                    {phone.startsWith('+') ? phone : `(+91) ${phone}`}
                  </a>
                </div>
              )}

              {whatsappNumber && (
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-normal">WhatsApp :</span>
                  <a
                    href={buildWhatsAppUrl('Hello Signature Uniforms, I would like to make an enquiry.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-300 hover:text-[#FFD700] transition-colors"
                  >
                    {whatsappNumber}
                  </a>
                </div>
              )}

              {email && (
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-normal">Email :</span>
                  <a
                    href={`mailto:${email}`}
                    className="text-neutral-300 hover:text-[#FFD700] transition-colors break-all"
                  >
                    {email}
                  </a>
                </div>
              )}

              {web && (
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-normal">Web :</span>
                  <a
                    href={web.startsWith('http') ? web : `https://${web}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-300 hover:text-[#FFD700] transition-colors"
                  >
                    {web.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
