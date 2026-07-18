from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class MarketSnapshot:
    timestamp: datetime
    odds: list[float]
    probabilities: list[float] | None