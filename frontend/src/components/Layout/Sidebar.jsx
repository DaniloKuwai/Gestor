import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiDollarSign, FiClock, FiUsers,
  FiPackage, FiShoppingCart, FiFileText, FiTruck
} from 'react-icons/fi';
import './Sidebar.css';

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
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Gestão</h1>
        <p>Sistema Integrado</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(group => (
          <div key={group.section} className="sidebar-section">
            <h3 className="sidebar-section-title">{group.section}</h3>
            {group.items.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link ${active ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user?.name}</p>
          <p className="sidebar-user-role">{user?.role}</p>
        </div>
        <button onClick={logout} className="sidebar-logout">Sair</button>
      </div>
    </aside>
  );
}
