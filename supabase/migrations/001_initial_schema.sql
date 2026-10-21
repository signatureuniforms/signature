-- ============================================================
-- Signature Uniforms by Hari — Supabase Database Migration
-- File: 001_initial_schema.sql
-- Run in Supabase SQL Editor or via: supabase db push
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ADMIN PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_profiles_username ON admin_profiles(username);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  value_json JSONB,
  label TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  updated_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- ============================================================
-- MEDIA ASSETS
-- ============================================================
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cloudinary_public_id TEXT UNIQUE NOT NULL,
  secure_url TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'image' CHECK (resource_type IN ('image', 'video', 'raw')),
  format TEXT,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  alt_text TEXT NOT NULL DEFAULT '',
  folder TEXT,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_assets_resource_type ON media_assets(resource_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON media_assets(folder);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON media_assets(created_at DESC);

-- ============================================================
-- CLOUDINARY DELETION QUEUE
-- ============================================================
CREATE TABLE IF NOT EXISTS cloudinary_deletion_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cloudinary_public_id TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'image',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  last_attempted_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error_message TEXT,
  completed_at TIMESTAMPTZ,
  queued_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deletion_queue_status ON cloudinary_deletion_queue(status);
CREATE INDEX IF NOT EXISTS idx_deletion_queue_next_retry ON cloudinary_deletion_queue(next_retry_at) WHERE status IN ('pending', 'failed');

-- ============================================================
-- PAGE CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(page_key, section_key)
);
CREATE INDEX IF NOT EXISTS idx_page_content_page_key ON page_content(page_key);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_position ON categories(position);
CREATE INDEX IF NOT EXISTS idx_categories_enabled ON categories(is_enabled);

-- ============================================================
-- SUBCATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_position ON subcategories(position);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  specifications JSONB NOT NULL DEFAULT '{}',
  available_sizes TEXT[] DEFAULT '{}',
  available_colors TEXT[] DEFAULT '{}',
  minimum_order_quantity INTEGER,
  show_price BOOLEAN NOT NULL DEFAULT FALSE,
  price_from NUMERIC(10,2),
  price_label TEXT,
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'made_to_order', 'seasonal', 'discontinued')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

-- ============================================================
-- PRODUCT MEDIA
-- ============================================================
CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);

-- ============================================================
-- GALLERY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  caption TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_items_published ON gallery_items(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_items_position ON gallery_items(position);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL,
  organization TEXT,
  designation TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(is_published) WHERE is_published = TRUE;

-- ============================================================
-- ENQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL DEFAULT ('SU-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex'), 1, 8))),
  enquiry_type TEXT NOT NULL DEFAULT 'contact' CHECK (enquiry_type IN ('contact', 'school_bulk', 'whatsapp_product', 'whatsapp_general', 'product_quote')),
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  institution_name TEXT,
  designation TEXT,
  location TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_snapshot JSONB,
  quantity INTEGER,
  requirements TEXT,
  preferred_timeline TEXT,
  message TEXT,
  source_page TEXT,
  source_url TEXT,
  whatsapp_opened BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_opened_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quotation_sent', 'follow_up', 'converted', 'closed')),
  admin_notes TEXT,
  assigned_to UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_enquiries_reference ON enquiries(reference);
CREATE INDEX IF NOT EXISTS idx_enquiries_type ON enquiries(enquiry_type);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex'), 1, 8))),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  institution_name TEXT,
  location TEXT,
  products JSONB NOT NULL DEFAULT '[]',
  total_quantity INTEGER,
  special_requirements TEXT,
  requested_delivery_date DATE,
  confirmed_delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN (
    'pending_confirmation', 'confirmed', 'in_production',
    'ready_for_dispatch', 'dispatched', 'delivered', 'cancelled'
  )),
  admin_notes TEXT,
  assigned_to UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- ============================================================
-- ENQUIRY STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS enquiry_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_enquiry_status_history_enquiry_id ON enquiry_status_history(enquiry_id);

-- ============================================================
-- ADMIN ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  entity_label TEXT,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON admin_activity_logs(created_at DESC);

-- ============================================================
-- HERO VIDEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS hero_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL DEFAULT 'Homepage Hero',
  desktop_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  mobile_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  poster_image_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  fallback_image_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  heading TEXT NOT NULL DEFAULT 'Premium Uniforms. Trusted Quality.',
  subheading TEXT NOT NULL DEFAULT 'Uniform solutions for schools, institutions, and businesses.',
  primary_cta_label TEXT NOT NULL DEFAULT 'Request Bulk Pricing',
  primary_cta_href TEXT NOT NULL DEFAULT '/enquiry/school-bulk',
  secondary_cta_label TEXT NOT NULL DEFAULT 'Explore Collections',
  secondary_cta_href TEXT NOT NULL DEFAULT '/categories',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WHY CHOOSE US
