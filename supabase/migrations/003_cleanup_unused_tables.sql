-- ============================================================
-- Signature Uniforms by Hari — Database Optimization & Cleanup
-- File: 003_cleanup_unused_tables.sql
-- Purpose: Remove redundant, unused, and dead tables
-- Preserves all essential catalog, CMS, media, settings, and enquiry tables.
-- ============================================================

-- 1. Drop foreign key dependencies and child tables first
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS enquiry_status_history CASCADE;
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS gallery_items CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS business_segments CASCADE;
DROP TABLE IF EXISTS cloudinary_deletion_queue CASCADE;

-- 2. Clean up obsolete RLS policies and update updated_at triggers
DO $$
DECLARE t TEXT;
BEGIN
  -- Re-bind set_updated_at trigger only to actively used tables
  FOREACH t IN ARRAY ARRAY[
    'admin_profiles',
    'site_settings',
    'media_assets',
    'page_content',
    'categories',
    'subcategories',
    'products',
    'enquiries',
    'hero_videos',
    'why_choose_us_items'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t);
  END LOOP;
END;
$$;

-- Verification comment:
-- Actively retained and preserved tables (11 total):
-- 1. admin_profiles (Authentication & Admin RLS helper)
-- 2. site_settings (Business phone, email, address, WhatsApp, footer config)
-- 3. media_assets (Cloudinary assets, URLs, public IDs, dimensions)
-- 4. page_content (Consolidated CMS JSON for About, Brands, Craftsmanship, Banner, Footer)
-- 5. categories (Uniform segments: School, College, Corporate, Hospital)
-- 6. subcategories (Segment breakdown: Boys, Girls, Lab Coats, Scrubs)
-- 7. products (Catalog items: specs, sizes, colors, MOQ, wholesale pricing)
-- 8. product_media (Primary and secondary product image associations)
-- 9. enquiries (Quotations, contact messages, and direct WhatsApp leads)
-- 10. hero_videos (Homepage hero video & CTA links)
-- 11. why_choose_us_items (Homepage Why Choose Us accordion reasons)
