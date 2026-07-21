import pool from '../config/db.js';

const calcularDiferencaHoras = (entrada, saida) => {
  if (!entrada || !saida) return 0;
  const [h1, m1] = entrada.split(':').map(Number);
  const [h2, m2] = saida.split(':').map(Number);
  const minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
  return +(minutos / 60).toFixed(2);
};

export const baterPonto = async (req, res) => {
  const { funcionario_id, data, entrada, saida_almoco, retorno_almoco, saida, observacoes } = req.body;

  try {
    let horas = 0;
    if (entrada && saida) {
      const manha = calcularDiferencaHoras(entrada, saida_almoco || saida);
      const tarde = calcularDiferencaHoras(retorno_almoco || entrada, saida);
      horas = +(manha + tarde).toFixed(2);
    }

    const [existe] = await pool.query(
      'SELECT id FROM registros_ponto WHERE funcionario_id = ? AND data = ?',
      [funcionario_id, data]
    );

    if (existe.length > 0) {
      await pool.query(
        `UPDATE registros_ponto
         SET entrada=?, saida_almoco=?, retorno_almoco=?, saida=?, horas_trabalhadas=?, observacoes=?
         WHERE id = ?`,
        [entrada, saida_almoco, retorno_almoco, saida, horas, observacoes, existe[0].id]
      );
      return res.json({ message: 'Ponto atualizado', horas });
    } else {
      const [result] = await pool.query(
        `INSERT INTO registros_ponto
         (funcionario_id, data, entrada, saida_almoco, retorno_almoco, saida, horas_trabalhadas, observacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [funcionario_id, data, entrada, saida_almoco, retorno_almoco, saida, horas, observacoes]
      );
      return res.status(201).json({ id: result.insertId, horas });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao registrar ponto' });
  }
};

export const listarPontos = async (req, res) => {
  const { data_inicio, data_fim, funcionario_id } = req.query;
  try {
    let query = `
      SELECT p.*, f.nome AS funcionario_nome
      FROM registros_ponto p
      JOIN funcionarios f ON f.id = p.funcionario_id
      WHERE 1=1
    `;
    const params = [];
    if (data_inicio && data_fim) {
      query += ' AND p.data BETWEEN ? AND ?';
      params.push(data_inicio, data_fim);
    }
    if (funcionario_id) {
      query += ' AND p.funcionario_id = ?';
      params.push(funcionario_id);
    }
    query += ' ORDER BY p.data DESC, f.nome';
    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar pontos' });
  }
};

export const listarPontosHoje = async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT p.*, f.nome AS funcionario_nome
       FROM registros_ponto p
       JOIN funcionarios f ON f.id = p.funcionario_id
       WHERE p.data = ?`,
      [hoje]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar pontos de hoje' });
  }
};

export const resumoPontoFuncionario = async (req, res) => {
  const { id } = req.params;
  const { semana_inicio, semana_fim } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM registros_ponto
       WHERE funcionario_id = ? AND data BETWEEN ? AND ?
       ORDER BY data`,
      [id, semana_inicio, semana_fim]
    );
    const totalHoras = rows.reduce((acc, r) => acc + Number(r.horas_trabalhadas || 0), 0);
    return res.json({ pontos: rows, totalHoras: +totalHoras.toFixed(2) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
};
