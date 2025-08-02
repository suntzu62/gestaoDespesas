/*
  # Fix Existing User Roles - Resolve Login Loop

  This migration addresses the login loop issue by ensuring all existing users
  have a valid role assigned in their profile.

  ## Problem
  When the 'role' column was added to the profiles table, existing users
  had NULL values which causes authentication context issues.

  ## Solution
  1. Update all profiles with NULL role to 'collaborator'
  2. Verify all users have valid roles
  3. Add constraint to prevent future NULL roles

  ## Changes
  - Updates existing profiles with NULL role to 'collaborator'
  - Adds NOT NULL constraint to prevent future issues
  - Provides verification queries
*/

-- 1. Update all existing profiles with NULL role to 'collaborator'
UPDATE public.profiles 
SET role = 'collaborator'::user_role,
    updated_at = now()
WHERE role IS NULL;

-- 2. Verify the update worked (this will show how many users were updated)
-- You can run this in a separate query to check
DO $$ 
DECLARE
    updated_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM public.profiles;
    SELECT COUNT(*) INTO updated_count FROM public.profiles WHERE role = 'collaborator';
    
    RAISE NOTICE 'Total profiles: %, Profiles with collaborator role: %', total_count, updated_count;
END $$;

-- 3. Add NOT NULL constraint to prevent future NULL roles
-- This ensures new profiles always have a valid role
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_name = 'profiles_role_not_null'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_role_not_null 
        CHECK (role IS NOT NULL);
    END IF;
END $$;

-- 4. Update the handle_new_user function to ensure it never creates NULL roles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url, role, created_at, updated_at)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email, 'Usuário'),
        COALESCE(new.email, ''),
        new.raw_user_meta_data->>'avatar_url',
        COALESCE(
            CASE 
                WHEN new.raw_user_meta_data->>'role' IS NOT NULL 
                THEN (new.raw_user_meta_data->>'role')::user_role
                ELSE 'collaborator'::user_role
            END
        ),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, profiles.name),
        email = COALESCE(EXCLUDED.email, profiles.email),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        role = COALESCE(EXCLUDED.role, profiles.role, 'collaborator'::user_role),
        updated_at = now();
    
    RETURN new;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't fail the auth creation
        RAISE LOG 'Error in handle_new_user for user %: %', new.id, SQLERRM;
        RETURN new;
END;
$$ language plpgsql security definer;

-- 5. Create a verification query to check all users have valid roles
-- Run this separately to verify everything is working
/*
SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
*/

-- 6. Final verification - count profiles by role
/*
SELECT 
    role,
    COUNT(*) as user_count
FROM public.profiles
GROUP BY role
ORDER BY user_count DESC;
*/