-- Create function to promote user to admin by email
CREATE OR REPLACE FUNCTION public.promote_email_to_admin(target_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id text;
    result_msg text;
BEGIN
    -- Find user with this email in profiles table
    SELECT id INTO target_user_id 
    FROM profiles 
    WHERE id IN (
        SELECT id::text FROM auth.users WHERE email = target_email
    );
    
    IF target_user_id IS NOT NULL THEN
        -- Make them admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = now();
        
        result_msg := 'SUCCESS: ' || target_email || ' is now an admin';
    ELSE
        result_msg := 'PENDING: ' || target_email || ' will become admin when they sign up';
        
        -- Store pending admin emails in a new table
        CREATE TABLE IF NOT EXISTS public.pending_admin_emails (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            email text NOT NULL UNIQUE,
            created_at timestamp with time zone DEFAULT now()
        );
        
        INSERT INTO public.pending_admin_emails (email) 
        VALUES (target_email)
        ON CONFLICT (email) DO NOTHING;
    END IF;
    
    RETURN result_msg;
END;
$$;

-- Create function to get pending admin emails
CREATE OR REPLACE FUNCTION public.get_pending_admin_emails()
RETURNS TABLE(email text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Ensure table exists
    CREATE TABLE IF NOT EXISTS public.pending_admin_emails (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE,
        created_at timestamp with time zone DEFAULT now()
    );
    
    -- Only allow admins to view pending admins
    IF NOT public.is_admin_user() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    RETURN QUERY
    SELECT pa.email, pa.created_at
    FROM public.pending_admin_emails pa
    ORDER BY pa.created_at;
END;
$$;

-- Update the check_pending_admin trigger to also check emails
CREATE OR REPLACE FUNCTION public.check_pending_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Ensure table exists
    CREATE TABLE IF NOT EXISTS public.pending_admin_emails (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE,
        created_at timestamp with time zone DEFAULT now()
    );
    
    -- Check if this email is in pending admins
    IF EXISTS (SELECT 1 FROM public.pending_admin_emails WHERE email = NEW.email) THEN
        -- Make them admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id::text, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
        
        -- Remove from pending
        DELETE FROM public.pending_admin_emails WHERE email = NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users to auto-promote pending admin emails
DROP TRIGGER IF EXISTS on_auth_user_created_check_email ON auth.users;
CREATE TRIGGER on_auth_user_created_check_email
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.check_pending_admin_email();