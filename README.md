# README.md

# Sports Trading Signal Engine

A real-time sports trading signal engine that detects momentum-driven movements in live betting markets.

---

# Motivation

Sports betting markets update continuously throughout a match.

Rather than reacting to a single odds movement, this project analyses short-term market behaviour and identifies meaningful momentum using multiple quantitative indicators.

The goal is to surface trading signals from live market dynamics.

---

# Features

- Live TxLINE Server-Sent Events (SSE) ingestion
- Market repository with rolling history
- Automatic implied probability calculation
- Momentum analysis
  - Velocity
  - Acceleration
  - Persistence
- Real-time signal generation
- JSONL market archive
- JSONL signal archive
- Live UI (hackathon demo)

---

# Architecture

```
TxLINE SSE
      │
      ▼
Parser
      │
      ▼
Repository
      │
      ▼
Signal Engine
      │
      ├── Velocity
      ├── Acceleration
      └── Persistence
      │
      ▼
Signals
      │
      ├── Archive
      └── UI
```

Each component has a single responsibility, making the system easy to extend while remaining simple enough for a hackathon MVP.

---

# Momentum Model

Momentum is calculated using three metrics.

## Velocity

Measures the change in implied probability over a short rolling window.

## Acceleration

Measures whether market movement is speeding up or slowing down.

## Persistence

Measures how many consecutive updates move in the same direction.

These metrics are combined into a weighted momentum score between 0 and 100.

---

# Example Signal

```
Fixture:
Spain vs Argentina

Market:
Over 2.5 Goals

Signal:
STRONG_SHORTENING

Score:
92

Reason:
Velocity +0.82%
Acceleration +0.18%
Persistence 6
```

---

# Future Work

- Richer UI
- Historical backtesting
- Additional signal models
- Automated testing
- Performance optimisation

---

# Tech Stack

- Python
- Server-Sent Events (SSE)
- Dataclasses
- JSONL