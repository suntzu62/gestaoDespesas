/*
  # Adicionar group_id à tabela categories

  1. Modificações na Tabela
    - Adicionar coluna `group_id` à tabela `categories`
    - Foreign key para `category_groups.id` com ON DELETE SET NULL
    - Índice para otimização de queries

  2. Função de Migração
    - Função para associar categorias existentes a grupos padrão
    - Baseada no tipo da categoria (spending -> Essenciais, etc.)
*/

-- Adicionar coluna group_id à tabela categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE categories ADD COLUMN group_id uuid REFERENCES category_groups(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Criar índice para otimização
CREATE INDEX IF NOT EXISTS categories_group_id_idx ON categories(group_id, sort_order);

-- Função para migrar categorias existentes para grupos padrão
CREATE OR REPLACE FUNCTION migrate_existing_categories_to_groups()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  essenciais_group_id uuid;
  estilo_vida_group_id uuid;
  poupanca_group_id uuid;
  outros_group_id uuid;
BEGIN
  -- Para cada usuário que tem categorias
  FOR user_record IN 
    SELECT DISTINCT user_id FROM categories WHERE group_id IS NULL
  LOOP
    -- Verificar se o usuário já tem grupos, se não, criar
    SELECT id INTO essenciais_group_id 
    FROM category_groups 
    WHERE user_id = user_record.user_id AND name = 'Essenciais'
    LIMIT 1;
    
    IF essenciais_group_id IS NULL THEN
      -- Criar grupos padrão para este usuário
      INSERT INTO category_groups (user_id, name, sort_order) VALUES
        (user_record.user_id, 'Essenciais', 1)
      RETURNING id INTO essenciais_group_id;
      
      INSERT INTO category_groups (user_id, name, sort_order) VALUES
        (user_record.user_id, 'Estilo de Vida', 2)
      RETURNING id INTO estilo_vida_group_id;
      
      INSERT INTO category_groups (user_id, name, sort_order) VALUES
        (user_record.user_id, 'Poupança e Investimentos', 3)
      RETURNING id INTO poupanca_group_id;
      
      INSERT INTO category_groups (user_id, name, sort_order) VALUES
        (user_record.user_id, 'Outros', 4)
      RETURNING id INTO outros_group_id;
    ELSE
      -- Buscar IDs dos grupos existentes
      SELECT id INTO estilo_vida_group_id 
      FROM category_groups 
      WHERE user_id = user_record.user_id AND name = 'Estilo de Vida'
      LIMIT 1;
      
      SELECT id INTO poupanca_group_id 
      FROM category_groups 
      WHERE user_id = user_record.user_id AND name = 'Poupança e Investimentos'
      LIMIT 1;
      
      SELECT id INTO outros_group_id 
      FROM category_groups 
      WHERE user_id = user_record.user_id AND name = 'Outros'
      LIMIT 1;
    END IF;
    
    -- Associar categorias existentes aos grupos baseado no tipo e nome
    UPDATE categories SET group_id = essenciais_group_id
    WHERE user_id = user_record.user_id 
      AND group_id IS NULL
      AND (
        type = 'spending' AND (
          LOWER(name) LIKE '%alimento%' OR 
          LOWER(name) LIKE '%alimentação%' OR
          LOWER(name) LIKE '%moradia%' OR 
          LOWER(name) LIKE '%transporte%' OR
          LOWER(name) LIKE '%saúde%' OR
          LOWER(name) LIKE '%educação%'
        )
      );
    
    UPDATE categories SET group_id = estilo_vida_group_id
    WHERE user_id = user_record.user_id 
      AND group_id IS NULL
      AND (
        type = 'spending' AND (
          LOWER(name) LIKE '%entretenimento%' OR 
          LOWER(name) LIKE '%lazer%' OR
          LOWER(name) LIKE '%restaurante%' OR
          LOWER(name) LIKE '%shopping%' OR
          LOWER(name) LIKE '%viagem%'
        )
      );
    
    UPDATE categories SET group_id = poupanca_group_id
    WHERE user_id = user_record.user_id 
      AND group_id IS NULL
      AND type = 'saving';
      
    -- Demais categorias vão para "Outros"
    UPDATE categories SET group_id = outros_group_id
    WHERE user_id = user_record.user_id 
      AND group_id IS NULL;
      
  END LOOP;
END;
$$ language plpgsql;

-- Executar a migração para usuários existentes (comentado por segurança)
-- SELECT migrate_existing_categories_to_groups();