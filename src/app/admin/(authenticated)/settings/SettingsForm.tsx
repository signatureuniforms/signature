'use client'

import { useState } from 'react'
import { Save, CheckCircle2, AlertCircle, Phone, Globe, MapPin, Loader2 } from 'lucide-react'

interface SettingsFormProps {
  initialSettings: Record<string, string>
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState<Record<string, string>>({
    site_name: initialSettings.site_name || initialSettings.business_name || 'Signature Uniforms by Hari',
    tagline: initialSettings.tagline || 'Premium Uniforms. Trusted Quality.',
    phone_primary: initialSettings.phone_primary || initialSettings.phone || '+919287342297',
    phone_secondary: initialSettings.phone_secondary || initialSettings.phone_primary || '+919287342297',
    whatsapp_number: initialSettings.whatsapp_number || '+919287342297',
    email_primary: initialSettings.email_primary || initialSettings.email || 'signature@gmail.com',
    factory_address: initialSettings.factory_address || initialSettings.address || 'SKM Road, Kodakara',
    city: initialSettings.city || 'Kodakara, Thrissur',
    state: initialSettings.state || 'Kerala',
    pincode: initialSettings.pincode || '680684',
    working_hours: initialSettings.working_hours || '9:00 AM - 7:00 PM',
    google_maps_url:
      initialSettings.google_maps_url ||
      'https://maps.google.com/?q=SKM+Road+Kodakara+Thrissur+Kerala',
    map_embed_url: initialSettings.map_embed_url || initialSettings.google_maps_embed || '',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      setMessage({ type: 'success', text: 'Settings and contact details saved successfully!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-6">
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
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
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
                placeholder="With country code e.g. 919842211516"
              />
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
              placeholder="e.g. Mon - Sat: 9:00 AM - 7:00 PM"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Google Maps Location Link (for Get Directions button)
            </label>
            <input
              type="url"
              value={form.google_maps_url}
              onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              placeholder="https://maps.google.com/?q=SKM+Road+Kodakara+Thrissur+Kerala"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Full Width Google Map Embed Link / URL
            </label>
            <textarea
              rows={2}
              value={form.map_embed_url}
              onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              placeholder="Paste Google Maps embed URL (https://www.google.com/maps/embed?...) or standard map link"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              This map will display in full width at the bottom of the contact location section. You can paste a Google Maps embed URL, standard share link, or iframe code.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-[#FFD700] font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-zinc-800 transition-colors shadow disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-[#FFD700]" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
