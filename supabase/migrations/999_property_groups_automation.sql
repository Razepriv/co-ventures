-- ========================================
-- PROPERTY GROUPS AUTOMATION
-- Migration: 999_property_groups_automation
-- ========================================

-- 1. FUNCTION TO AUTO-CREATE GROUP ON PROPERTY INSERT
CREATE OR REPLACE FUNCTION public.create_property_group_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if group already exists (shouldn't happen with inserts but good for safety)
    IF NOT EXISTS (SELECT 1 FROM public.property_groups WHERE property_id = NEW.id) THEN
        INSERT INTO public.property_groups (property_id, total_slots, filled_slots, is_locked)
        VALUES (NEW.id, 5, 0, false);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER FOR NEW PROPERTIES
DROP TRIGGER IF EXISTS trigger_auto_create_property_group ON public.properties;
CREATE TRIGGER trigger_auto_create_property_group
AFTER INSERT ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.create_property_group_on_insert();

-- 3. BACKFILL EXISTING PROPERTIES
DO $$
DECLARE
    prop RECORD;
BEGIN
    FOR prop IN SELECT id FROM public.properties WHERE id NOT IN (SELECT property_id FROM public.property_groups) LOOP
        INSERT INTO public.property_groups (property_id, total_slots, filled_slots, is_locked)
        VALUES (prop.id, 5, 0, false);
    END LOOP;
END $$;

-- 4. ENSURE GROUP MEMBERS TABLE HAS CORRECT POLICIES
-- Anyone can view group memberships (to show on property pages)
DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;
CREATE POLICY "Anyone can view group members" ON public.group_members
  FOR SELECT USING (true);

-- Authenticated users can join groups (insert their own row)
DROP POLICY IF EXISTS "Authenticated users can join" ON public.group_members;
CREATE POLICY "Authenticated users can join" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all memberships (including adding others)
DROP POLICY IF EXISTS "Admins can manage group members" ON public.group_members;
CREATE POLICY "Admins can manage group members" ON public.group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
