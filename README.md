# STOCKX TRADEZ - AI-Powered Algorithmic Trading Platform

<div align="center">

**Built on OpenAlgo** | Self-Hosted | 36+ Broker Support | Real-Time Market Data

</div>

---

## About

STOCKX TRADEZ is a full-stack algorithmic trading platform built on top of [OpenAlgo](https://github.com/marketcalls/openalgo). It provides a unified interface to design, test, and execute trading strategies across 36+ Indian brokers and crypto exchanges.

## Features

- **Unified Broker API** - Connect TradingView, Amibroker, ChartInk, Excel, Python, and more
- **Python Strategy Host** - Write and deploy Python strategies directly from the browser
- **No-Code Flow Builder** - Drag-and-drop strategy creation with webhook triggers
- **AI Trading Agent** - Chat-based strategy assistance with live market data
- **Options Trading Suite** - Strategy Builder, Option Chain, Greeks, IV Smile, Max Pain, GEX
- **Charting Terminal** - Real-time charts with custom indicators
- **Scalping Terminal** - Keyboard-driven options scalping
- **Sandbox Mode** - Paper trading with 1 Crore virtual capital

## Supported Brokers

5Paisa, Alice Blue, Angel One, Arrow, CompositEdge, Dhan, Delta Exchange, Definedge, Firstock, Flattrade, Fyers, Groww, HDFC Securities, HDFC Sky, Ibulls, IIFL, IIFL Capital, IndMoney, JainamXTS, Kotak Securities, mStock, Motilal Oswal, Nubra, Paytm Money, Pocketful, RMoney, Samco, Shoonya, Tradejini, TradeSmart, Upstox, Wisdom Capital, Zebu, Zerodha

## Tech Stack

- **Backend:** Python 3.12+, Flask, SQLAlchemy, ZeroMQ, Eventlet
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Database:** SQLite (6 isolated databases)
- **Streaming:** WebSocket proxy, ZeroMQ bus

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- uv (Python package manager)

### Installation

```bash
git clone https://github.com/ROMEO-D4V/AlgoTradez.git
cd AlgoTradez

# Copy environment config
cp .sample.env .env

# Install dependencies
uv sync

# Start the application
uv run app.py
```

The app runs on **http://localhost:5000**

### Docker

```bash
git clone https://github.com/ROMEO-D4V/AlgoTradez.git
cd AlgoTradez
chmod +x docker-run.sh
./docker-run.sh
```

## Project Structure

```
AlgoTradez/
├── app.py                 # Flask application entry point
├── blueprints/            # Flask route handlers
├── broker/                # 36 broker plugins
├── database/              # SQLAlchemy models & migrations
├── frontend/              # React 19 SPA
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Shared UI components
│       ├── stores/        # Zustand state management
│       └── lib/           # Utilities & charting
├── services/              # Business logic layer
├── sandbox/               # Paper trading engine
├── websocket_proxy/       # Real-time data proxy
├── strategies/            # User strategies & indicators
├── test/                  # Test suite
└── upgrade/               # Database migrations
```

## Ports

| Service | Port |
|---------|------|
| Web App | 5000 |
| WebSocket Proxy | 8765 |
| ZeroMQ Bus | 5555 |

## Environment Variables

Key configurations in `.env`:

```env
# Broker
VALID_BROKERS=zerodha,angel,flattrade
BROKER_API_KEY=your_api_key
BROKER_API_SECRET=your_api_secret
REDIRECT_URL=http://localhost:5000/zerodha/callback

# Server
HOST_SERVER=http://localhost:5000
WEBSOCKET_URL=ws://localhost:8765
```

See `.sample.env` for all available options.

## Documentation

- **Full Docs:** [docs.openalgo.in](https://docs.openalgo.in)
- **Installation:** [Getting Started](https://docs.openalgo.in/installation-guidelines/getting-started)
- **API Reference:** [REST API](https://docs.openalgo.in/rest-api)

## License

Based on [OpenAlgo](https://github.com/marketcalls/openalgo) - Open Source Algorithmic Trading Platform

---

**STOCKX TRADEZ** - Trade Smarter, Trade Faster
