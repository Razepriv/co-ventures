-- ========================================
-- KEEP ONLY MAJOR METRO CITIES
-- Run this in Supabase SQL Editor
-- ========================================

-- Deactivate all cities first
UPDATE public.cities SET is_active = false;

-- Activate only major metro cities
UPDATE public.cities 
SET is_active = true, display_order = 1 
WHERE name = 'New Delhi';

UPDATE public.cities 
SET is_active = true, display_order = 2 
WHERE name = 'Mumbai';

UPDATE public.cities 
SET is_active = true, display_order = 3 
WHERE name = 'Bangalore';

UPDATE public.cities 
SET is_active = true, display_order = 4 
WHERE name = 'Hyderabad';

UPDATE public.cities 
SET is_active = true, display_order = 5 
WHERE name = 'Chennai';

UPDATE public.cities 
SET is_active = true, display_order = 6 
WHERE name = 'Kolkata';

UPDATE public.cities 
SET is_active = true, display_order = 7 
WHERE name = 'Pune';

UPDATE public.cities 
SET is_active = true, display_order = 8 
WHERE name = 'Ahmedabad';

UPDATE public.cities 
SET is_active = true, display_order = 9 
WHERE name = 'Gurgaon';

UPDATE public.cities 
SET is_active = true, display_order = 10 
WHERE name = 'Noida';

-- Verify - should show 10 major cities
SELECT name, state, display_order FROM public.cities WHERE is_active = true ORDER BY display_order;
