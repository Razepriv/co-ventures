-- Add missing columns to group_members table
ALTER TABLE public.group_members 
ADD COLUMN IF NOT EXISTS investment_amount DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update the existing unique constraint to be more robust if needed
-- (Current unique constraint is on group_id, user_id, which is correct)
