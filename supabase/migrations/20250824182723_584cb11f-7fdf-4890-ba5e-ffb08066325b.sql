-- Fix security issue: Restrict access to student personal information
-- Remove any overly permissive policies and create secure ones

-- First, drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Anyone can view class registrations" ON public.class_registrations;
DROP POLICY IF EXISTS "Anyone can view class enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Public can view class registrations" ON public.class_registrations;
DROP POLICY IF EXISTS "Public can view class enrollments" ON public.class_enrollments;

-- Secure class_registrations table
-- Only admins can view all registrations, no public access
CREATE POLICY "Only admins can view class registrations" 
ON public.class_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Anyone can still register (insert), but cannot read back sensitive data
-- This policy already exists: "Anyone can register for classes"

-- Secure class_enrollments table  
-- Only admins can view all enrollments, no public access
CREATE POLICY "Only admins can view class enrollments"
ON public.class_enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Anyone can still enroll (insert), but cannot read back sensitive data
-- This policy already exists: "Anyone can enroll for classes"

-- Add audit logging for admin access to sensitive data
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  new_values jsonb,
  old_values jsonb
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- System can insert audit logs (for triggers)
CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (true);