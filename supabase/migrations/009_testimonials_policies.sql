-- RLS Policies for Testimonials
-- This must be run AFTER 008_testimonials_table.sql

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;

-- Public can view active testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials FOR SELECT
USING (is_active = TRUE);

-- Admins can view all testimonials  
CREATE POLICY "Admins can view all testimonials"
ON public.testimonials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Admins can insert testimonials
CREATE POLICY "Admins can insert testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Admins can update testimonials
CREATE POLICY "Admins can update testimonials"
ON public.testimonials FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Admins can delete testimonials
CREATE POLICY "Admins can delete testimonials"
ON public.testimonials FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);
