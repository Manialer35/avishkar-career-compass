-- Fix critical security issue: Remove any public access to class_registrations table
-- This prevents hackers from stealing sensitive student personal information

-- Ensure RLS is enabled on class_registrations
ALTER TABLE public.class_registrations ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view class registrations" ON public.class_registrations;
DROP POLICY IF EXISTS "Public can view class registrations" ON public.class_registrations;
DROP POLICY IF EXISTS "Users can view class registrations" ON public.class_registrations;

-- Keep existing secure policies but ensure they're properly configured

-- Policy for admins to view all class registrations (already exists but ensuring it's correct)
DROP POLICY IF EXISTS "Admins can view all class registrations" ON public.class_registrations;
CREATE POLICY "Admins can view all class registrations" 
ON public.class_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy for admins to delete registrations if needed
DROP POLICY IF EXISTS "Admins can delete class registrations" ON public.class_registrations;
CREATE POLICY "Admins can delete class registrations" 
ON public.class_registrations 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Keep the insert policy for registration functionality
-- Note: This allows anyone to register for classes, but they cannot read others' data
DROP POLICY IF EXISTS "Anyone can register for classes" ON public.class_registrations;
CREATE POLICY "Anyone can register for classes" 
ON public.class_registrations 
FOR INSERT 
WITH CHECK (true);

-- Add audit log entry for this security fix
INSERT INTO public.admin_audit_log (
  action, 
  target_table, 
  new_values
) VALUES (
  'security_fix_applied',
  'class_registrations',
  jsonb_build_object(
    'issue', 'removed_public_read_access',
    'description', 'Secured student personal information from public access'
  )
);