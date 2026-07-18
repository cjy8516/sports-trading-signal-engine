from __future__ import annotations

from dataclasses import dataclass, field

from .market_state import MarketState


@dataclass(slots=True)
class FixtureState:
    """
    Current state of a fixture.
    """

    fixture_id: int

    markets: dict[str, MarketState] = field(default_factory=dict)