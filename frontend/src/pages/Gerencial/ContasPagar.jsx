import { useEffect, useState } from 'react';
import api from '../../services/api';

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Contas a Pagar</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg">+ Nova Conta</button>
      </div>

      {resumo && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-slate-500">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">R$ {Number(resumo.totais.total_pago || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-slate-500">Pendente</p>
            <p className="text-2xl font-bold text-yellow-600">R$ {Number(resumo.totais.total_pendente || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-slate-500">Atrasado</p>
            <p className="text-2xl font-bold text-red-600">R$ {Number(resumo.totais.total_atrasado || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-slate-500">Qtd. Contas</p>
            <p className="text-2xl font-bold">{resumo.totais.total_contas}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border mb-6">
          <h2 className="text-lg font-semibold mb-4">Nova Conta a Pagar</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded col-span-2" placeholder="Descrição *" required
              value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
            <select className="border p-2 rounded" value={form.fornecedor_id}
              onChange={e => setForm({...form, fornecedor_id: e.target.value})}>
              <option value="">Fornecedor (opcional)</option>
              {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            <input className="border p-2 rounded" placeholder="Categoria (ex: Energia, Aluguel)"
              value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} />
            <input type="number" step="0.01" className="border p-2 rounded" placeholder="Valor *" required
              value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
            <input type="date" className="border p-2 rounded" required
              value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Nota Fiscal"
              value={form.nota_fiscal} onChange={e => setForm({...form, nota_fiscal: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Observações"
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
          <select className="border p-2 rounded" value={filter.mes}
            onChange={e => setFilter({...filter, mes: e.target.value})}>
            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleDateString('pt-BR', {month: 'long'})}</option>)}
          </select>
          <input type="number" className="border p-2 rounded" placeholder="Ano"
            value={filter.ano} onChange={e => setFilter({...filter, ano: e.target.value})} />
          <select className="border p-2 rounded" value={filter.status}
            onChange={e => setFilter({...filter, status: e.target.value})}>
            <option value="">Todos status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Descrição</th>
              <th className="text-left p-3">Fornecedor</th>
              <th className="text-left p-3">Vencimento</th>
              <th className="text-left p-3">Valor</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {contas.map(c => {
              const vencida = c.status === 'pendente' && new Date(c.data_vencimento) < new Date();
              return (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">{c.descricao}</td>
                  <td className="p-3">{c.fornecedor_nome || '-'}</td>
                  <td className="p-3 text-sm">{new Date(c.data_vencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 font-semibold">R$ {Number(c.valor).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      c.status === 'pago' ? 'bg-green-100 text-green-700' :
                      vencida ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {vencida ? 'atrasado' : c.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {c.status === 'pendente' && (
                      <button onClick={() => pagar(c.id)} className="text-green-600 font-medium">Pagar</button>
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
