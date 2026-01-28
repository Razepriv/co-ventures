-- Make the trigger function SECURITY DEFINER so it can update property_groups regardless of user permissions
CREATE OR REPLACE FUNCTION public.update_group_filled_slots()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.property_groups
  SET filled_slots = (
    SELECT COUNT(*)
    FROM public.group_members
    WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
    AND status = 'approved'
  )
  WHERE id = COALESCE(NEW.group_id, OLD.group_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure property_groups has appropriate RLS
ALTER TABLE public.property_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view property groups" 
  ON public.property_groups FOR SELECT 
  TO public 
  USING (true);

-- Allow authenticated users to insert property groups (needed if triggered from client side, though we moved to API)
-- But primarily, ensure admins can do everything
CREATE POLICY "Admins full access property_groups" 
  ON public.property_groups FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Fix: Check if any other trigger is failing. 
-- Ensure group_members policies allow "status" update if user is creating it. 
-- Actually, RLS on INSERT ignores the column logic usually, but let's be sure.

-- Grant usage on sequence if any (uuids don't use sequences usually)
