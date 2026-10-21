'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare, Search, Filter, RefreshCw, Phone, Mail, Building2,
  Calendar, CheckCircle, Clock, Send, ExternalLink, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { buildWhatsAppUrl } from '@/lib/constants'

interface Enquiry {
  id: string
  reference_no: string
  name: string
  phone: string
  email: string | null
  institution_name: string | null
  institution_type: string | null
  location: string | null
  enquiry_type: string
  estimated_quantity: number | null
  requirements: string | null
  status: string
  admin_notes: string | null
  created_at: string
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [notesText, setNotesText] = useState('')

  const loadEnquiries = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setEnquiries(data)
        if (!selectedEnquiry && data.length > 0) {
          setSelectedEnquiry(data[0])
          setNotesText(data[0].admin_notes || '')
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

  const handleSelectEnquiry = (enq: Enquiry) => {
    setSelectedEnquiry(enq)
    setNotesText(enq.admin_notes || '')
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

      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus, admin_notes: notesText })
      setEnquiries(enquiries.map(e => e.id === selectedEnquiry.id ? { ...e, status: newStatus, admin_notes: notesText } : e))
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

      setSelectedEnquiry({ ...selectedEnquiry, admin_notes: notesText })
      setEnquiries(enquiries.map(e => e.id === selectedEnquiry.id ? { ...e, admin_notes: notesText } : e))
    } catch (e) {
      console.error('Failed to save notes:', e)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch =
      e.reference_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm) ||
      (e.institution_name && e.institution_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || e.enquiry_type === typeFilter
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Customer Enquiries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track customer requests, quotations, and direct WhatsApp conversions.
          </p>
        </div>
        <button
          onClick={loadEnquiries}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Leads
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref #, name, phone, school..."
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
            <option value="all">All Types</option>
            <option value="school_bulk">School Bulk</option>
            <option value="contact">Contact Us</option>
            <option value="whatsapp">WhatsApp Direct</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="in_production">In Production</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Enquiries List */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm divide-y divide-gray-100 max-h-[750px] overflow-y-auto">
          {filteredEnquiries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-semibold text-gray-700">No enquiries found</p>
            </div>
          ) : (
            filteredEnquiries.map((enq) => {
              const isSelected = selectedEnquiry?.id === enq.id
              return (
                <div
                  key={enq.id}
                  onClick={() => handleSelectEnquiry(enq)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-50/60 border-l-4 border-l-black' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-gray-900">{enq.reference_no}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      enq.status === 'new' ? 'bg-amber-100 text-amber-800' :
                      enq.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      enq.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                      enq.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {enq.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{enq.name}</div>
                  {enq.institution_name && (
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      <span>{enq.institution_name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                    <span className="capitalize">{enq.enquiry_type.replace('_', ' ')}</span>
                    <span>{new Date(enq.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right: Selected Enquiry Details */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {selectedEnquiry ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-gray-500">REF: {selectedEnquiry.reference_no}</span>
                  <h2 className="text-xl font-bold text-gray-900 mt-0.5">{selectedEnquiry.name}</h2>
                  <p className="text-xs text-gray-400">
                    Received on {new Date(selectedEnquiry.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${selectedEnquiry.name}, thank you for your enquiry (${selectedEnquiry.reference_no}) with Signature Uniforms by Hari. We are pleased to assist you.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#1EBE5D] transition-colors shadow-sm"
                  >
                    <span>Reply on WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Update Lead Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['new', 'contacted', 'quoted', 'in_production', 'completed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium capitalize transition-all ${
                        selectedEnquiry.status === st
                          ? 'bg-black text-[#FFD700] ring-2 ring-black font-semibold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-semibold">Phone</span>
                  <a href={`tel:${selectedEnquiry.phone}`} className="font-semibold text-gray-900 hover:underline">
                    {selectedEnquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-semibold">Email</span>
                  <span className="font-semibold text-gray-900">{selectedEnquiry.email || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-semibold">Institution / Org</span>
                  <span className="font-semibold text-gray-900">{selectedEnquiry.institution_name || 'Individual'}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-semibold">Estimated Quantity</span>
                  <span className="font-semibold text-gray-900">
                    {selectedEnquiry.estimated_quantity ? `${selectedEnquiry.estimated_quantity} pieces` : 'Unspecified'}
                  </span>
                </div>
                {selectedEnquiry.location && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] block font-semibold">Location / Delivery City</span>
                    <span className="font-semibold text-gray-900">{selectedEnquiry.location}</span>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {selectedEnquiry.requirements && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Client Requirements & Notes
                  </h3>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 whitespace-pre-wrap">
                    {selectedEnquiry.requirements}
                  </div>
                </div>
              )}

              {/* Internal Admin Notes */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Internal Follow-Up Notes
                </h3>
                <textarea
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Add notes e.g. Sent fabric swatches on Monday, awaiting school committee sign-off..."
                  className="w-full p-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={updatingStatus}
                    className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-gray-400 text-xs">
              Select an enquiry from the list to view full specifications.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
