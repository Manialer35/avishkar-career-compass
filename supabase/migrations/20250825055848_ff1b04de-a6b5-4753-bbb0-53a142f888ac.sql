-- Set up admin user for phone +918888769281
-- First create the user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(phone_number)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own role" ON public.user_roles
FOR SELECT USING (true);

CREATE POLICY "Admin management" ON public.user_roles
FOR ALL USING (true);

-- Insert admin user by phone number
INSERT INTO public.user_roles (phone_number, role)
VALUES ('+918888769281', 'admin')
ON CONFLICT (phone_number) DO UPDATE SET role = 'admin';

-- Create function to check admin by phone
CREATE OR REPLACE FUNCTION public.is_admin_by_phone(phone_num TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE phone_number = phone_num AND role = 'admin'
  );
END;
$$;