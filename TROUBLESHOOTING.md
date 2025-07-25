# 🔧 Guia de Troubleshooting - BolsoZen

## 🔴 Erro: "Database error saving new user"

### Possíveis Causas e Soluções:

#### 1. **Variáveis de Ambiente Não Configuradas no Netlify**
**Sintoma**: Erro ao cadastrar usuário em produção, mas funciona localmente.

**Solução**:
1. Acesse o painel do Netlify
2. Vá em `Site settings` > `Environment variables`
3. Adicione as seguintes variáveis:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Faça um novo deploy após adicionar as variáveis

#### 2. **Migração SQL Não Executada**
**Sintoma**: Erro relacionado à tabela `profiles` ou coluna `role`.

**Solução**:
1. Acesse o Supabase Dashboard
2. Vá em `SQL Editor`
3. Execute o script da migração:
   ```sql
   -- Criar enum user_role se não existir
   DO $$ BEGIN
     CREATE TYPE user_role AS ENUM ('collaborator', 'admin', 'owner');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;

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
   ```

#### 3. **Problemas com RLS (Row Level Security)**
**Sintoma**: Erro de permissão ao inserir dados.

**Solução**:
1. No Supabase SQL Editor, execute:
   ```sql
   -- Verificar se RLS está habilitado
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Recriar políticas necessárias
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

#### 4. **Trigger Não Configurado**
**Sintoma**: Usuário é criado no Auth mas não na tabela profiles.

**Solução**:
1. Verificar se o trigger existe:
   ```sql
   -- Recriar o trigger
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
   ```

## 🔍 Como Identificar o Problema

### 1. **Verificar Console do Navegador**
- Abra F12 > Console
- Procure por erros detalhados
- Mensagens de "Missing environment variables" indicam problema de configuração

### 2. **Testar Conexão Supabase**
```javascript
// No console do navegador, teste:
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### 3. **Verificar Logs do Supabase**
- Acesse Supabase Dashboard
- Vá em `Logs` > `Database`
- Procure por erros de inserção ou políticas

## 📧 Configuração de Email (Opcional)

Para habilitar confirmação por email:

1. **Supabase Dashboard** > `Authentication` > `Settings`
2. Desabilite "Enable email confirmations" para teste
3. Configure SMTP em `Email Templates` para produção

## 🚀 Lista de Verificação Rápida

- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Migração SQL executada no Supabase
- [ ] Tabela `profiles` existe com coluna `role`
- [ ] RLS habilitado e políticas configuradas
- [ ] Trigger `on_auth_user_created` ativo
- [ ] Função `handle_new_user` atualizada
- [ ] Console do navegador sem erros

## 📞 Suporte

Se o problema persistir:
1. Verifique os logs do Supabase
2. Teste localmente com as mesmas variáveis
3. Entre em contato com o desenvolvedor com:
   - Screenshot do erro
   - Logs do console (F12)
   - URL da página onde ocorre o erro