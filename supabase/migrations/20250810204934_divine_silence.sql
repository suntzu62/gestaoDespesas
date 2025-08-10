/*
  # Corrigir Políticas RLS da Tabela Profiles

  ## Problema Identificado
  - Erro 500 ao tentar buscar perfil do usuário autenticado
  - Políticas de RLS mal configuradas impedindo acesso aos próprios dados

  ## Soluções Implementadas
  1. **RLS Habilitado**: Garante que Row Level Security está ativo
  2. **Limpeza de Políticas**: Remove políticas existentes que podem causar conflitos
  3. **Política de Leitura**: Permite que usuários leiam seu próprio perfil
  4. **Política de Atualização**: Permite que usuários atualizem seu próprio perfil
  5. **Políticas de Admin**: Permite que admins/owners gerenciem outros perfis

  ## Segurança
  - Usuários só podem acessar seus próprios dados
  - Admins e owners podem gerenciar outros usuários
  - Todas as operações são autenticadas
*/

-- Habilitar RLS na tabela profiles (caso não esteja habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos e duplicatas
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles based on role" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;

-- Política ESSENCIAL: Permite que usuários autenticados leiam seu próprio perfil
-- Esta é a política que resolve o erro 500 no AuthContext
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política: Permite que usuários autenticados atualizem seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Permite que admins e owners leiam todos os perfis
-- Esta política é opcional, mas útil para funcionalidades administrativas
CREATE POLICY "Users can read profiles based on role"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    -- Usuário pode ler seu próprio perfil OU
    (id = auth.uid()) OR 
    -- Usuário tem role de admin/owner e pode ler outros perfis
    (
      SELECT role FROM profiles 
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  );

-- Política: Permite que admins e owners alterem roles de outros usuários
-- Esta política é opcional, mas útil para gerenciamento de usuários
CREATE POLICY "Admins can update user roles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    -- Verifica se o usuário logado tem role de admin/owner
    (
      SELECT role FROM profiles 
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  )
  WITH CHECK (
    -- Verifica novamente na operação de escrita
    (
      SELECT role FROM profiles 
      WHERE id = auth.uid()
    ) IN ('admin', 'owner')
  );

-- Verificar se as políticas foram criadas corretamente
-- (Este comentário serve apenas para documentação, o SQL acima já criou as políticas)

/*
  ## Teste das Políticas

  Para testar se as políticas estão funcionando:
  
  1. Usuário autenticado deve conseguir:
     - SELECT em profiles WHERE id = auth.uid()
     - UPDATE em profiles WHERE id = auth.uid()
  
  2. Admin/Owner deve conseguir:
     - SELECT em qualquer registro de profiles
     - UPDATE de role em qualquer registro de profiles
  
  3. Usuário não autenticado:
     - Não deve conseguir acessar nenhum dado de profiles
*/