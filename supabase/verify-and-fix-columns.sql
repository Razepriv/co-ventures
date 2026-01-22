-- Verify and Fix Users Table Columns
-- Run this script to check if Firebase columns exist and add them if missing

-- 1. Check current columns in users table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Add missing columns with proper checks
DO $$
BEGIN
  -- Add firebase_uid if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'firebase_uid'
  ) THEN
    ALTER TABLE public.users ADD COLUMN firebase_uid TEXT UNIQUE;
    CREATE INDEX idx_users_firebase_uid ON public.users(firebase_uid);
    RAISE NOTICE '✅ Added firebase_uid column';
  ELSE
    RAISE NOTICE 'ℹ️ firebase_uid column already exists';
  END IF;

  -- Add phone if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.users ADD COLUMN phone TEXT;
    CREATE INDEX idx_users_phone ON public.users(phone);
    RAISE NOTICE '✅ Added phone column';
  ELSE
    RAISE NOTICE 'ℹ️ phone column already exists';
  END IF;

  -- Add phone_verified if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE public.users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    CREATE INDEX idx_users_phone_verified ON public.users(phone_verified);
    RAISE NOTICE '✅ Added phone_verified column';
  ELSE
    RAISE NOTICE 'ℹ️ phone_verified column already exists';
  END IF;

  -- Add last_login_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    CREATE INDEX idx_users_last_login_at ON public.users(last_login_at);
    RAISE NOTICE '✅ Added last_login_at column';
  ELSE
    RAISE NOTICE 'ℹ️ last_login_at column already exists';
  END IF;
END $$;

-- 3. Add comments
COMMENT ON COLUMN public.users.firebase_uid IS 'Firebase Authentication UID for phone auth users';
COMMENT ON COLUMN public.users.phone IS 'User phone number in E.164 format (e.g., +918220466397)';
COMMENT ON COLUMN public.users.phone_verified IS 'Whether the phone number has been verified via OTP';
COMMENT ON COLUMN public.users.last_login_at IS 'Timestamp of the user''s last login';

-- 4. Force schema reload
NOTIFY pgrst, 'reload schema';

-- 5. Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN ('firebase_uid', 'phone', 'phone_verified', 'last_login_at')
ORDER BY column_name;
