import pool from '../config/db.js';

// ============= CATEGORIAS =============
export const listarCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias_estoque ORDER BY nome');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar categorias' });
  }
};

export const criarCategoria = async (req, res) => {
  const { nome } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO categorias_estoque (nome) VALUES (?)',
      [nome]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar categoria' });
  }
};

// ============= ITENS =============
export const listarItens = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, c.nome AS categoria_nome
      FROM itens_estoque i
      LEFT JOIN categorias_estoque c ON c.id = i.categoria_id
      WHERE i.ativo = 1
      ORDER BY i.nome
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar itens' });
  }
};

export const criarItem = async (req, res) => {
  const { nome, unidade, categoria_id, estoque_minimo, preco_medio } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO itens_estoque (nome, unidade, categoria_id, estoque_minimo, preco_medio, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, unidade, categoria_id, estoque_minimo || 0, preco_medio || 0, req.userId]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar item' });
  }
};

export const atualizarItem = async (req, res) => {
  const { id } = req.params;
  const { nome, unidade, categoria_id, estoque_minimo, preco_medio } = req.body;
  try {
    await pool.query(
      `UPDATE itens_estoque
       SET nome=?, unidade=?, categoria_id=?, estoque_minimo=?, preco_medio=?
       WHERE id = ?`,
      [nome, unidade, categoria_id, estoque_minimo, preco_medio, id]
    );
    return res.json({ message: 'Item atualizado' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar item' });
  }
};

export const deletarItem = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE itens_estoque SET ativo = 0 WHERE id = ?', [id]);
    return res.json({ message: 'Item desativado' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao deletar item' });
  }
};

// ============= MOVIMENTAÇÕES =============
export const listarMovimentacoes = async (req, res) => {
  const { data_inicio, data_fim, item_id, tipo } = req.query;
  try {
    let query = `
      SELECT m.*, i.nome AS item_nome, i.unidade, u.name AS usuario_nome
      FROM movimentacoes_estoque m
      JOIN itens_estoque i ON i.id = m.item_id
      LEFT JOIN users u ON u.id = m.usuario_id
      WHERE 1=1
    `;
    const params = [];
    if (data_inicio && data_fim) {
      query += ' AND m.data_movimento BETWEEN ? AND ?';
      params.push(data_inicio, data_fim);
    }
    if (item_id) {
      query += ' AND m.item_id = ?';
      params.push(item_id);
    }
    if (tipo) {
      query += ' AND m.tipo = ?';
      params.push(tipo);
    }
    query += ' ORDER BY m.data_movimento DESC, m.id DESC LIMIT 200';
    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar movimentações' });
  }
};

export const registrarMovimentacao = async (req, res) => {
  const { item_id, tipo, quantidade, preco_unitario, data_movimento, observacao } = req.body;
  try {
    const valor_total = preco_unitario ? +(quantidade * preco_unitario).toFixed(2) : null;
    const [result] = await pool.query(
      `INSERT INTO movimentacoes_estoque
       (item_id, tipo, quantidade, preco_unitario, valor_total, data_movimento, usuario_id, observacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [item_id, tipo, quantidade, preco_unitario || null, valor_total,
       data_movimento || new Date(), req.userId, observacao]
    );

    if (tipo === 'entrada' && preco_unitario) {
      const [item] = await pool.query('SELECT preco_medio FROM itens_estoque WHERE id = ?', [item_id]);
      if (item.length > 0) {
        const novoPreco = ((Number(item[0].preco_medio) + Number(preco_unitario)) / 2).toFixed(2);
        await pool.query('UPDATE itens_estoque SET preco_medio = ? WHERE id = ?', [novoPreco, item_id]);
      }
    }

    return res.status(201).json({ id: result.insertId, valor_total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao registrar movimentação' });
  }
};

// ============= ESTOQUE ATUAL (calculado) =============
export const estoqueAtual = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        i.id,
        i.nome,
        i.unidade,
        i.estoque_minimo,
        i.preco_medio,
        c.nome AS categoria_nome,
        COALESCE(SUM(CASE WHEN m.tipo='entrada' THEN m.quantidade ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN m.tipo='saida' THEN m.quantidade ELSE 0 END), 0) AS quantidade_atual
      FROM itens_estoque i
      LEFT JOIN movimentacoes_estoque m ON m.item_id = i.id
      LEFT JOIN categorias_estoque c ON c.id = i.categoria_id
      WHERE i.ativo = 1
      GROUP BY i.id
      ORDER BY i.nome
    `);

    const resultado = rows.map(r => ({
      ...r,
      abaixo_minimo: Number(r.quantidade_atual) < Number(r.estoque_minimo)
    }));

    return res.json(resultado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao calcular estoque' });
  }
};

// ============= RELATÓRIO DE GASTOS =============
export const relatorioGastos = async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT
        i.id,
        i.nome,
        i.unidade,
        i.preco_medio,
        c.nome AS categoria_nome,
        SUM(CASE WHEN m.tipo='entrada' THEN m.quantidade ELSE 0 END) AS total_entradas,
        SUM(CASE WHEN m.tipo='saida' THEN m.quantidade ELSE 0 END) AS total_saidas,
        SUM(CASE WHEN m.tipo='entrada' THEN m.valor_total ELSE 0 END) AS valor_total_entradas,
        SUM(CASE WHEN m.tipo='saida' THEN m.valor_total ELSE 0 END) AS valor_total_saidas
      FROM itens_estoque i
      LEFT JOIN movimentacoes_estoque m ON m.item_id = i.id
        AND m.data_movimento BETWEEN ? AND ?
      LEFT JOIN categorias_estoque c ON c.id = i.categoria_id
      WHERE i.ativo = 1
      GROUP BY i.id
      ORDER BY valor_total_entradas DESC
    `, [data_inicio || '2000-01-01', data_fim || '2099-12-31']);

    const totalGeral = rows.reduce((acc, r) => acc + Number(r.valor_total_entradas || 0), 0);
    return res.json({ itens: rows, total_geral: +totalGeral.toFixed(2) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};
