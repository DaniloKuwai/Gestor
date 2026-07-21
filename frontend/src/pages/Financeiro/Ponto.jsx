import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Ponto() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [pontos, setPontos] = useState([]);
  const [form, setForm] = useState({
    funcionario_id: '', data: new Date().toISOString().split('T')[0],
    entrada: '', saida_almoco: '', retorno_almoco: '', saida: '', observacoes: ''
  });
  const [filter, setFilter] = useState({
    data_inicio: '', data_fim: '', funcionario_id: ''
  });

  const load = async () => {
    const [f, p] = await Promise.all([
      api.get('/financeiro/funcionarios'),
      api.get('/ponto', { params: filter })
    ]);
    setFuncionarios(f.data);
    setPontos(p.data);
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/ponto/registrar', form);
      alert(`Ponto registrado! Total: ${res.data.horas}h`);
      setForm({ ...form, entrada: '', saida_almoco: '', retorno_almoco: '', saida: '', observacoes: '' });
      load();
    } catch (err) {
      alert('Erro ao registrar ponto');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Controle de Ponto</h1>

      <div className="bg-white p-6 rounded-xl border mb-6">
        <h2 className="text-lg font-semibold mb-4">Registrar Ponto</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <select className="border p-2 rounded" value={form.funcionario_id}
            onChange={e => setForm({...form, funcionario_id: e.target.value})} required>
            <option value="">Selecione o funcionário</option>
            {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          <input type="date" className="border p-2 rounded"
            value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
          <input type="time" className="border p-2 rounded" placeholder="Entrada"
            value={form.entrada} onChange={e => setForm({...form, entrada: e.target.value})} />
          <input type="time" className="border p-2 rounded" placeholder="Saída Almoço"
            value={form.saida_almoco} onChange={e => setForm({...form, saida_almoco: e.target.value})} />
          <input type="time" className="border p-2 rounded" placeholder="Retorno Almoço"
            value={form.retorno_almoco} onChange={e => setForm({...form, retorno_almoco: e.target.value})} />
          <input type="time" className="border p-2 rounded" placeholder="Saída"
            value={form.saida} onChange={e => setForm({...form, saida: e.target.value})} />
          <input className="border p-2 rounded col-span-2" placeholder="Observações"
            value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Registrar</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-3 gap-4">
          <input type="date" className="border p-2 rounded"
            value={filter.data_inicio} onChange={e => setFilter({...filter, data_inicio: e.target.value})} />
          <input type="date" className="border p-2 rounded"
            value={filter.data_fim} onChange={e => setFilter({...filter, data_fim: e.target.value})} />
          <select className="border p-2 rounded" value={filter.funcionario_id}
            onChange={e => setFilter({...filter, funcionario_id: e.target.value})}>
            <option value="">Todos os funcionários</option>
            {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Funcionário</th>
              <th className="text-left p-3">Entrada</th>
              <th className="text-left p-3">Saída Almoço</th>
              <th className="text-left p-3">Retorno</th>
              <th className="text-left p-3">Saída</th>
              <th className="text-left p-3">Horas</th>
            </tr>
          </thead>
          <tbody>
            {pontos.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{new Date(p.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{p.funcionario_nome}</td>
                <td className="p-3">{p.entrada || '-'}</td>
                <td className="p-3">{p.saida_almoco || '-'}</td>
                <td className="p-3">{p.retorno_almoco || '-'}</td>
                <td className="p-3">{p.saida || '-'}</td>
                <td className="p-3 font-semibold">{p.horas_trabalhadas || 0}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
