-- Fix infinite recursion in profiles table RLS policies

-- Drop the existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- Create a security definer function to check admin status without RLS
CREATE OR REPLACE FUNCTION auth.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  -- Bypass RLS by using SECURITY DEFINER
  SELECT (role = 'admin' AND status = 'approved')
  INTO is_admin_user
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(is_admin_user, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.is_admin(UUID) TO authenticated;

-- Recreate the admin policies using the security definer function
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id -- Users can see their own profile
    OR 
    auth.is_admin(auth.uid()) -- Admins can see all profiles
  );

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    auth.is_admin(auth.uid())
  );

-- Also update the existing is_admin() function to use the new approach
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update is_approved function to also use security definer pattern
CREATE OR REPLACE FUNCTION auth.is_approved(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_approved_user BOOLEAN;
BEGIN
  -- Bypass RLS by using SECURITY DEFINER
  SELECT (status = 'approved')
  INTO is_approved_user
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(is_approved_user, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.is_approved(UUID) TO authenticated;

-- Update the is_approved function
CREATE OR REPLACE FUNCTION is_approved()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.is_approved(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now let's also fix the links table policies to use these functions
DROP POLICY IF EXISTS "Approved users can read links" ON links;
DROP POLICY IF EXISTS "Approved users can create links" ON links;
DROP POLICY IF EXISTS "Approved users can update own links" ON links;
DROP POLICY IF EXISTS "Approved users can delete own links" ON links;

-- Recreate links policies using the security definer functions
CREATE POLICY "Approved users can read links" ON links
  FOR SELECT USING (
    auth.is_approved(auth.uid())
  );

CREATE POLICY "Approved users can create links" ON links
  FOR INSERT WITH CHECK (
    auth.is_approved(auth.uid())
  );

CREATE POLICY "Approved users can update own links" ON links
  FOR UPDATE USING (
    user_id = auth.uid() AND auth.is_approved(auth.uid())
  );

CREATE POLICY "Approved users can delete own links" ON links
  FOR DELETE USING (
    user_id = auth.uid() AND auth.is_approved(auth.uid())
  );

-- Drop the old "Users can read own profile" policy and recreate it as part of the combined policy
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Add an index on profiles (id, role, status) for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_admin_check ON profiles(id, role, status);