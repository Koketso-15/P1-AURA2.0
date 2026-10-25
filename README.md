# P1-AURA2.0

This is a startup-ready AURA 2.0 application focused on a personal AI assistant with trading intelligence. It includes chat, input analysis, trading modules, code review strategy logic, user auth, and a SutaLight connector layer.

## Features

- AI chat conversations
- Market analysis assistant
- Code-maker and code-breaker strategy tooling
- SutaLight integration stub
- User register/login flow
- Watchlist + signal dashboards
- Technical indicator logic (SMA, RSI, MACD)

## Stack

### Backend
- Node.js
- TypeScript
- Express
- JWT-based demo auth
- JSON storage for user and strategy records

### Frontend
- React + TypeScript
- Vite

## Local setup

```bash
cd backend && npm install
cd ../frontend && npm install
```

Create environment variables:

```bash
cp .env.example .env
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

## API overview

### Chat

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Analyze this market setup for breakout potential."}'
```

### Trading analysis

```bash
curl -X POST http://localhost:3001/api/trading/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","market":"NASDAQ","commentary":"Momentum is improving after a strong breakout."}'
```

### Code generation

```bash
curl -X POST http://localhost:3001/api/trading/code \
  -H "Content-Type: application/json" \
  -d '{"strategy":"Trend continuation breakout","focus":"risk filtering and signal validation"}'
```

### User registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Trader One","email":"trader@example.com","password":"demo123"}'
```

## Roadmap

- connect live market data feeds
- add real charting and watchlists
- add DB persistence
- add strategy backtesting and alerts
- add production-grade auth and roles
- connect real SutaLight API

This version is a stronger trading AI starter with working structure and useful architecture.
