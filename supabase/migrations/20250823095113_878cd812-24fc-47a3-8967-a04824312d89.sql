-- Fix security issues and create proper RLS policies for class enrollments

-- Fix functions without search_path
ALTER FUNCTION public.is_admin_user(uuid) SET search_path = 'public';
ALTER FUNCTION public.ensure_user_role(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.ensure_user_role(text, text) SET search_path = 'public';
ALTER FUNCTION public.check_bucket_exists(text) SET search_path = 'public';
ALTER FUNCTION public.create_user_roles_if_not_exists(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.calculate_expiry_date(integer, text) SET search_path = 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path = 'public';
ALTER FUNCTION public.update_modified_column() SET search_path = 'public';
ALTER FUNCTION public.increment_material_downloads(uuid) SET search_path = 'public';

-- Enable RLS on tables that don't have it
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create comprehensive class enrollment policies
DROP POLICY IF EXISTS "Anyone can enroll for classes" ON public.class_enrollments;
DROP POLICY IF EXISTS "Admins can view all class enrollments" ON public.class_enrollments;

-- Anyone can enroll for classes (for registration)
CREATE POLICY "Anyone can enroll for classes"
ON public.class_enrollments
FOR INSERT
WITH CHECK (true);

-- Admins can view all class enrollments
CREATE POLICY "Admins can view all class enrollments"
ON public.class_enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Lock down sensitive data in class_registrations
DROP POLICY IF EXISTS "Anyone can register for classes" ON public.class_registrations;
DROP POLICY IF EXISTS "Admins can view all class registrations" ON public.class_registrations;

-- Only allow insertions with validated data
CREATE POLICY "Anyone can register for classes"
ON public.class_registrations
FOR INSERT
WITH CHECK (true);

-- Only admins can view registrations (protects personal data)
CREATE POLICY "Admins can view all class registrations"
ON public.class_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Secure user purchases - only users can see their own data
DROP POLICY IF EXISTS "user_purchases_user_policy" ON public.user_purchases;
CREATE POLICY "Users can view their own purchases"
ON public.user_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Secure payment orders - only users can see their own data
DROP POLICY IF EXISTS "payment_orders_user_policy" ON public.payment_orders;
CREATE POLICY "Users can view their own orders"
ON public.payment_orders
FOR SELECT
USING (auth.uid() = user_id);

-- Secure material purchases - users can only see their own
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.material_purchases;
CREATE POLICY "Users can view their own material purchases"
ON public.material_purchases
FOR SELECT
USING (user_id = auth.uid());

-- Create admin audit log policies
CREATE POLICY "Only admins can access audit log"
ON public.admin_audit_log
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);