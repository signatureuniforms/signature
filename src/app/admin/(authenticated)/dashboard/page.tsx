'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MessageSquare, Package, Layers,
  ArrowUpRight, Clock, Plus, ExternalLink, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalEnquiries: number
  pendingEnquiries: number
  totalProducts: number
  totalCategories: number
}

interface RecentEnquiry {
  id: string
  reference?: string | null
  reference_no?: string | null
  contact_name?: string | null
  name?: string | null
  institution_name: string | null
  phone: string
  enquiry_type: string
  status: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEnquiries: 0,
    pendingEnquiries: 0,
    totalProducts: 0,
    totalCategories: 0,
  })
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Fetch stats
      const [
        { count: enquiriesCount },
        { count: pendingCount },
        { count: productsCount },
        { count: categoriesCount },
        { data: enquiriesData }
      ] = await Promise.all([
        supabase.from('enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(6)
      ])

      setStats({
        totalEnquiries: enquiriesCount || 0,
        pendingEnquiries: pendingCount || 0,
        totalProducts: productsCount || 0,
        totalCategories: categoriesCount || 0,
      })

      if (enquiriesData) {
        setRecentEnquiries(enquiriesData)
      }
    } catch (e) {
      console.warn('Dashboard fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back to the Signature Uniforms management portal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-black rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#FFD700]" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">All Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">{stats.totalEnquiries}</span>
            <Link href="/admin/enquiries" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">New Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">{stats.pendingEnquiries}</span>
            <Link href="/admin/enquiries?status=new" className="text-xs text-amber-600 hover:underline flex items-center gap-0.5">
              View new <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live Products</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">{stats.totalProducts}</span>
            <Link href="/admin/products" className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">{stats.totalCategories}</span>
            <Link href="/admin/categories" className="text-xs text-purple-600 hover:underline flex items-center gap-0.5">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/hero"
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-black transition-all hover:shadow-md group"
        >
          <div className="text-xs font-semibold text-gray-900 group-hover:text-[#FFD700] transition-colors">Hero Video & CMS</div>
          <div className="text-[11px] text-gray-500 mt-1">Update desktop & mobile videos</div>
        </Link>
        <Link
          href="/admin/categories"
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-black transition-all hover:shadow-md group"
        >
          <div className="text-xs font-semibold text-gray-900 group-hover:text-[#FFD700] transition-colors">Categories</div>
          <div className="text-[11px] text-gray-500 mt-1">School, College, Corporate, Hospital</div>
        </Link>
        <Link
          href="/admin/why-choose-us"
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-black transition-all hover:shadow-md group"
        >
          <div className="text-xs font-semibold text-gray-900 group-hover:text-[#FFD700] transition-colors">Why Choose Us</div>
          <div className="text-[11px] text-gray-500 mt-1">Feature reasons and trust items</div>
        </Link>
        <Link
          href="/admin/settings"
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-black transition-all hover:shadow-md group"
        >
          <div className="text-xs font-semibold text-gray-900 group-hover:text-[#FFD700] transition-colors">Settings</div>
          <div className="text-[11px] text-gray-500 mt-1">Phone, WhatsApp, address & details</div>
        </Link>
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Enquiries</h2>
            <p className="text-xs text-gray-500 mt-0.5">Live leads generated from website visitors</p>
          </div>
          <Link
            href="/admin/enquiries"
            className="text-xs font-semibold text-black hover:text-[#FFD700] transition-colors flex items-center gap-1"
          >
            View all enquiries <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-700">No enquiries recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Customer submissions will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900">{enq.reference || enq.reference_no || 'REF'}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{enq.contact_name || enq.name || 'Anonymous'}</td>
                    <td className="py-3 px-4 text-gray-600">{enq.institution_name || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {enq.enquiry_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{enq.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        enq.status === 'new' ? 'bg-amber-100 text-amber-800' :
                        enq.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        enq.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                        enq.status === 'converted' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/enquiries?id=${enq.id}`}
                        className="text-xs font-medium text-black hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
