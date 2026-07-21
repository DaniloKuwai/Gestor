import { useEffect, useState } from 'react';
import api from '../../services/api';

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Pagamentos Semanais</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          + Novo Pagamento
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border mb-6">
          <h2 className="text-lg font-semibold mb-4">Novo Pagamento Semanal</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <select className="border p-2 rounded" value={form.funcionario_id}
              onChange={e => setForm({...form, funcionario_id: e.target.value})} required>
              <option value="">Funcionário *</option>
              {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome} (R$ {Number(f.valor_semanal).toFixed(2)})</option>)}
            </select>
            <input type="number" step="0.01" className="border p-2 rounded" placeholder="Valor *"
              value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required />
            <div>
              <label className="text-sm">Início da Semana</label>
              <input type="date" className="border p-2 rounded w-full"
                value={form.semana_inicio} onChange={e => setForm({...form, semana_inicio: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm">Fim da Semana</label>
              <input type="date" className="border p-2 rounded w-full"
                value={form.semana_fim} onChange={e => setForm({...form, semana_fim: e.target.value})} required />
            </div>
            <input className="border p-2 rounded col-span-2" placeholder="Observações"
              value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 px-4 py-2 rounded">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border mb-6">
        <div className="grid grid-cols-3 gap-4">
          <input type="date" className="border p-2 rounded"
            value={filter.semana_inicio} onChange={e => setFilter({...filter, semana_inicio: e.target.value})} />
          <input type="date" className="border p-2 rounded"
            value={filter.semana_fim} onChange={e => setFilter({...filter, semana_fim: e.target.value})} />
          <select className="border p-2 rounded" value={filter.status}
            onChange={e => setFilter({...filter, status: e.target.value})}>
            <option value="">Todos status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Funcionário</th>
              <th className="text-left p-3">Semana</th>
              <th className="text-left p-3">Valor</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Pago em</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.funcionario_nome}</td>
                <td className="p-3 text-sm">
                  {new Date(p.semana_inicio).toLocaleDateString('pt-BR')} até {new Date(p.semana_fim).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-3 font-semibold">R$ {Number(p.valor).toFixed(2)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    p.status === 'pago' ? 'bg-green-100 text-green-700' :
                    p.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  {p.data_pagamento ? new Date(p.data_pagamento).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="p-3 text-center">
                  {p.status === 'pendente' && (
                    <button onClick={() => pagar(p.id)} className="text-green-600 font-medium">Pagar</button>
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
