-- First drop the policies that depend on user_id columns
DROP POLICY IF EXISTS "Users can view their own orders" ON payment_orders;
DROP POLICY IF EXISTS "Users can view their own purchases" ON user_purchases;

-- Now we can alter the columns to TEXT type
ALTER TABLE payment_orders ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_purchases ALTER COLUMN user_id TYPE TEXT;

-- Recreate the policies with the new TEXT user_id columns
CREATE POLICY "Users can view their own orders" ON payment_orders
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own purchases" ON user_purchases
  FOR SELECT
  USING (user_id = auth.uid()::text);