import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../styles/shared.css';
import './Estoque.css';

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
    return { inicio: seg.toISOString().split('T')[0], fim: dom.toISOString().split('T')[0] };
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
      <div className="page-header">
        <h1 className="page-title">Lista de Compras</h1>
        <button onClick={gerar} className="btn-primary">Gerar Lista Automática</button>
      </div>

      <div className="filter-bar flex items-center gap-4">
        <input type="date" className="input" value={filter.semana_inicio || getCurrentWeek().inicio} onChange={e => setFilter({...filter, semana_inicio: e.target.value})} />
        <span>até</span>
        <input type="date" className="input" value={filter.semana_fim || getCurrentWeek().fim} onChange={e => setFilter({...filter, semana_fim: e.target.value})} />
        <div className="estimate-bar ml-auto">
          <span className="estimate-label">Total estimado: </span>
          <strong className="estimate-value">R$ {total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qtd Sugerida</th>
              <th>Preço Médio</th>
              <th>Total Estimado</th>
              <th>Status</th>
              <th className="table-actions">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(i => (
              <tr key={i.id} className="table-row">
                <td className="font-medium">{i.item_nome}</td>
                <td>{Number(i.quantidade_sugerida).toFixed(2)} {i.unidade}</td>
                <td>R$ {Number(i.preco_medio || 0).toFixed(2)}</td>
                <td className="font-bold">R$ {(Number(i.quantidade_sugerida) * Number(i.preco_medio || 0)).toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${i.status === 'comprado' ? 'status-pago' : 'status-pendente'}`}>
                    {i.status}
                  </span>
                </td>
                <td className="table-actions">
                  {i.status === 'pendente' && (
                    <span className="link-pay" onClick={() => comprar(i.id)}>Comprado</span>
                  )}
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan="6" className="table-empty">Nenhum item na lista. Clique em "Gerar Lista Automática".</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
