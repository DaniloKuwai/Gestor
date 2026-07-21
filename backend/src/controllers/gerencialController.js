import pool from '../config/db.js';

// ============= FORNECEDORES =============
export const listarFornecedores = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fornecedores WHERE ativo = 1 ORDER BY nome');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar fornecedores' });
  }
};

export const criarFornecedor = async (req, res) => {
  const { nome, cnpj, telefone, email, endereco, observacoes } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO fornecedores (nome, cnpj, telefone, email, endereco, observacoes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, cnpj, telefone, email, endereco, observacoes]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar fornecedor' });
  }
};

export const atualizarFornecedor = async (req, res) => {
  const { id } = req.params;
  const { nome, cnpj, telefone, email, endereco, observacoes } = req.body;
  try {
    await pool.query(
      `UPDATE fornecedores
       SET nome=?, cnpj=?, telefone=?, email=?, endereco=?, observacoes=?
       WHERE id = ?`,
      [nome, cnpj, telefone, email, endereco, observacoes, id]
    );
    return res.json({ message: 'Fornecedor atualizado' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar' });
  }
};

export const deletarFornecedor = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE fornecedores SET ativo = 0 WHERE id = ?', [id]);
    return res.json({ message: 'Fornecedor desativado' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao deletar' });
  }
};

// ============= CONTAS A PAGAR =============
export const listarContas = async (req, res) => {
  const { mes, ano, status, fornecedor_id } = req.query;
  try {
    let query = `
      SELECT c.*, f.nome AS fornecedor_nome
      FROM contas_pagar c
      LEFT JOIN fornecedores f ON f.id = c.fornecedor_id
      WHERE 1=1
    `;
    const params = [];

    if (mes && ano) {
      const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const fim = new Date(ano, mes, 0).toISOString().split('T')[0];
      query += ' AND c.data_vencimento BETWEEN ? AND ?';
      params.push(inicio, fim);
    }
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    if (fornecedor_id) {
      query += ' AND c.fornecedor_id = ?';
      params.push(fornecedor_id);
    }
    query += ' ORDER BY c.data_vencimento ASC';

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar contas' });
  }
};

export const criarConta = async (req, res) => {
  const { fornecedor_id, descricao, categoria, valor, data_vencimento, nota_fiscal, observacoes } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO contas_pagar
       (fornecedor_id, descricao, categoria, valor, data_vencimento, nota_fiscal, observacoes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fornecedor_id, descricao, categoria, valor, data_vencimento, nota_fiscal, observacoes, req.userId]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar conta' });
  }
};

export const pagarConta = async (req, res) => {
  const { id } = req.params;
  const { forma_pagamento, data_pagamento } = req.body;
  try {
    await pool.query(
      `UPDATE contas_pagar
       SET status='pago', forma_pagamento=?, data_pagamento=?, paid_by=?
       WHERE id = ?`,
      [forma_pagamento, data_pagamento || new Date(), req.userId, id]
    );
    return res.json({ message: 'Conta paga' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao pagar conta' });
  }
};

export const cancelarConta = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE contas_pagar SET status = "cancelado" WHERE id = ?', [id]);
    return res.json({ message: 'Conta cancelada' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao cancelar' });
  }
};

export const resumoMensal = async (req, res) => {
  const { mes, ano } = req.query;
  const m = mes || new Date().getMonth() + 1;
  const a = ano || new Date().getFullYear();
  const inicio = `${a}-${String(m).padStart(2, '0')}-01`;
  const fim = new Date(a, m, 0).toISOString().split('T')[0];

  try {
    const [totais] = await pool.query(`
      SELECT
        SUM(CASE WHEN status='pago' THEN valor ELSE 0 END) AS total_pago,
        SUM(CASE WHEN status='pendente' THEN valor ELSE 0 END) AS total_pendente,
        SUM(CASE WHEN status='atrasado' THEN valor ELSE 0 END) AS total_atrasado,
        COUNT(*) AS total_contas
      FROM contas_pagar
      WHERE data_vencimento BETWEEN ? AND ?
    `, [inicio, fim]);

    const [porCategoria] = await pool.query(`
      SELECT
        COALESCE(categoria, 'Sem categoria') AS categoria,
        SUM(valor) AS total,
        COUNT(*) AS quantidade
      FROM contas_pagar
      WHERE data_vencimento BETWEEN ? AND ?
      GROUP BY categoria
      ORDER BY total DESC
    `, [inicio, fim]);

    const [porFornecedor] = await pool.query(`
      SELECT
        f.nome AS fornecedor,
        SUM(c.valor) AS total,
        COUNT(*) AS quantidade
      FROM contas_pagar c
      LEFT JOIN fornecedores f ON f.id = c.fornecedor_id
      WHERE c.data_vencimento BETWEEN ? AND ?
      GROUP BY f.id
      ORDER BY total DESC
      LIMIT 10
    `, [inicio, fim]);

    return res.json({
      mes: m, ano: a,
      totais: totais[0],
      por_categoria: porCategoria,
      por_fornecedor: porFornecedor
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
};

export const contasVencendo = async (req, res) => {
  try {
    const hoje = new Date();
    const em7Dias = new Date();
    em7Dias.setDate(hoje.getDate() + 7);

    const [rows] = await pool.query(`
      SELECT c.*, f.nome AS fornecedor_nome
      FROM contas_pagar c
      LEFT JOIN fornecedores f ON f.id = c.fornecedor_id
      WHERE c.status = 'pendente'
        AND c.data_vencimento BETWEEN ? AND ?
      ORDER BY c.data_vencimento ASC
    `, [hoje.toISOString().split('T')[0], em7Dias.toISOString().split('T')[0]]);

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar contas' });
  }
};
