'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Search, RefreshCw, Phone, Mail, Building2,
  Calendar, CheckCircle, Clock, ExternalLink, MessageCircle,
  FileText, CheckCircle2, AlertCircle, MapPin, Package, Filter,
  Eye, Image as ImageIcon, ZoomIn, X, ChevronRight, Copy, Check
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ENQUIRY_TYPE_LABELS } from '@/lib/constants'

function extractReferenceImages(text?: string | null): { imageUrls: string[]; cleanText: string } {
  if (!text) return { imageUrls: [], cleanText: '' }

  const urls: string[] = []
  const urlRegex = /(?:Reference Image:\s*)?(https?:\/\/(?:res\.cloudinary\.com\/[^\s\n]+|[^\s\n]+\.(?:png|jpg|jpeg|webp|gif|svg)(?:\?[^\s\n]*)?))/gi

  let cleanText = text.replace(urlRegex, (match, url) => {
    const finalUrl = (url || match.replace(/^Reference Image:\s*/i, '')).trim()
    if (!urls.includes(finalUrl)) {
      urls.push(finalUrl)
    }
    return ''
  }).trim()

  cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim()

  return { imageUrls: urls, cleanText }
}

interface Enquiry {
  id: string
  reference?: string | null
  reference_no?: string | null
  contact_name?: string | null
  name?: string | null
  phone: string
  email: string | null
  institution_name: string | null
  institution_type?: string | null
  designation?: string | null
  location: string | null
  enquiry_type: string
  quantity?: number | null
  estimated_quantity?: number | null
  requirements: string | null
  message?: string | null
  source_page?: string | null
  source_url?: string | null
  whatsapp_opened?: boolean | null
  whatsapp_opened_at?: string | null
  status: string
  admin_notes: string | null
  created_at: string
}

