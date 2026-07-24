import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../styles/shared.css';

export default function Ponto() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [pontos, setPontos] = useState([]);
  const [form, setForm] = useState({
    funcionario_id: '', data: new Date().toISOString().split('T')[0],
    entrada: '', saida_almoco: '', retorno_almoco: '', saida: '', observacoes: ''
  });
  const [filter, setFilter] = useState({ data_inicio: '', data_fim: '', funcionario_id: '' });

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
      <h1 className="page-title mb-6">Controle de Ponto</h1>

      <div className="form-card">
        <h2>Registrar Ponto</h2>
        <form onSubmit={handleSubmit} className="form-grid form-grid-3">
          <select className="input" value={form.funcionario_id} onChange={e => setForm({...form, funcionario_id: e.target.value})} required>
            <option value="">Selecione o funcionário</option>
            {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          <input type="date" className="input" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
          <input type="time" className="input" placeholder="Entrada" value={form.entrada} onChange={e => setForm({...form, entrada: e.target.value})} />
          <input type="time" className="input" placeholder="Saída Almoço" value={form.saida_almoco} onChange={e => setForm({...form, saida_almoco: e.target.value})} />
          <input type="time" className="input" placeholder="Retorno Almoço" value={form.retorno_almoco} onChange={e => setForm({...form, retorno_almoco: e.target.value})} />
          <input type="time" className="input" placeholder="Saída" value={form.saida} onChange={e => setForm({...form, saida: e.target.value})} />
          <input className="input col-span-2" placeholder="Observações" value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
          <button type="submit" className="btn-primary">Registrar</button>
        </form>
      </div>

      <div className="form-card">
        <h2>Filtros</h2>
        <div className="form-grid form-grid-3">
          <input type="date" className="input" value={filter.data_inicio} onChange={e => setFilter({...filter, data_inicio: e.target.value})} />
          <input type="date" className="input" value={filter.data_fim} onChange={e => setFilter({...filter, data_fim: e.target.value})} />
          <select className="input" value={filter.funcionario_id} onChange={e => setFilter({...filter, funcionario_id: e.target.value})}>
            <option value="">Todos os funcionários</option>
            {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Funcionário</th>
              <th>Entrada</th>
              <th>Saída Almoço</th>
              <th>Retorno</th>
              <th>Saída</th>
              <th>Horas</th>
            </tr>
          </thead>
          <tbody>
            {pontos.map(p => (
              <tr key={p.id} className="table-row">
                <td>{new Date(p.data).toLocaleDateString('pt-BR')}</td>
                <td>{p.funcionario_nome}</td>
                <td>{p.entrada || '-'}</td>
                <td>{p.saida_almoco || '-'}</td>
                <td>{p.retorno_almoco || '-'}</td>
                <td>{p.saida || '-'}</td>
                <td className="font-bold">{p.horas_trabalhadas || 0}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
