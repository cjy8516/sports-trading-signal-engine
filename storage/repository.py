from __future__ import annotations

from collections import deque

from domain.events import OddsUpdate
from domain.fixture_state import FixtureState
from domain.market_state import MarketState
from domain.snapshot import MarketSnapshot


class Repository:
    """
    In-memory repository holding the latest state of every fixture.
    """

    def __init__(self) -> None:
        self._fixtures: dict[int, FixtureState] = {}

    def update(self, update: OddsUpdate) -> MarketState:
        """
        Apply a single odds update.
        """

        fixture = self._fixtures.setdefault(
            update.fixture_id,
            FixtureState(fixture_id=update.fixture_id),
        )

        market_key = self._market_key(update)

        old_market = fixture.markets.get(market_key)

        if old_market is None:
            history: deque[MarketSnapshot] = deque(maxlen=20)
        else:
            history = old_market.history

        # Always ensure probabilities are available.
        if update.implied_probabilities is not None:
            probabilities = update.implied_probabilities.copy()
        else:
            inverse = [1.0 / odd for odd in update.odds]
            total = sum(inverse)

            probabilities = [
                value / total * 100.0
                for value in inverse
            ]

        history.append(
            MarketSnapshot(
                timestamp=update.timestamp,
                odds=update.odds.copy(),
                probabilities=probabilities,
            )
        )

        market_state = MarketState(
            market=update.market,
            market_parameter=update.market_parameter,
            market_period=update.market_period,
            outcome_names=update.outcome_names,
            odds=update.odds.copy(),
            implied_probabilities=probabilities,
            updated_at=update.timestamp,
            in_running=update.in_running,
            history=history,
        )

        fixture.markets[market_key] = market_state

        return market_state

    def get_fixture(self, fixture_id: int) -> FixtureState | None:
        return self._fixtures.get(fixture_id)

    def all_fixtures(self) -> list[FixtureState]:
        return list(self._fixtures.values())

    @staticmethod
    def _market_key(update: OddsUpdate) -> str:
        """
        Generate a unique key for one betting market.
        """

        parts = [update.market]

        if update.market_period:
            parts.append(update.market_period)

        if update.market_parameter:
            parts.append(update.market_parameter)

        return "|".join(parts)