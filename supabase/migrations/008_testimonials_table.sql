-- Create Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
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
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON public.testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON public.testimonials(display_order);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE public.testimonials IS 'Stores customer testimonials and reviews';
COMMENT ON COLUMN public.testimonials.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN public.testimonials.is_featured IS 'Whether to show this testimonial prominently';
COMMENT ON COLUMN public.testimonials.display_order IS 'Order in which to display testimonials (lower numbers first)';
