import { useEffect, useState } from 'react';
import api from '../services/api';

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
        setData({
          contas: contas.data,
          itensBaixos,
          contasVencendo: contasVencendo.data
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Carregando...</div>;

  const cards = [
    { label: 'Contas Pagas no Mês', value: `R$ ${Number(data?.contas?.totais?.total_pago || 0).toFixed(2)}`, color: 'bg-green-500' },
    { label: 'Contas Pendentes', value: `R$ ${Number(data?.contas?.totais?.total_pendente || 0).toFixed(2)}`, color: 'bg-yellow-500' },
    { label: 'Itens Abaixo do Mínimo', value: data?.itensBaixos?.length || 0, color: 'bg-red-500' },
    { label: 'Contas Vencendo (7 dias)', value: data?.contasVencendo?.length || 0, color: 'bg-primary-500' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className={`w-2 h-2 ${c.color} rounded-full mb-2`} />
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Itens Abaixo do Mínimo</h2>
          {data?.itensBaixos?.length === 0 ? (
            <p className="text-slate-500 text-sm">Tudo em dia!</p>
          ) : (
            <ul className="space-y-2">
              {data?.itensBaixos?.slice(0, 8).map(item => (
                <li key={item.id} className="flex justify-between text-sm py-2 border-b">
                  <span>{item.nome}</span>
                  <span className="text-red-600">
                    {Number(item.quantidade_atual).toFixed(2)} {item.unidade}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Próximos Vencimentos</h2>
          {data?.contasVencendo?.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhuma conta próxima do vencimento.</p>
          ) : (
            <ul className="space-y-2">
              {data?.contasVencendo?.slice(0, 8).map(c => (
                <li key={c.id} className="flex justify-between text-sm py-2 border-b">
                  <div>
                    <p className="font-medium">{c.descricao}</p>
                    <p className="text-xs text-slate-500">{c.fornecedor_nome || 'Sem fornecedor'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {Number(c.valor).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{new Date(c.data_vencimento).toLocaleDateString('pt-BR')}</p>
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
