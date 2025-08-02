/*
  # Sistema Financeiro BolsoZen - Inspirado no YNAB

  1. Novas Tabelas
    - `accounts` - Contas financeiras (bancos, cartões, investimentos)
    - `categories` - Categorias de orçamento (envelopes)
    - `transactions` - Transações financeiras
    - `budgets` - Orçamentos mensais por categoria
    - `goals` - Metas de economia e poupança

  2. Alterações em Tabelas Existentes
    - `profiles` - Adiciona meta de economia padrão

  3. Tipos ENUM
    - `account_type` - Tipos de conta (corrente, poupança, crédito, investimento)
    - `category_type` - Tipos de categoria (gasto, economia, receita)
    - `transaction_type` - Tipos de transação (receita, despesa, transferência)
    - `goal_type` - Tipos de meta (construtor de poupança, meta por data, financiamento mensal)

  4. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados acessarem apenas seus próprios dados
    - Restrições de integridade referencial

  5. Funcionalidades
    - Suporte a orçamento zero-based (cada real deve ser alocado)
    - Rollover de saldo entre meses
    - Categorização automática via n8n
    - Metas inteligentes com progresso
    - Controle de contas múltiplas
*/

-- Criar tipos ENUM
DO $$ BEGIN
  CREATE TYPE account_type AS ENUM ('checking', 'savings', 'credit_card', 'investment', 'cash');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE category_type AS ENUM ('spending', 'saving', 'income');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE goal_type AS ENUM ('saving_builder', 'target_by_date', 'monthly_funding');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de contas financeiras
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type account_type NOT NULL DEFAULT 'checking',
  balance numeric(15,2) DEFAULT 0.00,
  bank_name text,
  account_number text,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  n8n_connection_id text, -- Para rastrear conexões do n8n
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de categorias de orçamento
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type category_type NOT NULL DEFAULT 'spending',
  parent_category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  budgeted_amount numeric(15,2) DEFAULT 0.00, -- Valor padrão mensal
  rollover_enabled boolean DEFAULT true,
  color text DEFAULT '#6B7280', -- Cor hex para UI
  icon text, -- Nome do ícone Lucide React
  is_hidden boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  date date NOT NULL,
  description text NOT NULL,
  amount numeric(15,2) NOT NULL,
  type transaction_type NOT NULL,
  is_cleared boolean DEFAULT false, -- Transação foi reconciliada
  is_recurring boolean DEFAULT false,
  recurring_interval text, -- 'monthly', 'weekly', etc.
  n8n_import_id text, -- ID da importação via n8n
  suggested_category_id uuid REFERENCES categories(id), -- Sugestão da IA
  notes text,
  tags text[], -- Tags para filtros avançados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de orçamentos mensais
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month date NOT NULL, -- Primeiro dia do mês (YYYY-MM-01)
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  budgeted_amount numeric(15,2) NOT NULL DEFAULT 0.00,
  rollover_amount numeric(15,2) DEFAULT 0.00, -- Valor rolado do mês anterior
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month, category_id) -- Um orçamento por categoria por mês
);

-- Tabela de metas
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL, -- Meta pode ser independente de categoria
  name text NOT NULL,
  description text,
  target_amount numeric(15,2) NOT NULL,
  current_amount numeric(15,2) DEFAULT 0.00,
  target_date date,
  type goal_type NOT NULL DEFAULT 'saving_builder',
  monthly_contribution numeric(15,2) DEFAULT 0.00,
  is_achieved boolean DEFAULT false,
  is_active boolean DEFAULT true,
  color text DEFAULT '#10B981', -- Verde para metas
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Atualizar tabela profiles para adicionar meta de economia
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'economy_goal'
  ) THEN
    ALTER TABLE profiles ADD COLUMN economy_goal numeric(15,2) DEFAULT 0.00;
  END IF;
END $$;

-- Adicionar campos úteis ao perfil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'currency'
  ) THEN
    ALTER TABLE profiles ADD COLUMN currency text DEFAULT 'BRL';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'America/Sao_Paulo';
  END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS accounts_type_idx ON accounts(type);

CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_category_id);
CREATE INDEX IF NOT EXISTS categories_type_idx ON categories(type);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_account_id_idx ON transactions(account_id);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);

