import { Router } from 'express';
import {
  listarCategorias,
  criarCategoria,
  listarItens,
  criarItem,
  atualizarItem,
  deletarItem,
  listarMovimentacoes,
  registrarMovimentacao,
  relatorioGastos,
  estoqueAtual
} from '../controllers/estoqueController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/categorias', listarCategorias);
router.post('/categorias', roleMiddleware('admin'), criarCategoria);

router.get('/itens', listarItens);
router.post('/itens', roleMiddleware('admin', 'gerente'), criarItem);
router.put('/itens/:id', roleMiddleware('admin', 'gerente'), atualizarItem);
router.delete('/itens/:id', roleMiddleware('admin'), deletarItem);

router.get('/movimentacoes', listarMovimentacoes);
router.post('/movimentacoes', registrarMovimentacao);

router.get('/atual', roleMiddleware('admin', 'gerente'), estoqueAtual);
router.get('/relatorio-gastos', roleMiddleware('admin', 'gerente'), relatorioGastos);

export default router;
