// Brand constants — single source of truth
export const BRAND = {
  name: 'Signature Uniforms by Hari',
  tagline: 'Premium Uniforms. Trusted Quality.',
  phone: '9287344297',
  whatsapp: '+919287342297',
  whatsappNumber: '+919287342297',
  email: 'signatureuniformshari@gmail.com',
  address: 'SKM Road, Kodakara, Thrissur, Kerala',
  website: 'https://www.signatureuniforms.in',
  mapsUrl: 'https://maps.google.com/?q=SKM+Road+Kodakara+Thrissur+Kerala',
} as const

export const COLORS = {
  black: '#0A0A0A',
  charcoal: '#171717',
  white: '#FFFFFF',
  gold: '#D4AF37',
  goldHover: '#E5C158',
  border: '#2A2A2A',
  muted: '#A3A3A3',
} as const

// WhatsApp helpers
export function buildWhatsAppUrl(message: string, customNumber?: string): string {
  const number = customNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || BRAND.whatsappNumber || '+919287342297'
  const encoded = encodeURIComponent(message.trim())
  return `https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encoded}`
}

export function buildProductWhatsAppMessage(
  optsOrName:
    | string
    | {
        productName: string
        quantity?: number | null
        requirements?: string
        productUrl?: string
      },
  qty?: number | null
): string {
  if (typeof optsOrName === 'string') {
    return [
      `Hello, I am interested in enquiring about:`,
      `Product: ${optsOrName}`,
      qty ? `Minimum Quantity: ${qty} units` : '',
      ``,
      `Please provide pricing and wholesale order details. Thank you.`,
    ]
      .filter(Boolean)
      .join('\n')
  }

  const lines = [
    `Hello, I am interested in enquiring about:`,
    `Product: ${optsOrName.productName}`,
    optsOrName.quantity ? `Quantity: ${optsOrName.quantity} units` : '',
    optsOrName.requirements ? `Requirements: ${optsOrName.requirements}` : '',
    optsOrName.productUrl ? `Product link: ${optsOrName.productUrl}` : '',
    ``,
    `Please provide pricing and availability details. Thank you.`,
  ]
  return lines.filter(Boolean).join('\n')
}

export function buildBulkOrderWhatsAppMessage(opts: {
  institutionName: string
  contactName: string
  phone: string
  location?: string
  quantity?: number
  requirements?: string
  timeline?: string
  reference?: string
}): string {
  const lines = [
    `Hello, I have submitted a school bulk uniform enquiry on your website.`,
    ``,
    `Institution: ${opts.institutionName}`,
    `Contact: ${opts.contactName}`,
    `Phone: ${opts.phone}`,
    opts.location ? `Location: ${opts.location}` : '',
    opts.quantity ? `Estimated Quantity: ${opts.quantity} students` : '',
    opts.requirements ? `Requirements: ${opts.requirements}` : '',
    opts.timeline ? `Preferred Timeline: ${opts.timeline}` : '',
    opts.reference ? `Enquiry Reference: ${opts.reference}` : '',
    ``,
    `Please get in touch to discuss further. Thank you.`,
  ]
  return lines.filter(Boolean).join('\n')
}

// Enquiry status labels
export const ENQUIRY_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  quotation_sent: 'Quotation Sent',
  follow_up: 'Follow-up Required',
  converted: 'Converted',
  closed: 'Closed',
}

export const ENQUIRY_TYPE_LABELS: Record<string, string> = {
  contact: 'Contact Form',
  school_bulk: 'School Bulk Order',
  whatsapp_product: 'WhatsApp Product',
  whatsapp_general: 'WhatsApp General',
  product_quote: 'Product Quote',
}

// Cloudinary folder structure
export const CLOUDINARY_FOLDERS = {
  categories: 'categories',
  products: 'products',
  gallery: 'gallery',
  hero: 'hero',
  segments: 'segments',
  whyChooseUs: 'why-choose-us',
  logo: 'logo',
  misc: 'misc',
} as const
