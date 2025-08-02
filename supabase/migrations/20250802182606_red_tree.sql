```sql
-- Step 1: Ensure the handle_new_user function is correctly defined for new user creation (INSERT)
-- This function inserts a new row into the public.profiles table when a new user signs up.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'collaborator'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Step 2: Ensure the handle_user_update function is correctly defined for user updates (UPDATE)
-- This function updates an existing row in the public.profiles table when an auth.users record is updated.
-- The error "record "old" has no field "name"" indicates this function was being called during an INSERT.
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET
    name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', OLD.name),
    email = COALESCE(NEW.email, OLD.email),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', OLD.avatar_url),
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Step 3: Ensure the trigger for new user creation (INSERT) is correctly set up
-- This trigger should fire AFTER INSERT on auth.users and call handle_new_user.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Step 4: Ensure the trigger for user updates (UPDATE) is correctly set up
-- This trigger should fire AFTER UPDATE on auth.users and call handle_user_update.
-- This is critical to prevent handle_user_update from being called during INSERT.
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users; -- Drop if it exists with any configuration
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_user_update();

-- Step 5: Re-apply RLS policies as a safeguard, though the primary issue is likely the trigger configuration.
-- Desabilitar RLS temporariamente para garantir que as políticas sejam recriadas corretamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover políticas RLS existentes para evitar duplicatas ou conflitos
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read profiles based on role" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;

-- Recriar políticas RLS
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read profiles based on role"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (id = auth.uid()) OR
    (
      SELECT role FROM public.profiles
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  );

CREATE POLICY "Admins can update user roles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    (
      SELECT role FROM public.profiles
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  )
  WITH CHECK (
    (
      SELECT role FROM public.profiles
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  );

-- Reabilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```