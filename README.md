# Sistema de Gestão Integrado

Sistema completo para gestão de **Financeiro**, **Estoque** e **Gerencial**, com controle de funcionários, ponto, pagamentos semanais, estoque de mantimentos e contas a pagar.

## Tecnologias

### Backend
- Node.js + Express
- MySQL (banco de dados)
- JWT (autenticação)
- Bcrypt (criptografia de senhas)
- Dotenv (variáveis de ambiente)
- CORS

### Frontend
- React + Vite
- Axios (requisições HTTP)
- React Router (navegação)
- TailwindCSS (estilização)
- Recharts (gráficos)

## Pré-requisitos

- Node.js 18+
- MySQL 8+ ou XAMPP
- Git

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/DaniloKuwai/Gestor.git
cd Gestor
```

### 2. Configure o Banco de Dados

Via phpMyAdmin:
1. Acesse `http://localhost/phpmyadmin`
2. Crie um banco chamado `gestao_sistema` com charset `utf8mb4`
3. Importe o arquivo `database/schema.sql`

Via terminal:
```bash
mysql -u root -p < database/schema.sql
```

### 3. Configure o Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta backend:
```
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=gestao_sistema
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d
```

### 4. Inicie o servidor

```bash
npm run dev
```

Servidor rodando em: `http://localhost:3001`

### 5. Configure o Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## Criar Primeiro Usuário (Admin)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Administrador","email":"admin@admin.com","password":"123456","role":"admin"}'
```

## Funcionalidades

### Financeiro
- Cadastro de funcionários (nome, CPF, cargo, PIX, valor semanal)
- Registro de ponto diário (entrada, almoço, saída)
- Cálculo automático de horas trabalhadas
- Geração de pagamentos semanais
- Status de pagamento (pendente → pago)

### Estoque
- Cadastro de itens por categoria
- Movimentações de entrada/saída
- Cálculo automático de estoque atual
- Alerta de itens abaixo do mínimo
- Lista de compras automática semanal
- Atualização de preço médio nas entradas
- Relatório de gastos por item/período

### Gerencial
- Cadastro de fornecedores
- Contas a pagar com vencimento
- Status automático (pendente / pago / atrasado)
- Resumo mensal por categoria e fornecedor
- Alerta de contas próximas do vencimento
- Suporte a notas fiscais

## Níveis de Acesso

| Role | Permissões |
|------|-----------|
| admin | Acesso total (incluindo deletar e cadastrar categorias) |
| gerente | Operacional (criar, editar, pagar - sem deletar) |
| funcionário | Leitura + registrar próprio ponto |

## Roadmap

- Dashboard com gráficos (Recharts)
- Relatórios em PDF
- Exportação para Excel
- Notificações por e-mail
- App Mobile (React Native)
- Controle de receitas (DRE)
- Fluxo de caixa
