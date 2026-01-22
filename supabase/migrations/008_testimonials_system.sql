-- Create Testimonials Table
DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testimonials') THEN
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
    
    RAISE NOTICE 'Created testimonials table';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON public.testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON public.testimonials(display_order);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies in separate DO block
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Anyone can view active testimonials') THEN
    DROP POLICY "Anyone can view active testimonials" ON public.testimonials;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Admins can view all testimonials') THEN
    DROP POLICY "Admins can view all testimonials" ON public.testimonials;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Admins can insert testimonials') THEN
    DROP POLICY "Admins can insert testimonials" ON public.testimonials;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Admins can update testimonials') THEN
    DROP POLICY "Admins can update testimonials" ON public.testimonials;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Admins can delete testimonials') THEN
    DROP POLICY "Admins can delete testimonials" ON public.testimonials;
  END IF;

  -- Create policies
  -- Public can view active testimonials
  EXECUTE 'CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = TRUE)';

  -- Admins can view all testimonials  
  EXECUTE 'CREATE POLICY "Admins can view all testimonials" ON public.testimonials FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN (''admin'', ''super_admin'')))';

  -- Admins can insert testimonials
  EXECUTE 'CREATE POLICY "Admins can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN (''admin'', ''super_admin'')))';

  -- Admins can update testimonials
  EXECUTE 'CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN (''admin'', ''super_admin'')))';

  -- Admins can delete testimonials
  EXECUTE 'CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN (''admin'', ''super_admin'')))';
  
  RAISE NOTICE 'Created all RLS policies';
END $$;

-- Insert sample testimonials
INSERT INTO public.testimonials (name, role, company, rating, testimonial, is_featured, is_active, display_order) VALUES
('Gabrielle Williams', 'CEO and Co-founder', 'ABC Company', 5, 'Creative geniuses who listen, understand, and craft captivating visuals - an agency that truly understands our needs.', true, true, 1),
('Samantha Johnson', 'CTO and Co-founder', 'ABC Company', 5, 'Exceeded our expectations with innovative designs that brought our vision to life - a truly remarkable creative agency.', true, true, 2),
('Isabella Rodriguez', 'CEO and Co-founder', 'ABC Company', 5, 'Their ability to capture our brand essence in every project is unparalleled - an invaluable creative collaborator.', true, true, 3),
('Natalie Martinez', 'CEO and Co-founder', 'ABC Company', 5, 'From concept to execution, their creativity knows no bounds - a game-changer for our brand''s success.', true, true, 4),
('Victoria Thompson', 'CEO and Co-founder', 'ABC Company', 5, 'A refreshing and imaginative agency that consistently delivers exceptional results - highly recommended for any project.', true, true, 5),
('John Peterson', 'CEO and Co-founder', 'ABC Company', 5, 'Their team''s artistic approach and strategic thinking created remarkable campaigns - a reliable creative partner.', true, true, 6);

-- Comments
COMMENT ON TABLE public.testimonials IS 'Stores customer testimonials and reviews';
COMMENT ON COLUMN public.testimonials.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN public.testimonials.is_featured IS 'Whether to show this testimonial prominently';
COMMENT ON COLUMN public.testimonials.display_order IS 'Order in which to display testimonials (lower numbers first)';
