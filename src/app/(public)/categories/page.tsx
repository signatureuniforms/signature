import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Grid3x3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types'

export const metadata: Metadata = {
  title: 'Uniform Categories | Signature Uniforms by Hari',
  description: 'Explore our complete uniform range: School Uniforms, College Uniforms, Corporate Workwear, Hospital & Nursing Apparel, and Industrial Uniforms.',
}

export const revalidate = 60

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*, image:media_assets(*)')
    .eq('is_enabled', true)
    .order('position', { ascending: true })

  const categoryList: Category[] = categories || []

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-black text-white pt-28 pb-16 px-6 sm:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-[#FFD700] font-semibold text-xs uppercase tracking-widest block">
            Our Manufacturing Range
          </span>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
            Uniform Segments & Collections
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
            From premier school shirts and pinafores to sterile medical scrubs and corporate blazers.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryList.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group border border-gray-200 rounded-2xl overflow-hidden hover:border-black transition-all hover:shadow-lg flex flex-col justify-between"
            >
              <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                    <Grid3x3 className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-normal text-gray-900 group-hover:text-[#FFD700] transition-colors" style={{ fontFamily: "'Regular-Light', serif", fontWeight: 400 }}>
                    {cat.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {cat.description || 'Specialized uniform solutions manufactured with premium fabrics and industrial stitch durability.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-black group-hover:text-[#FFD700]">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
