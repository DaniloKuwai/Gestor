import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ListaCompras() {
  const [lista, setLista] = useState([]);
  const [filter, setFilter] = useState({ semana_inicio: '', semana_fim: '' });

  const getCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const seg = new Date(d);
    seg.setDate(d.getDate() + diff);
    const dom = new Date(seg);
    dom.setDate(seg.getDate() + 6);
    return {
      inicio: seg.toISOString().split('T')[0],
      fim: dom.toISOString().split('T')[0]
    };
  };

  const load = async () => {
    const params = filter.semana_inicio ? filter : getCurrentWeek();
    const res = await api.get('/compras', { params });
    setLista(res.data);
  };

  useEffect(() => { load(); }, [filter]);

  const gerar = async () => {
    if (confirm('Gerar nova lista de compras baseada no estoque mínimo?')) {
      await api.post('/compras/gerar', {});
      load();
    }
  };

  const comprar = async (id) => {
    if (confirm('Confirmar compra e adicionar ao estoque?')) {
      await api.put(`/compras/${id}/comprar`, { adicionar_estoque: true });
      load();
    }
  };

  const total = lista.filter(i => i.status === 'pendente').reduce((acc, i) =>
    acc + (Number(i.quantidade_sugerida) * Number(i.preco_medio || 0)), 0
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Lista de Compras</h1>
        <button onClick={gerar} className="bg-primary-600 text-white px-4 py-2 rounded-lg">
          Gerar Lista Automática
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border mb-6 flex items-center gap-4">
        <input type="date" className="border p-2 rounded"
          value={filter.semana_inicio || getCurrentWeek().inicio}
          onChange={e => setFilter({...filter, semana_inicio: e.target.value})} />
        <span>até</span>
        <input type="date" className="border p-2 rounded"
          value={filter.semana_fim || getCurrentWeek().fim}
          onChange={e => setFilter({...filter, semana_fim: e.target.value})} />
        <div className="ml-auto bg-yellow-50 border border-yellow-200 px-4 py-2 rounded">
          <span className="text-sm text-yellow-800">Total estimado: </span>
          <strong className="text-yellow-900">R$ {total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Item</th>
              <th className="text-left p-3">Qtd Sugerida</th>
              <th className="text-left p-3">Preço Médio</th>
              <th className="text-left p-3">Total Estimado</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(i => (
              <tr key={i.id} className="border-t">
                <td className="p-3 font-medium">{i.item_nome}</td>
                <td className="p-3">{Number(i.quantidade_sugerida).toFixed(2)} {i.unidade}</td>
                <td className="p-3">R$ {Number(i.preco_medio || 0).toFixed(2)}</td>
                <td className="p-3 font-semibold">
                  R$ {(Number(i.quantidade_sugerida) * Number(i.preco_medio || 0)).toFixed(2)}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    i.status === 'comprado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {i.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {i.status === 'pendente' && (
                    <button onClick={() => comprar(i.id)} className="text-green-600 font-medium">
                      Comprado
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">
                Nenhum item na lista. Clique em "Gerar Lista Automática".
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
