# AURA 2.0

AURA 2.0 is an AI personal assistant platform for chat, data analysis, innovation workflows, and trading intelligence. This version adds a serious trading assistant layer with technical market analysis, code generation, risk review, SutaLight connectivity, and a basic authenticated user profile model for a more app-like flow.

## What is included

- AI chat assistant
- Data analysis and insight generation
- Trading assistant with market analysis
- Code maker and code breaker workflow
- SutaLight signal integration layer
- User registration and login flow with profile support
- Persistent local JSON storage for users, strategies, and signals
- React dashboard UI for trading and profile interactions

## Stack

### Backend
- Node.js
- TypeScript
- Express
- OpenAI-compatible AI layer
- Local JSON persistence layer

### Frontend
- React
- Vite
- TypeScript

## Repository structure

```text
.
├── README.md
├── .env.example
├── docker-compose.yml
├── docs/
│   └── ARCHITECTURE.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── data/
│   │   └── app-data.json
│   └── src/
│       ├── index.ts
│       ├── config/
│       │   └── env.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── chat.ts
│       │   ├── features.ts
│       │   └── trading.ts
│       └── services/
│           ├── ai.service.ts
│           ├── auth.service.ts
│           ├── market.service.ts
│           └── trading.service.ts
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       └── styles.css
└── .gitignore
```

## Quick start

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Run backend

```bash
cd backend
npm run dev
```

### 4. Run frontend

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

## Advanced trading capabilities

### Market analysis

```bash
curl -X POST http://localhost:3001/api/trading/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol":"AAPL",
    "market":"NASDAQ",
    "commentary":"Momentum is improving after a strong breakout.",
    "prices":[100,101,102,104,107,110,109,112,113,116]
  }'
```

### Code maker / breaker

```bash
curl -X POST http://localhost:3001/api/trading/code \
  -H "Content-Type: application/json" \
  -d '{
    "strategy":"Trend continuation breakout",
    "focus":"risk filtering and signal validation"
  }'
```

### SutaLight connection

```bash
curl -X POST http://localhost:3001/api/trading/sutalight \
  -H "Content-Type: application/json" \
  -d '{
    "market":"NASDAQ",
    "signal":"bullish-trend-acceleration"
  }'
```

### Authentication flow

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Trader One",
    "email":"trader@example.com",
    "password":"demo123"
  }'
```

## Features added in this upgrade

- real technical indicator logic for SMA, RSI, and MACD
- local strategy persistence with JSON store
- user profile and login flow
- watchlist and signal summaries
- modular API and service architecture
- live market API hook path with fallback demo data

## Roadmap

- add database-backed persistence (Postgres / SQLite)
- add charting with Recharts or TradingView widgets
- add real market data sources (Polygon, Alpha Vantage, Finnhub)
- add user watchlists, notifications, and vaults
- add strategy simulation and backtesting engine
- add authentication with JWT refresh tokens and roles

This is now a much more realistic AI trading assistant platform starter with a cleaner architecture and more meaningful workflows.
