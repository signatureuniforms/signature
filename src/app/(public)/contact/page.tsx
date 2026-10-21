'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { BRAND, buildWhatsAppUrl } from '@/lib/constants'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    institution_name: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/enquiries/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry')
      }

      setResult({
        success: true,
        message: `Thank you! Your enquiry has been received (Ref: ${data.reference_no}). Hari or our sales team will contact you shortly.`,
      })
      setForm({ name: '', phone: '', email: '', institution_name: '', message: '' })
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Something went wrong. Please connect with us directly via WhatsApp.',
      })
    } finally {
      setLoading(false)
    }
  }

  const waUrl = buildWhatsAppUrl('Hello Hari, I am reaching out through the Signature Uniforms website to discuss a uniform order.')

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-black text-white pt-28 pb-16 px-6 sm:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-[#FFD700] font-semibold text-xs uppercase tracking-widest block">
            Direct Line To Hari & Team
          </span>
          <h1 className="text-3xl sm:text-5xl font-normal tracking-tight" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
            Get In Touch
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
            Discuss customized pattern samples, request institutional proposals, or plan a visit to our Tirupur textile manufacturing facility.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details Left */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                Factory & Headquarters
              </span>
              <h2 className="text-2xl font-normal text-gray-900" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
                Signature Uniforms by Hari
              </h2>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                We supply premier educational institutions and industrial enterprises throughout India with prompt fulfillment from our manufacturing center.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Instant WhatsApp Discussion
                  </span>
                  <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                    Chat Directly With Hari
                  </span>
                  <span className="text-xs text-gray-500">Fastest reply for quotations & samples</span>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-black text-[#FFD700] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Telephone
                  </span>
                  <a href={`tel:${BRAND.phone}`} className="text-sm font-semibold text-gray-900 hover:underline block mt-0.5">
                    {BRAND.phone}
                  </a>
                  <span className="text-xs text-gray-400">Available Mon–Sat 9AM–7:30PM</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-black text-[#FFD700] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Email Inquiries
                  </span>
                  <a href={`mailto:${BRAND.email}`} className="text-sm font-semibold text-gray-900 hover:underline block mt-0.5">
                    {BRAND.email}
                  </a>
                  <span className="text-xs text-gray-400">Official RFPs and institutional tenders</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-black text-[#FFD700] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Facility Address
                  </span>
                  <p className="text-sm text-gray-900 font-medium mt-0.5">
                    {BRAND.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Right */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-normal text-gray-900 mb-1" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
              Send a Direct Message
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Fill in your specifications below and our manufacturing representative will reply within a few hours.
            </p>

            {result && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 text-xs mb-6 ${
                  result.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{result.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98422 11516"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="rajesh@schoolname.edu"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    School / Organization Name
                  </label>
                  <input
                    type="text"
                    value={form.institution_name}
                    onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                    placeholder="e.g. St. Jude's Matriculation School"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Uniform Details / Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about the uniform type, estimated quantity, preferred fabrics, or any deadline..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-black hover:bg-zinc-800 text-[#FFD700] font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending Details...' : 'Submit Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