CREATE INDEX IF NOT EXISTS budgets_user_id_month_idx ON budgets(user_id, month DESC);
CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON budgets(category_id);

CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_category_id_idx ON goals(category_id);
CREATE INDEX IF NOT EXISTS goals_is_active_idx ON goals(is_active);

-- Habilitar RLS em todas as tabelas
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para accounts
CREATE POLICY "Users can read own accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para categories
CREATE POLICY "Users can read own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para budgets
CREATE POLICY "Users can read own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Função para calcular saldo disponível de uma categoria em um mês
CREATE OR REPLACE FUNCTION get_category_available_amount(
  p_user_id uuid,
  p_category_id uuid,
  p_month date
) RETURNS numeric AS $$
DECLARE
  budgeted_amount numeric := 0;
  spent_amount numeric := 0;
  rollover_amount numeric := 0;
BEGIN
  -- Obter valor orçado
  SELECT COALESCE(b.budgeted_amount + b.rollover_amount, 0)
  INTO budgeted_amount
  FROM budgets b
  WHERE b.user_id = p_user_id
    AND b.category_id = p_category_id
    AND b.month = p_month;

  -- Obter valor gasto
  SELECT COALESCE(SUM(ABS(t.amount)), 0)
  INTO spent_amount
  FROM transactions t
  WHERE t.user_id = p_user_id
    AND t.category_id = p_category_id
    AND t.type = 'expense'
    AND date_trunc('month', t.date) = p_month;

  RETURN budgeted_amount - spent_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir categorias padrão para novos usuários
CREATE OR REPLACE FUNCTION create_default_categories_for_user(p_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Categorias de Gastos Essenciais
  INSERT INTO categories (user_id, name, type, color, icon, sort_order) VALUES
    (p_user_id, 'Moradia', 'spending', '#EF4444', 'Home', 1),
    (p_user_id, 'Alimentação', 'spending', '#F59E0B', 'UtensilsCrossed', 2),
    (p_user_id, 'Transporte', 'spending', '#3B82F6', 'Car', 3),
    (p_user_id, 'Saúde', 'spending', '#10B981', 'Heart', 4),
    (p_user_id, 'Educação', 'spending', '#8B5CF6', 'GraduationCap', 5);

  -- Categorias de Assinaturas e Serviços
  INSERT INTO categories (user_id, name, type, color, icon, sort_order) VALUES
    (p_user_id, 'Assinaturas', 'spending', '#F97316', 'Repeat', 6),
    (p_user_id, 'Internet/Telefone', 'spending', '#06B6D4', 'Wifi', 7),
    (p_user_id, 'Seguros', 'spending', '#84CC16', 'Shield', 8);

  -- Categorias de Lazer e Estilo de Vida
  INSERT INTO categories (user_id, name, type, color, icon, sort_order) VALUES
    (p_user_id, 'Lazer', 'spending', '#EC4899', 'PartyPopper', 9),
    (p_user_id, 'Roupas', 'spending', '#A855F7', 'Shirt', 10),
    (p_user_id, 'Cuidados Pessoais', 'spending', '#14B8A6', 'Sparkles', 11);

  -- Categorias de Poupança e Metas
  INSERT INTO categories (user_id, name, type, color, icon, sort_order) VALUES
    (p_user_id, 'Emergência', 'saving', '#DC2626', 'AlertTriangle', 12),
    (p_user_id, 'Aposentadoria', 'saving', '#059669', 'PiggyBank', 13),
    (p_user_id, 'Viagem', 'saving', '#0EA5E9', 'Plane', 14);

  -- Categoria de Receita
  INSERT INTO categories (user_id, name, type, color, icon, sort_order) VALUES
    (p_user_id, 'Salário', 'income', '#22C55E', 'Banknote', 15),
    (p_user_id, 'Renda Extra', 'income', '#16A34A', 'TrendingUp', 16);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar categorias padrão quando um novo perfil é criado
CREATE OR REPLACE FUNCTION handle_new_user_categories()
RETURNS trigger AS $$
BEGIN
  -- Criar categorias padrão para o novo usuário
  PERFORM create_default_categories_for_user(NEW.id);
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Aplicar o trigger à tabela profiles (será executado após inserção)
DROP TRIGGER IF EXISTS on_user_profile_created ON profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user_categories();