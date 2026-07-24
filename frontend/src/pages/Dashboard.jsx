import { useEffect, useState } from 'react';
import api from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [contas, estoque, contasVencendo] = await Promise.all([
          api.get('/gerencial/resumo-mensal'),
          api.get('/estoque/atual'),
          api.get('/gerencial/vencendo')
        ]);

        const itensBaixos = estoque.data.filter(i => i.abaixo_minimo);
        setData({ contas: contas.data, itensBaixos, contasVencendo: contasVencendo.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="dashboard">Carregando...</div>;

  const cards = [
    { label: 'Contas Pagas no Mês', value: `R$ ${Number(data?.contas?.totais?.total_pago || 0).toFixed(2)}`, color: 'green' },
    { label: 'Contas Pendentes', value: `R$ ${Number(data?.contas?.totais?.total_pendente || 0).toFixed(2)}`, color: 'yellow' },
    { label: 'Itens Abaixo do Mínimo', value: data?.itensBaixos?.length || 0, color: 'red' },
    { label: 'Contas Vencendo (7 dias)', value: data?.contasVencendo?.length || 0, color: 'blue' }
  ];

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-cards">
        {cards.map((c, i) => (
          <div key={i} className="dashboard-card">
            <div className={`dashboard-card-dot ${c.color}`} />
            <p className="dashboard-card-label">{c.label}</p>
            <p className="dashboard-card-value">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2>Itens Abaixo do Mínimo</h2>
          {data?.itensBaixos?.length === 0 ? (
            <p className="dashboard-panel-empty">Tudo em dia!</p>
          ) : (
            <ul className="dashboard-panel-list">
              {data?.itensBaixos?.slice(0, 8).map(item => (
                <li key={item.id} className="dashboard-panel-item">
                  <span>{item.nome}</span>
                  <span className="dashboard-panel-item-value red">
                    {Number(item.quantidade_atual).toFixed(2)} {item.unidade}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-panel">
          <h2>Próximos Vencimentos</h2>
          {data?.contasVencendo?.length === 0 ? (
            <p className="dashboard-panel-empty">Nenhuma conta próxima do vencimento.</p>
          ) : (
            <ul className="dashboard-panel-list">
              {data?.contasVencendo?.slice(0, 8).map(c => (
                <li key={c.id} className="dashboard-panel-item">
                  <div>
                    <p className="dashboard-panel-item-name">{c.descricao}</p>
                    <p className="dashboard-panel-item-sub">{c.fornecedor_nome || 'Sem fornecedor'}</p>
                  </div>
                  <div className="text-right">
                    <p className="dashboard-panel-item-value">R$ {Number(c.valor).toFixed(2)}</p>
                    <p className="dashboard-panel-item-date">{new Date(c.data_vencimento).toLocaleDateString('pt-BR')}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
