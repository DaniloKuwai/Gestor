import { Router } from 'express';
import {
  listarFornecedores,
  criarFornecedor,
  atualizarFornecedor,
  deletarFornecedor,
  listarContas,
  criarConta,
  pagarConta,
  cancelarConta,
  resumoMensal,
  contasVencendo
} from '../controllers/gerencialController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();
router.use(authMiddleware);

// Fornecedores
router.get('/fornecedores', listarFornecedores);
router.post('/fornecedores', roleMiddleware('admin', 'gerente'), criarFornecedor);
router.put('/fornecedores/:id', roleMiddleware('admin', 'gerente'), atualizarFornecedor);
router.delete('/fornecedores/:id', roleMiddleware('admin'), deletarFornecedor);

// Contas
router.get('/contas', listarContas);
router.post('/contas', roleMiddleware('admin', 'gerente'), criarConta);
router.put('/contas/:id/pagar', roleMiddleware('admin', 'gerente'), pagarConta);
router.put('/contas/:id/cancelar', roleMiddleware('admin', 'gerente'), cancelarConta);

router.get('/resumo-mensal', roleMiddleware('admin', 'gerente'), resumoMensal);
router.get('/vencendo', contasVencendo);

export default router;
