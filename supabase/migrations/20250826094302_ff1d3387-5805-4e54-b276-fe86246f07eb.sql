-- Fix admin verification to work with Firebase user IDs
-- First, let's see what users exist
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id, phone, email FROM auth.users 
        WHERE phone LIKE '+91888%' OR email LIKE '%neeraj%' OR email LIKE '%madkar%'
    LOOP
        RAISE NOTICE 'Found user: ID=%, Phone=%, Email=%', user_record.id, user_record.phone, user_record.email;
    END LOOP;
END $$;

-- Create a function that works with Firebase user IDs (non-UUID format)
CREATE OR REPLACE FUNCTION public.check_user_is_admin_by_phone(user_phone text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT user_phone IN ('+918888769281', '+918484843232');
$$;

-- Also create a fallback function that doesn't rely on user_roles table for now
CREATE OR REPLACE FUNCTION public.is_admin_phone(phone_num text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT phone_num IN ('+918888769281', '+918484843232');
$$;