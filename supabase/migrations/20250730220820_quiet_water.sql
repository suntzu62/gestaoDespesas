/*
  # Fix Database Error During User Sign-up

  This migration resolves the "Database error updating user" issue that occurs
  during user registration. It ensures all necessary database components are
  properly configured for automatic user profile creation.

  ## What this migration does:
  1. Creates the user_role enum type if it doesn't exist
  2. Ensures the profiles table has all required columns
  3. Creates/updates the handle_new_user function with proper error handling
  4. Sets up the authentication trigger correctly
  5. Configures Row Level Security policies
  6. Grants necessary permissions

  ## Security:
  - Enables RLS on profiles table
  - Creates policies for authenticated users to manage their profiles
  - Sets up admin policies for user management
*/

-- Step 1: Create user_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('collaborator', 'admin', 'owner');
  END IF;
END $$;

-- Step 2: Ensure profiles table has all required columns
DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'collaborator'::user_role;
  END IF;
END $$;

-- Step 3: Create or replace the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new profile with error handling
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    'collaborator'::user_role
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Re-raise the error so sign-up fails gracefully
    RAISE;
END;
$$;

-- Step 4: Drop and recreate the trigger to ensure it's properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Step 5: Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;

-- Step 7: Create comprehensive RLS policies
-- Policy for users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    -- Prevent users from changing their own role
    (role IS NULL OR role = (SELECT role FROM profiles WHERE id = auth.uid()))
  );

-- Policy for admins to read all profiles
CREATE POLICY "Users can read profiles based on role"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own profile OR if they are admin/owner
    id = auth.uid() OR 
    (
      SELECT role FROM profiles 
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  );

-- Policy for admins to update user roles
CREATE POLICY "Admins can update user roles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Only admins/owners can update roles
    (
      SELECT role FROM profiles 
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  )
  WITH CHECK (
    -- Only admins/owners can update roles
    (
      SELECT role FROM profiles 
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  );

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Step 9: Create an index on the email column for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Step 10: Verify the setup
DO $$
BEGIN
  -- Check if the trigger exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    RAISE EXCEPTION 'Trigger on_auth_user_created was not created successfully';
  END IF;
  
  -- Check if the function exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'handle_new_user'
  ) THEN
    RAISE EXCEPTION 'Function handle_new_user was not created successfully';
  END IF;
  
  RAISE NOTICE 'Database setup completed successfully. User sign-up should now work properly.';
END $$;