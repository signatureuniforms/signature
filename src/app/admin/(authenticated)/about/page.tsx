'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Info,
  Target,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Compass,
  ArrowRight,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

function AdminAboutContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'vision-mission' ? 'vision-mission' : 'intro'

  const [activeTab, setActiveTab] = useState<'intro' | 'vision-mission'>(initialTab)
  const [loading, setLoading] = useState(true)

  // ─── 1. About Intro Form State (No mock data) ─────────────────────────────
  const [introForm, setIntroForm] = useState({
    subheading: '',
    heading: '',
    description: '',
    image_url: '',
    is_published: true,
  })
  const [introSaving, setIntroSaving] = useState(false)
  const [introMessage, setIntroMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ─── 2. Vision & Mission Form State (No mock data) ────────────────────────
  const [vmForm, setVmForm] = useState({
    section_subheading: '',
    section_heading: '',
    vision_heading: 'Our Vision',
    vision_description: '',
    mission_heading: 'Our Mission',
    mission_description: '',
    is_published: true,
  })
  const [vmSaving, setVmSaving] = useState(false)
  const [vmMessage, setVmMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Sync tab if URL param changes
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'vision-mission') {
      setActiveTab('vision-mission')
    } else if (tab === 'intro') {
      setActiveTab('intro')
    }
  }, [searchParams])

  // Load both sections
  useEffect(() => {
    async function loadContent() {
      setLoading(true)
      try {
        const supabase = createClient()

        // Fetch About Intro (page_key: 'home', section_key: 'about')
        const { data: aboutData } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', 'home')
          .eq('section_key', 'about')
          .maybeSingle()

        if (aboutData && aboutData.content) {
          const c = aboutData.content as Record<string, any>
          setIntroForm({
            subheading: typeof c.subheading === 'string' ? c.subheading : '',
            heading: typeof c.heading === 'string' ? c.heading : '',
            description: typeof c.description === 'string' ? c.description : '',
            image_url: typeof c.image_url === 'string' ? c.image_url : '',
            is_published: typeof aboutData.is_published === 'boolean' ? aboutData.is_published : true,
          })
        }

        // Fetch Vision & Mission (page_key: 'about', section_key: 'vision_mission')
        const { data: vmData } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', 'about')
          .eq('section_key', 'vision_mission')
          .maybeSingle()

        if (vmData && vmData.content) {
          const c = vmData.content as Record<string, any>
          setVmForm({
            section_subheading: typeof c.section_subheading === 'string' ? c.section_subheading : '',
            section_heading: typeof c.section_heading === 'string' ? c.section_heading : '',
            vision_heading: typeof c.vision_heading === 'string' ? c.vision_heading : 'Our Vision',
            vision_description: typeof c.vision_description === 'string' ? c.vision_description : '',
            mission_heading: typeof c.mission_heading === 'string' ? c.mission_heading : 'Our Mission',
            mission_description: typeof c.mission_description === 'string' ? c.mission_description : '',
            is_published: typeof vmData.is_published === 'boolean' ? vmData.is_published : true,
          })
        }
      } catch (err: any) {
        console.warn('Failed to load about content:', err)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [])

  // ─── Save About Intro ──────────────────────────────────────────────────────
  const handleIntroSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIntroSaving(true)
    setIntroMessage(null)

    try {
      const supabase = createClient()
      const payload = {
        page_key: 'home',
        section_key: 'about',
        content: {
          subheading: introForm.subheading.trim(),
          heading: introForm.heading.trim(),
          description: introForm.description.trim(),
          image_url: introForm.image_url.trim(),
        },
        is_published: introForm.is_published,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('page_content').upsert(payload, {
        onConflict: 'page_key,section_key',
      })

      if (error) throw error
      setIntroMessage({ type: 'success', text: 'About section saved successfully!' })
    } catch (err: any) {
      console.error('Error saving about section:', err)
      setIntroMessage({ type: 'error', text: err.message || 'Failed to save about section.' })
    } finally {
      setIntroSaving(false)
    }
  }

  // ─── Save Vision & Mission ────────────────────────────────────────────────
  const handleVmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setVmSaving(true)
    setVmMessage(null)

    try {
      const supabase = createClient()
      const payload = {
        page_key: 'about',
        section_key: 'vision_mission',
        content: {
          section_subheading: vmForm.section_subheading.trim(),
          section_heading: vmForm.section_heading.trim(),
          vision_heading: vmForm.vision_heading.trim(),
          vision_description: vmForm.vision_description.trim(),
          mission_heading: vmForm.mission_heading.trim(),
          mission_description: vmForm.mission_description.trim(),
        },
        is_published: vmForm.is_published,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('page_content').upsert(payload, {
        onConflict: 'page_key,section_key',
      })

      if (error) throw error
      setVmMessage({ type: 'success', text: 'Vision & Mission saved successfully! It will appear on the About page.' })
    } catch (err: any) {
      console.error('Error saving vision & mission:', err)
      setVmMessage({ type: 'error', text: err.message || 'Failed to save vision & mission.' })
    } finally {
      setVmSaving(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Info className="w-6 h-6 text-black" />
          About Page Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the About story intro and the Vision &amp; Mission sections displayed on the About page.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('intro')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'intro'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About Overview</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vision-mission')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'vision-mission'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Vision &amp; Mission</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Loading content...</p>
        </div>
      ) : activeTab === 'intro' ? (
        /* ═════════════════ TAB 1: ABOUT INTRO ═════════════════ */
        <div>
          {/* Status Message */}
          {introMessage && (
            <div
              className={`p-4 rounded-xl flex items-center gap-2 text-sm mb-6 ${
                introMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {introMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{introMessage.text}</span>
            </div>
          )}

          <div className="w-full">
            {/* Form */}
            <div className="w-full">
              <form onSubmit={handleIntroSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                  About Story &amp; Details
                </h2>

                {/* Subheading */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Subheading
                  </label>
                  <input
                    type="text"
                    value={introForm.subheading}
                    onChange={(e) => setIntroForm({ ...introForm, subheading: e.target.value })}
                    placeholder="e.g. Craftsmanship & Heritage"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Small gold uppercase label above the main heading.</p>
                </div>

                {/* Heading */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Heading *
                  </label>
                  <input
                    type="text"
                    value={introForm.heading}
                    onChange={(e) => setIntroForm({ ...introForm, heading: e.target.value })}
                    placeholder="e.g. Two Decades of Manufacturing Excellence"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={6}
                    value={introForm.description}
                    onChange={(e) => setIntroForm({ ...introForm, description: e.target.value })}
                    placeholder="Enter detailed description about the company, heritage, tailoring process, etc."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors leading-relaxed"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Section Image (Right Side)
                  </label>
                  <CloudinaryUpload
                    value={introForm.image_url}
                    onChange={(url) => setIntroForm({ ...introForm, image_url: url })}
                    folder="about"
                    label="Upload or Select About Image"
                  />

                  {introForm.image_url && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 border border-gray-200">
                          <img
                            src={introForm.image_url}
                            alt="About preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs text-gray-600 truncate max-w-[240px]">
                          {introForm.image_url}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIntroForm({ ...introForm, image_url: '' })}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Publish Toggle */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Published</span>
                    <span className="text-xs text-gray-500">Enable or disable rendering of the about intro.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={introForm.is_published}
                      onChange={(e) => setIntroForm({ ...introForm, is_published: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={introSaving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition-all shadow hover:shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{introSaving ? 'Saving...' : 'Save About Section'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ═════════════════ TAB 2: VISION & MISSION ═════════════════ */
        <div>
          {/* Status Message */}
          {vmMessage && (
            <div
              className={`p-4 rounded-xl flex items-center gap-2 text-sm mb-6 ${
                vmMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {vmMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{vmMessage.text}</span>
            </div>
          )}

          <div className="w-full">
            {/* Form */}
            <div className="w-full">
              <form onSubmit={handleVmSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900">
                    Vision &amp; Mission Details
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This section will appear exclusively on the About page right below the about story.
                  </p>
                </div>

                {/* Optional Section Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Section Subheading (Optional)
                    </label>
                    <input
                      type="text"
                      value={vmForm.section_subheading}
                      onChange={(e) => setVmForm({ ...vmForm, section_subheading: e.target.value })}
                      placeholder="e.g. Purpose &amp; Direction"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Section Heading (Optional)
                    </label>
                    <input
                      type="text"
                      value={vmForm.section_heading}
                      onChange={(e) => setVmForm({ ...vmForm, section_heading: e.target.value })}
                      placeholder="e.g. Our Guiding Principles"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                    />
                  </div>
                </div>

                {/* Vision Box */}
                <div className="p-5 rounded-2xl border border-amber-200/60 bg-amber-50/20 space-y-4">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Eye className="w-4 h-4 text-[#D4AF37]" />
                    <span>Vision Statement</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Vision Heading *
                    </label>
                    <input
                      type="text"
                      value={vmForm.vision_heading}
                      onChange={(e) => setVmForm({ ...vmForm, vision_heading: e.target.value })}
                      placeholder="e.g. Our Vision"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Vision Description *
                    </label>
                    <textarea
                      rows={5}
                      value={vmForm.vision_description}
                      onChange={(e) => setVmForm({ ...vmForm, vision_description: e.target.value })}
                      placeholder="Enter the long-term vision of Signature Uniforms..."
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white leading-relaxed"
                      required
                    />
                  </div>
                </div>

                {/* Mission Box */}
                <div className="p-5 rounded-2xl border border-sky-200/60 bg-sky-50/20 space-y-4">
                  <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                    <Compass className="w-4 h-4 text-sky-600" />
                    <span>Mission Statement</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Mission Heading *
                    </label>
                    <input
                      type="text"
                      value={vmForm.mission_heading}
                      onChange={(e) => setVmForm({ ...vmForm, mission_heading: e.target.value })}
                      placeholder="e.g. Our Mission"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Mission Description *
                    </label>
                    <textarea
                      rows={5}
                      value={vmForm.mission_description}
                      onChange={(e) => setVmForm({ ...vmForm, mission_description: e.target.value })}
                      placeholder="Enter the daily mission and operational purpose of Signature Uniforms..."
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black bg-white leading-relaxed"
                      required
                    />
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Published on About Page</span>
                    <span className="text-xs text-gray-500">Enable or disable rendering on the public About page.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vmForm.is_published}
                      onChange={(e) => setVmForm({ ...vmForm, is_published: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={vmSaving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition-all shadow hover:shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{vmSaving ? 'Saving...' : 'Save Vision & Mission'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminAboutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400">Loading admin manager...</div>}>
      <AdminAboutContent />
    </Suspense>
  )
}
