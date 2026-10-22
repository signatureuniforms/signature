'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  GitBranch,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  Layout,
  ListOrdered,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'

interface ProcessStepLocal {
  id: string
  step_number: number
  heading: string
  description: string
  image_url: string
  is_published: boolean
  position: number
}

function newStep(position: number): ProcessStepLocal {
  return {
    id: `new-${Date.now()}-${Math.random()}`,
    step_number: position,
    heading: '',
    description: '',
    image_url: '',
    is_published: true,
    position,
  }
}

function AdminProcessContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'steps' ? 'steps' : 'header'

  const [activeTab, setActiveTab] = useState<'header' | 'steps'>(initialTab)
  const [loading, setLoading] = useState(true)

  const [headerForm, setHeaderForm] = useState({
    subheading: '',
    heading: '',
    description: '',
    is_published: true,
  })
  const [headerSaving, setHeaderSaving] = useState(false)
  const [headerMessage, setHeaderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [steps, setSteps] = useState<ProcessStepLocal[]>([])
  const [stepsSaving, setStepsSaving] = useState(false)
  const [stepsMessage, setStepsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'steps') setActiveTab('steps')
    else if (tab === 'header') setActiveTab('header')
  }, [searchParams])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const supabase = createClient()

        const { data: headerData } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', 'process')
          .eq('section_key', 'header')
          .maybeSingle()

        if (headerData?.content) {
          const c = headerData.content as Record<string, unknown>
          setHeaderForm({
            subheading: typeof c.subheading === 'string' ? c.subheading : '',
            heading: typeof c.heading === 'string' ? c.heading : '',
            description: typeof c.description === 'string' ? c.description : '',
            is_published: typeof headerData.is_published === 'boolean' ? headerData.is_published : true,
          })
        }

        const { data: stepsData } = await supabase
          .from('process_steps')
          .select('*')
          .order('position', { ascending: true })

        if (stepsData && stepsData.length > 0) {
          setSteps(
            stepsData.map((s: ProcessStepLocal) => ({
              id: s.id,
              step_number: s.step_number,
              heading: s.heading ?? '',
              description: s.description ?? '',
              image_url: s.image_url ?? '',
              is_published: typeof s.is_published === 'boolean' ? s.is_published : true,
              position: s.position,
            })),
          )
        }
      } catch (err) {
        console.warn('Failed to load process content:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleHeaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHeaderSaving(true)
    setHeaderMessage(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('page_content').upsert(
        {
          page_key: 'process',
          section_key: 'header',
          content: {
            subheading: headerForm.subheading.trim(),
            heading: headerForm.heading.trim(),
            description: headerForm.description.trim(),
          },
          is_published: headerForm.is_published,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_key,section_key' },
      )
      if (error) throw error
      setHeaderMessage({ type: 'success', text: 'Section header saved successfully!' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save section header.'
      setHeaderMessage({ type: 'error', text: message })
    } finally {
      setHeaderSaving(false)
    }
  }

  const handleStepsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStepsSaving(true)
    setStepsMessage(null)
    try {
      const supabase = createClient()

      // Split into new rows (INSERT) and existing rows (UPDATE) to avoid
      // a mixed upsert failing on onConflict:'id' when some rows have no id.
      const newRows = steps
        .filter((s) => s.id.startsWith('new-'))
        .map((s, _i) => {
          const pos = steps.indexOf(s)
          return {
            step_number: pos + 1,
            heading: s.heading.trim(),
            description: s.description.trim(),
            image_url: s.image_url.trim(),
            is_published: s.is_published,
            position: pos + 1,
          }
        })

      const existingRows = steps
        .filter((s) => !s.id.startsWith('new-'))
        .map((s) => {
          const pos = steps.indexOf(s)
          return {
            id: s.id,
            step_number: pos + 1,
            heading: s.heading.trim(),
            description: s.description.trim(),
            image_url: s.image_url.trim(),
            is_published: s.is_published,
            position: pos + 1,
            updated_at: new Date().toISOString(),
          }
        })

      if (newRows.length > 0) {
        const { error } = await supabase.from('process_steps').insert(newRows)
        if (error) throw error
      }

      if (existingRows.length > 0) {
        const { error } = await supabase
          .from('process_steps')
          .upsert(existingRows, { onConflict: 'id' })
        if (error) throw error
      }
      const { data: freshSteps } = await supabase
        .from('process_steps')
        .select('*')
        .order('position', { ascending: true })
      if (freshSteps) {
        setSteps(
          freshSteps.map((s: ProcessStepLocal) => ({
            id: s.id,
            step_number: s.step_number,
            heading: s.heading ?? '',
            description: s.description ?? '',
            image_url: s.image_url ?? '',
            is_published: s.is_published,
            position: s.position,
          })),
        )
      }
      setStepsMessage({ type: 'success', text: 'Process steps saved successfully!' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save steps.'
      setStepsMessage({ type: 'error', text: message })
    } finally {
      setStepsSaving(false)
    }
  }

  const deleteStep = async (step: ProcessStepLocal) => {
    if (step.id.startsWith('new-')) {
      setSteps((prev) => prev.filter((s) => s.id !== step.id))
      return
    }
    try {
      const supabase = createClient()
      const { error } = await supabase.from('process_steps').delete().eq('id', step.id)
      if (error) throw error
      setSteps((prev) => prev.filter((s) => s.id !== step.id))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete step.'
      setStepsMessage({ type: 'error', text: message })
    }
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const arr = [...steps]
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (swapWith < 0 || swapWith >= arr.length) return
    ;[arr[index], arr[swapWith]] = [arr[swapWith], arr[index]]
    setSteps(arr)
  }

  const updateStep = (id: string, field: keyof ProcessStepLocal, value: string | boolean | number) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <GitBranch className="w-6 h-6 text-black" />
          Process Page Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the service workflow section heading and individual process steps shown on the Process page.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === 'header' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          <Layout className="w-4 h-4" />
          <span>Section Header</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === 'steps' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Process Steps</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Loading content...</p>
        </div>
      ) : activeTab === 'header' ? (
        <div>
          {headerMessage && (
            <div className={`p-4 rounded-xl flex items-center gap-2 text-sm mb-6 ${headerMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {headerMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{headerMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleHeaderSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Workflow Section Header</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Subheading (Optional)</label>
              <input
                type="text"
                value={headerForm.subheading}
                onChange={(e) => setHeaderForm({ ...headerForm, subheading: e.target.value })}
                placeholder="e.g. How We Work"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
              />
              <p className="text-[11px] text-gray-400 mt-1">Small label displayed above the main heading.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Heading *</label>
              <input
                type="text"
                value={headerForm.heading}
                onChange={(e) => setHeaderForm({ ...headerForm, heading: e.target.value })}
                placeholder="e.g. Our Service Workflow"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Description (Optional)</label>
              <textarea
                rows={3}
                value={headerForm.description}
                onChange={(e) => setHeaderForm({ ...headerForm, description: e.target.value })}
                placeholder="e.g. A structured, precision-driven architectural roadmap to outfitting your organization."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-900 block">Published</span>
                <span className="text-xs text-gray-500">Enable or disable the Process page header.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={headerForm.is_published} onChange={(e) => setHeaderForm({ ...headerForm, is_published: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button type="submit" disabled={headerSaving} className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition-all shadow hover:shadow-md disabled:opacity-50 cursor-pointer">
                <Save className="w-4 h-4" />
                <span>{headerSaving ? 'Saving...' : 'Save Header'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {stepsMessage && (
            <div className={`p-4 rounded-xl flex items-center gap-2 text-sm mb-6 ${stepsMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {stepsMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{stepsMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleStepsSubmit} className="space-y-5">
            {steps.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400">
                <ListOrdered className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No process steps yet.</p>
                <p className="text-xs mt-1">Click &quot;Add Step&quot; below to create the first one.</p>
              </div>
            ) : (
              steps.map((step, idx) => (
                <div key={step.id} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-300" />
                      <span className="w-7 h-7 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-bold text-gray-800 truncate max-w-[200px]">
                        {step.heading || <span className="text-gray-400 font-normal">Untitled Step</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveStep(idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-20 cursor-pointer" title="Move up">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => moveStep(idx, 'down')} disabled={idx === steps.length - 1} className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-20 cursor-pointer" title="Move down">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => deleteStep(step)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete step">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Step Heading *</label>
                    <input type="text" value={step.heading} onChange={(e) => updateStep(step.id, 'heading', e.target.value)} placeholder="e.g. Design & Fabric Selection" className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors" required />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Description *</label>
                    <textarea rows={3} value={step.description} onChange={(e) => updateStep(step.id, 'description', e.target.value)} placeholder="Describe this step in the workflow..." className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors leading-relaxed" required />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Step Image</label>
                    <CloudinaryUpload value={step.image_url} onChange={(url) => updateStep(step.id, 'image_url', url)} folder="process" label="Upload Step Image" />
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-900 block">Published</span>
                      <span className="text-xs text-gray-500">Show or hide this step on the page.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={step.is_published} onChange={(e) => updateStep(step.id, 'is_published', e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                    </label>
                  </div>
                </div>
              ))
            )}

            <button type="button" onClick={() => setSteps((prev) => [...prev, newStep(prev.length + 1)])} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 hover:border-black rounded-2xl text-sm font-semibold text-gray-500 hover:text-black transition-all cursor-pointer">
              <Plus className="w-4 h-4" />
              Add Step
            </button>

            {steps.length > 0 && (
              <div className="flex items-center justify-end pt-2">
                <button type="submit" disabled={stepsSaving} className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition-all shadow hover:shadow-md disabled:opacity-50 cursor-pointer">
                  <Save className="w-4 h-4" />
                  <span>{stepsSaving ? 'Saving...' : 'Save All Steps'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  )
}

export default function AdminProcessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400">Loading process manager...</div>}>
      <AdminProcessContent />
    </Suspense>
  )
}
