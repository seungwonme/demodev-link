-- Update RLS policies to use Clerk JWT instead of Supabase Auth
-- auth.jwt() ->> 'sub' returns the Clerk user ID from the JWT token

-- 1. Update get_current_profile_id function to use Clerk JWT
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles
  WHERE clerk_user_id = (auth.jwt() ->> 'sub')
$$;

-- 2. Update profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (clerk_user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- Add INSERT policy for profiles (needed for first-time user creation)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));

-- 3. Update links table INSERT policy
DROP POLICY IF EXISTS "Users can create links" ON links;
CREATE POLICY "Users can create links" ON links
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'sub') IS NOT NULL
    AND user_id = get_current_profile_id()
  );

-- 4. Update campaigns table INSERT policy
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
CREATE POLICY "Users can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'sub') IS NOT NULL
    AND user_id = get_current_profile_id()
  );

-- 5. Update link_templates table INSERT policy
DROP POLICY IF EXISTS "Users can create templates" ON link_templates;
CREATE POLICY "Users can create templates" ON link_templates
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'sub') IS NOT NULL
    AND user_id = get_current_profile_id()
  );

-- Add comments for documentation
COMMENT ON FUNCTION public.get_current_profile_id() IS
'Returns the profile ID for the current Clerk user based on JWT sub claim';
