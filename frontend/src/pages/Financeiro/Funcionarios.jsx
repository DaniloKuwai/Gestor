import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nome: '', cpf: '', cargo: '', pix: '', telefone: '',
    data_admissao: '', valor_semanal: 0
  });

  const load = async () => {
    const res = await api.get('/financeiro/funcionarios');
    setFuncionarios(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/financeiro/funcionarios/${editing}`, form);
      } else {
        await api.post('/financeiro/funcionarios', form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nome: '', cpf: '', cargo: '', pix: '', telefone: '', data_admissao: '', valor_semanal: 0 });
      load();
    } catch (err) {
      alert('Erro ao salvar');
    }
  };

  const handleEdit = (f) => {
    setEditing(f.id);
    setForm({
      nome: f.nome, cpf: f.cpf || '', cargo: f.cargo || '',
      pix: f.pix || '', telefone: f.telefone || '',
      data_admissao: f.data_admissao?.split('T')[0] || '',
      valor_semanal: f.valor_semanal
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Desativar este funcionário?')) {
      await api.delete(`/financeiro/funcionarios/${id}`);
      load();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Funcionários</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar' : 'Novo'} Funcionário</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Nome *"
              value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            <input className="border p-2 rounded" placeholder="CPF"
              value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Cargo"
              value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} />
            <input className="border p-2 rounded" placeholder="PIX"
              value={form.pix} onChange={e => setForm({...form, pix: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Telefone"
              value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
            <input type="date" className="border p-2 rounded"
              value={form.data_admissao} onChange={e => setForm({...form, data_admissao: e.target.value})} />
            <input type="number" step="0.01" className="border p-2 rounded col-span-2"
              placeholder="Valor Semanal (R$)"
              value={form.valor_semanal} onChange={e => setForm({...form, valor_semanal: e.target.value})} />
            <div className="col-span-2 flex gap-2">
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
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Cargo</th>
              <th className="text-left p-3">Valor Semanal</th>
              <th className="text-left p-3">PIX</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(f => (
              <tr key={f.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{f.nome}</td>
                <td className="p-3">{f.cargo || '-'}</td>
                <td className="p-3">R$ {Number(f.valor_semanal).toFixed(2)}</td>
                <td className="p-3 text-sm text-slate-600">{f.pix || '-'}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEdit(f)} className="text-primary-600 mr-3">Editar</button>
                  <button onClick={() => handleDelete(f.id)} className="text-red-600">Excluir</button>
                </td>
              </tr>
            ))}
            {funcionarios.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">Nenhum funcionário cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
