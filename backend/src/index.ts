import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import chatRouter from './routes/chat.js';
import featuresRouter from './routes/features.js';
import tradingRouter from './routes/trading.js';
import authRouter from './routes/auth.js';

const app = express();
const port = env.PORT;

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AURA backend',
    provider: env.AI_PROVIDER,
    version: '2.2.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/features', featuresRouter);
app.use('/api/trading', tradingRouter);

app.listen(port, () => {
  console.log(`AURA backend listening on http://localhost:${port}`);
});
