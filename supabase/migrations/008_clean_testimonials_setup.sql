-- ========================================
-- CLEAN TESTIMONIALS SETUP
-- Drops everything and recreates from scratch
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;

-- Drop the table (CASCADE will drop all dependent objects)
DROP TABLE IF EXISTS public.testimonials CASCADE;

-- Now create fresh table (matching original schema)
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_testimonials_approved ON public.testimonials(is_approved);
CREATE INDEX idx_testimonials_featured ON public.testimonials(is_featured);
CREATE INDEX idx_testimonials_order ON public.testimonials(display_order);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Anyone can view approved testimonials"
ON public.testimonials FOR SELECT
USING (is_approved = TRUE);

CREATE POLICY "Admins can view all testimonials"
ON public.testimonials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can insert testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can update testimonials"
ON public.testimonials FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can delete testimonials"
ON public.testimonials FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Insert sample testimonials
INSERT INTO public.testimonials (full_name, role, company, rating, content, is_featured, is_approved, display_order) 
VALUES
('Gabrielle Williams', 'CEO and Co-founder', 'ABC Company', 5, 'Creative geniuses who listen, understand, and craft captivating visuals - an agency that truly understands our needs.', true, true, 1),
('Samantha Johnson', 'CTO and Co-founder', 'ABC Company', 5, 'Exceeded our expectations with innovative designs that brought our vision to life - a truly remarkable creative agency.', true, true, 2),
('Isabella Rodriguez', 'CEO and Co-founder', 'ABC Company', 5, 'Their ability to capture our brand essence in every project is unparalleled - an invaluable creative collaborator.', true, true, 3),
('Natalie Martinez', 'CEO and Co-founder', 'ABC Company', 5, 'From concept to execution, their creativity knows no bounds - a game-changer for our brand''s success.', true, true, 4),
('Victoria Thompson', 'CEO and Co-founder', 'ABC Company', 5, 'A refreshing and imaginative agency that consistently delivers exceptional results - highly recommended for any project.', true, true, 5),
('John Peterson', 'CEO and Co-founder', 'ABC Company', 5, 'Their team''s artistic approach and strategic thinking created remarkable campaigns - a reliable creative partner.', true, true, 6);

-- Add comments
COMMENT ON TABLE public.testimonials IS 'Stores customer testimonials and reviews';
COMMENT ON COLUMN public.testimonials.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN public.testimonials.is_featured IS 'Whether to show this testimonial prominently';
COMMENT ON COLUMN public.testimonials.is_approved IS 'Whether the testimonial is approved for display';
COMMENT ON COLUMN public.testimonials.display_order IS 'Order in which to display testimonials (lower numbers first)';
