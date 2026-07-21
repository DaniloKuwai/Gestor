import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Pagamentos from '../pages/Financeiro/Pagamentos';
import Ponto from '../pages/Financeiro/Ponto';
import Funcionarios from '../pages/Financeiro/Funcionarios';
import Itens from '../pages/Estoque/Itens';
import Movimentacoes from '../pages/Estoque/Movimentacoes';
import ListaCompras from '../pages/Estoque/ListaCompras';
import ContasPagar from '../pages/Gerencial/ContasPagar';
import Fornecedores from '../pages/Gerencial/Fornecedores';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <main className="flex-1 ml-64 p-8">{children}</main>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/financeiro/pagamentos" element={<PrivateRoute><Layout><Pagamentos /></Layout></PrivateRoute>} />
      <Route path="/financeiro/ponto" element={<PrivateRoute><Layout><Ponto /></Layout></PrivateRoute>} />
      <Route path="/financeiro/funcionarios" element={<PrivateRoute><Layout><Funcionarios /></Layout></PrivateRoute>} />
      <Route path="/estoque/itens" element={<PrivateRoute><Layout><Itens /></Layout></PrivateRoute>} />
      <Route path="/estoque/movimentacoes" element={<PrivateRoute><Layout><Movimentacoes /></Layout></PrivateRoute>} />
      <Route path="/estoque/compras" element={<PrivateRoute><Layout><ListaCompras /></Layout></PrivateRoute>} />
      <Route path="/gerencial/contas" element={<PrivateRoute><Layout><ContasPagar /></Layout></PrivateRoute>} />
      <Route path="/gerencial/fornecedores" element={<PrivateRoute><Layout><Fornecedores /></Layout></PrivateRoute>} />
    </Routes>
  );
}
