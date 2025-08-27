-- CRITICAL SECURITY FIXES

-- 1. Secure class_registrations table (contains student PII)
ALTER TABLE public.class_registrations ENABLE ROW LEVEL SECURITY;

-- Allow only admins to view all registrations
CREATE POLICY "Admins can view all class registrations" 
ON public.class_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow authenticated users to insert registrations
CREATE POLICY "Users can register for classes" 
ON public.class_registrations 
FOR INSERT 
WITH CHECK (true);

-- 2. Secure class_enrollments table (contains student PII and payment data)
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- Allow only admins to view all enrollments
CREATE POLICY "Admins can view all class enrollments" 
ON public.class_enrollments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow authenticated users to insert enrollments
CREATE POLICY "Users can enroll in classes" 
ON public.class_enrollments 
FOR INSERT 
WITH CHECK (true);

-- 3. Secure profiles_backup table
ALTER TABLE public.profiles_backup ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own backup profile
CREATE POLICY "Users can view own profile backup" 
ON public.profiles_backup 
FOR SELECT 
USING (auth.uid() = id);

-- 4. Fix material_purchases policies - restrict to user's own purchases only
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.material_purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.material_purchases;
DROP POLICY IF EXISTS "Only admins can edit purchases" ON public.material_purchases;

-- Recreate secure policies
CREATE POLICY "Users can view own purchases only" 
ON public.material_purchases 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all purchases" 
ON public.material_purchases 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. Secure user_purchases table with proper policies
DROP POLICY IF EXISTS "user_purchases_user_policy" ON public.user_purchases;
DROP POLICY IF EXISTS "user_purchases_admin_policy" ON public.user_purchases;

CREATE POLICY "Users can view own purchases" 
ON public.user_purchases 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own purchases" 
ON public.user_purchases 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all purchases" 
ON public.user_purchases 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. Create secure admin verification function
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

-- 7. Update existing database functions with proper search path
CREATE OR REPLACE FUNCTION public.ensure_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id) 
    DO UPDATE SET role = p_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM public.user_roles
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(v_role, 'user');
END;
$$;

-- 8. Add audit logging table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  target_table text,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.is_admin_user());

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');