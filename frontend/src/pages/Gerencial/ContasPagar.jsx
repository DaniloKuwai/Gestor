import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../styles/shared.css';
import '../Gerencial/Gerencial.css';

export default function ContasPagar() {
  const [contas, setContas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    status: ''
  });
  const [form, setForm] = useState({
    fornecedor_id: '', descricao: '', categoria: '', valor: '',
    data_vencimento: '', nota_fiscal: '', observacoes: ''
  });

  const load = async () => {
    const [c, f, r] = await Promise.all([
      api.get('/gerencial/contas', { params: filter }),
      api.get('/gerencial/fornecedores'),
      api.get('/gerencial/resumo-mensal', { params: { mes: filter.mes, ano: filter.ano } })
    ]);
    setContas(c.data);
    setFornecedores(f.data);
    setResumo(r.data);
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gerencial/contas', { ...form, valor: Number(form.valor) });
      setShowForm(false);
      setForm({ fornecedor_id: '', descricao: '', categoria: '', valor: '', data_vencimento: '', nota_fiscal: '', observacoes: '' });
      load();
    } catch (err) {
      alert('Erro ao criar conta');
    }
  };

  const pagar = async (id) => {
    const forma = prompt('Forma de pagamento:');
    if (!forma) return;
    await api.put(`/gerencial/contas/${id}/pagar`, { forma_pagamento: forma });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Contas a Pagar</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Nova Conta</button>
      </div>

      {resumo && (
        <div className="summary-cards">
          <div className="summary-card">
            <p className="summary-card-label">Total Pago</p>
            <p className="summary-card-value green">R$ {Number(resumo.totais.total_pago || 0).toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <p className="summary-card-label">Pendente</p>
            <p className="summary-card-value yellow">R$ {Number(resumo.totais.total_pendente || 0).toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <p className="summary-card-label">Atrasado</p>
            <p className="summary-card-value red">R$ {Number(resumo.totais.total_atrasado || 0).toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <p className="summary-card-label">Qtd. Contas</p>
            <p className="summary-card-value">{resumo.totais.total_contas}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h2>Nova Conta a Pagar</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <input className="input input-full" placeholder="Descrição *" required value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
            <select className="input" value={form.fornecedor_id} onChange={e => setForm({...form, fornecedor_id: e.target.value})}>
              <option value="">Fornecedor (opcional)</option>
              {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            <input className="input" placeholder="Categoria (ex: Energia, Aluguel)" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} />
            <input type="number" step="0.01" className="input" placeholder="Valor *" required value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
            <input type="date" className="input" required value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
            <input className="input" placeholder="Nota Fiscal" value={form.nota_fiscal} onChange={e => setForm({...form, nota_fiscal: e.target.value})} />
            <input className="input" placeholder="Observações" value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
            <div className="form-actions">
              <button type="submit" className="btn-primary">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <div className="form-grid form-grid-3">
          <select className="input" value={filter.mes} onChange={e => setFilter({...filter, mes: e.target.value})}>
            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleDateString('pt-BR', {month: 'long'})}</option>)}
          </select>
          <input type="number" className="input" placeholder="Ano" value={filter.ano} onChange={e => setFilter({...filter, ano: e.target.value})} />
          <select className="input" value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
            <option value="">Todos status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Fornecedor</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th className="table-actions">Ação</th>
            </tr>
          </thead>
          <tbody>
            {contas.map(c => {
              const vencida = c.status === 'pendente' && new Date(c.data_vencimento) < new Date();
              return (
                <tr key={c.id} className="table-row">
                  <td className="font-medium">{c.descricao}</td>
                  <td>{c.fornecedor_nome || '-'}</td>
                  <td className="text-sm">{new Date(c.data_vencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="font-bold">R$ {Number(c.valor).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${c.status === 'pago' ? 'status-pago' : vencida ? 'status-atrasado' : 'status-pendente'}`}>
                      {vencida ? 'atrasado' : c.status}
                    </span>
                  </td>
                  <td className="table-actions">
                    {c.status === 'pendente' && (
                      <span className="link-pay" onClick={() => pagar(c.id)}>Pagar</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
