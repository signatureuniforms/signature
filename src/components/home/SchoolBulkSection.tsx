'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, MessageCircle, Loader2 } from 'lucide-react'
import { schoolBulkEnquirySchema, type SchoolBulkEnquiryInput } from '@/lib/validations'
import { buildBulkOrderWhatsAppMessage, buildWhatsAppUrl } from '@/lib/constants'

const SELLING_POINTS = [
  { title: 'Bulk Order Pricing', desc: 'Competitive wholesale rates for institutions of all sizes.' },
  { title: 'Consistent Quality', desc: 'Uniform standards maintained across every batch and delivery.' },
  { title: 'Institution-Wide Supply', desc: 'Complete uniform solutions covering all student categories.' },
]

export default function SchoolBulkSection() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [enquiryRef, setEnquiryRef] = useState<string | null>(null)
  const [waData, setWaData] = useState<SchoolBulkEnquiryInput | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SchoolBulkEnquiryInput>({
    resolver: zodResolver(schoolBulkEnquirySchema) as any,
  })

  const onSubmit = async (data: SchoolBulkEnquiryInput) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/enquiries/school-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok && result.reference) {
        setEnquiryRef(result.reference)
        setWaData(data)
        setSubmitted(true)
        reset()
      }
    } catch {
      // Error handled below
    } finally {
      setSubmitting(false)
    }
  }

  const handleWhatsAppFollowUp = () => {
    if (!waData) return
    const msg = buildBulkOrderWhatsAppMessage({
      institutionName: waData.institution_name,
      contactName: waData.contact_name,
      phone: waData.phone,
      location: waData.location,
      quantity: waData.quantity,
      requirements: waData.requirements,
      timeline: waData.preferred_timeline,
      reference: enquiryRef ?? undefined,
    })
    window.open(buildWhatsAppUrl(msg), '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="py-20 lg:py-28 bg-black w-full" aria-labelledby="school-bulk-heading">
      <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Left — info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#FFD700] mb-3 block">
                Priority Service
              </span>
              <h2
                id="school-bulk-heading"
                className="text-white mb-5 leading-tight font-display text-3xl sm:text-4xl lg:text-5xl font-normal"
                style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
              >
                School Uniforms,<br />Supplied at Scale.
              </h2>
              <div className="w-12 h-[2px] bg-[#FFD700] border-0 mb-6" />
              <p className="text-white/70 text-base leading-relaxed mb-10 max-w-md">
                Reliable uniform solutions for schools, with consistent quality, bulk pricing, and dependable supply — for institutions of all sizes.
              </p>
            </motion.div>

            <motion.div
              className="space-y-6 mb-10"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {SELLING_POINTS.map((pt, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold"
                    style={{ backgroundColor: '#FFD700' }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {pt.title}
                    </h3>
                    <p className="text-white/55 text-sm leading-relaxed">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="bg-white rounded-3xl p-8 lg:p-10">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#FFD700' }} />
                    <h3 className="text-xl font-semibold mb-2 font-display">
                      Enquiry Submitted
                    </h3>
                    {enquiryRef && (
                      <p className="text-sm text-gray-500 mb-1">
                        Reference: <span className="font-semibold text-black">{enquiryRef}</span>
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mb-6">
                      We have received your school uniform enquiry. Our team will be in touch soon.
                    </p>
                    <button
                      onClick={handleWhatsAppFollowUp}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold text-sm rounded-2xl tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_4px_16px_rgba(255,215,0,0.3)] cursor-pointer mb-3"
                      id="school-bulk-whatsapp-followup"
                    >
                      <MessageCircle size={17} />
                      Continue on WhatsApp
                    </button>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      Submit another enquiry
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                    noValidate
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    id="school-bulk-enquiry-form"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-1 font-display text-black">
                        Request a School Quotation
                      </h3>
                      <p className="text-sm text-gray-500">Fill in your details and we will get back to you.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide" htmlFor="institution_name">
                          Institution Name *
                        </label>
                        <input
                          {...register('institution_name')}
                          id="institution_name"
                          className={`w-full px-4 py-3 bg-white text-black border rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-all ${errors.institution_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:border-[#FFD700] focus:ring-[#FFD700]'
                            }`}
                          placeholder="School name"
                          autoComplete="organization"
                        />
                        {errors.institution_name && (
                          <p className="text-red-500 text-xs mt-1">{errors.institution_name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide" htmlFor="bulk_contact_name">
                          Contact Person *
                        </label>
                        <input
                          {...register('contact_name')}
                          id="bulk_contact_name"
                          className={`w-full px-4 py-3 bg-white text-black border rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-all ${errors.contact_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:border-[#FFD700] focus:ring-[#FFD700]'
                            }`}
                          placeholder="Your name"
                          autoComplete="name"
                        />
                        {errors.contact_name && (
                          <p className="text-red-500 text-xs mt-1">{errors.contact_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide" htmlFor="bulk_phone">
                          Phone Number *
                        </label>
                        <input
                          {...register('phone')}
                          id="bulk_phone"
                          type="tel"
                          className={`w-full px-4 py-3 bg-white text-black border rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-all ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:border-[#FFD700] focus:ring-[#FFD700]'
                            }`}
                          placeholder="Your phone"
                          autoComplete="tel"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide" htmlFor="bulk_email">
                          Email Address
                        </label>
                        <input
                          {...register('email')}
                          id="bulk_email"
                          type="email"
                          className={`w-full px-4 py-3 bg-white text-black border rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:border-[#FFD700] focus:ring-[#FFD700]'
                            }`}
                          placeholder="Optional"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide" htmlFor="bulk_location">
                          School Location *
                        </label>
                        <input
                          {...register('location')}
                          id="bulk_location"
                          className={`w-full px-4 py-3 bg-white text-black border rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-all ${errors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:border-[#FFD700] focus:ring-[#FFD700]'
                            }`}
                          placeholder="City / District"
                        />
                        {errors.location && (
                          <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide" htmlFor="bulk_quantity">
                          Student Strength
                        </label>
                        <input
                          {...register('quantity')}
                          id="bulk_quantity"
                          type="number"
                          min="1"
                          className="w-full px-4 py-3 bg-white text-black border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all"
                          placeholder="Approx. count"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide" htmlFor="bulk_requirements">
                        Uniform Requirements
                      </label>
                      <textarea
                        {...register('requirements')}
                        id="bulk_requirements"
                        rows={3}
                        className="w-full px-4 py-3 bg-white text-black border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all resize-none"
                        placeholder="Describe the uniforms needed — types, classes, fabric preferences, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide" htmlFor="bulk_timeline">
                          Preferred Delivery Timeline
                        </label>
                        <input
                          {...register('preferred_timeline')}
                          id="bulk_timeline"
                          className="w-full px-4 py-3 bg-white text-black border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all"
                          placeholder="e.g. Within 2 months"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide" htmlFor="bulk_message">
                        Additional Message
                      </label>
                      <textarea
                        {...register('message')}
                        id="bulk_message"
                        rows={2}
                        className="w-full px-4 py-3 bg-white text-black border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all resize-none"
                        placeholder="Any other details or questions"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold text-sm rounded-2xl tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_4px_16px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      id="school-bulk-submit"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Request School Quotation
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
