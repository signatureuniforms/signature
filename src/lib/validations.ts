import { z } from 'zod'

// ─── School Bulk Order Enquiry ────────────────────────────────────────────────
export const schoolBulkEnquirySchema = z.object({
  institution_name: z.string().min(2, 'Institution name is required').max(200),
  contact_name: z.string().min(2, 'Contact name is required').max(100),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  location: z.string().min(2, 'School location is required').max(200),
  quantity: z.coerce
    .number()
    .int()
    .min(1, 'Enter a valid quantity')
    .optional()
    .or(z.literal(undefined)),
  requirements: z.string().max(1000).optional().or(z.literal('')),
  preferred_timeline: z.string().max(200).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
})

export type SchoolBulkEnquiryInput = z.infer<typeof schoolBulkEnquirySchema>

// ─── Contact Form ─────────────────────────────────────────────────────────────
export const contactEnquirySchema = z.object({
  contact_name: z.string().min(2, 'Name is required').max(100),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  message: z.string().min(2, 'Please enter your message').max(2000),
})


export type ContactEnquiryInput = z.infer<typeof contactEnquirySchema>

// ─── Product Quote Enquiry ────────────────────────────────────────────────────
export const productQuoteSchema = z.object({
  contact_name: z.string().min(2, 'Name is required').max(100),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  institution_name: z.string().max(200).optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1).optional().or(z.literal(undefined)),
  requirements: z.string().max(1000).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
})

export type ProductQuoteInput = z.infer<typeof productQuoteSchema>

// ─── Admin: Category ─────────────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(500).optional().or(z.literal('')),
  position: z.coerce.number().int().min(0).default(0),
  is_enabled: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  meta_title: z.string().max(200).optional().or(z.literal('')),
  meta_description: z.string().max(500).optional().or(z.literal('')),
})

export type CategoryInput = z.infer<typeof categorySchema>

// ─── Admin: Subcategory ───────────────────────────────────────────────────────
export const subcategorySchema = z.object({
  category_id: z.string().uuid('Select a category'),
  name: z.string().min(2, 'Name is required').max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(500).optional().or(z.literal('')),
  position: z.coerce.number().int().min(0).default(0),
  is_enabled: z.boolean().default(true),
})

export type SubcategoryInput = z.infer<typeof subcategorySchema>

// ─── Admin: Product ───────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  category_id: z.string().uuid().optional().nullable(),
  subcategory_id: z.string().uuid().optional().nullable(),
  short_description: z.string().max(300).optional().or(z.literal('')),
  full_description: z.string().max(5000).optional().or(z.literal('')),
  available_sizes: z.array(z.string()).default([]),
  available_colors: z.array(z.string()).default([]),
  minimum_order_quantity: z.coerce.number().int().min(1).optional().nullable(),
  show_price: z.boolean().default(false),
  price_from: z.coerce.number().min(0).optional().nullable(),
  price_label: z.string().max(100).optional().or(z.literal('')),
  availability_status: z
    .enum(['available', 'made_to_order', 'seasonal', 'discontinued'])
    .default('available'),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  position: z.coerce.number().int().min(0).default(0),
})

export type ProductInput = z.infer<typeof productSchema>

// ─── Admin: Gallery Item ──────────────────────────────────────────────────────
export const galleryItemSchema = z.object({
  caption: z.string().max(300).optional().or(z.literal('')),
  category: z.string().max(100).default('general'),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  position: z.coerce.number().int().min(0).default(0),
})

export type GalleryItemInput = z.infer<typeof galleryItemSchema>

// ─── Admin: Site Setting ──────────────────────────────────────────────────────
export const siteSettingSchema = z.object({
  value: z.string().max(2000).optional().or(z.literal('')),
})

export type SiteSettingInput = z.infer<typeof siteSettingSchema>

// ─── Admin: Hero Video ────────────────────────────────────────────────────────
export const heroVideoSchema = z.object({
  heading: z.string().min(1, 'Heading is required').max(200),
  subheading: z.string().max(400).optional().or(z.literal('')),
  primary_cta_label: z.string().min(1, 'CTA label is required').max(100),
  primary_cta_href: z.string().min(1, 'CTA link is required').max(500),
  secondary_cta_label: z.string().max(100).optional().or(z.literal('')),
  secondary_cta_href: z.string().max(500).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
})

export type HeroVideoInput = z.infer<typeof heroVideoSchema>
