import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Movimentacoes() {
  const [itens, setItens] = useState([]);
  const [movs, setMovs] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [form, setForm] = useState({
    item_id: '', tipo: 'entrada', quantidade: '', preco_unitario: '',
    data_movimento: new Date().toISOString().split('T')[0], observacao: ''
  });
  const [tab, setTab] = useState('movimentar');
  const [filter, setFilter] = useState({ data_inicio: '', data_fim: '' });

  const load = async () => {
    const [i, m, e] = await Promise.all([
      api.get('/estoque/itens'),
      api.get('/estoque/movimentacoes', { params: filter }),
      api.get('/estoque/atual')
    ]);
    setItens(i.data);
    setMovs(m.data);
    setEstoque(e.data);
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/estoque/movimentacoes', {
        ...form,
        quantidade: Number(form.quantidade),
        preco_unitario: form.preco_unitario ? Number(form.preco_unitario) : null
      });
      setForm({ ...form, quantidade: '', preco_unitario: '', observacao: '' });
      load();
    } catch (err) {
      alert('Erro ao registrar');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Estoque</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('movimentar')}
          className={`px-4 py-2 rounded ${tab === 'movimentar' ? 'bg-primary-600 text-white' : 'bg-slate-200'}`}>
          Movimentar
        </button>
        <button onClick={() => setTab('atual')}
          className={`px-4 py-2 rounded ${tab === 'atual' ? 'bg-primary-600 text-white' : 'bg-slate-200'}`}>
          Estoque Atual
        </button>
        <button onClick={() => setTab('historico')}
          className={`px-4 py-2 rounded ${tab === 'historico' ? 'bg-primary-600 text-white' : 'bg-slate-200'}`}>
          Histórico
        </button>
      </div>

      {tab === 'movimentar' && (
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Nova Movimentação</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <select className="border p-2 rounded col-span-2" value={form.item_id}
              onChange={e => setForm({...form, item_id: e.target.value})} required>
              <option value="">Selecione o item *</option>
              {itens.map(i => <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>)}
            </select>
            <select className="border p-2 rounded" value={form.tipo}
              onChange={e => setForm({...form, tipo: e.target.value})}>
              <option value="entrada">Entrada (Compra)</option>
              <option value="saida">Saída (Consumo)</option>
            </select>
            <input type="number" step="0.001" className="border p-2 rounded" placeholder="Quantidade *" required
              value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
            {form.tipo === 'entrada' && (
              <input type="number" step="0.01" className="border p-2 rounded" placeholder="Preço unitário (R$)"
                value={form.preco_unitario} onChange={e => setForm({...form, preco_unitario: e.target.value})} />
            )}
            <input type="date" className="border p-2 rounded"
              value={form.data_movimento} onChange={e => setForm({...form, data_movimento: e.target.value})} />
            <input className="border p-2 rounded col-span-2" placeholder="Observação"
              value={form.observacao} onChange={e => setForm({...form, observacao: e.target.value})} />
            <button type="submit" className="col-span-2 bg-primary-600 text-white py-2 rounded">Registrar Movimentação</button>
          </form>
        </div>
      )}

      {tab === 'atual' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Categoria</th>
                <th className="text-left p-3">Quantidade Atual</th>
                <th className="text-left p-3">Mínimo</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {estoque.map(i => (
                <tr key={i.id} className="border-t">
                  <td className="p-3 font-medium">{i.nome}</td>
                  <td className="p-3">{i.categoria_nome || '-'}</td>
                  <td className="p-3 font-bold">{Number(i.quantidade_atual).toFixed(2)} {i.unidade}</td>
                  <td className="p-3">{i.estoque_minimo} {i.unidade}</td>
                  <td className="p-3">
                    {i.abaixo_minimo
                      ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Abaixo</span>
                      : <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'historico' && (
        <>
          <div className="bg-white p-4 rounded-xl border mb-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="border p-2 rounded" placeholder="Data início"
                value={filter.data_inicio} onChange={e => setFilter({...filter, data_inicio: e.target.value})} />
              <input type="date" className="border p-2 rounded" placeholder="Data fim"
                value={filter.data_fim} onChange={e => setFilter({...filter, data_fim: e.target.value})} />
            </div>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Item</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Qtd</th>
                  <th className="text-left p-3">Valor Total</th>
                  <th className="text-left p-3">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movs.map(m => (
                  <tr key={m.id} className="border-t">
                    <td className="p-3 text-sm">{new Date(m.data_movimento).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3">{m.item_nome}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        m.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className="p-3">{Number(m.quantidade).toFixed(2)} {m.unidade}</td>
                    <td className="p-3">{m.valor_total ? `R$ ${Number(m.valor_total).toFixed(2)}` : '-'}</td>
                    <td className="p-3 text-sm text-slate-600">{m.usuario_nome || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
