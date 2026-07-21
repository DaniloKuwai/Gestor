import { Router } from 'express';
import {
  baterPonto,
  listarPontos,
  resumoPontoFuncionario,
  listarPontosHoje
} from '../controllers/pontoController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/hoje', listarPontosHoje);
router.get('/funcionario/:id', resumoPontoFuncionario);
router.post('/registrar', baterPonto);
router.get('/', listarPontos);

export default router;
