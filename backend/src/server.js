import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import financeiroRoutes from './routes/financeiroRoutes.js';
import pontoRoutes from './routes/pontoRoutes.js';
import estoqueRoutes from './routes/estoqueRoutes.js';
import comprasRoutes from './routes/comprasRoutes.js';
import gerencialRoutes from './routes/gerencialRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/ponto', pontoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/gerencial', gerencialRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Gestão rodando!' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
