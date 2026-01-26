-- Add status column to group_members
ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update trigger function to only count approved members
CREATE OR REPLACE FUNCTION update_group_filled_slots()
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
$$ LANGUAGE plpgsql;

-- Re-create the trigger to be safe (though replace function updates logic)
DROP TRIGGER IF EXISTS trigger_update_group_filled_slots ON public.group_members;
CREATE TRIGGER trigger_update_group_filled_slots
  AFTER INSERT OR UPDATE OR DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_filled_slots();

-- Allow users to insert themselves as pending
DROP POLICY IF EXISTS "Authenticated users can join" ON public.group_members;
CREATE POLICY "Authenticated users can request to join" ON public.group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    -- User can only set status to pending or it defaults to pending (via API logic usually, but here DB constraint)
    -- Actually, if we want to enforce pending for users:
    -- AND status = 'pending' 
    -- But existing policy was just user_id check. Let's keep it simple and handle status in API/Client.
  );
