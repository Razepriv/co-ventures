-- ========================================
-- CLEAN TESTIMONIALS SETUP
-- Drops everything and recreates from scratch
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;

-- Drop the table (CASCADE will drop all dependent objects)
DROP TABLE IF EXISTS public.testimonials CASCADE;

-- Now create fresh table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  avatar_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  testimonial TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_testimonials_active ON public.testimonials(is_active);
CREATE INDEX idx_testimonials_featured ON public.testimonials(is_featured);
CREATE INDEX idx_testimonials_order ON public.testimonials(display_order);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials FOR SELECT
USING (is_active = TRUE);

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
INSERT INTO public.testimonials (name, role, company, rating, testimonial, is_featured, is_active, display_order) 
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
COMMENT ON COLUMN public.testimonials.display_order IS 'Order in which to display testimonials (lower numbers first)';
