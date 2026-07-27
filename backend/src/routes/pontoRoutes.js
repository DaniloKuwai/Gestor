import { Router } from 'express';

import {
  baterPonto,
  listarPontos,
  resumoPontoFuncionario,
  listarPontosHoje
} from '../controllers/pontoController.js';

import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/registrar', baterPonto);

router.get('/hoje', authMiddleware, listarPontosHoje);

router.get(
  '/funcionario/:id',
  authMiddleware,
  resumoPontoFuncionario
);

router.get(
  '/',
  authMiddleware,
  listarPontos
);

export default router;