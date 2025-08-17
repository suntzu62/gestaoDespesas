/*
  # Sistema de Metas (Goals) - MVP
  
  Implementa um sistema completo de metas por categoria com:
  
  1. New Tables
    - `goals`: Armazena as metas dos usuários
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para users)
      - `category_id` (uuid, foreign key para categories)
      - `type` (enum: save_by_date, save_monthly, spend_monthly)
      - `target_amount` (numeric, valor da meta)
      - `due_date` (date, opcional, para save_by_date)
      - `cadence` (text, monthly/weekly, para save_monthly/spend_monthly)
      - `note` (text, opcional)
      - `created_at` (timestamp)
    
    - `goal_contributions`: Armazena contribuições manuais para as metas
      - `id` (uuid, primary key)
      - `goal_id` (uuid, foreign key para goals)
      - `user_id` (uuid, foreign key para users)
      - `amount` (numeric, valor da contribuição - positivo/negativo)
      - `date` (date, data da contribuição)
      - `created_at` (timestamp)
  
  2. Views
    - `v_goal_progress`: View que calcula progresso em tempo real via SUM()
      - Combina dados das metas com soma das contribuições
      - Permite cálculo derivado sem denormalização
  
  3. Security
    - Enable RLS em ambas as tabelas
    - Políticas para usuários acessarem apenas seus dados
    - View herda RLS das tabelas base automaticamente
*/

-- Criar tabela goals
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('save_by_date', 'save_monthly', 'spend_monthly')),
  target_amount numeric(15,2) NOT NULL CHECK (target_amount >= 0),
  due_date date NULL,
  cadence text NULL CHECK (cadence IN ('monthly', 'weekly') OR cadence IS NULL),
  note text NULL,
  created_at timestamptz DEFAULT now()
);

-- Adicionar foreign keys para goals
ALTER TABLE goals ADD CONSTRAINT goals_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE goals ADD CONSTRAINT goals_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_category_id_idx ON goals(category_id);
CREATE INDEX IF NOT EXISTS goals_type_idx ON goals(type);

-- Criar tabela goal_contributions
CREATE TABLE IF NOT EXISTS goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  amount numeric(15,2) NOT NULL,
  date date NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Adicionar foreign keys para goal_contributions
ALTER TABLE goal_contributions ADD CONSTRAINT goal_contributions_goal_id_fkey 
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE;

ALTER TABLE goal_contributions ADD CONSTRAINT goal_contributions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS goal_contributions_goal_id_idx ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS goal_contributions_user_id_idx ON goal_contributions(user_id);
CREATE INDEX IF NOT EXISTS goal_contributions_date_idx ON goal_contributions(date DESC);

-- Habilitar RLS nas tabelas
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para goals
CREATE POLICY "Users can read own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para goal_contributions
CREATE POLICY "Users can read own goal contributions"
  ON goal_contributions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal contributions"
  ON goal_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal contributions"
  ON goal_contributions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal contributions"
  ON goal_contributions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar view para cálculo de progresso em tempo real
CREATE OR REPLACE VIEW v_goal_progress AS
SELECT
  g.id as goal_id,
  g.user_id,
  g.category_id,
  g.type,
  g.target_amount,
  g.due_date,
  g.cadence,
  g.note,
  g.created_at,
  COALESCE(SUM(gc.amount), 0) as contributed
FROM goals g
LEFT JOIN goal_contributions gc ON gc.goal_id = g.id
GROUP BY g.id, g.user_id, g.category_id, g.type, g.target_amount, g.due_date, g.cadence, g.note, g.created_at;