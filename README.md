# Sports Trading Signal Engine

<p align="center">

**Real-time Sports Betting Market Intelligence**

Detect meaningful betting market momentum from live odds rather than predicting football matches.

</p>

---

> Built for the **TxLINE Sports Trading Hackathon**

---

## Dashboard

> **(Insert dashboard screenshot here)**

```
docs/dashboard.png
```

---

# Overview

Sports Trading Signal Engine is a real-time market intelligence platform that consumes live betting odds from **TxLINE** and transforms high-frequency market updates into actionable trading signals.

Unlike traditional prediction models, this project does **not attempt to predict match outcomes**.

Instead, it analyses **betting market microstructure**, measuring how implied probabilities evolve over time and identifying meaningful momentum before presenting those movements through an interactive trading dashboard.

---

# Key Features

✓ Real-time TxLINE SSE ingestion

✓ Replay mode

✓ Live mode (API ready)

✓ Implied probability calculation

✓ Market momentum analysis

✓ Velocity

✓ Acceleration

✓ Persistence

✓ Momentum score

✓ Signal classification

✓ Interactive trading dashboard

✓ Timeline visualisation

✓ JSONL replay archive

---

# System Architecture

```text
                     +---------------------+
                     |     TxLINE SSE      |
                     +---------------------+
                                │
                                ▼
                      Stream Listener
                                │
                                ▼
                     Market Repository
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
     Match State         Rolling History     Market State
                                │
                                ▼
                      Signal Engine
                                │
      ┌─────────────────────────┼─────────────────────────┐
      ▼                         ▼                         ▼
  Velocity                Acceleration             Persistence
      │                         │                         │
      └─────────────────────────┼─────────────────────────┘
                                ▼
                    Momentum Score (0-100)
                                │
                                ▼
                     Signal Classification
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
        JSONL Replay Archive              FastAPI API
                                                 │
                                                 ▼
                                         React Dashboard
```

---

# Signal Pipeline

```text
TxLINE Odds

      │

      ▼

Remove Vig

      │

      ▼

Implied Probability

      │

      ▼

Rolling History

      │

      ▼

Velocity

      │

      ▼

Acceleration

      │

      ▼

Persistence

      │

      ▼

Momentum Score

      │

      ▼

Trading Signal

      │

      ▼

Replay Archive / Dashboard
```

---

# Dashboard Layout

```text
+---------------------------------------------------------------+
| Header                                                        |
+---------------+---------------------------+-------------------+
|               |                           |                   |
| Match Summary | Probability Chart         | Signal Panel      |
|               |                           |                   |
+---------------+---------------------------+-------------------+
|               Focused Market                                  |
+---------------------------------------------------------------+
| Replay Controls            Timeline                           |
+---------------------------------------------------------------+
```

---

# Example Signal

```text
Fixture

England vs France

Market

1X2

Signal

STRONG SHORTENING

Momentum Score

92

Reason

Velocity       +0.42%

Acceleration   +0.11%

Persistence    6
```

---

# Project Structure

```text
sports-trading-signal-engine/

├── api/
│   ├── app.py
│   └── routes.py
│
├── analysis/
│   ├── signal_engine.py
│   ├── market_movement.py
│   ├── delayed_reaction.py
│   ├── unexpected_movement.py
│   └── volatility.py
│
├── ingestion/
│   ├── stream_listener.py
│   ├── txline_client.py
│   ├── replay_loader.py
│   └── snapshot_loader.py
│
├── storage/
│   ├── repository.py
│   └── database.py
│
├── dashboard/
│
├── data/
│
└── README.md
```

---

# Getting Started

```bash
git clone ...

cd sports-trading-signal-engine
```

Install Python dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn api.app:app --reload
```

Run frontend

```bash
cd dashboard

npm install

npm run dev
```

---

# Future Work

- Live production streaming
- Historical backtesting
- Market anomaly detection
- Multi-match monitoring
- Cross-market correlation analysis
- Machine-learning assisted signal ranking

---

# Tech Stack

Backend

- Python
- FastAPI
- SSE
- Dataclasses

Frontend

- React
- Vite
- Recharts
- Framer Motion

Data

- TxLINE
- JSONL

---

# Acknowledgements

Built for the TxLINE Sports Trading Hackathon.