```sql
-- Criar enum user_role se não existir
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('collaborator', 'admin', 'owner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar a tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  role user_role DEFAULT 'collaborator'::user_role
);

-- Adicionar coluna role se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'collaborator'::user_role;
  END IF;
END $$;

-- Atualizar a função handle_new_user
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

-- Habilitar Row Level Security (RLS) na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recriar políticas de RLS para a tabela profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;

-- Política para leitura do próprio perfil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política para atualização do próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para admins lerem todos os perfis
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

-- Política para admins alterarem roles
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
```