import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../styles/shared.css';

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
      <div className="page-header">
        <h1 className="page-title">Fornecedores</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); }} className="btn-primary">+ Novo Fornecedor</button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editing ? 'Editar' : 'Novo'} Fornecedor</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <input className="input" placeholder="Nome *" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <input className="input" placeholder="CNPJ" value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} />
            <input className="input" placeholder="Telefone" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
            <input className="input" placeholder="E-mail" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <input className="input input-full" placeholder="Endereço" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
            <textarea className="input input-full" placeholder="Observações" value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
            <div className="form-actions">
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
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th className="table-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {fornecedores.map(f => (
              <tr key={f.id} className="table-row">
                <td className="font-medium">{f.nome}</td>
                <td>{f.cnpj || '-'}</td>
                <td>{f.telefone || '-'}</td>
                <td>{f.email || '-'}</td>
                <td className="table-actions">
                  <span className="link-edit" onClick={() => {
                    setEditing(f.id);
                    setForm({ nome: f.nome, cnpj: f.cnpj || '', telefone: f.telefone || '',
                      email: f.email || '', endereco: f.endereco || '', observacoes: f.observacoes || '' });
                    setShowForm(true);
                  }}>Editar</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
