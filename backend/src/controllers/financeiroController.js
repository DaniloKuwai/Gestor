import pool from '../config/db.js';

// ============= FUNCIONÁRIOS =============
export const listarFuncionarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM funcionarios WHERE ativo = 1 ORDER BY nome'
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar funcionários' });
  }
};

export const criarFuncionario = async (req, res) => {
  const { nome, cpf, cargo, pix, telefone, data_admissao, valor_semanal, user_id } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO funcionarios (user_id, nome, cpf, cargo, pix, telefone, data_admissao, valor_semanal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, nome, cpf, cargo, pix, telefone, data_admissao, valor_semanal || 0]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar funcionário' });
  }
};

export const atualizarFuncionario = async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, cargo, pix, telefone, data_admissao, valor_semanal } = req.body;
  try {
    await pool.query(
      `UPDATE funcionarios SET nome=?, cpf=?, cargo=?, pix=?, telefone=?, data_admissao=?, valor_semanal=?
       WHERE id = ?`,
      [nome, cpf, cargo, pix, telefone, data_admissao, valor_semanal, id]
    );
    return res.json({ message: 'Funcionário atualizado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
};

export const deletarFuncionario = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE funcionarios SET ativo = 0 WHERE id = ?', [id]);
    return res.json({ message: 'Funcionário desativado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao deletar funcionário' });
  }
};

// ============= PAGAMENTOS =============
export const listarPagamentos = async (req, res) => {
  const { semana_inicio, semana_fim, status, funcionario_id } = req.query;
  try {
    let query = `
      SELECT p.*, f.nome AS funcionario_nome
      FROM pagamentos p
      JOIN funcionarios f ON f.id = p.funcionario_id
      WHERE 1=1
    `;
    const params = [];

    if (semana_inicio && semana_fim) {
      query += ' AND p.semana_inicio >= ? AND p.semana_fim <= ?';
      params.push(semana_inicio, semana_fim);
    }
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    if (funcionario_id) {
      query += ' AND p.funcionario_id = ?';
      params.push(funcionario_id);
    }

    query += ' ORDER BY p.semana_inicio DESC, f.nome';

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
};

export const criarPagamento = async (req, res) => {
  const { funcionario_id, semana_inicio, semana_fim, valor, observacoes } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO pagamentos (funcionario_id, semana_inicio, semana_fim, valor, observacoes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [funcionario_id, semana_inicio, semana_fim, valor, observacoes, req.userId]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
};

export const pagarPagamento = async (req, res) => {
  const { id } = req.params;
  const { forma_pagamento, data_pagamento } = req.body;
  try {
    await pool.query(
      `UPDATE pagamentos
       SET status = 'pago', forma_pagamento = ?, data_pagamento = ?
       WHERE id = ?`,
      [forma_pagamento, data_pagamento || new Date(), id]
    );
    return res.json({ message: 'Pagamento efetuado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao pagar' });
  }
};

export const resumoSemanal = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        semana_inicio,
        semana_fim,
        COUNT(*) AS total_pagamentos,
        SUM(CASE WHEN status='pago' THEN valor ELSE 0 END) AS total_pago,
        SUM(CASE WHEN status='pendente' THEN valor ELSE 0 END) AS total_pendente
      FROM pagamentos
      GROUP BY semana_inicio, semana_fim
      ORDER BY semana_inicio DESC
      LIMIT 12
    `);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
};
