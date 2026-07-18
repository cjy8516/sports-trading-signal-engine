from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class MarketState:
    """
    Latest state of a single betting market.
    """

    market: str

    market_parameter: str | None

    market_period: str | None

    outcome_names: list[str]

    odds: list[float]

    implied_probabilities: list[float] | None

    updated_at: datetime

    in_running: bool

    previous_odds: list[float] | None = None