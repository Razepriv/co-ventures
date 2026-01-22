-- Add Firebase authentication fields to users table
-- This allows users to authenticate via Firebase Phone Auth while storing data in Supabase

-- Add firebase_uid column (for linking Firebase auth with Supabase user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'firebase_uid'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN firebase_uid TEXT UNIQUE;
    
    CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users(firebase_uid);
    
    RAISE NOTICE 'Added firebase_uid column to users table';
  ELSE
    RAISE NOTICE 'firebase_uid column already exists';
  END IF;
END $$;

-- Add phone column (for phone number storage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN phone TEXT;
    
    CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
    
    RAISE NOTICE 'Added phone column to users table';
  ELSE
    RAISE NOTICE 'phone column already exists';
  END IF;
END $$;

-- Add phone_verified column (to track if phone is verified)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    
    CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON public.users(phone_verified);
    
    RAISE NOTICE 'Added phone_verified column to users table';
  ELSE
    RAISE NOTICE 'phone_verified column already exists';
  END IF;
END $$;

-- Add last_login_at column (to track last login time)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    
    CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON public.users(last_login_at);
    
    RAISE NOTICE 'Added last_login_at column to users table';
  ELSE
    RAISE NOTICE 'last_login_at column already exists';
  END IF;
END $$;

-- Comments
COMMENT ON COLUMN public.users.firebase_uid IS 'Firebase Authentication UID for phone auth users';
COMMENT ON COLUMN public.users.phone IS 'User phone number in E.164 format (e.g., +918220115779)';
COMMENT ON COLUMN public.users.phone_verified IS 'Whether the phone number has been verified via OTP';
COMMENT ON COLUMN public.users.last_login_at IS 'Timestamp of the user last login';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Firebase authentication fields added successfully!';
  RAISE NOTICE '📋 Added: firebase_uid, phone, phone_verified, last_login_at';
  RAISE NOTICE '🔒 Indexes created for better query performance';
END $$;
