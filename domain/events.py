from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class OddsUpdate:
    """
    A single odds update received from the TxLINE stream.
    """

    fixture_id: int

    timestamp: datetime

    market: str

    market_parameter: str | None

    market_period: str | None

    outcome_names: list[str]

    odds: list[float]

    implied_probabilities: list[float] | None

    in_running: bool