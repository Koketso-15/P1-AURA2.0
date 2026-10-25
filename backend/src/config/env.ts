import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  AI_PROVIDER: process.env.AI_PROVIDER ?? 'openai',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  SUTALIGHT_API_KEY: process.env.SUTALIGHT_API_KEY ?? '',
  SUTALIGHT_BASE_URL: process.env.SUTALIGHT_BASE_URL ?? 'https://api.sutalight.example.com',
  JWT_SECRET: process.env.JWT_SECRET ?? 'aura-demo-secret',
  MARKET_API_KEY: process.env.MARKET_API_KEY ?? '',
  MARKET_API_BASE_URL: process.env.MARKET_API_BASE_URL ?? 'https://api.market.example.com',
};
