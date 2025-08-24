-- Fix security warnings and enable admin for +91 8888769281

-- Enable RLS on admin_audit_log table (fixing the RLS disabled warning)
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Update the admin check function to use the correct function name
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$;

-- Update useSecureAdmin hook function  
CREATE OR REPLACE FUNCTION public.check_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_admin_user(auth.uid());
END;
$$;

-- Function to make a phone number admin (will work once user signs up)
CREATE OR REPLACE FUNCTION public.promote_phone_to_admin(target_phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id uuid;
    result_msg text;
BEGIN
    -- Find user with this phone number
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE phone = target_phone;
    
    IF target_user_id IS NOT NULL THEN
        -- Make them admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
        
        result_msg := 'SUCCESS: ' || target_phone || ' is now an admin';
    ELSE
        result_msg := 'PENDING: ' || target_phone || ' will become admin when they sign up';
        
        -- Store pending admin phone numbers
        INSERT INTO public.pending_admins (phone_number) 
        VALUES (target_phone)
        ON CONFLICT (phone_number) DO NOTHING;
    END IF;
    
    RETURN result_msg;
END;
$$;

-- Create table for pending admin phone numbers
CREATE TABLE IF NOT EXISTS public.pending_admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pending_admins ENABLE ROW LEVEL SECURITY;

-- Only admins can view pending admins
CREATE POLICY "Only admins can view pending admins" 
ON public.pending_admins 
FOR ALL 
USING (public.is_admin_user());

-- Function to check and promote pending admins on signup
CREATE OR REPLACE FUNCTION public.check_pending_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if this phone number is in pending admins
    IF EXISTS (SELECT 1 FROM public.pending_admins WHERE phone_number = NEW.phone) THEN
        -- Make them admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
        
        -- Remove from pending
        DELETE FROM public.pending_admins WHERE phone_number = NEW.phone;
    ELSE
        -- Regular user
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created_admin_check ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_check
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.check_pending_admin();

-- Add the specified admin phone number to pending admins
SELECT public.promote_phone_to_admin('+918888769281');