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

  const phone = contactInfo?.phone_primary || contactInfo?.phone || BRAND.phone
  const secondaryPhone = contactInfo?.phone_secondary
  const email = contactInfo?.email_primary || contactInfo?.email || BRAND.email

  // Seamlessly construct address from factory_address, city, state, pincode
  const addressParts: string[] = []
  if (contactInfo?.factory_address) addressParts.push(contactInfo.factory_address)
  if (contactInfo?.city && (!contactInfo?.factory_address || !contactInfo.factory_address.toLowerCase().includes(contactInfo.city.toLowerCase()))) {
    addressParts.push(contactInfo.city)
  }
  if (contactInfo?.state) addressParts.push(contactInfo.state)
  if (contactInfo?.pincode) addressParts.push(contactInfo.pincode)
  const formattedAddress = addressParts.join(', ')
  const address = formattedAddress || contactInfo?.address || BRAND.address

  const web = contactInfo?.website || 'www.signatureuniforms.in'
  const whatsappNumber = contactInfo?.whatsapp_number || BRAND.whatsappNumber
  const workingHours = contactInfo?.working_hours

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
      style={{ backgroundImage: 'none' }}
      className="relative w-full bg-[#0A0A0A] text-white py-12 lg:py-20 overflow-hidden no-bg-grid"
      aria-labelledby="home-contact-heading"
    >
      {/* Background Subtle Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Section Header: Styled identically to About Section */}
        <div className="mb-10 lg:mb-14 text-center flex flex-col items-center">
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
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4AF37] block mb-3 font-sans text-center"
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
            className="text-lg sm:text-xl md:text-2xl font-normal text-white uppercase leading-tight mb-2 font-serif tracking-[0.25em] text-center"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            CONTACT
          </motion.h2>
        </div>

        {/* Contact Form Container (Contact Info column removed as requested) */}
        <div className="w-full">
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
            className="w-full space-y-4"
          >
            {result && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={`p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 transition-all ${
                  result.type === 'success'
                    ? 'bg-[#141414] text-white border border-[#D4AF37]/35 shadow-[0_4px_24px_rgba(212,175,55,0.08)]'
                    : 'bg-[#141414] text-white border border-red-500/35 shadow-[0_4px_24px_rgba(239,68,68,0.08)]'
                }`}
                role="alert"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    result.type === 'success'
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25'
                      : 'bg-red-500/10 text-red-400 border border-red-500/25'
                  }`}
                >
                  {result.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-xs sm:text-sm tracking-wide ${
                      result.type === 'success' ? 'text-[#D4AF37]' : 'text-red-400'
                    }`}
                  >
                    {result.type === 'success' ? 'Enquiry Submitted Successfully' : 'Submission Failed'}
                  </p>
                  <p className="text-[#C4C4C4] text-xs sm:text-sm mt-1 leading-relaxed">
                    {result.text}
                  </p>
                </div>
              </motion.div>
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
                  className="w-full px-4 py-3.5 sm:py-4 bg-[#171717] hover:bg-[#1a1a1a] focus:bg-[#171717] rounded text-white placeholder:text-[#A3A3A3] text-base sm:text-sm font-sans transition-all duration-200 outline-none focus:outline-none"
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
                  className="w-full px-4 py-3.5 sm:py-4 bg-[#171717] hover:bg-[#1a1a1a] focus:bg-[#171717] rounded text-white placeholder:text-[#A3A3A3] text-base sm:text-sm font-sans transition-all duration-200 outline-none focus:outline-none"
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
                  className="w-full px-4 py-3.5 sm:py-4 bg-[#171717] hover:bg-[#1a1a1a] focus:bg-[#171717] rounded text-white placeholder:text-[#A3A3A3] text-base sm:text-sm font-sans transition-all duration-200 outline-none focus:outline-none resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-1 flex justify-center">
                <button
                  type="submit"
                  disabled={submitting}
                  id="contact-form-submit"
                  className="btn-gold-sweep inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#D4AF37] hover:bg-[#E5C158] active:scale-[0.99] text-[#0A0A0A] font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0A0A0A]" />}
                  <span>{submitting ? 'Sending...' : 'Send Enquiry'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
