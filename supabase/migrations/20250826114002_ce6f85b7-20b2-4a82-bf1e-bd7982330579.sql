-- Drop all foreign key constraints that reference auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE payment_orders DROP CONSTRAINT IF EXISTS payment_orders_user_id_fkey;
ALTER TABLE user_purchases DROP CONSTRAINT IF EXISTS user_purchases_user_id_fkey;

-- Drop ALL existing policies on affected tables to avoid column type conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles safe" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles safe" ON profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles safe" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own role info" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage user roles" ON user_roles;

-- Now change column types to TEXT
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE user_roles ALTER COLUMN user_id TYPE TEXT;

-- Create minimal policies needed for the payment system to work
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL
  USING (auth.jwt() ? 'service_role'::text);

CREATE POLICY "Service role can manage user roles" ON user_roles
  FOR ALL
  USING (auth.jwt() ? 'service_role'::text);