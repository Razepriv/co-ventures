-- Create Super Admin User
-- STEP 1: Go to Supabase Dashboard → Authentication → Users → Add User
-- Email: coventures2026@gmail.com
-- Password: Pso@2026
-- Auto Confirm User: ✅ CHECK THIS BOX
-- Click "Create User"

-- STEP 2: After user is created, COPY THE USER ID (UUID) from the users list

-- STEP 3: Replace 'PASTE_USER_ID_HERE' below with the actual UUID and run this SQL:

-- Temporarily disable RLS to insert the super admin
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

INSERT INTO public.users (id, email, role, full_name, created_at, updated_at)
VALUES (
  '4e28c312-c623-4b5b-9865-14dd1fd27201',
  'coventures2026@gmail.com',
  'super_admin',
  'Super Admin',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin', full_name = 'Super Admin';

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

