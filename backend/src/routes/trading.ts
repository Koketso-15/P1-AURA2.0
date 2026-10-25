import { Router } from 'express';
import {
  analyzeMarket,
  generateTradingCode,
  connectToSutaLight,
  buildWatchlist,
  buildSignalSummary,
  createStrategyRecord,
} from '../services/trading.service.js';

const router = Router();

router.get('/watchlist', (_req, res) => {
  res.json(buildWatchlist());
});

router.post('/watchlist', (req, res) => {
  const { symbol, market } = req.body ?? {};

  if (!symbol || typeof symbol !== 'string' || !market || typeof market !== 'string') {
    return res.status(400).json({ error: 'symbol and market are required.' });
  }

  const items = buildWatchlist();
  const exists = items.some((item) => item.symbol === symbol.toUpperCase());

  if (!exists) {
    items.push({ symbol: symbol.toUpperCase(), market, trend: 'new', score: 60 });
  }

  return res.json({ items, message: 'watchlist updated' });
});

router.get('/signals', (_req, res) => {
  res.json(buildSignalSummary());
});

router.post('/analyze', async (req, res) => {
  const { symbol, market, commentary, prices } = req.body ?? {};

  if (!symbol || typeof symbol !== 'string' || !market || typeof market !== 'string') {
    return res.status(400).json({ error: 'symbol and market are required.' });
  }

  try {
    const result = analyzeMarket({
      symbol,
      market,
      commentary: typeof commentary === 'string' ? commentary : '',
      prices: Array.isArray(prices) ? prices.map(Number) : undefined,
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown trading analysis error' });
  }
});

router.post('/code', async (req, res) => {
  const { strategy, focus } = req.body ?? {};

  if (!strategy || typeof strategy !== 'string') {
    return res.status(400).json({ error: 'strategy is required.' });
  }

  try {
    const result = generateTradingCode({
      strategy,
      focus: typeof focus === 'string' ? focus : 'risk management and signal validation',
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown code generation error' });
  }
});

router.post('/strategy', async (req, res) => {
  const { title, summary, signal, risk } = req.body ?? {};

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required.' });
  }

  const saved = createStrategyRecord({
    title,
    summary: typeof summary === 'string' ? summary : '',
    signal: typeof signal === 'string' ? signal : 'trend',
    risk: typeof risk === 'string' ? risk : 'moderate',
  });

  return res.status(201).json(saved);
});

router.post('/sutalight', async (req, res) => {
  const { market, signal } = req.body ?? {};

  if (!market || typeof market !== 'string') {
    return res.status(400).json({ error: 'market is required.' });
  }

  try {
    const result = connectToSutaLight({
      market,
      signal: typeof signal === 'string' ? signal : '',
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown SutaLight connection error' });
  }
});

export default router;
