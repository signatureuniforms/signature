// Shared TypeScript types for Signature Uniforms by Hari
// These mirror the Supabase database schema

export type ResourceType = 'image' | 'video' | 'raw'
export type AdminRole = 'admin'
export type ProductAvailability = 'available' | 'made_to_order' | 'seasonal' | 'discontinued'
export type EnquiryType = 'contact' | 'school_bulk' | 'whatsapp_product' | 'whatsapp_general' | 'product_quote'
export type EnquiryStatus = 'new' | 'contacted' | 'quotation_sent' | 'follow_up' | 'converted' | 'closed'

// ─── Media ────────────────────────────────────────────────────────────────────
export interface MediaAsset {
  id: string
  cloudinary_public_id: string
  secure_url: string
  resource_type: ResourceType
  format: string | null
  width: number | null
  height: number | null
  file_size: number | null
  alt_text: string
  folder: string | null
  tags: string[]
  usage_count: number
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminProfile {
  id: string
  user_id: string
  username: string
  display_name: string
  role: AdminRole
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

// ─── Site Settings ────────────────────────────────────────────────────────────
export interface SiteSetting {
  id: string
  key: string
  value: string | null
  value_json: Record<string, unknown> | null
  label: string | null
  description: string | null
  category: string
  updated_by: string | null
  updated_at: string
}

// ─── Categories ───────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_id?: string | null
  image_url?: string | null
  position?: number
  display_order?: number
  is_enabled: boolean
  is_featured: boolean
  meta_title?: string | null
  meta_description?: string | null
  created_at?: string
  updated_at?: string
  // Joined
  image?: MediaAsset | null
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description?: string
  image_id?: string | null
  position?: number
  display_order?: number
  is_enabled: boolean
  meta_title?: string | null
  meta_description?: string | null
  created_at?: string
  updated_at?: string
  // Joined
  image?: MediaAsset | null
  category?: Category
}

// ─── Products ─────────────────────────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  slug: string
  category_id: string | null
  subcategory_id?: string | null
  short_description?: string
  full_description?: string
  description?: string
  fabric_composition?: string
  care_instructions?: string
  specifications?: Record<string, string>
  available_sizes?: string[]
  available_colors?: string[]
  minimum_order_quantity?: number | null
  min_order_quantity?: number | null
  show_price: boolean
  price_from?: number | null
  base_price?: number | null
  price_label?: string | null
  availability_status?: ProductAvailability
  is_featured: boolean
  is_published: boolean
  position?: number
  display_order?: number
  primary_image_url?: string | null
  gallery_image_urls?: string[]
  meta_title?: string | null
  meta_description?: string | null
  created_at?: string
  updated_at?: string
  // Joined
  category?: Category | null
  subcategory?: Subcategory | null
  media?: ProductMedia[]
}

export interface ProductMedia {
  id: string
  product_id: string
  asset_id: string
  media_type: 'image' | 'video'
  is_primary: boolean
  position?: number
  created_at?: string
  // Joined
  asset?: MediaAsset
}


// ─── Hero Video ───────────────────────────────────────────────────────────────
export interface HeroVideo {
  id: string
  label?: string
  title?: string
  subtitle?: string
  desktop_asset_id?: string | null
  mobile_asset_id?: string | null
  desktop_video_url?: string | null
  desktop_video_public_id?: string | null
  mobile_video_url?: string | null
  mobile_video_public_id?: string | null
  poster_image_id?: string | null
  poster_image_url?: string | null
  fallback_image_id?: string | null
  heading?: string
  subheading?: string
  primary_cta_label?: string
  primary_cta_href?: string
  primary_cta_text?: string
  primary_cta_link?: string
  secondary_cta_label?: string
  secondary_cta_href?: string
  secondary_cta_text?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  // Joined
  desktop_asset?: MediaAsset | null
  mobile_asset?: MediaAsset | null
  poster_image?: MediaAsset | null
  fallback_image?: MediaAsset | null
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────
export interface WhyChooseUsContent {
  image_url?: string | null
  eyebrow?: string | null
  title?: string | null
  is_published?: boolean
}

export interface WhyChooseUsItem {
  id: string
  heading: string
  description: string
  icon_name: string | null
  image_id: string | null
  position: number
  is_published: boolean
  created_at: string
  updated_at: string
  image?: MediaAsset | null
}



// ─── Enquiries ────────────────────────────────────────────────────────────────
export interface Enquiry {
  id: string
  reference: string
  enquiry_type: EnquiryType
  contact_name: string
  phone: string
  email: string | null
  institution_name: string | null
  designation: string | null
  location: string | null
  product_id: string | null
  product_snapshot: Record<string, unknown> | null
  quantity: number | null
  requirements: string | null
  preferred_timeline: string | null
  message: string | null
  source_page: string | null
  source_url: string | null
  whatsapp_opened: boolean
  whatsapp_opened_at: string | null
  status: EnquiryStatus
  admin_notes: string | null
  assigned_to: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
}


// ─── Page Content ─────────────────────────────────────────────────────────────
export interface PageContent {
  id: string
  page_key: string
  section_key: string
  content: Record<string, unknown>
  is_published: boolean
  updated_by: string | null
  updated_at: string
}

export interface AboutSectionContent {
  subheading?: string
  heading?: string
  description?: string
  image_url?: string
}

export interface VisionMissionContent {
  section_subheading?: string
  section_heading?: string
  vision_heading?: string
  vision_description?: string
  mission_heading?: string
  mission_description?: string
}

export interface BrandLogo {
  id: string
  name: string
  image_url: string
}

export interface TrustedBrandsContent {
  bottom_content?: string
  logos?: BrandLogo[]
}

export interface VideoBannerContent {
  heading?: string
  description?: string
  video_url?: string
}

export interface CraftsmanshipFeature {
  id: string
  icon_name: string
  title: string
  description: string
}

export interface CraftsmanshipContent {
  eyebrow?: string
  title?: string
  heading?: string
  description?: string
  main_image_url?: string
  inset_image_1_url?: string
  inset_image_2_url?: string
  features?: CraftsmanshipFeature[]
}

export interface FooterFeatureItem {
  id: string
  icon_url: string
  heading: string
  description: string
}

export interface FooterFeaturesContent {
  items: FooterFeatureItem[]
}


// ─── Forms ────────────────────────────────────────────────────────────────────
export interface SchoolBulkEnquiryForm {
  institution_name: string
  contact_name: string
  phone: string
  email?: string
  location: string
  quantity?: number
  requirements?: string
  preferred_timeline?: string
  message?: string
}

export interface ContactEnquiryForm {
  contact_name: string
  phone: string
  email?: string
  message: string
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  total_products: number
  published_products: number
  total_categories: number
  total_subcategories: number
  total_enquiries: number
  new_enquiries: number
}
