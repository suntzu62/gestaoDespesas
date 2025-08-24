# BolsoZen - Controle Financeiro via WhatsApp

Sistema de controle financeiro WhatsApp-first. Envie comprovantes pelo chat, confirme em 1 clique, veja insights no dashboard.

## 🚀 Visão Geral

O BolsoZen revoluciona o controle financeiro usando WhatsApp como interface principal:

1. **📱 Envie comprovante** - Foto/print via WhatsApp
2. **🤖 IA processa** - OCR + classificação automática
3. **✅ Confirme em 1 clique** - Botões interativos no chat
4. **📊 Veja insights** - Dashboard web + comandos WhatsApp

## 🚀 Setup Inicial

### 1. Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Vá para Settings > API para obter suas chaves
3. Configure as variáveis de ambiente:

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Configuração do Google OAuth

1. Vá para [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google+ API
4. Vá para "Credentials" e crie uma "OAuth 2.0 Client ID"
5. Configure os URIs de redirecionamento:
   - Desenvolvimento: `http://localhost:5173/auth/callback`
   - Produção: `https://seudominio.com/auth/callback`

6. No Supabase, vá para Authentication > Providers > Google:
   - Ative o provedor Google
   - Adicione seu Client ID e Client Secret
   - Configure o redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 3. Database Setup

Execute a migração SQL no Supabase SQL Editor:

```sql
-- Cole o conteúdo do arquivo supabase/migrations/create_profiles_table.sql
```

## 🏃‍♂️ Executando o Projeto

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── AuthForm.tsx          # Formulário reutilizável de autenticação
│   ├── GoogleAuthButton.tsx  # Botão de login com Google
│   └── ProtectedRoute.tsx    # Proteção de rotas autenticadas
├── contexts/
│   └── AuthContext.tsx       # Context de autenticação global
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   └── validations.ts       # Schemas Zod para validação
├── pages/
│   ├── SignIn.tsx           # Página de login
│   ├── SignUp.tsx           # Página de cadastro
│   ├── AuthCallback.tsx     # Callback OAuth
│   └── Dashboard.tsx        # Dashboard protegido
└── utils/
    └── handleError.ts       # Tratamento de erros
```

## 🛠 Funcionalidades

### ✅ Implementado

- [x] Cadastro com email/senha
- [x] Login com email/senha
- [x] Login/cadastro com Google
- [x] Validação com Zod
- [x] Tratamento de erros
- [x] Context de autenticação
- [x] Rotas protegidas
- [x] Dashboard básico
- [x] Logout
- [x] Callback OAuth
- [x] Triggers automáticos no banco

### 🔜 Próximos Passos

- [ ] Reset de senha
- [ ] Verificação de email
- [ ] Perfil do usuário
- [ ] Upload de avatar
- [ ] Configurações de conta

## 🎯 Rotas Disponíveis

- `/` - Landing page
- `/signin` - Página de login
- `/signup` - Página de cadastro
- `/auth/callback` - Callback OAuth
- `/dashboard` - Dashboard (protegido)

## 🔐 Fluxo de Autenticação

### Cadastro/Login com Email
1. Usuário preenche formulário
2. Validação com Zod
3. Chamada para Supabase Auth
4. Trigger automático cria perfil
5. Redirecionamento para dashboard

### Login com Google
1. Usuário clica no botão Google
2. Redirecionamento para OAuth do Google
3. Callback processa resposta
4. Trigger automático cria/atualiza perfil
5. Redirecionamento para dashboard

## 🛡 Segurança

- Row Level Security (RLS) habilitado
- Validação client-side e server-side
- Tratamento seguro de erros
- Tokens JWT gerenciados pelo Supabase
- HTTPS obrigatório em produção

## 📝 Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (configurado no Supabase)
# Não precisam estar no .env - são gerenciadas pelo Supabase
```

## 🐛 Troubleshooting

### Erro: "Invalid login credentials"
- Verifique se o email/senha estão corretos
- Confirme se o usuário foi criado com sucesso

### Erro: Google OAuth não funciona
- Verifique as configurações no Google Cloud Console
- Confirme os redirect URIs
- Verifique as credenciais no Supabase

### Erro: "Missing Supabase environment variables"
- Confirme se o arquivo .env existe
- Verifique se as variáveis estão corretas
- Reinicie o servidor de desenvolvimento