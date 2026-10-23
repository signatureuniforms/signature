'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle, Clock, Globe, Save, CheckCircle2, AlertCircle, ArrowLeft, ExternalLink, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BRAND } from '@/lib/constants'

export default function AdminContactSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    phone: '',
    phone_secondary: '',
    whatsapp_number: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    google_maps_url: '',
    working_hours: '',
    instagram_url: '',
    facebook_url: '',
    linkedin_url: '',
    whatsapp_url: '',
  })

  useEffect(() => {
    async function loadContactSettings() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('site_settings').select('*')
        if (data && data.length > 0) {
          const loaded: Record<string, string> = {}
          data.forEach(item => {
            loaded[item.key] = item.value || ''
          })
          setForm(prev => ({
            ...prev,
            phone: loaded.phone || loaded.phone_primary || prev.phone,
            phone_secondary: loaded.phone_secondary || prev.phone_secondary,
            whatsapp_number: loaded.whatsapp_number || prev.whatsapp_number,
            email: loaded.email || loaded.email_primary || prev.email,
            address: loaded.address || loaded.factory_address || prev.address,
            city: loaded.city || prev.city,
            state: loaded.state || prev.state,
            pincode: loaded.pincode || prev.pincode,
            google_maps_url: loaded.google_maps_url || prev.google_maps_url,
            working_hours: loaded.working_hours || prev.working_hours,
            instagram_url: loaded.instagram_url || '',
            facebook_url: loaded.facebook_url || '',
            linkedin_url: loaded.linkedin_url || '',
            whatsapp_url: loaded.whatsapp_url || '',
          }))
        }
      } catch (e: any) {
        console.warn('Failed to load contact settings:', e)
      } finally {
        setLoading(false)
      }
    }
    loadContactSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const entries = [
        { key: 'phone', value: form.phone, label: 'Primary Phone', category: 'contact' },
        { key: 'phone_primary', value: form.phone, label: 'Primary Phone', category: 'contact' },
        { key: 'phone_secondary', value: form.phone_secondary, label: 'Secondary Phone', category: 'contact' },
        { key: 'whatsapp_number', value: form.whatsapp_number, label: 'WhatsApp Number', category: 'contact' },
        { key: 'email', value: form.email, label: 'Email Address', category: 'contact' },
        { key: 'email_primary', value: form.email, label: 'Primary Email', category: 'contact' },
        { key: 'address', value: form.address, label: 'Factory Address', category: 'contact' },
        { key: 'city', value: form.city, label: 'City', category: 'contact' },
        { key: 'state', value: form.state, label: 'State', category: 'contact' },
        { key: 'pincode', value: form.pincode, label: 'Pincode', category: 'contact' },
        { key: 'google_maps_url', value: form.google_maps_url, label: 'Google Maps URL', category: 'contact' },
        { key: 'working_hours', value: form.working_hours, label: 'Working Hours', category: 'contact' },
        { key: 'instagram_url', value: form.instagram_url, label: 'Instagram URL', category: 'social' },
        { key: 'facebook_url', value: form.facebook_url, label: 'Facebook URL', category: 'social' },
        { key: 'linkedin_url', value: form.linkedin_url, label: 'LinkedIn URL', category: 'social' },
        { key: 'whatsapp_url', value: form.whatsapp_url, label: 'WhatsApp URL', category: 'social' },
      ]

      for (const item of entries) {
        await supabase
          .from('site_settings')
          .upsert(item, { onConflict: 'key' })
      }

      setMessage({ type: 'success', text: 'Contact & factory location details updated successfully!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Contact & Location Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your factory hotline, WhatsApp enquiry number, physical address, and hours.
            </p>
          </div>
        </div>

        <Link
          href="/contact"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          <span>View Public Contact Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Phone & WhatsApp Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <Phone className="w-5 h-5 text-gray-700" />
            <h2 className="font-bold text-gray-900 text-base">Phone & Communication Channels</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Primary Hotline Number *
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="9287344297"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:border-black outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Direct calls from navbar and header CTA</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Secondary / Factory Phone
              </label>
              <input
                type="text"
                value={form.phone_secondary}
                onChange={e => setForm(p => ({ ...p, phone_secondary: e.target.value }))}
                placeholder="+91 94433 11516"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:border-black outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Alternative contact for bulk inquiries</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                WhatsApp Business Number *
              </label>
              <input
                type="text"
                required
                value={form.whatsapp_number}
                onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))}
                placeholder="+919287342297"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:border-black outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Include country code with +91 for WhatsApp click-to-chat</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="signatureuniformshari@gmail.com"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Receives quotation requests and inquiries</p>
            </div>
          </div>
        </div>

        {/* Address & Working Hours Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <MapPin className="w-5 h-5 text-gray-700" />
            <h2 className="font-bold text-gray-900 text-base">Factory Location & Timings</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Factory Street Address *
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="SKM Road, Kodakara, Thrissur, Kerala"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City / District</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={form.state}
                onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={form.pincode}
                onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:border-black outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Google Maps Location Link
            </label>
            <input
              type="text"
              value={form.google_maps_url}
              onChange={e => setForm(p => ({ ...p, google_maps_url: e.target.value }))}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono text-xs focus:border-black outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Factory Operating Hours
            </label>
            <input
              type="text"
              value={form.working_hours}
              onChange={e => setForm(p => ({ ...p, working_hours: e.target.value }))}
              placeholder="Monday – Saturday: 9:00 AM – 7:30 PM"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
            />
          </div>
        </div>

        {/* Social Media & WhatsApp Links Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <Share2 className="w-5 h-5 text-gray-700" />
            <h2 className="font-bold text-gray-900 text-base">Social Media & Public Links</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Instagram Profile URL</label>
              <input
                type="url"
                value={form.instagram_url}
                onChange={e => setForm(p => ({ ...p, instagram_url: e.target.value }))}
                placeholder="https://instagram.com/your_handle"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Facebook Page URL</label>
              <input
                type="url"
                value={form.facebook_url}
                onChange={e => setForm(p => ({ ...p, facebook_url: e.target.value }))}
                placeholder="https://facebook.com/your_page"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn Company URL</label>
              <input
                type="url"
                value={form.linkedin_url}
                onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/company/your_company"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp Direct Link (Optional)</label>
              <input
                type="url"
                value={form.whatsapp_url}
                onChange={e => setForm(p => ({ ...p, whatsapp_url: e.target.value }))}
                placeholder="https://wa.me/919287342297"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-black outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Leave blank to use WhatsApp Number automatically</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#FFD700]" />
            <span>{saving ? 'Saving Changes...' : 'Save Contact Details'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
