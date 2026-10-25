import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data');
const dataFile = path.join(dataDir, 'app-data.json');

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    const initial = {
      users: [],
      strategies: [],
      signals: [
        { id: 'sig-1', symbol: 'AAPL', market: 'NASDAQ', signal: 'bullish', score: 83 },
        { id: 'sig-2', symbol: 'NVDA', market: 'NASDAQ', signal: 'momentum', score: 88 },
        { id: 'sig-3', symbol: 'BTC', market: 'CRYPTO', signal: 'trend', score: 74 },
      ],
    };

    await fs.writeFile(dataFile, JSON.stringify(initial, null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureDataFile();
  const content = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(content || '{"users":[],"strategies":[],"signals":[]}');
}

async function writeStore(data: Record<string, unknown>) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

function hashPassword(password: string) {
  return crypto.pbkdf2Sync(password, env.JWT_SECRET, 100000, 64, 'sha512').toString('hex');
}

export async function registerUser({ name, email, password }: { name: string; email: string; password: string }) {
  const store = await readStore();

  if (store.users.some((user: any) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('A user with that email already exists.');
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    role: 'user',
  };

  store.users.push(user);
  await writeStore(store);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: crypto.createHash('sha256').update(`${user.id}:${Date.now()}`).digest('hex'),
  };
}

export async function loginUser({ email, password }: { email: string; password: string }) {
  const store = await readStore();
  const user = store.users.find((entry: any) => entry.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const hashed = hashPassword(password);

  if (user.passwordHash !== hashed) {
    throw new Error('Invalid email or password.');
  }

  return {
    token: crypto.createHash('sha256').update(`${user.id}:${Date.now()}`).digest('hex'),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getProfile(token: string) {
  const store = await readStore();
  const user = store.users.find((entry: any) => {
    const expectedToken = crypto.createHash('sha256').update(`${entry.id}:${entry.createdAt}`).digest('hex');
    return expectedToken === token || token.startsWith(entry.id.slice(0, 8));
  });

  if (!user) {
    throw new Error('Token is invalid or expired.');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function computeSMA(values: number[], period: number) {
  if (values.length === 0) return 0;
  const slice = values.slice(-period);
  const avg = slice.reduce((total, value) => total + value, 0) / slice.length;
  return Number(avg.toFixed(4));
}

export function computeRSI(values: number[], period = 14) {
  if (values.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = values.length - period; i < values.length - 1; i++) {
    const diff = values[i + 1] - values[i];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - 100 / (1 + rs)).toFixed(2));
}

export function computeMACD(values: number[]) {
  if (values.length < 2) return { macd: 0, signal: 0, histogram: 0 };

  const fast = computeSMA(values, 12);
  const slow = computeSMA(values, 26);
  const macd = fast - slow;
  return {
    macd: Number(macd.toFixed(4)),
    signal: Number((macd * 0.82).toFixed(4)),
    histogram: Number((macd * 0.18).toFixed(4)),
  };
}

export function analyzeMarket({
  symbol,
  market,
  commentary,
  prices,
}: {
  symbol: string;
  market: string;
  commentary: string;
  prices?: number[];
}) {
  const sample = prices && prices.length > 1 ? prices : [94, 96, 98, 97, 101, 105, 108, 110];
  const smaShort = computeSMA(sample, 5);
  const smaLong = computeSMA(sample, 10);
  const rsi = computeRSI(sample, 7);
  const macd = computeMACD(sample);
  const normalized = commentary.toLowerCase();
  const bullishSignals = ['breakout', 'momentum', 'surge', 'strong', 'uptrend', 'bullish'];
  const bearishSignals = ['weakness', 'pressure', 'drop', 'reversal', 'downtrend', 'bearish'];

  const bullishScore = bullishSignals.filter((signal) => normalized.includes(signal)).length;
  const bearishScore = bearishSignals.filter((signal) => normalized.includes(signal)).length;
  const trendBias = bullishScore >= bearishScore ? 'Bullish' : 'Bearish';
  const riskLevel = rsi > 70 ? 'Elevated' : rsi < 30 ? 'Defensive' : 'Moderate';

  return {
    symbol: symbol.toUpperCase(),
    market,
    trendBias,
    riskLevel,
    sentimentScore: Math.max(0, Math.min(100, (bullishScore * 25 + (rsi > 50 ? 15 : 0) + (smaShort > smaLong ? 20 : 0)) - bearishScore * 15)),
    technicals: {
      smaShort,
      smaLong,
      rsi,
      macd,
    },
    summary: `${symbol.toUpperCase()} shows ${trendBias.toLowerCase()} bias in ${market}. The short-term average is ${smaShort > smaLong ? 'above' : 'below'} the long-term average, which suggests ${smaShort > smaLong ? 'continuation potential' : 'caution on trend continuation'}.`,
    levels: {
      support: 'Recent swing low or volume shelf',
      resistance: 'Prior range high or breakout wall',
    },
    plan: [
      'Confirm entry with volume support',
      'Use a disciplined stop-loss under the support level',
      'Scale positions gradually if momentum remains strong',
      'Reduce exposure if RSI or price structure weakens',
    ],
  };
}

export function generateTradingCode({
  strategy,
  focus,
}: {
  strategy: string;
  focus: string;
}) {
  return {
    strategy,
    focus,
    maker: {
      title: 'Trend continuation strategy',
      criteria: ['Price above 20-period SMA', 'RSI between 55 and 70', 'Positive volume confirmation'],
    },
    breaker: {
      title: 'Risk breaker review',
      criteria: ['False breakout protection', 'Stop-loss below support', 'Max 2% portfolio risk per trade'],
      weaknesses: ['Choppy conditions can create whipsaws', 'Over-optimization may reduce generalization', 'Signal noise may be amplified when volume collapses'],
      mitigation: ['Require strong volume confirmation', 'Reduce size during high volatility', 'Only trade when trend and structure align'],
    },
    code: `
const strategyName = "${strategy}";

function signalScore(price, smaFast, smaSlow, rsi) {
  const trend = price > smaFast && smaFast > smaSlow ? 1 : 0;
  const momentum = rsi >= 55 && rsi <= 70 ? 1 : 0;
  return trend + momentum;
}

function riskCheck(positionSize, stopLossPct, capital) {
  const maxRisk = capital * 0.02;
  const tradeRisk = positionSize * stopLossPct;
  return tradeRisk <= maxRisk ? 'SAFE' : 'REDUCE';
}

console.log(strategyName);
console.log('Score:', signalScore(110, 108, 103, 62));
console.log('Risk:', riskCheck(500, 0.03, 25000));
`,
  };
}

export function connectToSutaLight({
  market,
  signal,
}: {
  market: string;
  signal: string;
}) {
  return {
    provider: 'SutaLight',
    status: 'connected',
    gateway: env.SUTALIGHT_BASE_URL,
    market,
    signal: signal || 'neutral-market-signal',
    credentialed: Boolean(env.SUTALIGHT_API_KEY),
    summary: `SutaLight connector is active for ${market}. The next stage is to validate downstream signal strength and route it into the trading engine.`,
    nextAction: [
      'Normalize payload schema',
      'Validate against market structure',
      'Pass signal to risk filter',
      'Send decision support to front-end',
    ],
  };
}

export function buildWatchlist() {
  return [
    { symbol: 'AAPL', market: 'NASDAQ', trend: 'bullish', score: 83 },
    { symbol: 'MSFT', market: 'NASDAQ', trend: 'bullish', score: 81 },
    { symbol: 'NVDA', market: 'NASDAQ', trend: 'momentum', score: 88 },
    { symbol: 'BTC', market: 'CRYPTO', trend: 'trend', score: 76 },
    { symbol: 'ETH', market: 'CRYPTO', trend: 'volatile', score: 71 },
  ];
}

export function buildSignalSummary() {
  return [
    { symbol: 'AAPL', signal: 'bullish', score: 83, confidence: 'high' },
    { symbol: 'NVDA', signal: 'momentum', score: 88, confidence: 'high' },
    { symbol: 'BTC', signal: 'uptrend', score: 76, confidence: 'medium' },
  ];
}

export function createStrategyRecord({ title, summary, signal, risk }: { title: string; summary: string; signal: string; risk: string }) {
  const record = {
    id: crypto.randomUUID(),
    title,
    summary,
    signal,
    risk,
    createdAt: new Date().toISOString(),
  };

  return record;
}
