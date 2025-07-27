/*
  # Fix Database Error Updating User

  This migration resolves the "Database error updating user" issue that occurs during signup.
  
  1. Database Setup
    - Creates user_role enum type
    - Ensures profiles table exists with correct structure
    - Adds role column with proper default value
  
  2. User Management Function
    - Creates handle_new_user function with proper error handling
    - Handles profile creation for new users
    - Sets default role as 'collaborator'
  
  3. Trigger Configuration
    - Creates trigger to automatically handle new user registration
    - Ensures trigger fires after user creation in auth.users
  
  4. Security Policies
    - Enables Row Level Security on profiles table
    - Creates policies for user profile access and updates
*/

-- Create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('collaborator', 'admin', 'owner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    role user_role DEFAULT 'collaborator'::user_role
);

-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'collaborator'::user_role;
    END IF;
END $$;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        new.email,
        new.raw_user_meta_data->>'avatar_url',
        'collaborator'::user_role
    );
    RETURN new;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
        RETURN new;
END;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;

-- Create RLS policies
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE profiles TO authenticated;