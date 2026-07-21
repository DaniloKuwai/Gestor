-- ============================================
-- BANCO DE DADOS: SISTEMA DE GESTÃO
-- ============================================

CREATE DATABASE IF NOT EXISTS gestao_sistema
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gestao_sistema;

-- ============================================
-- USUÁRIOS E AUTENTICAÇÃO
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'gerente', 'funcionario') NOT NULL DEFAULT 'funcionario',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- FUNCIONÁRIOS
-- ============================================
CREATE TABLE funcionarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  cargo VARCHAR(80),
  pix VARCHAR(120),
  telefone VARCHAR(20),
  data_admissao DATE,
  valor_semanal DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- PONTO (Registro diário)
-- ============================================
CREATE TABLE registros_ponto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funcionario_id INT NOT NULL,
  data DATE NOT NULL,
  entrada TIME,
  saida_almoco TIME,
  retorno_almoco TIME,
  saida TIME,
  horas_trabalhadas DECIMAL(5,2),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_funcionario_data (funcionario_id, data)
);

-- ============================================
-- PAGAMENTOS SEMANAIS
-- ============================================
CREATE TABLE pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funcionario_id INT NOT NULL,
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_pagamento DATE,
  status ENUM('pendente', 'pago', 'cancelado') DEFAULT 'pendente',
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- CATEGORIAS DO ESTOQUE
-- ============================================
CREATE TABLE categorias_estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ITENS DO ESTOQUE
-- ============================================
CREATE TABLE itens_estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  unidade ENUM('kg', 'g', 'l', 'ml', 'un', 'cx', 'pct') NOT NULL,
  categoria_id INT,
  estoque_minimo DECIMAL(10,3) DEFAULT 0,
  preco_medio DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias_estoque(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- MOVIMENTAÇÕES DE ESTOQUE
-- ============================================
CREATE TABLE movimentacoes_estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  tipo ENUM('entrada', 'saida') NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL,
  preco_unitario DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  data_movimento DATE NOT NULL,
  usuario_id INT,
  observacao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES itens_estoque(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- LISTA DE COMPRAS (semanal/diária)
-- ============================================
CREATE TABLE lista_compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  quantidade_sugerida DECIMAL(10,3) NOT NULL,
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  status ENUM('pendente', 'comprado', 'cancelado') DEFAULT 'pendente',
  observacao TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES itens_estoque(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- FORNECEDORES
-- ============================================
CREATE TABLE fornecedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  cnpj VARCHAR(18),
  telefone VARCHAR(20),
  email VARCHAR(150),
  endereco TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CONTAS A PAGAR
-- ============================================
CREATE TABLE contas_pagar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fornecedor_id INT,
  descricao VARCHAR(200) NOT NULL,
  categoria VARCHAR(80),
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status ENUM('pendente', 'pago', 'atrasado', 'cancelado') DEFAULT 'pendente',
  forma_pagamento VARCHAR(50),
  nota_fiscal VARCHAR(50),
  observacoes TEXT,
  created_by INT,
  paid_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- CATEGORIAS INICIAIS
-- ============================================
INSERT INTO categorias_estoque (nome) VALUES
  ('Grãos'),
  ('Carnes'),
  ('Hortifruti'),
  ('Laticínios'),
  ('Bebidas'),
  ('Limpeza'),
  ('Descartáveis'),
  ('Temperos');
