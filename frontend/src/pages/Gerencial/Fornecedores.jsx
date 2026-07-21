import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', cnpj: '', telefone: '', email: '', endereco: '', observacoes: '' });

  const load = async () => {
    const res = await api.get('/gerencial/fornecedores');
    setFornecedores(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/gerencial/fornecedores/${editing}`, form);
      } else {
        await api.post('/gerencial/fornecedores', form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nome: '', cnpj: '', telefone: '', email: '', endereco: '', observacoes: '' });
      load();
    } catch (err) {
      alert('Erro ao salvar');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Fornecedores</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg">+ Novo Fornecedor</button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar' : 'Novo'} Fornecedor</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Nome *" required
              value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <input className="border p-2 rounded" placeholder="CNPJ"
              value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Telefone"
              value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
            <input className="border p-2 rounded" placeholder="E-mail"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <input className="border p-2 rounded col-span-2" placeholder="Endereço"
              value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
            <textarea className="border p-2 rounded col-span-2" placeholder="Observações"
              value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
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
              <th className="text-left p-3">CNPJ</th>
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">E-mail</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {fornecedores.map(f => (
              <tr key={f.id} className="border-t">
                <td className="p-3 font-medium">{f.nome}</td>
                <td className="p-3">{f.cnpj || '-'}</td>
                <td className="p-3">{f.telefone || '-'}</td>
                <td className="p-3">{f.email || '-'}</td>
                <td className="p-3 text-center">
                  <button onClick={() => {
                    setEditing(f.id);
                    setForm({ nome: f.nome, cnpj: f.cnpj || '', telefone: f.telefone || '',
                      email: f.email || '', endereco: f.endereco || '', observacoes: f.observacoes || '' });
                    setShowForm(true);
                  }} className="text-primary-600">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
