import { Router } from 'express';
import {
  listarListaCompras,
  gerarListaCompras,
  marcarComoComprado,
  deletarDaLista,
  relatorioCompras
} from '../controllers/comprasController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', listarListaCompras);
router.post('/gerar', roleMiddleware('admin', 'gerente'), gerarListaCompras);
router.put('/:id/comprar', roleMiddleware('admin', 'gerente'), marcarComoComprado);
router.delete('/:id', roleMiddleware('admin', 'gerente'), deletarDaLista);
router.get('/relatorio', roleMiddleware('admin', 'gerente'), relatorioCompras);

export default router;
