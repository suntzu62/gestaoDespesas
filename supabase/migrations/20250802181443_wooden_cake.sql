```sql
-- Desabilitar RLS temporariamente para garantir que as políticas sejam recriadas corretamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Recriar a função handle_new_user
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

-- Recriar o trigger on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Reabilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

-- Opcional: Conceder permissão de INSERT para a função handle_new_user se necessário (geralmente não é, pois SECURITY DEFINER já dá privilégios)
-- GRANT INSERT ON public.profiles TO supabase_auth_admin;
```