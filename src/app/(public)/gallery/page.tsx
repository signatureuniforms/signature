'use client'

import { useState, useEffect } from 'react'
import { BookImage, Filter, X, ZoomIn, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { buildWhatsAppUrl } from '@/lib/constants'
import type { GalleryItem } from '@/types'

const CATEGORY_TABS = [
  { id: 'all', label: 'All Showcase' },
  { id: 'school', label: 'School Uniforms' },
  { id: 'college', label: 'College & Blazers' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'hospital', label: 'Healthcare & Scrubs' },
  { id: 'industrial', label: 'Industrial & Workwear' },
  { id: 'factory', label: 'Production Facility' },
]

export default function PublicGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)

  useEffect(() => {
    async function fetchGallery() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_published', true)
        .order('position', { ascending: true })

      if (data) setItems(data)
      setLoading(false)
    }

    fetchGallery()
  }, [])

  const filteredItems = items.filter(i => activeTab === 'all' || i.category === activeTab)

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-black text-white pt-28 pb-16 px-6 sm:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-[#FFD700] font-semibold text-xs uppercase tracking-widest block">
            Visual Portfolio
          </span>
          <h1 className="text-3xl sm:text-5xl font-normal tracking-tight" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
            Workmanship & Manufacturing Showcase
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
            A visual record of school batches, institutional uniforms, and high-precision production at our facility.
          </p>
        </div>
      </section>

      {/* Filter Tabs & Gallery Grid */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-black text-[#FFD700]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            <BookImage className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">No images under this category yet</p>
            <p className="text-xs text-gray-400 mt-1">Check back shortly or view our other collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="group cursor-pointer border border-gray-200 rounded-2xl overflow-hidden hover:border-black transition-all hover:shadow-lg bg-white flex flex-col"
              >
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title || 'Uniform gallery image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-3 bg-white/90 rounded-full text-black">
                      <ZoomIn className="w-5 h-5" />
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-black/80 text-[#FFD700] backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#FFD700] transition-colors">
                    {item.title || 'Uniform Detail'}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-black rounded-2xl overflow-hidden border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 rounded-full text-white hover:text-[#FFD700] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={lightboxItem.image_url}
                alt={lightboxItem.title || 'Enlarged uniform view'}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            <div className="p-6 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FFD700] tracking-wider block">
                  {lightboxItem.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{lightboxItem.title || 'Uniform Detail'}</h3>
                {lightboxItem.caption && (
                  <p className="text-xs text-gray-400 mt-1 max-w-xl">{lightboxItem.caption}</p>
                )}
              </div>
              <a
                href={buildWhatsAppUrl(`Hello Hari, I saw this design in your gallery (${lightboxItem.title || lightboxItem.category}) and would like to inquire for our institution.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#1EBE5D] transition-colors shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enquire This Design</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
