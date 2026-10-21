'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { GalleryItem } from '@/types'

export default function GalleryPreviewSection({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null

  return (
    <section className="py-20 lg:py-28 bg-black w-full" aria-labelledby="gallery-preview-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#FFD700] block mb-3">Our Work</span>
            <h2
              id="gallery-preview-heading"
              className="text-white text-2xl sm:text-3xl md:text-4xl font-normal font-serif tracking-[0.25em] uppercase mb-4"
              style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
            >
              Gallery
            </h2>
            <div className="w-12 h-[2px] bg-[#FFD700] border-0" />
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-transparent hover:bg-white/10 text-white font-semibold text-sm rounded-2xl border border-white/60 hover:border-white tracking-wide transition-all duration-200 cursor-pointer self-start sm:self-auto"
          >
            View All
            <ArrowRight size={15} />
          </Link>
        </motion.div>

        {/* Masonry-style grid */}
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="break-inside-avoid rounded-2xl overflow-hidden bg-white/5 group"
            >
              {item.asset?.secure_url && (
                <div className="relative overflow-hidden">
                  <Image
                    src={item.asset.secure_url}
                    alt={item.asset.alt_text || item.caption || 'Gallery image'}
                    width={item.asset.width ?? 400}
                    height={item.asset.height ?? 400}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {item.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                      <p className="text-white text-xs">{item.caption}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
