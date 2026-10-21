'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Search, Filter, RefreshCw, Eye, Edit2, CheckCircle2, AlertCircle, X, Plus, Calendar, Phone, Mail, Building, Clock, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending_confirmation: { label: 'Pending Confirmation', bg: 'bg-amber-100', text: 'text-amber-800' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-800' },
  in_production: { label: 'In Production', bg: 'bg-purple-100', text: 'text-purple-800' },
  ready_for_dispatch: { label: 'Ready for Dispatch', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  dispatched: { label: 'Dispatched', bg: 'bg-cyan-100', text: 'text-cyan-800' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800' },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [savingStatus, setSavingStatus] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // New order form state
  const [createForm, setCreateForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    institution_name: '',
    location: '',
    product_summary: '',
    total_quantity: 0,
    special_requirements: '',
    requested_delivery_date: '',
    admin_notes: '',
  })

  const loadOrders = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setOrders(data as Order[])
      }
    } catch (e: any) {
      console.warn('Error loading orders:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setSavingStatus(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev =>
        prev.map(ord => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      )
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => (prev ? { ...prev, status: newStatus } : null))
      }
      setMessage({ type: 'success', text: `Order status changed to ${STATUS_CONFIG[newStatus]?.label}` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Status update failed' })
    } finally {
      setSavingStatus(false)
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.customer_name || !createForm.phone) {
      alert('Customer Name and Phone are required.')
      return
    }

    setSavingStatus(true)
    try {
      const supabase = createClient()
      const reference = `ORD-${Date.now().toString().slice(-6)}`
      const payload = {
        reference,
        customer_name: createForm.customer_name.trim(),
        phone: createForm.phone.trim(),
        email: createForm.email.trim() || null,
        institution_name: createForm.institution_name.trim() || null,
        location: createForm.location.trim() || null,
        products: [
          {
            name: createForm.product_summary,
            quantity: Number(createForm.total_quantity) || 1,
          }
        ],
        total_quantity: Number(createForm.total_quantity) || 1,
        special_requirements: createForm.special_requirements.trim() || null,
        requested_delivery_date: createForm.requested_delivery_date || null,
        status: 'pending_confirmation' as OrderStatus,
        admin_notes: createForm.admin_notes.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('orders').insert(payload)
      if (error) throw error

      setShowCreateModal(false)
      setMessage({ type: 'success', text: `Order created: ${reference}` })
      setCreateForm({
        customer_name: '',
        phone: '',
        email: '',
        institution_name: '',
        location: '',
        product_summary: '',
        total_quantity: 0,
        special_requirements: '',
        requested_delivery_date: '',
        admin_notes: '',
      })
      loadOrders()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create order' })
    } finally {
      setSavingStatus(false)
    }
  }

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return
    setSavingStatus(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('orders').delete().eq('id', orderToDelete.id)
      if (error) throw error
      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id))
      setMessage({ type: 'success', text: `Order "${orderToDelete.reference}" deleted.` })
      setOrderToDelete(null)
      setShowModal(false)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete order' })
    } finally {
      setSavingStatus(false)
    }
  }

  const filteredOrders = orders.filter(ord => {
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      ord.reference.toLowerCase().includes(q) ||
      ord.customer_name.toLowerCase().includes(q) ||
      ord.phone.toLowerCase().includes(q) ||
      (ord.institution_name && ord.institution_name.toLowerCase().includes(q))
    return matchesStatus && matchesSearch
  })

  // Metric counts
  const totalCount = orders.length
  const inProdCount = orders.filter(o => o.status === 'in_production').length
  const readyCount = orders.filter(o => o.status === 'ready_for_dispatch').length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bulk Orders & Production</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track confirmed wholesale uniform orders from receipt to factory dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white font-medium text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFD700]" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            message.type === 'success'
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
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">In Production</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{inProdCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Ready for Dispatch</p>
          <p className="text-2xl font-bold text-indigo-900 mt-1">{readyCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Delivered</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{deliveredCount}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reference, school/client name, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium text-gray-600">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">Confirmed orders from enquiries will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Client / School</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Delivery Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(ord => {
                  const cfg = STATUS_CONFIG[ord.status] || {
                    label: ord.status,
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                  }

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-gray-900">
                        {ord.reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{ord.customer_name}</div>
                        {ord.institution_name && (
                          <div className="text-xs text-gray-500 font-medium">{ord.institution_name}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-gray-700">{ord.phone}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-900">
                        {ord.total_quantity ? `${ord.total_quantity} pcs` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ord.status}
                          disabled={savingStatus}
                          onChange={e => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border border-black/5 outline-none cursor-pointer ${cfg.bg} ${cfg.text}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([val, conf]) => (
                            <option key={val} value={val}>
                              {conf.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {ord.requested_delivery_date || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord)
                              setShowModal(true)
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => setOrderToDelete(ord)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete order"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-mono text-gray-400">Order Reference</span>
                <h2 className="text-xl font-bold text-gray-900">{selectedOrder.reference}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-gray-400 block">Customer</span>
                  <p className="font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                  <p className="text-xs text-gray-600">{selectedOrder.phone}</p>
                  {selectedOrder.email && <p className="text-xs text-gray-500">{selectedOrder.email}</p>}
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Institution / School</span>
                  <p className="font-semibold text-gray-900">{selectedOrder.institution_name || 'Individual / Walk-in'}</p>
                  <p className="text-xs text-gray-600">{selectedOrder.location || 'Kerala'}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Order Products</span>
                <div className="border border-gray-200 rounded-xl p-3 bg-white divide-y divide-gray-100">
                  {selectedOrder.products && selectedOrder.products.length > 0 ? (
                    selectedOrder.products.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="font-bold text-gray-900">{item.quantity} units</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">Total Quantity: {selectedOrder.total_quantity || 0} units</p>
                  )}
                </div>
              </div>

              {selectedOrder.special_requirements && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Special Requirements</span>
                  <p className="text-xs text-gray-700 bg-amber-50/60 border border-amber-200/70 p-3 rounded-xl">
                    {selectedOrder.special_requirements}
                  </p>
                </div>
              )}

              {selectedOrder.admin_notes && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Internal Admin Notes</span>
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {selectedOrder.admin_notes}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <span className="text-xs font-semibold text-gray-700 block mb-1.5">Change Status</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const isCurrent = selectedOrder.status === key
                    return (
                      <button
                        key={key}
                        onClick={() => handleUpdateStatus(selectedOrder.id, key as OrderStatus)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create New Bulk Order</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.customer_name}
                    onChange={e => setCreateForm(p => ({ ...p, customer_name: e.target.value }))}
                    placeholder="e.g. Fr. Joseph / Principal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={createForm.phone}
                    onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="9287344297"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">School / Institution</label>
                  <input
                    type="text"
                    value={createForm.institution_name}
                    onChange={e => setCreateForm(p => ({ ...p, institution_name: e.target.value }))}
                    placeholder="e.g. St. Thomas Public School"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Town</label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={e => setCreateForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Kodakara, Thrissur"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Description</label>
                <input
                  type="text"
                  value={createForm.product_summary}
                  onChange={e => setCreateForm(p => ({ ...p, product_summary: e.target.value }))}
                  placeholder="e.g. Boys Check Shirts & Navy Trousers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Quantity (Pieces)</label>
                  <input
                    type="number"
                    value={createForm.total_quantity}
                    onChange={e => setCreateForm(p => ({ ...p, total_quantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Delivery Date</label>
                  <input
                    type="date"
                    value={createForm.requested_delivery_date}
                    onChange={e => setCreateForm(p => ({ ...p, requested_delivery_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Special Requirements / Notes</label>
                <textarea
                  rows={2}
                  value={createForm.special_requirements}
                  onChange={e => setCreateForm(p => ({ ...p, special_requirements: e.target.value }))}
                  placeholder="Embroidery details, packaging, sizes breakdown..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
                >
                  {savingStatus ? 'Creating...' : 'Confirm & Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* POPUP MODAL: Delete Order Confirmation */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Order?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete order &ldquo;{orderToDelete.reference}&rdquo; for &ldquo;{orderToDelete.customer_name}&rdquo;?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={savingStatus}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                disabled={savingStatus}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
              >
                {savingStatus ? 'Deleting...' : 'Yes, Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