type ChannelTab = 'all' | 'normal' | 'whatsapp'

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [channelTab, setChannelTab] = useState<ChannelTab>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [notesText, setNotesText] = useState('')
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [copiedRef, setCopiedRef] = useState(false)

  const getRef = (enq: Enquiry) => enq.reference || enq.reference_no || 'REF-LEAD'
  const getName = (enq: Enquiry) => enq.contact_name || enq.name || 'Anonymous Client'
  const getPhone = (enq: Enquiry) => enq.phone || 'N/A'
  const getQuantity = (enq: Enquiry) => enq.quantity ?? enq.estimated_quantity ?? null
  const isWhatsApp = (enq: Enquiry) =>
    Boolean(enq.whatsapp_opened) ||
    (enq.enquiry_type || '').toLowerCase().includes('whatsapp')

  const hasImage = (enq: Enquiry) => {
    const combined = `${enq.message || ''} ${enq.requirements || ''}`
    return combined.includes('res.cloudinary.com') || /\.(png|jpg|jpeg|webp|svg)/i.test(combined)
  }

  const loadEnquiries = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setEnquiries(data)
        if (selectedEnquiry) {
          const updated = data.find((d) => d.id === selectedEnquiry.id)
          if (updated) {
            setSelectedEnquiry(updated)
            setNotesText(updated.admin_notes || '')
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching enquiries:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnquiries()
  }, [])

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  const handleOpenDetails = (enq: Enquiry) => {
    setSelectedEnquiry(enq)
    setNotesText(enq.admin_notes || '')
    setIsDrawerOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDrawerOpen(false)
  }

  const handleCopyRef = (refText: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(refText)
      setCopiedRef(true)
      setTimeout(() => setCopiedRef(false), 2000)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedEnquiry) return
    setUpdatingStatus(true)
    try {
      const supabase = createClient()
      await supabase
        .from('enquiries')
        .update({ status: newStatus, admin_notes: notesText, updated_at: new Date().toISOString() })
        .eq('id', selectedEnquiry.id)

      const updated = { ...selectedEnquiry, status: newStatus, admin_notes: notesText }
      setSelectedEnquiry(updated)
      setEnquiries((prev) => prev.map((e) => (e.id === selectedEnquiry.id ? updated : e)))
    } catch (e) {
      console.error('Failed to update enquiry status:', e)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return
    setUpdatingStatus(true)
    try {
      const supabase = createClient()
      await supabase
        .from('enquiries')
        .update({ admin_notes: notesText, updated_at: new Date().toISOString() })
        .eq('id', selectedEnquiry.id)

      const updated = { ...selectedEnquiry, admin_notes: notesText }
      setSelectedEnquiry(updated)
      setEnquiries((prev) => prev.map((e) => (e.id === selectedEnquiry.id ? updated : e)))
    } catch (e) {
      console.error('Failed to save notes:', e)
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Channel counts
  const counts = useMemo(() => {
    const total = enquiries.length
    const whatsapp = enquiries.filter(isWhatsApp).length
    const normal = total - whatsapp
    const pending = enquiries.filter((e) => e.status === 'new').length
    return { total, whatsapp, normal, pending }
  }, [enquiries])

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      // 1. Channel Filter
      if (channelTab === 'whatsapp' && !isWhatsApp(e)) return false
      if (channelTab === 'normal' && isWhatsApp(e)) return false

      // 2. Specific Type Filter
      if (typeFilter !== 'all' && e.enquiry_type !== typeFilter) return false

      // 3. Status Filter
      if (statusFilter !== 'all' && e.status !== statusFilter) return false

      // 4. Search Filter
      const term = (searchTerm || '').trim().toLowerCase()
      if (!term) return true

      const ref = (e.reference || e.reference_no || '').toLowerCase()
      const name = (e.contact_name || e.name || '').toLowerCase()
      const phone = (e.phone || '').toLowerCase()
      const inst = (e.institution_name || '').toLowerCase()
      const loc = (e.location || '').toLowerCase()
      const req = (e.requirements || '').toLowerCase()
      const msg = (e.message || '').toLowerCase()

      return (
        ref.includes(term) ||
        name.includes(term) ||
        phone.includes(term) ||
        inst.includes(term) ||
        loc.includes(term) ||
        req.includes(term) ||
        msg.includes(term)
      )
    })
  }, [enquiries, channelTab, typeFilter, statusFilter, searchTerm])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'quotation_sent':
      case 'quoted':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'converted':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'closed':
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    return ENQUIRY_TYPE_LABELS[type] || type.replace(/_/g, ' ')
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Customer Enquiries & Quotations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review wholesale leads, sample uniform photos, and customer specifications.
          </p>
        </div>
        <button
          onClick={loadEnquiries}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Leads
        </button>
      </div>

      {/* Metric Cards / Quick Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setChannelTab('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            channelTab === 'all'
              ? 'bg-black text-white border-black shadow-md'
              : 'bg-white text-gray-900 border-gray-200 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${channelTab === 'all' ? 'text-gray-300' : 'text-gray-500'}`}>
              All Leads
            </span>
            <MessageSquare className={`w-4 h-4 ${channelTab === 'all' ? 'text-[#FFD700]' : 'text-gray-400'}`} />
          </div>
          <div className="text-2xl font-bold mt-2">{counts.total}</div>
          <div className={`text-[11px] mt-0.5 ${channelTab === 'all' ? 'text-gray-400' : 'text-gray-500'}`}>
            {counts.pending} new pending
          </div>
        </div>

        <div
          onClick={() => setChannelTab('normal')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            channelTab === 'normal'
              ? 'bg-blue-900 text-white border-blue-900 shadow-md'
              : 'bg-white text-gray-900 border-gray-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${channelTab === 'normal' ? 'text-blue-200' : 'text-gray-500'}`}>
              Normal Enquiries
            </span>
            <FileText className={`w-4 h-4 ${channelTab === 'normal' ? 'text-blue-300' : 'text-blue-600'}`} />
          </div>
          <div className="text-2xl font-bold mt-2">{counts.normal}</div>
          <div className={`text-[11px] mt-0.5 ${channelTab === 'normal' ? 'text-blue-200' : 'text-gray-500'}`}>
            Web forms & bulk quotes
          </div>
        </div>

        <div
          onClick={() => setChannelTab('whatsapp')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            channelTab === 'whatsapp'
              ? 'bg-[#075E54] text-white border-[#075E54] shadow-md'
              : 'bg-white text-gray-900 border-gray-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${channelTab === 'whatsapp' ? 'text-emerald-200' : 'text-gray-500'}`}>
              WhatsApp Enquiries
            </span>
            <MessageCircle className={`w-4 h-4 ${channelTab === 'whatsapp' ? 'text-emerald-300' : 'text-emerald-600'}`} />
          </div>
          <div className="text-2xl font-bold mt-2">{counts.whatsapp}</div>
          <div className={`text-[11px] mt-0.5 ${channelTab === 'whatsapp' ? 'text-emerald-200' : 'text-gray-500'}`}>
            Direct WhatsApp chats
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              New Leads
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.pending}</div>
          <div className="text-[11px] text-amber-600 mt-0.5 font-medium">Awaiting response</div>
        </div>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setChannelTab('all')}
            className={`pb-3 text-xs font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
              channelTab === 'all'
                ? 'text-black border-b-2 border-black font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>All Enquiries</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-700">
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => setChannelTab('normal')}
            className={`pb-3 text-xs font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
              channelTab === 'normal'
                ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Normal / Web Enquiries</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700">
              {counts.normal}
            </span>
          </button>

          <button
            onClick={() => setChannelTab('whatsapp')}
            className={`pb-3 text-xs font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
              channelTab === 'whatsapp'
                ? 'text-emerald-700 border-b-2 border-emerald-700 font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp Enquiries</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700">
              {counts.whatsapp}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref #, name, phone, school, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black bg-white"
          >
            <option value="all">All Specific Types</option>
            <option value="school_bulk">School Bulk Order</option>
            <option value="product_quote">Product Quote Request</option>
            <option value="contact">Contact Form</option>
            <option value="whatsapp_product">WhatsApp Product Lead</option>
            <option value="whatsapp_general">WhatsApp General Lead</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quotation_sent">Quotation Sent</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed / Cancelled</option>
          </select>
        </div>
      </div>

      {/* ── FULL WIDTH ENQUIRIES LIST ────────────────────────────────────────── */}
      <div className="w-full space-y-3">
        {filteredEnquiries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-500 shadow-sm">
            <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No customer enquiries found</h3>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your channel tab, filters or search query.
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enq) => {
            const wa = isWhatsApp(enq)
            const refNo = getRef(enq)
            const clientName = getName(enq)
            const hasRef = hasImage(enq)
            const qty = getQuantity(enq)

            return (
              <div
                key={enq.id}
                onClick={() => handleOpenDetails(enq)}
                className="w-full bg-white border border-gray-200 hover:border-black/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Section: Ref, Badges, Name, Organization */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-md">
                      {refNo}
                    </span>

                    {/* Channel Badge */}
                    {wa ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <MessageCircle className="w-3 h-3 text-[#25D366]" />
                        <span>WhatsApp</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span>Web Form</span>
                      </span>
                    )}

                    {/* Attached Image Indicator Badge */}
                    {hasRef && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 shadow-xs"
                        title="Customer uploaded a sample uniform photograph"
                      >
                        <ImageIcon className="w-3 h-3 text-purple-700" />
                        <span>Ref Image Attached</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(enq.status)}`}>
                      {enq.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-black">
                      {clientName}
                    </h3>
                    {enq.designation && (
                      <span className="text-xs text-gray-400">({enq.designation})</span>
                    )}
                  </div>

                  {enq.institution_name && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium truncate">{enq.institution_name}</span>
                      {enq.location && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {enq.location}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Middle Info: Phone, Quantity, Category */}
                <div className="hidden lg:flex flex-col items-start gap-1 text-xs text-gray-500 border-l border-gray-100 pl-6 min-w-[200px]">
                  <div className="flex items-center gap-1.5 font-medium text-gray-800">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{getPhone(enq)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Type:</span>
                    <span className="font-medium text-gray-700">{getTypeLabel(enq.enquiry_type)}</span>
                  </div>
                  {qty && (
                    <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                      <Package className="w-3 h-3 text-gray-400" />
                      <span>{qty} units required</span>
                    </div>
                  )}
                </div>

                {/* Right Section: Date & View Details Button */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-right">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(enq.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(enq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDetails(enq)
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all group-hover:shadow-md cursor-pointer shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── FULL DETAILS SLIDE-OVER DRAWER (OPENS ON "VIEW DETAILS" CLICK) ───── */}
      <AnimatePresence>
        {isDrawerOpen && selectedEnquiry && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleCloseDetails}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-over panel from right */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white text-black shadow-2xl z-50 flex flex-col justify-between overflow-y-auto"
            >
              <SelectedEnquiryDrawerContent
                enquiry={selectedEnquiry}
                updatingStatus={updatingStatus}
                notesText={notesText}
                setNotesText={setNotesText}
                handleUpdateStatus={handleUpdateStatus}
                handleSaveNotes={handleSaveNotes}
                onClose={handleCloseDetails}
                onZoomImage={(url) => setZoomedImage(url)}
                copiedRef={copiedRef}
                handleCopyRef={handleCopyRef}
                getStatusBadge={getStatusBadge}
                getTypeLabel={getTypeLabel}
                getRef={getRef}
                getName={getName}
                getPhone={getPhone}
                getQuantity={getQuantity}
                isWhatsApp={isWhatsApp}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Lightbox / Zoom Modal for Reference Images ───────────────────────── */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-3 cursor-default flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 px-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Customer Reference Uniform Image
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={zoomedImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-colors"
                  title="Open original high-res image"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size</span>
                </a>
                <button
                  type="button"
                  onClick={() => setZoomedImage(null)}
                  className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-auto p-4 flex items-center justify-center max-h-[75vh] bg-neutral-900 rounded-xl mt-2">
              <img
                src={zoomedImage}
                alt="Enlarged Reference Uniform"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface DrawerContentProps {
  enquiry: Enquiry
  updatingStatus: boolean
  notesText: string
  setNotesText: (val: string) => void
  handleUpdateStatus: (st: string) => Promise<void>
  handleSaveNotes: () => Promise<void>
  onClose: () => void
  onZoomImage: (url: string) => void
  copiedRef: boolean
  handleCopyRef: (ref: string) => void
  getStatusBadge: (st: string) => string
  getTypeLabel: (t: string) => string
  getRef: (e: Enquiry) => string
  getName: (e: Enquiry) => string
  getPhone: (e: Enquiry) => string
  getQuantity: (e: Enquiry) => number | null
  isWhatsApp: (e: Enquiry) => boolean
}

function SelectedEnquiryDrawerContent({
  enquiry,
  updatingStatus,
  notesText,
  setNotesText,
  handleUpdateStatus,
  handleSaveNotes,
  onClose,
  onZoomImage,
  copiedRef,
  handleCopyRef,
  getStatusBadge,
  getTypeLabel,
  getRef,
  getName,
  getPhone,
  getQuantity,
  isWhatsApp,
}: DrawerContentProps) {
  // Extract reference images from both message and requirements fields
  const { imageUrls: msgImages, cleanText: cleanMessage } = useMemo(
    () => extractReferenceImages(enquiry.message),
    [enquiry.message]
  )
  const { imageUrls: reqImages, cleanText: cleanRequirements } = useMemo(
    () => extractReferenceImages(enquiry.requirements),
    [enquiry.requirements]
  )
  const referenceImages = useMemo(
    () => Array.from(new Set([...msgImages, ...reqImages])),
    [msgImages, reqImages]
  )

  const cleanReqDisplay = cleanRequirements
    ? cleanRequirements.replace(/\[Ref Image Attached\]/gi, '').trim()
    : ''

  const refCode = getRef(enquiry)

  return (
    <div className="flex flex-col h-full">
      {/* Top Header Bar */}
      <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/50">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-gray-800 bg-white border border-gray-200 px-2.5 py-0.5 rounded-md">
              REF: {refCode}
            </span>
            <button
              type="button"
              onClick={() => handleCopyRef(refCode)}
              className="p-1 text-gray-400 hover:text-black hover:bg-gray-200 rounded transition-colors"
              title="Copy Reference"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(enquiry.status)}`}>
              {enquiry.status.replace('_', ' ')}
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {getName(enquiry)}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Received on {new Date(enquiry.created_at).toLocaleString()}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Channel Banner */}
        {isWhatsApp(enquiry) ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Direct Customer Lead</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {enquiry.whatsapp_opened_at
                ? `Opened at ${new Date(enquiry.whatsapp_opened_at).toLocaleTimeString()}`
                : 'Direct WhatsApp Contact'}
            </span>
          </div>
        ) : (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-800 text-xs font-semibold">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Website Form Quotation Request</span>
            </div>
            <span className="text-[11px] text-blue-700 capitalize font-medium">
              {getTypeLabel(enquiry.enquiry_type)}
            </span>
          </div>
        )}

        {/* Quick Contact Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {enquiry.phone && enquiry.phone !== 'N/A' && (
            <a
              href={`https://wa.me/${enquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hello ${getName(enquiry)}, thank you for contacting Signature Uniforms (Ref: ${refCode}). We are pleased to assist you.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-xs font-bold rounded-xl hover:bg-[#1EBE5D] transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          )}
          {enquiry.phone && enquiry.phone !== 'N/A' && (
            <a
              href={`tel:${enquiry.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-gray-500" />
              <span>Call Client</span>
            </a>
          )}
          {enquiry.email && (
            <a
              href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Signature Uniforms - Quotation ${refCode}`)}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <span>Send Email</span>
            </a>
          )}
        </div>

        {/* Lead Status Update Selector */}
        <div className="bg-gray-50/70 border border-gray-200 p-4 rounded-xl space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Lead Processing Status
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'new', label: 'New Lead' },
              { id: 'contacted', label: 'Contacted' },
              { id: 'quotation_sent', label: 'Quotation Sent' },
              { id: 'converted', label: 'Converted' },
              { id: 'closed', label: 'Closed / Cancelled' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                disabled={updatingStatus}
                onClick={() => handleUpdateStatus(st.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  enquiry.status === st.id
                    ? 'bg-black text-[#FFD700] ring-2 ring-black shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-black'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs border border-gray-100">
          <div>
            <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">
              Phone Number
            </span>
            <a href={`tel:${enquiry.phone}`} className="font-semibold text-gray-900 hover:underline mt-0.5 block">
              {getPhone(enquiry)}
            </a>
          </div>
          <div>
            <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">
              Email Address
            </span>
            <span className="font-semibold text-gray-900 mt-0.5 block">
              {enquiry.email || 'Not provided'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">
              Institution / Company
            </span>
            <span className="font-semibold text-gray-900 mt-0.5 block">
              {enquiry.institution_name || 'Individual / Not specified'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">
              Estimated Order Quantity
            </span>
            <span className="font-semibold text-gray-900 mt-0.5 block">
              {getQuantity(enquiry)
                ? `${getQuantity(enquiry)} units`
                : 'Unspecified'}
            </span>
          </div>
          {enquiry.location && (
            <div className="sm:col-span-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">
                Location / Delivery Town
              </span>
              <span className="font-semibold text-gray-900 mt-0.5 block">{enquiry.location}</span>
            </div>
          )}
          {enquiry.source_page && (
            <div>
              <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-bold">
                Source Page
              </span>
              <span className="font-mono text-gray-700 capitalize mt-0.5 block">{enquiry.source_page}</span>
            </div>
          )}
        </div>

        {/* ── CUSTOMER UPLOADED REFERENCE IMAGE SHOWCASE ───────────────────── */}
        {referenceImages.length > 0 && (
          <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Customer Reference Uniform Image
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Sample uniform photo attached by customer for custom fabrication
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                {referenceImages.length} {referenceImages.length === 1 ? 'Photo' : 'Photos'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {referenceImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div
                    className="aspect-[4/3] bg-neutral-100 relative overflow-hidden cursor-pointer flex items-center justify-center"
                    onClick={() => onZoomImage(imgUrl)}
                  >
                    <img
                      src={imgUrl}
                      alt={`Reference uniform sample ${idx + 1}`}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="p-2 bg-white/95 rounded-full text-black shadow-lg">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 flex items-center justify-between bg-white border-t border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-700">Sample Design</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onZoomImage(imgUrl)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        <span>Full View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements & Notes */}
        {(cleanReqDisplay || cleanMessage) && (
          <div>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Client Requirements & Message
            </h3>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 whitespace-pre-wrap leading-relaxed space-y-2">
              {cleanReqDisplay && (
                <div>
                  <span className="font-bold text-gray-900">Specifications: </span>
                  {cleanReqDisplay}
                </div>
              )}
              {cleanMessage && (
                <div>
                  <span className="font-bold text-gray-900">Message: </span>
                  {cleanMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Internal Admin Notes */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Internal Staff Follow-Up Notes
          </h3>
          <textarea
            rows={3}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Add follow-up notes e.g. Contacted client, sample sent, awaiting size sheet..."
            className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-black leading-relaxed"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveNotes}
              disabled={updatingStatus}
              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Save Internal Notes
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Action */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <span className="text-xs text-gray-500">
          Status: <strong className="text-black uppercase">{enquiry.status}</strong>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Close Drawer
        </button>
      </div>
    </div>
  )
}
