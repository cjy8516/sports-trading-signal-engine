from __future__ import annotations

from domain.market_state import MarketState
from domain.signal import Signal, SignalType
from .momentum import Momentum


class SignalEngine:
    """
    Generates trading signals from market momentum.

    V1
    ---
    * Only analyses the 1X2 market.
    * Uses probability velocity.
    * Ignores insignificant movements.
    """

    MARKET = "1X2_PARTICIPANT_RESULT"

    # Ignore movements smaller than 0.10 percentage points.
    MIN_PROBABILITY_CHANGE = 0.10

    def generate(
        self,
        fixture_id: int,
        market: MarketState,
    ) -> list[Signal]:

        if market.market != self.MARKET:
            return []

        if len(market.history) < 2:
            return []

        signals: list[Signal] = []

        history = list(market.history)

        for outcome_index, outcome in enumerate(market.outcome_names):

            velocity = Momentum.velocity(
                history=history,
                outcome_index=outcome_index,
            )

            if abs(velocity) < self.MIN_PROBABILITY_CHANGE:
                continue

            signal_type = (
                SignalType.SHORTENING
                if velocity > 0
                else SignalType.DRIFT
            )

            signals.append(
                Signal(
                    fixture_id=fixture_id,
                    market=market.market,
                    outcome=outcome,
                    signal_type=signal_type,
                    message=(
                        f"{outcome}: "
                        f"velocity={velocity:+.2f}%"
                    ),
                    timestamp=market.updated_at,
                )
            )

        return signals