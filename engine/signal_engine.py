from __future__ import annotations

from domain.fixture_state import FixtureState
from domain.signal import Signal, SignalType


class SignalEngine:
    """
    Very simple rule-based signal engine.

    Looks only at the 1X2 market.
    """

    MARKET = "1X2_PARTICIPANT_RESULT"

    def evaluate(self, fixture: FixtureState) -> Signal | None:
        market = fixture.markets.get(self.MARKET)

        if market is None:
            return None

        previous = getattr(market, "previous_odds", None)

        # first update, nothing to compare
        if previous is None:
            return Signal(
                fixture_id=fixture.fixture_id,
                signal=SignalType.WATCH,
                confidence=0.0,
                edge=0.0,
                reason="Waiting for another odds update.",
            )

        current = market.odds

        # Home odds only (part1)
        previous_home = previous[0]
        current_home = current[0]

        change = (previous_home - current_home) / previous_home

        if change >= 0.03:
            return Signal(
                fixture_id=fixture.fixture_id,
                signal=SignalType.BUY,
                confidence=min(change * 20, 0.99),
                edge=change,
                reason=f"Home odds shortened by {change:.1%}",
            )

        if change <= -0.03:
            return Signal(
                fixture_id=fixture.fixture_id,
                signal=SignalType.SELL,
                confidence=min(abs(change) * 20, 0.99),
                edge=abs(change),
                reason=f"Home odds drifted by {abs(change):.1%}",
            )

        return Signal(
            fixture_id=fixture.fixture_id,
            signal=SignalType.WATCH,
            confidence=0.5,
            edge=abs(change),
            reason="No significant movement.",
        )