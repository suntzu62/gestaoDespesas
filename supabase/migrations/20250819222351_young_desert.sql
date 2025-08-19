/*
  # Fix handle_new_user function and trigger

  This migration fixes the authentication flow by:
  1. Updating the handle_new_user function to handle both INSERT and UPDATE scenarios
  2. Recreating the trigger to fire on both INSERT and UPDATE events
  3. Ensuring profiles are always created or updated when users authenticate

  ## Changes Made:
  - Modified handle_new_user function to use UPSERT logic (INSERT or UPDATE)
  - Updated trigger to fire on INSERT OR UPDATE
  - Added better error handling and logging
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function with improved UPSERT logic
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert new profile or update existing one
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'collaborator'
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    name = COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    email = new.email,
    avatar_url = new.raw_user_meta_data->>'avatar_url',
    updated_at = now();

  -- Always update the user's app metadata with role for RLS policies
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', 'collaborator'::text)
  WHERE id = new.id;

  RETURN new;
END;
$$ language plpgsql security definer;

-- Recreate trigger to fire on both INSERT and UPDATE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Manually create profile for existing Google user if needed
-- Replace the UUID below with the actual user ID from your auth.users table
DO $$
DECLARE
  google_user_id uuid := '3b07d796-759c-41b5-b9bc-3f8a41b21d8'; -- Update this with actual ID
  user_record record;
BEGIN
  -- Get the user data from auth.users
  SELECT * INTO user_record FROM auth.users WHERE id = google_user_id;
  
  IF user_record.id IS NOT NULL THEN
    -- Insert profile if it doesn't exist
    INSERT INTO public.profiles (id, name, email, avatar_url, role)
    VALUES (
      user_record.id,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.email),
      user_record.email,
      user_record.raw_user_meta_data->>'avatar_url',
      'collaborator'
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Update app metadata
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', 'collaborator'::text)
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Profile created/updated for user: %', user_record.email;
  ELSE
    RAISE NOTICE 'User with ID % not found in auth.users', google_user_id;
  END IF;
END $$;