'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import type { Product } from '@/types'
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '@/lib/constants'

export default function FeaturedProductsSection({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-20 lg:py-28 bg-black w-full" aria-labelledby="products-heading">
      <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#FFD700] block mb-3">Featured</span>
          <h2
            id="products-heading"
            className="text-white text-2xl sm:text-3xl md:text-4xl font-normal font-serif tracking-[0.25em] uppercase mb-4"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            Selected Products
          </h2>
          <div className="w-12 h-[2px] bg-[#FFD700] border-0" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => {
            const primaryMedia = product.media?.find((m) => m.is_primary)?.asset
              ?? product.media?.[0]?.asset
            const waMsg = buildProductWhatsAppMessage(product.name, product.min_order_quantity)
            const waUrl = buildWhatsAppUrl(waMsg)

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="group bg-white rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Image */}
                <Link href={`/products/${product.slug}`} aria-label={product.name}>
                  <div className="relative overflow-hidden bg-zinc-900" style={{ aspectRatio: '3/4' }}>
                    {primaryMedia ? (
                      <img
                        src={primaryMedia.secure_url}
                        alt={primaryMedia.alt_text || product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
                        <span className="w-12 h-12 rounded-full bg-black/60 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] font-bold text-lg mb-3">
                          SU
                        </span>
                        <span className="text-white/60 text-xs font-mono uppercase tracking-wider">
                          Wholesale Standard
                        </span>
                      </div>
                    )}
                    {product.min_order_quantity && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-black/85 text-[#FFD700] backdrop-blur-sm">
                        MOQ: {product.min_order_quantity} pcs
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1">
                    <h3 className="font-semibold text-black text-base mb-2 group-hover:text-brand-gold transition-colors line-clamp-1"
                      style={{ fontFamily: 'Playfair Display, serif', color: '#000000' }}>
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                      {product.short_description}
                    </p>
                    <div className="text-xs font-semibold text-gray-900">
                      {product.show_price && product.base_price ? (
                        <span>₹{product.base_price} <span className="text-gray-400 font-normal">/ pc</span></span>
                      ) : (
                        <span className="text-[#E6C200]">Institutional Pricing on Request</span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* WhatsApp action */}
                <div className="px-5 pb-5 pt-1">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-[#25D366] text-gray-800 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 border border-gray-100"
                    aria-label={`Enquire about ${product.name} on WhatsApp`}
                  >
                    <MessageCircle size={15} />
                    WhatsApp Enquiry
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* View all link */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white hover:text-black transition-all"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
