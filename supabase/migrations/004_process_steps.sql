-- Migration: 004_process_steps.sql
-- Creates the process_steps table for the Process page workflow section.

CREATE TABLE IF NOT EXISTS process_steps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number integer      NOT NULL DEFAULT 1,
  heading     text         NOT NULL DEFAULT '',
  description text         NOT NULL DEFAULT '',
  image_url   text         NOT NULL DEFAULT '',
  is_published boolean     NOT NULL DEFAULT true,
  position    integer      NOT NULL DEFAULT 1,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;

-- Public read access (published steps only)
CREATE POLICY "Public can read published process steps"
  ON process_steps
  FOR SELECT
  USING (is_published = true);

-- Admins can do everything (authenticated users)
CREATE POLICY "Admins can manage process steps"
  ON process_steps
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_process_steps_position ON process_steps (position ASC);
