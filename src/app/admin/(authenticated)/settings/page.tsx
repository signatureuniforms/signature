'use client'

import { useState, useEffect } from 'react'
import { Save, CheckCircle2, AlertCircle, Phone, Mail, MapPin, Globe, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BRAND } from '@/lib/constants'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState<Record<string, string>>({
    site_name: '',
    tagline: '',
    phone_primary: '',
    phone_secondary: '',
    whatsapp_number: '',
    email_primary: '',
    factory_address: '',
    city: '',
    state: '',
    pincode: '',
    working_hours: '',
  })

  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('site_settings').select('*')
        if (data && data.length > 0) {
          const loaded: Record<string, string> = {}
          data.forEach(item => {
            loaded[item.key] = item.value || ''
          })
          setForm(prev => ({ ...prev, ...loaded }))
        }
      } catch (e) {
        console.warn('Settings load warning:', e)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      // Upsert key/value pairs
      const updates = Object.entries(form).map(([key, value]) => ({
        key,
        value: String(value),
        category: 'general',
        updated_at: new Date().toISOString(),
      }))

      for (const item of updates) {
        await supabase.from('site_settings').upsert(item, { onConflict: 'key' })
      }

      setMessage({ type: 'success', text: 'Site settings and contact details saved successfully!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
          General & Contact Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Update company profile, contact phone numbers, WhatsApp dispatch lines, and factory address.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
        {/* Brand Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#FFD700]" />
            Brand Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Company / Brand Name
              </label>
              <input
                type="text"
                required
                value={form.site_name}
                onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#FFD700]" />
            Direct Contact & WhatsApp
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Primary Phone Number
              </label>
              <input
                type="text"
                required
                value={form.phone_primary}
                onChange={(e) => setForm({ ...form, phone_primary: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Secondary Phone
              </label>
              <input
                type="text"
                value={form.phone_secondary}
                onChange={(e) => setForm({ ...form, phone_secondary: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                WhatsApp Dispatch Number
              </label>
              <input
                type="text"
                required
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">With country code e.g. 919842211516</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={form.email_primary}
              onChange={(e) => setForm({ ...form, email_primary: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Manufacturing Location */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FFD700]" />
            Factory & Showroom Location
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Street / Building Address
            </label>
            <textarea
              rows={2}
              value={form.factory_address}
              onChange={(e) => setForm({ ...form, factory_address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                City / Textile Hub
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Working Hours
            </label>
            <input
              type="text"
              value={form.working_hours}
              onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-[#FFD700] font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-zinc-800 transition-colors shadow"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
