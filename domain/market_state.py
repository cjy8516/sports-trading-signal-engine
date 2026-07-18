from collections import deque
from dataclasses import dataclass, field
from datetime import datetime

from domain.snapshot import MarketSnapshot


@dataclass(slots=True)
class MarketState:
    market: str
    market_parameter: str | None
    market_period: str | None

    outcome_names: list[str]

    odds: list[float]

    implied_probabilities: list[float] | None

    updated_at: datetime

    in_running: bool

    history: deque[MarketSnapshot] = field(
        default_factory=lambda: deque(maxlen=20)
    )