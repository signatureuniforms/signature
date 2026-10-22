'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, CheckCircle2, Loader2, MessageCircle, Upload, Trash2 } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/constants'

interface OpenDrawerOptions {
  category?: string
  productName?: string
}

interface BulkQuoteContextType {
  isOpen: boolean
  openDrawer: (options?: OpenDrawerOptions) => void
  closeDrawer: () => void
}

const BulkQuoteContext = createContext<BulkQuoteContextType | null>(null)

export function useBulkQuote() {
  const context = useContext(BulkQuoteContext)
  if (!context) {
    throw new Error('useBulkQuote must be used within a BulkQuoteProvider')
  }
  return context
}

const CATEGORY_OPTIONS = [
  'School Uniforms',
  'College & University Uniforms',
  'Corporate & Office Wear',
  'Hospital & Healthcare Scrubs',
  'Hotel, Chef & Hospitality',
  'Industrial & Security Uniforms',
  'Sports & Fitness Wear',
  'Custom Uniform Design & Manufacturing',
]

export function BulkQuoteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialCategory, setInitialCategory] = useState('')
  const [initialProduct, setInitialProduct] = useState('')

  const openDrawer = (options?: OpenDrawerOptions) => {
    if (options?.category) setInitialCategory(options.category)
    if (options?.productName) setInitialProduct(options.productName)
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
  }

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <BulkQuoteContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
      <BulkQuotationDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        defaultCategory={initialCategory}
        defaultProduct={initialProduct}
      />
    </BulkQuoteContext.Provider>
  )
}

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  defaultCategory?: string
  defaultProduct?: string
}