-- ============================================================
CREATE TABLE IF NOT EXISTS why_choose_us_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heading TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_name TEXT,
  image_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_why_choose_us_position ON why_choose_us_items(position);

-- ============================================================
-- BUSINESS SEGMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS business_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_segments_position ON business_segments(position);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admin_profiles','site_settings','media_assets',
    'page_content','categories','subcategories',
    'products','gallery_items','testimonials','enquiries','orders',
    'hero_videos','why_choose_us_items','business_segments'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t);
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloudinary_deletion_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE why_choose_us_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_segments ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is active admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid() AND is_active = TRUE
  );
END;
$$;

-- Public read: published/enabled content
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (is_enabled = TRUE);
CREATE POLICY "public_read_subcategories" ON subcategories FOR SELECT USING (is_enabled = TRUE);
CREATE POLICY "public_read_products" ON products FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public_read_product_media" ON product_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM products WHERE id = product_media.product_id AND is_published = TRUE)
);
CREATE POLICY "public_read_gallery" ON gallery_items FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public_read_media_assets" ON media_assets FOR SELECT USING (TRUE);
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "public_read_page_content" ON page_content FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public_read_hero_videos" ON hero_videos FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_why_choose_us" ON why_choose_us_items FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public_read_business_segments" ON business_segments FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (is_published = TRUE);

-- Public can submit enquiries
CREATE POLICY "public_insert_enquiries" ON enquiries FOR INSERT WITH CHECK (TRUE);

-- Admin: full access to all tables
DO $$
DECLARE t TEXT; pname TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admin_profiles','site_settings','media_assets','cloudinary_deletion_queue',
    'page_content','categories','subcategories',
    'products','product_media','gallery_items','testimonials','enquiries',
    'orders','order_status_history','enquiry_status_history','admin_activity_logs',
    'hero_videos','why_choose_us_items','business_segments'
  ] LOOP
    pname := 'admin_all_' || t;
    EXECUTE format('
      DROP POLICY IF EXISTS %I ON %I;
      CREATE POLICY %I ON %I USING (is_admin()) WITH CHECK (is_admin());
    ', pname, t, pname, t);
  END LOOP;
END;
$$;

-- ============================================================
-- SEED DATA (required business data only)
-- ============================================================

-- Site settings
INSERT INTO site_settings (key, value, label, category) VALUES
  ('business_name', 'Signature Uniforms by Hari', 'Business Name', 'general'),
  ('tagline', 'Premium Uniforms. Trusted Quality.', 'Tagline', 'general'),
  ('phone', '9287344297', 'Phone Number', 'contact'),
  ('whatsapp_number', '+919287342297', 'WhatsApp Number', 'contact'),
  ('email', 'signatureuniformshari@gmail.com', 'Email Address', 'contact'),
  ('address', 'SKM Road, Kodakara, Thrissur, Kerala', 'Business Address', 'contact'),
  ('website', 'https://www.signatureuniforms.in', 'Website URL', 'general'),
  ('google_maps_url', 'https://maps.google.com/?q=SKM+Road+Kodakara+Thrissur+Kerala', 'Google Maps URL', 'contact'),
  ('copyright_text', '© 2024 Signature Uniforms by Hari. All rights reserved.', 'Copyright Text', 'footer'),
  ('footer_description', 'Premium uniform manufacturer and wholesale supplier for schools, colleges, corporate offices, hospitals, and industries across Kerala.', 'Footer Description', 'footer')
ON CONFLICT (key) DO NOTHING;

-- Business segments
INSERT INTO business_segments (name, slug, description, position, is_published) VALUES
  ('Schools', 'schools', 'Comprehensive uniform solutions for schools of all sizes, from primary level to higher secondary.', 1, TRUE),
  ('Colleges', 'colleges', 'Professional uniform programs for colleges and higher education institutions.', 2, TRUE),
  ('Corporate Offices', 'corporate', 'Sophisticated staff uniforms for offices, retail outlets, and business establishments.', 3, TRUE),
  ('Hospitals & Nursing', 'hospitals', 'Hygienic, comfortable, and professional uniforms for healthcare and nursing institutions.', 4, TRUE),
  ('Industries', 'industries', 'Durable and safety-compliant workwear for factories, warehouses, and industrial facilities.', 5, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Default hero
INSERT INTO hero_videos (label, heading, subheading, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, is_active)
VALUES ('Homepage Hero', 'Premium Uniforms. Trusted Quality.', 'Uniform solutions for schools, institutions, and businesses.',
  'Request Bulk Pricing', '/enquiry/school-bulk', 'Explore Collections', '/categories', TRUE)
ON CONFLICT DO NOTHING;
