-- Fix additional security warnings from the linter

-- Fix the audit log table that has RLS enabled but no policies for UPDATE/DELETE
CREATE POLICY "Only admins can update audit logs"
ON public.admin_audit_log
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete audit logs"
ON public.admin_audit_log
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Fix function search path issues by updating existing functions
-- Update the ensure_user_role function to be more secure
CREATE OR REPLACE FUNCTION public.ensure_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.user_roles (user_id, role)
  values (p_user_id, p_role)
  on conflict (user_id) do update set role = excluded.role, updated_at = now();
end;
$function$;

-- Update the get_user_role function to be more secure
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare v_role text;
begin
  select role into v_role from public.user_roles where user_id = p_user_id;
  return coalesce(v_role, 'user');
end;
$function$;

-- Update the is_current_user_admin function to be more secure
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$function$;