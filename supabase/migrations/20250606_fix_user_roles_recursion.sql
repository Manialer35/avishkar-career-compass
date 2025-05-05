
-- Create a security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT role
        FROM public.user_roles
        WHERE user_id = $1
        LIMIT 1
    );
END;
$$;

-- Create a security definer function to check if a user has admin role
CREATE OR REPLACE FUNCTION public.is_admin_role(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = $1 AND role = 'admin'
    );
END;
$$;
