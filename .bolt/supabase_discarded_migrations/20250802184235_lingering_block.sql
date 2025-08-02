```sql
-- Drop existing objects to ensure a clean slate
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE; -- Adicionado CASCADE para garantir que o tipo seja removido se estiver em uso
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar enum user_role
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('collaborator', 'admin', 'owner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar a tabela profiles
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  role user_role DEFAULT 'collaborator'::user_role
);

-- Adicionar índice para email (o PRIMARY KEY já cria um índice para 'id')
CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);

-- Atualizar função handle_new_user
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Habilitar RLS
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
```