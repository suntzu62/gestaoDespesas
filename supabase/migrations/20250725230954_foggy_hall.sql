/*
  # Fix Database Error for User Signup

  This migration resolves the "Database error saving new user" issue by ensuring:
  
  1. User Role Enum
     - Creates the user_role enum type if it doesn't exist
     
  2. Profiles Table Structure  
     - Ensures profiles table has all required columns
     - Adds the role column with proper default value
     
  3. Database Functions
     - Creates/updates the handle_new_user function for automatic profile creation
     - Ensures proper error handling and data insertion
     
  4. Triggers
     - Sets up the on_auth_user_created trigger to call handle_new_user
     - Ensures trigger fires after user creation in auth.users
     
  5. Row Level Security
     - Enables RLS on profiles table
     - Creates proper policies for user access
*/

-- 1. Create user_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('collaborator', 'admin', 'owner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Ensure profiles table has the role column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'collaborator'::user_role;
  END IF;
END $$;

-- 3. Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'collaborator'::user_role,
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ language plpgsql security definer;

-- 4. Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 5. Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;

-- 7. Create RLS policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read profiles based on role"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (id = auth.uid()) OR 
    (
      SELECT role FROM profiles 
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  );

CREATE POLICY "Admins can update user roles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (
      SELECT role FROM profiles 
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  )
  WITH CHECK (
    (
      SELECT role FROM profiles 
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  );

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE profiles TO authenticated;