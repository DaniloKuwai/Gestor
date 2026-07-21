import { useEffect, useState } from 'react';
import api from '../../services/api';

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Itens do Estoque</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCat(true)}
            className="bg-slate-200 px-4 py-2 rounded-lg">+ Categoria</button>
          <button onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg">+ Novo Item</button>
        </div>
      </div>

      {showCat && (
        <div className="bg-white p-4 rounded-xl border mb-6 flex gap-2">
          <input className="border p-2 rounded flex-1" placeholder="Nome da categoria"
            value={novaCat} onChange={e => setNovaCat(e.target.value)} />
          <button onClick={criarCategoria} className="bg-primary-600 text-white px-4 rounded">Salvar</button>
          <button onClick={() => setShowCat(false)} className="bg-slate-200 px-4 rounded">Cancelar</button>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border mb-6">
          <h2 className="text-lg font-semibold mb-4">Novo Item</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <input className="border p-2 rounded col-span-2" placeholder="Nome *" required
              value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <select className="border p-2 rounded" value={form.unidade}
              onChange={e => setForm({...form, unidade: e.target.value})}>
              <option value="kg">Quilograma (kg)</option>
              <option value="g">Grama (g)</option>
              <option value="l">Litro (l)</option>
              <option value="ml">Mililitro (ml)</option>
              <option value="un">Unidade (un)</option>
              <option value="cx">Caixa (cx)</option>
              <option value="pct">Pacote (pct)</option>
            </select>
            <select className="border p-2 rounded" value={form.categoria_id}
              onChange={e => setForm({...form, categoria_id: e.target.value})}>
              <option value="">Categoria</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <input type="number" step="0.001" className="border p-2 rounded" placeholder="Estoque mínimo"
              value={form.estoque_minimo} onChange={e => setForm({...form, estoque_minimo: e.target.value})} />
            <input type="number" step="0.01" className="border p-2 rounded" placeholder="Preço médio (R$)"
              value={form.preco_medio} onChange={e => setForm({...form, preco_medio: e.target.value})} />
            <div className="col-span-3 flex gap-2">
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 px-4 py-2 rounded">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Item</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-left p-3">Unidade</th>
              <th className="text-left p-3">Estoque Mínimo</th>
              <th className="text-left p-3">Preço Médio</th>
            </tr>
          </thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.id} className="border-t">
                <td className="p-3 font-medium">{i.nome}</td>
                <td className="p-3">{i.categoria_nome || '-'}</td>
                <td className="p-3">{i.unidade}</td>
                <td className="p-3">{i.estoque_minimo} {i.unidade}</td>
                <td className="p-3">R$ {Number(i.preco_medio).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
