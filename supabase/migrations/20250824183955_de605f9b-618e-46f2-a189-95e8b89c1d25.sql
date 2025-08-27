-- Fix critical security issue: Ensure material_purchases table is not publicly accessible
-- This prevents competitors from stealing customer purchase data

-- Ensure RLS is enabled on material_purchases
ALTER TABLE public.material_purchases ENABLE ROW LEVEL SECURITY;

-- Drop any existing public access policies
DROP POLICY IF EXISTS "Anyone can view material purchases" ON public.material_purchases;
DROP POLICY IF EXISTS "Public can view material purchases" ON public.material_purchases;
DROP POLICY IF EXISTS "Material purchases are publicly viewable" ON public.material_purchases;

-- Recreate secure policies to ensure they're properly configured

-- Policy for users to view only their own purchases
DROP POLICY IF EXISTS "Users can view their own material purchases" ON public.material_purchases;
CREATE POLICY "Users can view their own material purchases" 
ON public.material_purchases 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy for admins to view all purchases
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.material_purchases;
CREATE POLICY "Admins can view all purchases" 
ON public.material_purchases 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy for admins to manage all purchases
DROP POLICY IF EXISTS "Only admins can edit purchases" ON public.material_purchases;
CREATE POLICY "Only admins can manage purchases" 
ON public.material_purchases 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add audit log entry for this security fix
INSERT INTO public.admin_audit_log (
  action, 
  target_table, 
  new_values
) VALUES (
  'security_fix_applied',
  'material_purchases',
  jsonb_build_object(
    'issue', 'secured_purchase_history',
    'description', 'Ensured customer purchase data is only accessible to users and admins'
  )
);