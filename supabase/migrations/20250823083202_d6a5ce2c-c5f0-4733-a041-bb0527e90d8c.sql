-- Update admin system for phone authentication

-- First, let's create a function to handle phone-based admin setup
CREATE OR REPLACE FUNCTION public.setup_phone_admin(phone_number text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find user by phone number in auth.users
    SELECT id INTO user_record
    FROM auth.users 
    WHERE phone = phone_number;
    
    IF user_record.id IS NOT NULL THEN
        -- Insert or update user role to admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_record.id, 'admin')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'admin';
        
        RAISE NOTICE 'User % set as admin', phone_number;
    ELSE
        RAISE NOTICE 'User with phone % not found', phone_number;
    END IF;
END;
$$;

-- Update the admin verification function to work with current user
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Create a function to manually add admin by phone (for existing users)
CREATE OR REPLACE FUNCTION public.add_admin_by_phone(phone_number text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record RECORD;
    result_message text;
BEGIN
    -- Find user by phone number
    SELECT id, phone INTO user_record
    FROM auth.users 
    WHERE phone = phone_number;
    
    IF user_record.id IS NOT NULL THEN
        -- Insert or update user role to admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_record.id, 'admin')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'admin';
        
        result_message := 'SUCCESS: User ' || phone_number || ' is now an admin';
        
        -- Log the admin creation
        INSERT INTO public.admin_audit_log (
            admin_user_id, 
            action, 
            target_table, 
            target_id, 
            new_values
        ) VALUES (
            auth.uid(),
            'admin_role_granted', 
            'user_roles', 
            user_record.id, 
            jsonb_build_object('role', 'admin', 'phone', phone_number)
        );
    ELSE
        result_message := 'ERROR: User with phone ' || phone_number || ' not found. User must sign up first.';
    END IF;
    
    RETURN result_message;
END;
$$;

-- Create a function to list all admin users
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(user_id uuid, phone text, role text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow current admins to view admin list
    IF NOT public.is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    RETURN QUERY
    SELECT ur.user_id, au.phone, ur.role::text, ur.created_at
    FROM public.user_roles ur
    JOIN auth.users au ON ur.user_id = au.id
    WHERE ur.role = 'admin'
    ORDER BY ur.created_at;
END;
$$;