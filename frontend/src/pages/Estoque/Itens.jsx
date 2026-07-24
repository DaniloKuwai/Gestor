import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../styles/shared.css';
import '../Estoque/Estoque.css';

export default function Itens() {
  const [itens, setItens] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCat, setShowCat] = useState(false);
  const [novaCat, setNovaCat] = useState('');
  const [form, setForm] = useState({
    nome: '', unidade: 'kg', categoria_id: '', estoque_minimo: 0, preco_medio: 0
  });

  const load = async () => {
    const [i, c] = await Promise.all([
      api.get('/estoque/itens'),
      api.get('/estoque/categorias')
    ]);
    setItens(i.data);
    setCategorias(c.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/estoque/itens', form);
      setShowForm(false);
      setForm({ nome: '', unidade: 'kg', categoria_id: '', estoque_minimo: 0, preco_medio: 0 });
      load();
    } catch (err) {
      alert('Erro ao salvar');
    }
  };

  const criarCategoria = async () => {
    if (!novaCat) return;
    await api.post('/estoque/categorias', { nome: novaCat });
    setNovaCat('');
    setShowCat(false);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Itens do Estoque</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCat(true)} className="btn-secondary">+ Categoria</button>
          <button onClick={() => setShowForm(true)} className="btn-primary">+ Novo Item</button>
        </div>
      </div>

      {showCat && (
        <div className="category-form">
          <input className="input" placeholder="Nome da categoria" value={novaCat} onChange={e => setNovaCat(e.target.value)} />
          <button onClick={criarCategoria} className="btn-primary">Salvar</button>
          <button onClick={() => setShowCat(false)} className="btn-secondary">Cancelar</button>
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h2>Novo Item</h2>
          <form onSubmit={handleSubmit} className="form-grid form-grid-3">
            <input className="input col-span-2" placeholder="Nome *" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <select className="input" value={form.unidade} onChange={e => setForm({...form, unidade: e.target.value})}>
              <option value="kg">Quilograma (kg)</option>
              <option value="g">Grama (g)</option>
              <option value="l">Litro (l)</option>
              <option value="ml">Mililitro (ml)</option>
              <option value="un">Unidade (un)</option>
              <option value="cx">Caixa (cx)</option>
              <option value="pct">Pacote (pct)</option>
            </select>
            <select className="input" value={form.categoria_id} onChange={e => setForm({...form, categoria_id: e.target.value})}>
              <option value="">Categoria</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <input type="number" step="0.001" className="input" placeholder="Estoque mínimo" value={form.estoque_minimo} onChange={e => setForm({...form, estoque_minimo: e.target.value})} />
            <input type="number" step="0.01" className="input" placeholder="Preço médio (R$)" value={form.preco_medio} onChange={e => setForm({...form, preco_medio: e.target.value})} />
            <div className="col-span-3 flex gap-2">
              <button type="submit" className="btn-primary">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Categoria</th>
              <th>Unidade</th>
              <th>Estoque Mínimo</th>
              <th>Preço Médio</th>
            </tr>
          </thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.id} className="table-row">
                <td className="font-medium">{i.nome}</td>
                <td>{i.categoria_nome || '-'}</td>
                <td>{i.unidade}</td>
                <td>{i.estoque_minimo} {i.unidade}</td>
                <td>R$ {Number(i.preco_medio).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
