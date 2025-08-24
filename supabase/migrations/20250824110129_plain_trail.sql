/*
  # Criar tabela inbox_items para Smart Inbox

  1. Nova Tabela
    - `inbox_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `description` (text) - Descrição da transação
      - `amount` (numeric) - Valor da transação
      - `date` (date) - Data da transação
      - `suggested_category_id` (uuid, foreign key opcional) - Categoria sugerida
      - `status` (enum) - pending/confirmed/rejected
      - `source` (text) - Fonte da captura (email, manual, etc)
      - `raw_data` (jsonb) - Dados brutos para debugging
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Enums
    - Criar enum para status dos inbox_items

  3. Segurança
    - Enable RLS na tabela inbox_items
    - Políticas para usuários acessarem apenas seus próprios itens
*/

-- Criar enum para status do inbox_items
DO $$ BEGIN
  CREATE TYPE inbox_status AS ENUM ('pending', 'confirmed', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar tabela inbox_items
CREATE TABLE IF NOT EXISTS inbox_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  description text NOT NULL,
  amount numeric(15,2) NOT NULL,
  date date NOT NULL,
  suggested_category_id uuid,
  status inbox_status DEFAULT 'pending'::inbox_status,
  source text DEFAULT 'email',
  raw_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can read own inbox items"
  ON inbox_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inbox items"
  ON inbox_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inbox items"
  ON inbox_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inbox items"
  ON inbox_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS inbox_items_user_id_status_idx ON inbox_items(user_id, status);
CREATE INDEX IF NOT EXISTS inbox_items_user_id_date_idx ON inbox_items(user_id, date DESC);

-- Foreign key constraints
ALTER TABLE inbox_items
ADD CONSTRAINT inbox_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE inbox_items
ADD CONSTRAINT inbox_items_suggested_category_id_fkey 
FOREIGN KEY (suggested_category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_inbox_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inbox_items_updated_at
  BEFORE UPDATE ON inbox_items
  FOR EACH ROW
  EXECUTE PROCEDURE update_inbox_items_updated_at();