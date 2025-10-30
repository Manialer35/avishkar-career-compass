-- Drop the foreign key constraints first
ALTER TABLE payment_orders DROP CONSTRAINT IF EXISTS payment_orders_user_id_fkey;
ALTER TABLE user_purchases DROP CONSTRAINT IF EXISTS user_purchases_user_id_fkey;

-- Drop the policies that depend on user_id columns
DROP POLICY IF EXISTS "Users can view their own orders" ON payment_orders;
DROP POLICY IF EXISTS "Users can view their own purchases" ON user_purchases;

-- Now we can alter the columns to TEXT type to handle Firebase UIDs
ALTER TABLE payment_orders ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_purchases ALTER COLUMN user_id TYPE TEXT;

-- Recreate the policies with the new TEXT user_id columns
CREATE POLICY "Users can view their own orders" ON payment_orders
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own purchases" ON user_purchases
  FOR SELECT
  USING (user_id = auth.uid()::text);