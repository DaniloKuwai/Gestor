import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../styles/shared.css';

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ semana_inicio: '', semana_fim: '', status: '' });
  const [form, setForm] = useState({
    funcionario_id: '', semana_inicio: '', semana_fim: '', valor: '', observacoes: ''
  });

  const load = async () => {
    const [p, f] = await Promise.all([
      api.get('/financeiro/pagamentos', { params: filter }),
      api.get('/financeiro/funcionarios')
    ]);
    setPagamentos(p.data);
    setFuncionarios(f.data);
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/financeiro/pagamentos', { ...form, valor: Number(form.valor) });
      setShowForm(false);
      setForm({ funcionario_id: '', semana_inicio: '', semana_fim: '', valor: '', observacoes: '' });
      load();
    } catch (err) {
      alert('Erro ao criar pagamento');
    }
  };

  const pagar = async (id) => {
    const forma = prompt('Forma de pagamento (PIX, Dinheiro, Transferência):');
    if (!forma) return;
    await api.put(`/financeiro/pagamentos/${id}/pagar`, { forma_pagamento: forma });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pagamentos Semanais</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Novo Pagamento</button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Novo Pagamento Semanal</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <select className="input" value={form.funcionario_id} onChange={e => setForm({...form, funcionario_id: e.target.value})} required>
              <option value="">Funcionário *</option>
              {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome} (R$ {Number(f.valor_semanal).toFixed(2)})</option>)}
            </select>
            <input type="number" step="0.01" className="input" placeholder="Valor *" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required />
            <div>
              <label className="text-sm">Início da Semana</label>
              <input type="date" className="input" value={form.semana_inicio} onChange={e => setForm({...form, semana_inicio: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm">Fim da Semana</label>
              <input type="date" className="input" value={form.semana_fim} onChange={e => setForm({...form, semana_fim: e.target.value})} required />
            </div>
            <input className="input input-full" placeholder="Observações" value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
            <div className="form-actions">
              <button type="submit" className="btn-primary">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <div className="form-grid form-grid-3">
          <input type="date" className="input" value={filter.semana_inicio} onChange={e => setFilter({...filter, semana_inicio: e.target.value})} />
          <input type="date" className="input" value={filter.semana_fim} onChange={e => setFilter({...filter, semana_fim: e.target.value})} />
          <select className="input" value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
            <option value="">Todos status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Semana</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Pago em</th>
              <th className="table-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map(p => (
              <tr key={p.id} className="table-row">
                <td className="font-medium">{p.funcionario_nome}</td>
                <td className="text-sm">
                  {new Date(p.semana_inicio).toLocaleDateString('pt-BR')} até {new Date(p.semana_fim).toLocaleDateString('pt-BR')}
                </td>
                <td className="font-bold">R$ {Number(p.valor).toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${p.status === 'pago' ? 'status-pago' : p.status === 'pendente' ? 'status-pendente' : 'status-cancelado'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="text-sm">
                  {p.data_pagamento ? new Date(p.data_pagamento).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="table-actions">
                  {p.status === 'pendente' && (
                    <span className="link-pay" onClick={() => pagar(p.id)}>Pagar</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
