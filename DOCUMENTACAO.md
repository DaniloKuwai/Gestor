# Documentacao do Projeto - Sistema de Gestao Integrado

> **Metodo Feynman aplicado:** Cada conceito e explicado como se voce estivesse sentado ao lado de um dev senior, tomando um cafe, e ele te mostrasse como as coisas funcionam de verdade. Sem jargao sem necessidade, com analogias do mundo real.

---

## Sumario

1. [Visao Geral da Arquitetura](#1-visao-geral-da-arquitetura)
2. [Backend - O Servidor](#2-backend---o-servidor)
3. [Banco de Dados - A Memoria do Sistema](#3-banco-de-dados---a-memoria-do-sistema)
4. [Autenticacao - Quem e Voce?](#4-autenticacao---quem-e-voce)
5. [Middlewares - O Porteiro](#5-middlewares---o-porteiro)
6. [Controllers - O Gerente de Cada Secao](#6-controllers---o-gerente-de-cada-secao)
7. [Rotas - O Mapa do Sistema](#7-rotas---o-mapa-do-sistema)
8. [Frontend - A Interface](#8-frontend---a-interface)
9. [Context API - O Estado Compartilhado](#9-context-api---o-estado-compartilhado)
10. [Axios e Interceptors - O Carteiro Inteligente](#10-axios-e-interceptors---o-carteiro-inteligente)
11. [Explicacao Modulo por Modulo](#11-explicacao-modulo-por-modulo)
12. [Fluxo Completo de uma Requisicao](#12-fluxo-completo-de-uma-requisicao)

---

## 1. Visao Geral da Arquitetura

### O que e esse projeto?

Imagine um restaurante. Esse projeto e o **sistema completo** que gerencia esse restaurante: quem trabalha la, quanto ganha, o que tem na despensa, o que precisa comprar, e quais contas precisam pagar no fim do mes.

### Como as pecas se conectam?

```
NAVEGADOR (voce clica)
    |
    v
FRONTEND (React) --> manda pedidos HTTP para o -->
    |
    v
BACKEND (Express) --> traduz em consultas SQL para o -->
    |
    v
BANCO DE DADOS (MySQL) --> devolve os dados -->
    |
    v
BACKEND --> formata e devolve ao -->
    |
    v
FRONTEND --> mostra na tela
```

**Analogia:** E como um pedido de comida. Voce (navegador) pede ao garcom (frontend), que leva o pedido para a cozinha (backend), que consulta o estoque (banco de dados), prepara o prato, e devolve para voce.

### Stack Tecnologico

| Camada | Tecnologia | O que faz |
|--------|-----------|-----------|
| Frontend | React + Vite | A tela que voce ve e interage |
| Estilizacao | TailwindCSS | Deixa tudo bonito sem escrever CSS manual |
| Comunicacao | Axios | Manda e recebe dados do servidor |
| Backend | Express (Node.js) | O cerebro que processa tudo |
| Banco | MySQL | Onde os dados ficam guardados |
| Auth | JWT + Bcrypt | Garante que so quem pode acessa |

---

## 2. Backend - O Servidor

### O que e o backend?

O backend e como a **cozinha** de um restaurante. O cliente (navegador) nunca ve o que acontece la dentro. Ele so recebe o prato pronto (os dados formatados).

### `backend/src/server.js` - O Ponto de Entrada

```javascript
const app = express();
app.use(cors());
app.use(express.json());
```

**Explicacao simples:**
- `express()` cria o servidor. E como ligar o forno da cozinha.
- `cors()` e o sistema de seguranca que permite que o frontend (que roda em outra porta) faca pedidos. Sem isso, o navegador bloqueia as requisicoes por seguranca.
- `express.json()` e o tradutor. Ele entende quando o frontend manda dados em formato JSON (o padrao da web) e transforma em algo que o JavaScript entende.

**As linhas de rota:**
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/financeiro', financeiroRoutes);
```

**Analogia:** Sao como os telefones de cada setor. Quando voce liga para `/api/auth`, a chamada vai para o setor de autenticacao. Quando liga para `/api/financeiro`, vai para o setor financeiro.

**O servidor escuta na porta:**
```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

**Analogia:** A porta e como o numero do telefone do restaurante. O frontend liga para a porta 3001 para falar com o backend. E como discar (3001) para ligar para o setor certo.

---

## 3. Banco de Dados - A Memoria do Sistema

### O que e o banco de dados?

O banco de dados e como os **arquivos de papel** de um escritorio. Cada tabela e uma pasta diferente: uma pasta tem os funcionarios, outra tem os pagamentos, outra tem os itens do estoque.

### `backend/src/config/db.js` - A Conexao

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});
```

**Explicacao passo a passo:**

- **`mysql.createPool()`** cria um **pool de conexoes**. E como ter 10 telefones disponiveis ao inves de um so. Se 5 pessoas estiverem fazendo pedidos ao mesmo tempo, o sistema nao trava - cada uma usa um telefone diferente.

- **`waitForConnections: true`** significa: "se todos os 10 telefones estiverem ocupados, a pessoa faz fila e espera ao inves de receber erro."

- **`connectionLimit: 10`** limita a 10 conexoes simultaneas. E por seguranca - se muitas pessoas acessarem ao mesmo tempo, o sistema nao explode.

- **`charset: 'utf8mb4'** garante que caracteres especiais (acentos, emojis) funcionem corretamente.

### As 10 Tabelas do Banco

| Tabela | O que armazena | Analogia |
|--------|---------------|----------|
| `users` | Usuarios do sistema (login) | Lista de funcionarios com cracha |
| `funcionarios` | Dados dos funcionarios (CPF, cargo, PIX) | Pasta RH de cada pessoa |
| `registros_ponto` | Quem bateu ponto e quando | Relogio de ponto digital |
| `pagamentos` | Pagamentos semanais | Folha de pagamento |
| `categorias_estoque` | Categorias (Carnes, Graos, etc.) | Etiquetas das prateleiras |
| `itens_estoque` | Itens (arroz, feijao, frango) | Cadastro de cada produto na despensa |
| `movimentacoes_estoque` | Entradas e saidas de itens | Controle de quanto entrou e saiu |
| `lista_compras` | O que precisa comprar | Lista de compras da semana |
| `fornecedores` | Quem nos vende | Cadastro de fornecedores |
| `contas_pagar` | Contas do mes | Caderneta de contas a pagar |

### Como os dados se relacionam?

**Analogia:** Imagine que voce tem um formulario de pagamento. Nele, voce preenche o nome do funcionario. Mas em vez de escrever o nome inteiro toda vez, voce so coloca o numero do cracha dele. O sistema depois consulta a pasta RH para saber o nome completo.

E exatamente o que acontece com as **Foreign Keys (chaves estrangeiras)**:

```sql
CREATE TABLE pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funcionario_id INT NOT NULL,  -- <-- esse numero aponta para a tabela funcionarios
  ...
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);
```

`funcionario_id` e o "numero do cracha". Ele aponta para o funcionario certo na tabela `funcionarios`.

---

## 4. Autenticacao - Quem e Voce?

### O que e autenticacao?

Autenticacao e como mostrar seu **cracha** para entrar no predio. Voce prova quem e (login + senha) e recebe um cracha (token JWT) que mostra "essa pessoa pode entrar."

### Como funciona o fluxo?

```
1. Usuario digita email + senha
2. Backend verifica: o email existe? a senha esta certa?
3. Se sim: backend cria um TOKEN (cracha digital)
4. Backend devolve o token para o frontend
5. Frontend guarda o token no navegador
6. Todas as proximas requisicoes mandam o token junto
7. Backend verifica: esse token e valido? Essa pessoa pode acessar?
```

### `backend/src/controllers/authController.js` - O Registro

```javascript
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, role || 'funcionario']
  );
};
```

**Explicacao passo a passo:**

1. **`req.body`** sao os dados que o frontend mandou (nome, email, senha).
2. **`bcrypt.hash(password, 10)`** transforma a senha em uma字符串ilegivel. E como escrever um bilhete e depois embaralhar as letras. Ninguem consegue ler a senha original, nem eu que criei o sistema.
   - O `10` e a "forca do embaralhamento". Quanto maior, mais seguro, mas mais lento.
3. **`pool.query()`** e a consulta SQL que insere o usuario no banco.

### O Login e o Token JWT

```javascript
export const login = async (req, res) => {
  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const valid = await bcrypt.compare(password, user.password);
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};
```

**Analogia do JWT:** Imagine um cracha de plastico que tem:
- Seu nome
- Seu cargo
- Uma data de validade (7 dias)

Esse cracha e assinado com um carimbo secreto (`JWT_SECRET`). So quem tem o carimbo pode criar ou verificar o cracha. Se alguem tentar forjar, o carimbo nao bate e o cracha e invalido.

**O que tem dentro do token:**
```javascript
{ id: 1, role: "admin" }  // <-- so isso! dados minimos
```

O token **NAO** guarda a senha. Guarda so o necessario para saber quem voce e e o que voce pode fazer.

---

## 5. Middlewares - O Porteiro

### O que e um middleware?

Middleware e como um **porteiro** ou **seguranca** que fica na porta de cada setor. Antes de voce entrar, ele verifica seu cracha. Se nao tiver, nao deixa passar.

### `backend/src/middlewares/auth.js`

**authMiddleware - O seguranca que verifica o cracha:**

```javascript
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token nao fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();  // <-- autorizado, pode passar!
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido' });
  }
};
```

**Explicacao passo a passo:**

1. **`req.headers.authorization`** e onde o navegador manda o token. Ele vem assim: `Bearer eyJhbGciOiJIUzI1...`
2. **`authHeader.split(' ')`** separa "Bearer" do token real. A gente so quer o token.
3. **`jwt.verify(token, secret)`** verifica se o carimbo bate. Se bater, libera. Se nao, retorna erro 401 (nao autorizado).
4. **`req.userId = decoded.id`** anota o ID do usuario na requisicao. Assim o controller sabe quem esta fazendo o pedido.
5. **`next()`** e a chave: ele diz "ok, pode seguir para o proximo passo (o controller)."

**roleMiddleware - O seguranca que verifica o cargo:**

```javascript
export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};
```

**Analogia:** E como um porteiro que so deixa entrar quem tem cracha de "gerente" ou "admin". Se voce tem cracha de "funcionario" e tenta entrar no setor de gerencia, ele bloqueia (erro 403).

**Uso na pratica:**
```javascript
router.post('/funcionarios', roleMiddleware('admin', 'gerente'), criarFuncionario);
```
Isso significa: "so admin e gerente podem criar funcionario."

---

## 6. Controllers - O Gerente de Cada Secao

### O que e um controller?

Controller e como o **gerente** de cada setor do restaurante. O setor de estoque tem seu gerente, o financeiro tem o seu, e assim por diante. Cada gerente sabe exatamente o que fazer no seu setor.

### Padrao basico de um controller

Todo controller segue o mesmo padrao:

```javascript
// LISTAR - "Me mostra todos os funcionarios"
export const listarFuncionarios = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM funcionarios');
  return res.json(rows);  // devolve os dados em JSON
};

// CRIAR - "Cadastra um funcionario novo"
export const criarFuncionario = async (req, res) => {
  const { nome, cpf, cargo } = req.body;  // pega os dados do pedido
  await pool.query('INSERT INTO ...', [nome, cpf, cargo]);  // salva no banco
  return res.status(201).json({ id: result.insertId });  // devolve o ID criado
};

// ATUALIZAR - "Altera os dados do funcionario"
export const atualizarFuncionario = async (req, res) => {
  const { id } = req.params;  // pega o ID da URL
  const { nome, cpf } = req.body;  // pega os dados novos
  await pool.query('UPDATE ... WHERE id = ?', [nome, cpf, id]);
  return res.json({ message: 'Atualizado!' });
};

// DELETAR - "Remove o funcionario"
export const deletarFuncionario = async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE funcionarios SET ativo = 0 WHERE id = ?', [id]);
  return res.json({ message: 'Desativado!' });
};
```

**Detalhe importante:** Nao deletamos registros fisicamente (`DELETE FROM`). Desativamos (`SET ativo = 0`). E como demitir um funcionario - voce nao apaga ele da existencia, so marca que ele nao trabalha mais la. Assim o historico fica preservado.

### Controllers explicados

| Controller | Responsabilidade | Analogia |
|-----------|-----------------|----------|
| `authController.js` | Login, registro, dados do usuario | Seguranca do predio |
| `financeiroController.js` | Funcionarios, pagamentos, resumo semanal | Departamento pessoal |
| `pontoController.js` | Registrar e consultar pontos | Relogio de ponto |
| `estoqueController.js` | Itens, categorias, movimentacoes, estoque atual | Despenseiro |
| `comprasController.js` | Lista de compras automatica | Comprador do restaurante |
| `gerencialController.js` | Fornecedores, contas a pagar, resumo mensal | Contador |

---

## 7. Rotas - O Mapa do Sistema

### O que sao rotas?

Rotas sao como as **extensoes de telefone** de uma empresa. Cada rota leva a um lugar diferente:

```
/api/auth/login         --> falar com o seguranca
/api/financeiro/funcionarios  --> falar com o departamento pessoal
/api/estoque/itens      --> falar com a despensa
/api/gerencial/contas   --> falar com o contador
```

### Como uma rota e definida?

```javascript
// financeiroRoutes.js
router.get('/funcionarios', listarFuncionarios);         // GET = consultar
router.post('/funcionarios', roleMiddleware('admin'), criarFuncionario);  // POST = criar
router.put('/funcionarios/:id', roleMiddleware('admin'), atualizarFuncionario);  // PUT = atualizar
router.delete('/funcionarios/:id', roleMiddleware('admin'), deletarFuncionario);  // DELETE = remover
```

**Os 4 verbos HTTP:**

| Verbo | O que faz | Analogia |
|-------|----------|----------|
| GET | Consultar dados | Abrir um arquivo e ler |
| POST | Criar algo novo | Preencher um formulario e enviar |
| PUT | Atualizar algo existente | Editar um documento ja salvo |
| DELETE | Remover algo | Jogar o documento no lixo |

### Rota com parametros

```javascript
router.put('/funcionarios/:id', atualizarFuncionario);
```

O `:id` e um parametro dinamico. Quando voce acessa `/funcionarios/5`, o `:id` vira `5`. E como preencher um formulario online: o ID muda dependendo de qual funcionario voce quer editar.

---

## 8. Frontend - A Interface

### O que e o frontend?

O frontend e a **tela** que voce ve e interage. E como o cardapio do restaurante - voce nao ve a cozinha (backend), so ve o resultado final.

### Estrutura de Pastas

```
frontend/src/
├── components/     --> pecas reutilizaveis (Sidebar, Header)
├── context/        --> dados compartilhados (AuthContext)
├── pages/          --> cada tela do sistema
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Financeiro/
│   ├── Estoque/
│   └── Gerencial/
├── routes/         --> define qual pagina mostra em cada URL
├── services/       --> como fala com o backend (api.js)
├── App.jsx         --> raiz do frontend
└── main.jsx        --> ponto de entrada
```

### `frontend/src/main.jsx` - O Ponto de Entrada

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**Explicacao de dentro para fora:**

1. **`App`** e o componente principal do sistema.
2. **`AuthProvider`** e o provedor de autenticacao. Ele "envolve" todo o sistema e permite que qualquer componente saiba quem esta logado.
3. **`BrowserRouter`** e o navegador de URLs internas. Quando voce clica em "Pagamentos" e muda a URL para `/financeiro/pagamentos`, e o BrowserRouter que troca a pagina sem recarregar tudo.
4. **`React.StrictMode`** e um modo de desenvolvimento que avisa se voce estiver fazendo algo errado.

### `frontend/src/routes/index.jsx` - O Mapa de Navegacao

```jsx
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  return user ? children : <Navigate to="/login" />;
};
```

**Explicacao:** `PrivateRoute` e como um **seguranca da porta**. Antes de mostrar qualquer pagina do sistema, ele verifica: "esta logado?". Se sim, mostra a pagina. Se nao, redireciona para o login.

```jsx
<Route path="/financeiro/pagamentos" element={
  <PrivateRoute><Layout><Pagamentos /></Layout></PrivateRoute>
} />
```

**A cadeia e:** Verifica login --> Mostra Sidebar + Conteudo --> Mostra pagina de Pagamentos.

---

## 9. Context API - O Estado Compartilhado

### O que e o Context?

Context e como um ** quadro de avisos** na parede do restaurante. Quando alguem escreve algo no quadro, todos que estao olhando veem a mesma coisa. E como compartilhar informacao sem precisar passar de mao em mao.

### `frontend/src/context/AuthContext.jsx`

```jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Explicacao passo a passo:**

1. **`useState`** com funcao: quando o sistema abre, ele verifica se ja tem usuario salvo no navegador. Se sim, ja assume que esta logado.
2. **`login()`**: manda o email/senha pro backend, recebe o token, salva no navegador, e atualiza o estado.
3. **`logout()`**: apaga tudo do navegador e limpa o estado.
4. **`AuthContext.Provider`**: "envolve" todos os componentes filhos e disponibiliza `user`, `login`, `logout` para qualquer um usar.

**Como qualquer componente acessa:**
```jsx
const { user, login, logout } = useAuth();
```

E como ter acesso ao quadro de avisos de qualquer lugar do restaurante.

---

## 10. Axios e Interceptors - O Carteiro Inteligente

### O que e o Axios?

Axios e o **carteiro** que leva pedidos do frontend para o backend e traz as respostas.

### `frontend/src/services/api.js`

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Explicacao dos interceptors:**

**Interceptor de REQUISICAO (antes de mandar):**
Antes de cada pedido sair do frontend, o interceptor automaticamente anexa o token de autenticacao. E como o carteiro que sozinho coloca o carimbo de "prioridade" em cada carta.

**Interceptor de RESPOSTA (quando chega):**
Se o backend devolver um erro 401 (token invalido ou expirado), o interceptor automaticamente:
- Limpa o token do navegador
- Limpa os dados do usuario
- Redireciona para o login

E como o carteiro que, se a carta voltar com "destinatario errado", automaticamente direciona voce para atualizar seu endereco.

---

## 11. Explicacao Modulo por Modulo

### Modulo Financeiro

**O que gerencia:** Funcionarios, pontos, pagamentos semanais.

**Funcionarios (`Funcionarios.jsx`)**
- CRUD completo (Create, Read, Update, Delete)
- Cada funcionario tem: nome, CPF, cargo, PIX, telefone, data admissao, valor semanal
- O `valor_semanal` e quanto a pessoa ganha por semana

**Ponto (`Ponto.jsx`)**
- Registra entrada, saida almoco, retorno, saida
- Calcula horas trabalhadas automaticamente
- Funciona assim:
  ```
  Manha: 08:00 ate 12:00 = 4 horas
  Tarde: 13:00 ate 17:00 = 4 horas
  Total: 8 horas
  ```
- Se bater o ponto de um dia que ja existe, atualiza (nao duplica)

**Pagamentos (`Pagamentos.jsx`)**
- Cria pagamentos semanais para cada funcionario
- Status comeca como "pendente"
- Quando clica em "Pagar", muda para "pago"
- Forma de pagamento: PIX, Dinheiro, Transferencia

### Modulo Estoque

**O que gerencia:** Itens, movimentacoes, lista de compras.

**Itens (`Itens.jsx`)**
- Cadastro de itens (arroz, feijao, frango, etc.)
- Cada item tem: nome, unidade (kg, g, l, un, etc.), categoria, estoque minimo, preco medio
- So admin pode criar/editar itens

**Movimentacoes (`Movimentacoes.jsx`)**
- **Entrada:** quando voce compra algo (ex: 10kg de arroz)
- **Saida:** quando voce usa algo (ex: 2kg de arroz para o almoco)
- O estoque atual e calculado: `entradas - saidas`
- **Abaixo do minimo:** quando a quantidade cai abaixo do estoque minimo

**Exemplo pratico:**
```
Arroz: estoque minimo = 5kg
Comprei 20kg (entrada)
Usei 18kg (saida)
Estoque atual = 2kg --> ABAIXO DO MINIMO!
```

**Lista de Compras (`ListaCompras.jsx`)**
- Botao "Gerar Lista Automatica" verifica todos os itens
- Se o estoque esta abaixo do minimo, sugere comprar
- Calcula valor total estimado baseado no preco medio
- Quando clica "Comprado", automaticamente cria uma entrada no estoque

### Modulo Gerencial

**O que gerencia:** Fornecedores, contas a pagar.

**Fornecedores (`Fornecedores.jsx`)**
- Cadastro de quem nos vende (nome, CNPJ, telefone, email, endereco)
- Pode vincular as contas a pagar

**Contas a Pagar (`ContasPagar.jsx`)**
- Cadastro de contas com vencimento e valor
- Status automatico:
  - **pendente:** nao pago ainda
  - **pago:** ja foi pago
  - **atrasado:** passou da data e nao pagou
  - **cancelado:** nao precisa mais pagar
- Cards de resumo: total pago, pendente, atrasado
- Filtrar por mes e ano

---

## 12. Fluxo Completo de uma Requisicao

### Exemplo: Bater ponto

```
1. FUNCIONARIO clica em "Registrar" na tela de Ponto
         |
2. FRONTEND manda POST para /api/ponto/registrar
   com dados: { funcionario_id: 1, data: "2024-01-15", entrada: "08:00" }
         |
3. AXIOS automaticamente adiciona o token no header
   Authorization: Bearer eyJhbGciOiJIUzI1...
         |
4. BACKEND recebe a requisicao
         |
5. MIDDLEWARE authMiddleware verifica o token
   - Token valido? SIM
   - Decodifica: userId=1, role="funcionario"
   - Anota na requisicao e chama next()
         |
6. CONTROLLER pontoController.baterPonto recebe
   - Pega os dados do body
   - Calcula horas trabalhadas
   - Salva no banco de dados
         |
7. BANCO DE DADOS executa o INSERT
   INSERT INTO registros_ponto (funcionario_id, data, entrada)
   VALUES (1, '2024-01-15', '08:00')
         |
8. BANCO responde: "inserido com id 5"
         |
9. CONTROLLER devolve: { id: 5, horas: 0 }
         |
10. FRONTEND recebe a resposta
    - Mostra "Ponto registrado! Total: 0h"
    - Atualiza a lista de pontos
```

### Resumo dos Codigos de HTTP

| Codigo | Significado | Quando aparece |
|--------|------------|----------------|
| 200 | OK | Tudo certo, deu bom |
| 201 | Created | Um registro foi criado com sucesso |
| 400 | Bad Request | Faltou dado obrigatorio ou dado invalido |
| 401 | Unauthorized | Nao logou ou token expirado |
| 403 | Forbidden | Logou, mas nao tem permissao |
| 404 | Not Found | Recurso nao encontrado |
| 500 | Server Error | Erro interno no servidor |

---

## Guia de Variaveis de Ambiente (.env)

| Variavel | O que e | Exemplo |
|----------|---------|---------|
| `PORT` | Porta do servidor backend | 3001 |
| `DB_HOST` | Onde esta o MySQL | 127.0.0.1 |
| `DB_PORT` | Porta do MySQL | 3306 |
| `DB_USER` | Usuario do MySQL | root |
| `DB_PASSWORD` | Senha do MySQL | (vazio no XAMPP) |
| `DB_NAME` | Nome do banco de dados | gestao_sistema |
| `JWT_SECRET` | Chave secreta para assinar tokens | (qualquer texto longo) |
| `JWT_EXPIRES_IN` | Quanto tempo o token dura | 7d (7 dias) |

**Por que o .env nao vai pro GitHub?** Porque ele contem senhas e chaves secretas. Se alguem mal intencionado pegar, pode acessar seu banco de dados.

---

## Glossario para Consulta Rapida

| Termo | Significado Simples |
|-------|-------------------|
| API | O "telefone" entre frontend e backend |
| Endpoint | Uma rota especifica (ex: /api/auth/login) |
| JWT | Cracha digital que prova quem voce e |
| Token | Codigo unico que identifica sua sessao |
| Middleware | Codigo que roda ANTES do controller |
| Controller | O codigo que processa a requisicao |
| Route | Define qual URL leva a qual controller |
| CRUD | Create, Read, Update, Delete (as 4 operacoes basicas) |
| Pool | Conjunto de conexoes prontas com o banco |
| Schema | Estrutura do banco (quais tabelas, quais colunas) |
| Foreign Key | Campo que aponta para outro registro em outra tabela |
| Hash | Senha embaralhada (irreversivel) |
| CORS | Regra que permite ou bloqueia requisicoes entre portas |
| State | Estado do componente (dados que podem mudar) |
| Props | Dados que um componente recebe do pai |
| Context | Estado compartilhado entre varios componentes |
| Axios | Biblioteca que manda requisicoes HTTP |
| Express | Framework para criar servidores web com Node.js |
| Vite | Ferramenta que roda o React em desenvolvimento |
| TailwindCSS | Biblioteca de estilos prontos |