export function BulkQuotationDrawer({ isOpen, onClose, defaultCategory, defaultProduct }: DrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    category: '',
    quantity: '',
    notes: '',
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ reference: string; name: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync default category when drawer opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null)
      setSuccessData(null)
      if (defaultCategory) {
        setFormData((prev) => ({
          ...prev,
          category: defaultCategory,
          notes: defaultProduct ? `Inquiring about ${defaultProduct}` : prev.notes,
        }))
      }
    }
  }, [isOpen, defaultCategory, defaultProduct])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 10MB.')
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const data = new FormData()
      data.append('contact_name', formData.name.trim())
      data.append('institution_name', formData.company.trim())
      data.append('phone', formData.phone.trim())
      data.append('category', formData.category.trim())
      if (formData.quantity) data.append('quantity', formData.quantity.trim())
      if (formData.notes) data.append('notes', formData.notes.trim())
      if (selectedImage) data.append('image', selectedImage)

      const res = await fetch('/api/enquiries/bulk-quote', {
        method: 'POST',
        body: data,
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit enquiry. Please try again.')
      }

      setSuccessData({
        reference: json.reference || 'SU-QUOTE',
        name: formData.name,
      })
      // Reset form
      setFormData({
        name: '',
        company: '',
        phone: '',
        category: '',
        quantity: '',
        notes: '',
      })
      handleRemoveImage()
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const waFollowUpUrl = successData
    ? buildWhatsAppUrl(
        `Hello Hari, I just submitted quotation request ${successData.reference} for uniform manufacturing. Could we discuss bulk pricing and fabric samples?`
      )
    : ''

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] cursor-pointer"
          />

          {/* Right Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white text-black shadow-2xl z-50 flex flex-col justify-between overflow-y-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-gray-500 hover:text-black transition-colors rounded-full hover:bg-gray-100 z-10 cursor-pointer"
              aria-label="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 md:p-10 flex-1 flex flex-col">
              {/* Brand Logo */}
              <div className="flex justify-center mb-3">
                <Image
                  src="/logo/logo.png"
                  alt="Signature Uniforms"
                  width={160}
                  height={56}
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </div>

              {/* Title matching screenshot styling */}
              <h2
                className="text-center text-lg sm:text-xl font-normal text-gray-900 tracking-[0.14em] uppercase mb-6 sm:mb-8"
                style={{ fontFamily: "'Regular-Light', serif" }}
              >
                Speak With Our Uniform Consultant
              </h2>

              {successData ? (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="my-auto py-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Quotation Request Received</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Reference Number:{' '}
                      <span className="font-mono font-bold text-gray-800">{successData.reference}</span>
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                    Thank you {successData.name}. Our uniform consultant is reviewing your specifications and will get
                    back to you with customized pricing and fabric recommendations shortly.
                  </p>

                  <div className="pt-4 space-y-2.5">
                    <a
                      href={waFollowUpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full font-bold text-xs tracking-wider uppercase transition-all shadow-md"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Chat on WhatsApp Instantly</span>
                    </a>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3 px-6 border border-gray-200 hover:border-black text-gray-800 rounded-full font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 sm:space-y-5">
                    {/* Your Name */}
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Name*"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border-b border-gray-300 focus:border-black py-2 px-0 text-base sm:text-sm outline-none transition-colors placeholder:text-gray-400 bg-transparent"
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Company Name*"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full border-b border-gray-300 focus:border-black py-2 px-0 text-base sm:text-sm outline-none transition-colors placeholder:text-gray-400 bg-transparent"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="Mobile Number*"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border-b border-gray-300 focus:border-black py-2 px-0 text-base sm:text-sm outline-none transition-colors placeholder:text-gray-400 bg-transparent"
                      />
                    </div>

                    {/* Select Uniform Category */}
                    <div className="relative">
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full border-b border-gray-300 focus:border-black py-2 px-0 text-base sm:text-sm outline-none transition-colors text-gray-800 bg-transparent appearance-none cursor-pointer pr-6"
                      >
                        <option value="" disabled className="text-gray-400">
                          Select Uniform Category*
                        </option>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat} className="text-gray-900 bg-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-0 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Quantity Required */}
                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Quantity Required"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full border-b border-gray-300 focus:border-black py-2 px-0 text-base sm:text-sm outline-none transition-colors placeholder:text-gray-400 bg-transparent"
                      />
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <textarea
                        rows={2}
                        placeholder="Additional Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full border-b border-gray-300 focus:border-black py-2 px-0 text-base sm:text-sm outline-none transition-colors placeholder:text-gray-400 bg-transparent resize-none"
                      />
                    </div>

                    {/* Upload Uniform Reference Image (Optional) */}
                    <div className="pt-2">
                      <label className="block text-xs text-gray-700 font-medium">
                        Upload Uniform Reference Image (Optional)
                      </label>
                      <p className="text-[11px] text-gray-400 mt-0.5 mb-2.5">
                        (You can add any sample image to show the design you want.)
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />

                      {imagePreview ? (
                        <div className="relative inline-flex items-center gap-3 p-2 bg-gray-50 border border-gray-200">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-12 h-12 object-cover border border-gray-200"
                          />
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {selectedImage?.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {((selectedImage?.size || 0) / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-1.5 right-1.5 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-black text-xs font-medium text-gray-700 bg-white transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Image</span>
                        </button>
                      )}
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-red-600 bg-red-50 p-2.5 border border-red-200">
                        {errorMsg}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 mt-auto">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold-sweep w-full py-3.5 sm:py-4 bg-black disabled:opacity-50 text-white rounded-none font-bold text-xs tracking-[0.2em] uppercase transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/**
 * Reusable client button that triggers the Bulk Quotation Drawer
 */
export function BulkQuoteButton({
  children = 'Request a Bulk Quotation',
  className = '',
  category,
  productName,
  style,
  id,
  'aria-label': ariaLabel,
}: {
  children?: React.ReactNode
  className?: string
  category?: string
  productName?: string
  style?: React.CSSProperties
  id?: string
  'aria-label'?: string
}) {
  const { openDrawer } = useBulkQuote()

  return (
    <button
      type="button"
      id={id}
      aria-label={ariaLabel}
      style={style}
      onClick={() => openDrawer({ category, productName })}
      className={className}
    >
      {children}
    </button>
  )
}
