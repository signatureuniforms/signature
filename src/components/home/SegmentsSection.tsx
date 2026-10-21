'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { BusinessSegment } from '@/types'

export default function SegmentsSection({ segments }: { segments: BusinessSegment[] }) {
  if (segments.length === 0) return null

  return (
    <section className="py-20 lg:py-28 bg-white w-full" aria-labelledby="segments-heading">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#FFD700] block mb-3">Who We Serve</span>
          <h2
            id="segments-heading"
            className="text-4xl lg:text-5xl font-normal text-black mb-4 font-display"
            style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}
          >
            Uniform Solutions For Every Sector
          </h2>
          <div className="w-12 h-[2px] bg-[#FFD700] border-0" />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group"
            >
              <div
                className="rounded-2xl overflow-hidden bg-black relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default"
                style={{ aspectRatio: '3/4' }}
              >
                {seg.image?.secure_url ? (
                  <Image
                    src={seg.image.secure_url}
                    alt={seg.name}
                    fill
                    className="object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-60"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-black" aria-hidden="true" />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)' }}
                  aria-hidden="true"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-sm leading-snug" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {seg.name}
                  </h3>
                </div>
              </div>
              {seg.description && (
                <p className="text-gray-500 text-xs mt-3 leading-relaxed line-clamp-2">{seg.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
