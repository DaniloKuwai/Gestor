import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../styles/shared.css';

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nome: '', cpf: '', cargo: '', pix: '', telefone: '', data_admissao: '', valor_diario: 100, senha_ponto: ''
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
      setForm({ nome: '', cpf: '', cargo: '', pix: '', telefone: '', data_admissao: '', valor_diario: 100,senha_ponto:'' });
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
      data_admissao: f.data_admissao?.split('T')[0] || '', valor_diario: f.valor_diario, senha: f.senha_ponto || '' 
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
      <div className="page-header">
        <h1 className="page-title">Funcionários</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); }} className="btn-primary">
          + Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editing ? 'Editar' : 'Novo'} Funcionário</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <input className="input" placeholder="Nome *" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            <input className="input" placeholder="CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
            <input className="input" placeholder="Cargo" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} />
            <input className="input" placeholder="PIX" value={form.pix} onChange={e => setForm({...form, pix: e.target.value})} />
            <input className="input" placeholder="Telefone" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
            <input type="date" className="input" value={form.data_admissao} onChange={e => setForm({...form, data_admissao: e.target.value})} />
            <input type="input" className="input input-full" placeholder="Valor Diario (R$)" value={form.valor_semanal} onChange={e => setForm({...form, valor_diario: e.target.value})} />
            <input type="input" className="input" placeholder="Senha para funcionario bater o ponto" value={form.senha_ponto} onChange={e => setForm({...form, senha_ponto: e.target.value})} />
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
              <th>Cargo</th>
              <th>Valor Semanal</th>
              <th>PIX</th>
              <th className="table-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(f => (
              <tr key={f.id} className="table-row">
                <td className="font-medium">{f.nome}</td>
                <td>{f.cargo || '-'}</td>
                <td>R$ {Number(f.valor_semanal).toFixed(2)}</td>
                <td className="text-sm text-gray">{f.pix || '-'}</td>
                <td className="table-actions">
                  <span className="link-edit" onClick={() => handleEdit(f)}>Editar</span>
                  <span className="link-delete" onClick={() => handleDelete(f.id)}>Excluir</span>
                </td>
              </tr>
            ))}
            {funcionarios.length === 0 && (
              <tr><td colSpan="5" className="table-empty">Nenhum funcionário cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
