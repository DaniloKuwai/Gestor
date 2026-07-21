import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiDollarSign, FiClock, FiUsers,
  FiPackage, FiShoppingCart, FiFileText, FiTruck
} from 'react-icons/fi';

const menuItems = [
  { section: 'Geral', items: [
    { to: '/', label: 'Dashboard', icon: FiHome }
  ]},
  { section: 'Financeiro', items: [
    { to: '/financeiro/pagamentos', label: 'Pagamentos', icon: FiDollarSign },
    { to: '/financeiro/ponto', label: 'Ponto', icon: FiClock },
    { to: '/financeiro/funcionarios', label: 'Funcionários', icon: FiUsers }
  ]},
  { section: 'Estoque', items: [
    { to: '/estoque/itens', label: 'Itens', icon: FiPackage },
    { to: '/estoque/movimentacoes', label: 'Movimentações', icon: FiFileText },
    { to: '/estoque/compras', label: 'Lista de Compras', icon: FiShoppingCart }
  ]},
  { section: 'Gerencial', items: [
    { to: '/gerencial/contas', label: 'Contas a Pagar', icon: FiDollarSign },
    { to: '/gerencial/fornecedores', label: 'Fornecedores', icon: FiTruck }
  ]}
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-slate-900 text-white p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-500">Gestão</h1>
        <p className="text-xs text-slate-400">Sistema Integrado</p>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {menuItems.map(group => (
          <div key={group.section} className="mb-6">
            <h3 className="text-xs uppercase text-slate-500 font-semibold mb-2 px-2">
              {group.section}
            </h3>
            {group.items.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
                    active ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-700 pt-4">
        <div className="px-2 mb-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
