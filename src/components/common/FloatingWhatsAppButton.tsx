'use client'

import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/constants'

interface FloatingWhatsAppButtonProps {
  customNumber?: string
  message?: string
}

export default function FloatingWhatsAppButton({
  customNumber,
  message = 'Hello, I would like to enquire about bulk uniform pricing.',
}: FloatingWhatsAppButtonProps) {
  const waUrl = buildWhatsAppUrl(message, customNumber)

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      id="floating-whatsapp-btn"
      className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.45)] hover:scale-110 active:scale-95 transition-all duration-200 border border-neutral-200/90 hover:border-[#25D366]/50 group"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-[#25D366] text-[#25D366] transition-transform duration-200 group-hover:scale-105" />
    </a>
  )
}
