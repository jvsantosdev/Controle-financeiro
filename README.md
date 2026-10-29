# Financeiro App

Um gerenciador financeiro pessoal completo desenvolvido com Next.js 15, TypeScript, Prisma e PostgreSQL. O aplicativo permite controle completo de transações, orçamentos, metas de poupança e métodos de pagamento.

## 🚀 Funcionalidades

- **Autenticação segura**: Login/registro com NextAuth.js
- **Transações**: CRUD completo de entradas e saídas com categorias
- **Orçamentos**: Controle de orçamentos por categoria com barras de progresso
- **Metas de poupança**: Definição e acompanhamento de metas financeiras
- **Métodos de pagamento**: Gerenciamento de cartões, PIX, dinheiro
- **Dashboard**: Visão geral com gráficos de receitas/despesas
- **Importação CSV**: Importação de transações a partir de arquivos CSV
- **Modo claro/escuro**: Toggle entre temas
- **Totalmente responsivo**: Design mobile-first
- **Localização pt-BR**: Formatação monetária em R$ e datas no padrão brasileiro

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: API Routes do Next.js
- **Banco de dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **Validação**: Zod
- **Gráficos**: Recharts
- **Formatação**: Intl API para BRL e datas pt-BR

## 📋 Pré-requisitos

- Node.js 18+ ou Bun
- PostgreSQL (local ou serviços como Neon/Supabase)

## ⚙️ Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   # ou
   bun install
   ```
3. Configure o banco de dados:
   - Crie um arquivo `.env.local` baseado em `.env.example`
   - Configure a `DATABASE_URL` com suas credenciais PostgreSQL
   - Configure `NEXTAUTH_URL` e `NEXTAUTH_SECRET`
4. Execute as migrations do Prisma:
   ```bash
   npx prisma migrate dev
   # ou
   bunx prisma migrate dev
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   bun dev
   ```

## 🗄️ Estrutura do Banco de Dados

O projeto utiliza Prisma com os seguintes modelos principais:

- **User**: Usuários do sistema
- **Transaction**: Transações financeiras (receitas/despesas)
- **PaymentMethod**: Métodos de pagamento
- **Budget**: Orçamentos por categoria
- **Goal**: Metas de poupança

## 🌐 Deployment

### Vercel

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente:
   - `DATABASE_URL` (Neon, Supabase ou outro PostgreSQL)
   - `NEXTAUTH_URL` (URL da sua aplicação)
   - `NEXTAUTH_SECRET` (segredo para sessões)
3. Deploy automático com `git push`

### Render

1. Crie um novo Web Service no Render
2. Conecte ao repositório Git
3. Configure as variáveis de ambiente
4. Build command: `npm run build` ou `bun run build`
5. Start command: `npm start` ou `bun start`

## 📱 Responsividade

O aplicativo é totalmente responsivo com design mobile-first:
- Grids que se adaptam de 1 coluna (mobile) para 2-3 colunas (desktop)
- Tabelas com rolagem horizontal em dispositivos pequenos
- Elementos interativos com tamanhos adequados para toque
- Breakpoints consistentes com Tailwind CSS

## 🎨 Formatação Local

- **Moeda**: Formatação automática em Real Brasileiro (R$)
- **Datas**: Formato dd/mm/aaaa conforme padrão pt-BR
- **Números**: Separadores decimais e milhares apropriados

## 🔒 Segurança

- Senhas armazenadas com hash (bcrypt)
- Rotas protegidas com middleware de autenticação
- Sessões seguras com NextAuth.js
- Validação de entrada com Zod

## 📊 API Endpoints

- `POST /api/auth/[...nextauth]` - Autenticação
- `GET|POST|PUT|DELETE /api/transactions` - Transações
- `GET|POST|PUT|DELETE /api/budgets` - Orçamentos
- `GET|POST|PUT|DELETE /api/goals` - Metas
- `GET /api/dashboard/summary` - Dados do dashboard
- `POST /api/import/csv` - Importação CSV

## 📄 Licença

MIT
