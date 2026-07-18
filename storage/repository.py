from __future__ import annotations

from domain.fixture_state import FixtureState
from domain.market_state import MarketState
from domain.events import OddsUpdate


class Repository:
    """
    In-memory repository holding the latest state of every fixture.
    """

    def __init__(self) -> None:
        self._fixtures: dict[int, FixtureState] = {}

    def update(self, update: OddsUpdate) -> None:
        """
        Apply a single odds update.
        """

        fixture = self._fixtures.setdefault(
            update.fixture_id,
            FixtureState(fixture_id=update.fixture_id),
        )

        market_key = self._market_key(update)

        old_market = fixture.markets.get(market_key)

        previous_odds = None
        if old_market is not None:
            previous_odds = old_market.odds.copy()

        fixture.markets[market_key] = MarketState(
            market=update.market,
            market_parameter=update.market_parameter,
            market_period=update.market_period,
            outcome_names=update.outcome_names,
            odds=update.odds,
            previous_odds=previous_odds,
            implied_probabilities=update.implied_probabilities,
            updated_at=update.timestamp,
            in_running=update.in_running,
        )

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