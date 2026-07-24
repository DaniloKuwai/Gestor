import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../styles/shared.css';
import './Estoque.css';

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
      <h1 className="page-title mb-6">Estoque</h1>

      <div className="estoque-tabs">
        <button onClick={() => setTab('movimentar')} className={`estoque-tab ${tab === 'movimentar' ? 'active' : ''}`}>Movimentar</button>
        <button onClick={() => setTab('atual')} className={`estoque-tab ${tab === 'atual' ? 'active' : ''}`}>Estoque Atual</button>
        <button onClick={() => setTab('historico')} className={`estoque-tab ${tab === 'historico' ? 'active' : ''}`}>Histórico</button>
      </div>

      {tab === 'movimentar' && (
        <div className="form-card">
          <h2>Nova Movimentação</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <select className="input input-full" value={form.item_id} onChange={e => setForm({...form, item_id: e.target.value})} required>
              <option value="">Selecione o item *</option>
              {itens.map(i => <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>)}
            </select>
            <select className="input" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
              <option value="entrada">Entrada (Compra)</option>
              <option value="saida">Saída (Consumo)</option>
            </select>
            <input type="number" step="0.001" className="input" placeholder="Quantidade *" required value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
            {form.tipo === 'entrada' && (
              <input type="number" step="0.01" className="input" placeholder="Preço unitário (R$)" value={form.preco_unitario} onChange={e => setForm({...form, preco_unitario: e.target.value})} />
            )}
            <input type="date" className="input" value={form.data_movimento} onChange={e => setForm({...form, data_movimento: e.target.value})} />
            <input className="input input-full" placeholder="Observação" value={form.observacao} onChange={e => setForm({...form, observacao: e.target.value})} />
            <button type="submit" className="btn-primary input-full">Registrar Movimentação</button>
          </form>
        </div>
      )}

      {tab === 'atual' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Categoria</th>
                <th>Quantidade Atual</th>
                <th>Mínimo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {estoque.map(i => (
                <tr key={i.id} className="table-row">
                  <td className="font-medium">{i.nome}</td>
                  <td>{i.categoria_nome || '-'}</td>
                  <td className="font-bold">{Number(i.quantidade_atual).toFixed(2)} {i.unidade}</td>
                  <td>{i.estoque_minimo} {i.unidade}</td>
                  <td>
                    {i.abaixo_minimo
                      ? <span className="stock-status-low">Abaixo</span>
                      : <span className="stock-status-ok">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'historico' && (
        <>
          <div className="filter-bar">
            <div className="form-grid">
              <input type="date" className="input" placeholder="Data início" value={filter.data_inicio} onChange={e => setFilter({...filter, data_inicio: e.target.value})} />
              <input type="date" className="input" placeholder="Data fim" value={filter.data_fim} onChange={e => setFilter({...filter, data_fim: e.target.value})} />
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Item</th>
                  <th>Tipo</th>
                  <th>Qtd</th>
                  <th>Valor Total</th>
                  <th>Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movs.map(m => (
                  <tr key={m.id} className="table-row">
                    <td className="text-sm">{new Date(m.data_movimento).toLocaleDateString('pt-BR')}</td>
                    <td>{m.item_nome}</td>
                    <td>
                      <span className={`status-badge ${m.tipo === 'entrada' ? 'status-pago' : 'status-pendente'}`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td>{Number(m.quantidade).toFixed(2)} {m.unidade}</td>
                    <td>{m.valor_total ? `R$ ${Number(m.valor_total).toFixed(2)}` : '-'}</td>
                    <td className="text-sm text-gray">{m.usuario_nome || '-'}</td>
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
