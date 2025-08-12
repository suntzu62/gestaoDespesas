/*
  # Criação da tabela category_groups

  1. Nova Tabela
    - `category_groups`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para auth.users)
      - `name` (text, nome do grupo)
      - `sort_order` (integer, ordenação dos grupos)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `category_groups`
    - Adicionar políticas para CRUD baseado no user_id
    - Trigger para atualização automática de updated_at
*/

-- Criar tabela category_groups
CREATE TABLE IF NOT EXISTS category_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;

-- Índices para otimização
CREATE INDEX IF NOT EXISTS category_groups_user_id_idx ON category_groups(user_id);
CREATE INDEX IF NOT EXISTS category_groups_sort_order_idx ON category_groups(user_id, sort_order);

-- Políticas RLS
CREATE POLICY "Users can read own category groups"
  ON category_groups FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category groups"
  ON category_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category groups"
  ON category_groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own category groups"
  ON category_groups FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_category_groups_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_category_groups_updated_at
  BEFORE UPDATE ON category_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_category_groups_updated_at();

-- Inserir grupos padrão para usuários existentes (opcional)
-- Esta função pode ser executada para criar grupos básicos para usuários que já existem
CREATE OR REPLACE FUNCTION create_default_category_groups_for_existing_users()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Para cada usuário que tem categorias mas não tem grupos
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM categories 
    WHERE user_id NOT IN (SELECT DISTINCT user_id FROM category_groups)
  LOOP
    -- Inserir grupos padrão
    INSERT INTO category_groups (user_id, name, sort_order) VALUES
      (user_record.user_id, 'Essenciais', 1),
      (user_record.user_id, 'Estilo de Vida', 2),
      (user_record.user_id, 'Poupança e Investimentos', 3),
      (user_record.user_id, 'Outros', 4);
  END LOOP;
END;
$$ language plpgsql;

-- Executar a função para usuários existentes (comentado por segurança)
-- SELECT create_default_category_groups_for_existing_users();