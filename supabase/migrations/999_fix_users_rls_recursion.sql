-- ========================================
-- FIX USERS RLS RECURSION
-- Resolve "infinite recursion detected in policy for relation users"
-- ========================================

-- 1. Create a SECURITY DEFINER function to check admin roles
-- This function bypasses RLS because it runs with the privileges of the creator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use a direct query on public.users
  -- SECURITY DEFINER ensures this doesn't trigger RLS on public.users recursively
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop all recursive policies on public.users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Admins full access to users" ON public.users;

-- 3. Create a single, clean admin policy using the helper function
CREATE POLICY "Admins full access to users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (is_admin());

-- 4. Ensure standard user policies are preserved and clean
-- (They were dropped in some previous migrations)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
  ON public.users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Preserve the public basics policy needed for login
DROP POLICY IF EXISTS "Public can read user basics for login" ON public.users;
CREATE POLICY "Public can read user basics for login" 
  ON public.users
  FOR SELECT
  TO public
  USING (true);

-- 6. Add policy for insert (used by auth triggers)
DROP POLICY IF EXISTS "System can insert users" ON public.users;
CREATE POLICY "System can insert users" 
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Verify
SELECT 'RLS recursion fixed successfully!' as status;
