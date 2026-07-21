import { Router } from 'express';
import {
  listarFuncionarios,
  criarFuncionario,
  atualizarFuncionario,
  deletarFuncionario,
  listarPagamentos,
  criarPagamento,
  pagarPagamento,
  resumoSemanal
} from '../controllers/financeiroController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();
router.use(authMiddleware);

// Funcionários
router.get('/funcionarios', listarFuncionarios);
router.post('/funcionarios', roleMiddleware('admin', 'gerente'), criarFuncionario);
router.put('/funcionarios/:id', roleMiddleware('admin', 'gerente'), atualizarFuncionario);
router.delete('/funcionarios/:id', roleMiddleware('admin'), deletarFuncionario);

// Pagamentos
router.get('/pagamentos', listarPagamentos);
router.post('/pagamentos', roleMiddleware('admin', 'gerente'), criarPagamento);
router.put('/pagamentos/:id/pagar', roleMiddleware('admin', 'gerente'), pagarPagamento);

router.get('/resumo-semanal', resumoSemanal);

export default router;
