-- ============================================================
-- Signature Uniforms — Category & Subcategory Seed
-- File: 002_seed_categories.sql
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Insert 6 main categories
INSERT INTO categories (name, slug, description, position, is_enabled, is_featured) VALUES
  ('School Uniforms',         'school-uniforms',    'Complete uniform solutions for schools — from primary level to higher secondary. Boys and girls uniforms in bulk for institutions across Kerala.', 1, TRUE, TRUE),
  ('College Uniforms',        'college-uniforms',   'Professional and presentable uniform sets for colleges and higher education institutions.', 2, TRUE, TRUE),
  ('Corporate Uniforms',      'corporate-uniforms', 'Sophisticated staff and office uniforms tailored for professional business environments.', 3, TRUE, TRUE),
  ('Hospital & Nursing Uniforms', 'hospital-nursing-uniforms', 'Hygienic, durable, and comfortable uniforms designed for healthcare professionals and nursing institutions.', 4, TRUE, TRUE),
  ('Industrial Workwear',     'industrial-workwear', 'Heavy-duty, safety-compliant workwear for factories, warehouses, and industrial facilities.', 5, TRUE, TRUE),
  ('Uniform Products',        'uniform-products',   'Ready-made uniforms, uniform fabrics, and garment components available for wholesale supply.', 6, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  is_enabled = EXCLUDED.is_enabled,
  is_featured = EXCLUDED.is_featured,
  updated_at = NOW();

-- Insert subcategories using category slugs
-- A. School Uniforms subcategories
INSERT INTO subcategories (category_id, name, slug, description, position, is_enabled)
SELECT c.id, sub.name, sub.slug, sub.description, sub.position, TRUE
FROM categories c
JOIN (VALUES
  ('Boys Uniforms',           'school-boys-uniforms',           'Complete uniform sets for boys including shirts, trousers, belts, and accessories.', 1),
  ('Girls Uniforms',          'school-girls-uniforms',          'Full uniform sets for girls including frocks, pinafores, skirts, and salwar sets.', 2),
  ('Primary School Uniforms', 'primary-school-uniforms',        'Comfortable and durable uniforms designed for primary school students.', 3),
  ('High School Uniforms',    'high-school-uniforms',           'Smart, well-finished uniforms for high school students.', 4),
  ('Plus One & Plus Two Uniforms', 'plus-one-plus-two-uniforms','Higher secondary uniform sets for Plus One and Plus Two students.', 5)
) AS sub(name, slug, description, position) ON c.slug = 'school-uniforms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  position = EXCLUDED.position, updated_at = NOW();

-- B. College Uniforms subcategories
INSERT INTO subcategories (category_id, name, slug, description, position, is_enabled)
SELECT c.id, sub.name, sub.slug, sub.description, sub.position, TRUE
FROM categories c
JOIN (VALUES
  ('College Shirts & Trousers', 'college-shirts-trousers', 'Formal shirts and trousers for college students, available in bulk for institutions.', 1),
  ('College Girls Uniforms',    'college-girls-uniforms',  'Formal salwar sets and churidar uniforms for college girls.', 2)
) AS sub(name, slug, description, position) ON c.slug = 'college-uniforms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  position = EXCLUDED.position, updated_at = NOW();

-- C. Corporate Uniforms subcategories
INSERT INTO subcategories (category_id, name, slug, description, position, is_enabled)
SELECT c.id, sub.name, sub.slug, sub.description, sub.position, TRUE
FROM categories c
JOIN (VALUES
  ('Office Uniforms', 'office-uniforms', 'Professional office uniforms for corporate staff, including formal shirts and trousers.', 1),
  ('Staff Uniforms',  'staff-uniforms',  'Branded staff uniforms for retail, hospitality, and service businesses.', 2)
) AS sub(name, slug, description, position) ON c.slug = 'corporate-uniforms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  position = EXCLUDED.position, updated_at = NOW();

-- D. Hospital & Nursing subcategories
INSERT INTO subcategories (category_id, name, slug, description, position, is_enabled)
SELECT c.id, sub.name, sub.slug, sub.description, sub.position, TRUE
FROM categories c
JOIN (VALUES
  ('Nursing Uniforms',       'nursing-uniforms',       'Professional nursing uniforms — aprons, scrubs, and formal dress sets for nursing students and staff.', 1),
  ('Hospital Staff Uniforms','hospital-staff-uniforms','Uniforms for hospital support staff, administrative teams, and ward attendants.', 2)
) AS sub(name, slug, description, position) ON c.slug = 'hospital-nursing-uniforms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  position = EXCLUDED.position, updated_at = NOW();

-- E. Industrial Workwear subcategories
INSERT INTO subcategories (category_id, name, slug, description, position, is_enabled)
SELECT c.id, sub.name, sub.slug, sub.description, sub.position, TRUE
FROM categories c
JOIN (VALUES
  ('Industrial Uniforms', 'industrial-uniforms', 'Heavy-duty uniforms for factory and industrial workers with reinforced stitching.', 1),
  ('Workwear',            'workwear',            'General workwear for technicians, maintenance staff, and field workers.', 2)
) AS sub(name, slug, description, position) ON c.slug = 'industrial-workwear'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  position = EXCLUDED.position, updated_at = NOW();

-- F. Uniform Products subcategories
INSERT INTO subcategories (category_id, name, slug, description, position, is_enabled)
SELECT c.id, sub.name, sub.slug, sub.description, sub.position, TRUE
FROM categories c
JOIN (VALUES
  ('Ready-made Uniforms',                   'ready-made-uniforms',    'Stock ready-made uniforms available for immediate wholesale supply.', 1),
  ('Uniform Fabrics',                       'uniform-fabrics',        'High-quality fabric rolls and materials used in uniform manufacturing.', 2),
  ('Shirts, Trousers, Frocks & Pinafores',  'shirts-trousers-frocks', 'Individual garment components available for wholesale purchase.', 3)
) AS sub(name, slug, description, position) ON c.slug = 'uniform-products'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  position = EXCLUDED.position, updated_at = NOW();
