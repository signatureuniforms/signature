'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import type { Product } from '@/types'
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '@/lib/constants'
import { BulkQuoteButton } from '@/components/common/BulkQuotationDrawer'

export default function FeaturedProductsSection({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-20 lg:py-28 bg-[#0A0A0A] w-full" aria-labelledby="products-heading">
      <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D4AF37] block mb-3">Featured</span>
          <h2
            id="products-heading"
            className="text-white text-2xl sm:text-3xl md:text-4xl font-normal font-serif tracking-[0.25em] uppercase mb-4"
            style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.22em' }}
          >
            Selected Products
          </h2>
          <div className="w-12 h-[2px] bg-[#D4AF37] border-0" />
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
                className="group bg-[#171717] border border-[#2A2A2A] hover:border-[#D4AF37]/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)]"
              >
                {/* Image */}
                <div className="block">
                  <div className="relative overflow-hidden bg-neutral-900" style={{ aspectRatio: '3/4' }}>
                    {primaryMedia ? (
                      <img
                        src={primaryMedia.secure_url}
                        alt={primaryMedia.alt_text || product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-6 text-center">
                        <span className="w-12 h-12 rounded-full bg-[#0A0A0A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-lg mb-3">
                          SU
                        </span>
                        <span className="text-[#A3A3A3] text-xs font-mono uppercase tracking-wider">
                          Wholesale Standard
                        </span>
                      </div>
                    )}
                    {product.min_order_quantity && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-[#0A0A0A]/90 text-[#D4AF37] border border-[#2A2A2A] backdrop-blur-sm">
                        MOQ: {product.min_order_quantity} pcs
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1">
                    <h3
                      className="font-semibold text-white text-base mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-1"
                      style={{ fontFamily: "'Regular-Light', serif", letterSpacing: '0.05em' }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-[#A3A3A3] text-xs leading-relaxed line-clamp-2 mb-3">
                      {product.short_description}
                    </p>
                    <div className="text-xs font-semibold text-white">
                      {product.show_price && product.base_price ? (
                        <span>₹{product.base_price} <span className="text-[#A3A3A3] font-normal">/ pc</span></span>
                      ) : (
                        <span className="text-[#D4AF37]">Institutional Pricing on Request</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Request Quote + WhatsApp */}
                <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-2">
                  <BulkQuoteButton
                    productName={product.name}
                    category={product.category?.name || 'Uniform Manufacturing'}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    <span>Request Quote</span>
                  </BulkQuoteButton>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#0A0A0A] hover:bg-[#25D366] text-[#A3A3A3] hover:text-white rounded-xl text-xs font-semibold transition-all border border-[#2A2A2A] hover:border-[#25D366]"
                    aria-label={`Enquire about ${product.name} on WhatsApp`}
                  >
                    <MessageCircle size={14} />
                    WhatsApp
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
            className="btn-gold-sweep inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[#2A2A2A] text-white text-xs font-semibold uppercase tracking-wider hover:border-[#D4AF37] transition-all cursor-pointer"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
