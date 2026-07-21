import pool from '../config/db.js';

const getWeekRange = (dataRef) => {
  const d = new Date(dataRef);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const segunda = new Date(d);
  segunda.setDate(d.getDate() + diffToMonday);
  segunda.setHours(0, 0, 0, 0);
  const domingo = new Date(segunda);
  domingo.setDate(segunda.getDate() + 6);
  return {
    inicio: segunda.toISOString().split('T')[0],
    fim: domingo.toISOString().split('T')[0]
  };
};

export const listarListaCompras = async (req, res) => {
  const { semana_inicio, semana_fim, status } = req.query;
  try {
    let query = `
      SELECT lc.*, i.nome AS item_nome, i.unidade, i.preco_medio
      FROM lista_compras lc
      JOIN itens_estoque i ON i.id = lc.item_id
      WHERE 1=1
    `;
    const params = [];
    if (semana_inicio && semana_fim) {
      query += ' AND lc.semana_inicio = ? AND lc.semana_fim = ?';
      params.push(semana_inicio, semana_fim);
    }
    if (status) {
      query += ' AND lc.status = ?';
      params.push(status);
    }
    query += ' ORDER BY lc.status, i.nome';
    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar' });
  }
};

export const gerarListaCompras = async (req, res) => {
  const { data_referencia } = req.body;
  const { inicio, fim } = getWeekRange(data_referencia || new Date());

  try {
    const [estoque] = await pool.query(`
      SELECT
        i.id,
        i.nome,
        i.unidade,
        i.estoque_minimo,
        i.preco_medio,
        COALESCE(SUM(CASE WHEN m.tipo='entrada' THEN m.quantidade ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN m.tipo='saida' THEN m.quantidade ELSE 0 END), 0) AS quantidade_atual
      FROM itens_estoque i
      LEFT JOIN movimentacoes_estoque m ON m.item_id = i.id
      WHERE i.ativo = 1
      GROUP BY i.id
    `);

    await pool.query(
      'DELETE FROM lista_compras WHERE semana_inicio = ? AND status = "pendente"',
      [inicio]
    );

    const itensParaComprar = estoque
      .filter(i => Number(i.quantidade_atual) < Number(i.estoque_minimo) || Number(i.estoque_minimo) === 0)
      .map(i => {
        const sugerido = Number(i.estoque_minimo) > 0
          ? Number(i.estoque_minimo) * 2
          : Number(i.quantidade_atual) * 0.5 + 1;
        return [
          i.id,
          +sugerido.toFixed(3),
          inicio,
          fim,
          'pendente',
          req.userId
        ];
      });

    if (itensParaComprar.length > 0) {
      await pool.query(
        `INSERT INTO lista_compras (item_id, quantidade_sugerida, semana_inicio, semana_fim, status, created_by)
         VALUES ?`,
        [itensParaComprar]
      );
    }

    return res.status(201).json({
      message: 'Lista gerada com sucesso',
      semana_inicio: inicio,
      semana_fim: fim,
      total_itens: itensParaComprar.length
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao gerar lista' });
  }
};

export const marcarComoComprado = async (req, res) => {
  const { id } = req.params;
  const { adicionar_estoque = true } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [lista] = await conn.query('SELECT * FROM lista_compras WHERE id = ?', [id]);
    if (lista.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const item = lista[0];

    if (adicionar_estoque) {
      await conn.query(
        `INSERT INTO movimentacoes_estoque (item_id, tipo, quantidade, data_movimento, usuario_id, observacao)
         VALUES (?, 'entrada', ?, CURRENT_DATE, ?, 'Compra da lista semanal')`,
        [item.item_id, item.quantidade_sugerida, req.userId]
      );
    }

    await conn.query('UPDATE lista_compras SET status = "comprado" WHERE id = ?', [id]);

    await conn.commit();
    return res.json({ message: 'Item marcado como comprado' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Erro ao marcar como comprado' });
  } finally {
    conn.release();
  }
};

export const deletarDaLista = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM lista_compras WHERE id = ?', [id]);
    return res.json({ message: 'Removido da lista' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover' });
  }
};

export const relatorioCompras = async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT
        semana_inicio,
        semana_fim,
        COUNT(*) AS total_itens,
        SUM(CASE WHEN status='comprado' THEN 1 ELSE 0 END) AS comprados,
        SUM(CASE WHEN status='pendente' THEN 1 ELSE 0 END) AS pendentes
      FROM lista_compras
      WHERE semana_inicio BETWEEN ? AND ?
      GROUP BY semana_inicio, semana_fim
      ORDER BY semana_inicio DESC
    `, [data_inicio || '2000-01-01', data_fim || '2099-12-31']);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};
