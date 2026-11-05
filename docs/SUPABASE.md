# Configurando o Supabase

O app não roda sem estes passos: toda página exige login, e o login depende do Supabase.

## 1. Criar o projeto

1. Crie uma conta em [supabase.com](https://supabase.com) e clique em **New project**.
2. Escolha a região **South America (São Paulo)** e guarde a senha do banco.

## 2. Criar as tabelas

No painel, abra **SQL Editor** → **New query** e rode cada arquivo uma vez, nesta ordem:

1. [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql)
2. [`supabase/migrations/0002_server_game_logic.sql`](../supabase/migrations/0002_server_game_logic.sql)
3. [`supabase/migrations/0003_full_cases.sql`](../supabase/migrations/0003_full_cases.sql)
4. [`supabase/migrations/0004_data_limits.sql`](../supabase/migrations/0004_data_limits.sql)

## 3. Configurar as chaves

Preencha o `.env.local` (se ele não existir, copie o `.env.example`):

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project Settings → API** (Project URL) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Project Settings → API Keys** (publishable ou anon) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` enquanto não houver domínio; a URL pública em produção |

A chave publishable fica visível no navegador por design: quem protege os dados é o RLS. **Nunca** use a chave `service_role`/secret neste projeto; ela ignora o RLS e o app não precisa dela.

Reinicie o `npm run dev` depois de criar o `.env.local`.

## 4. Configurar as URLs de autenticação

Em **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`.
- **Redirect URLs:** adicione `http://localhost:3000/**`. O `/**` cobre os links de confirmação de e-mail e de recuperação de senha.

Quando tiver um domínio, troque a Site URL e adicione `https://SEU-DOMINIO/**`. Domínio próprio não é necessário para desenvolver.

A confirmação de e-mail vem ligada por padrão. Para testar sem depender de e-mail, desligue **Confirm email** em **Authentication → Sign In / Providers → Email**. O serviço de e-mail padrão do Supabase tem limite baixo de envios; para produção, configure um SMTP próprio.

## 5. Login com Google (opcional)

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um **OAuth client ID** do tipo **Web application**.
2. Em **Authorized redirect URIs**, use `https://SEU-PROJETO.supabase.co/auth/v1/callback`.
3. No Supabase, em **Authentication → Sign In / Providers → Google**, ative e cole o Client ID e o Secret.
4. Defina `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` no `.env.local` e reinicie o servidor.

## Publicação

Cadastre as mesmas variáveis no painel da hospedagem (por exemplo, Vercel), com `NEXT_PUBLIC_SITE_URL` apontando para o domínio real. O `.env.local` nunca vai para o git.
