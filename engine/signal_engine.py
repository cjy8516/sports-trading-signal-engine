from __future__ import annotations

from domain.fixture_state import FixtureState
from domain.market_state import MarketState
from domain.signal import Signal, SignalType
from .momentum import Momentum


class SignalEngine:
    """
    Generates trading signals from market momentum.

    Supports:
    - 1X2
    - Asian Handicap
    - Over / Under

    Uses the same momentum algorithm for every market.
    """

    SUPPORTED_MARKETS = {
        "1X2_PARTICIPANT_RESULT",
        "ASIANHANDICAP_PARTICIPANT_GOALS",
        "OVERUNDER_PARTICIPANT_GOALS",
    }

    # Ignore weak momentum.
    MIN_SCORE = 40

    # Strong signal threshold.
    STRONG_SIGNAL_SCORE = 70

    def generate(
        self,
        fixture_id: int,
        market: MarketState,
    ) -> list[Signal]:

        # print(
        #     f"DEBUG market={market.market} "
        #     f"parameter={market.market_parameter} "
        #     f"period={market.market_period} "
        #     f"history={len(market.history)}"
        # )

        if market.market not in self.SUPPORTED_MARKETS:
            return []

        if len(market.history) < 2:
            # print("DEBUG -> history < 2, skip")
            return []

        history = list(market.history)

        signals: list[Signal] = []

        for outcome_index, outcome in enumerate(market.outcome_names):

            velocity = Momentum.velocity(
                history=history,
                outcome_index=outcome_index,
            )

            acceleration = Momentum.acceleration(
                history=history,
                outcome_index=outcome_index,
            )

            persistence = Momentum.persistence(
                history=history,
                outcome_index=outcome_index,
            )

            score = Momentum.score(
                velocity=velocity,
                acceleration=acceleration,
                persistence=persistence,
            )

            # print(
            #     f"DEBUG outcome={outcome} | "
            #     f"v={velocity:.3f} | "
            #     f"a={acceleration:.3f} | "
            #     f"p={persistence} | "
            #     f"score={score}"
            # )

            if score < self.MIN_SCORE:
                # print("DEBUG -> score too low")
                continue

            if velocity > 0:
                signal_type = (
                    SignalType.STRONG_SHORTENING
                    if score >= self.STRONG_SIGNAL_SCORE
                    else SignalType.SHORTENING
                )
            else:
                signal_type = (
                    SignalType.STRONG_DRIFT
                    if score >= self.STRONG_SIGNAL_SCORE
                    else SignalType.DRIFT
                )

            reasons: list[str] = []

            if abs(velocity) >= 0.05:
                reasons.append(
                    f"Probability moved {velocity:+.2f}%."
                )

            if acceleration > 0:
                reasons.append(
                    "Momentum is accelerating."
                )
            elif acceleration < 0:
                reasons.append(
                    "Momentum is slowing."
                )

            if persistence >= 5:
                reasons.append(
                    f"{persistence} consecutive moves in the same direction."
                )
            elif persistence >= 3:
                reasons.append(
                    f"{persistence} consecutive moves detected."
                )

            if not reasons:
                reasons.append("Momentum detected.")

            signal = Signal(
                fixture_id=fixture_id,
                market=market.market,
                market_parameter=market.market_parameter,
                market_period=market.market_period,
                outcome=outcome,
                signal_type=signal_type,
                score=score,
                velocity=velocity,
                acceleration=acceleration,
                persistence=persistence,
                message=" ".join(reasons),
                timestamp=market.updated_at,
            )

            # print("DEBUG SIGNAL:", signal)

            signals.append(signal)

        return signals

    def generate_fixture_signals(
        self,
        fixture_id: int,
        fixture: FixtureState,
    ) -> list[Signal]:
        """
        Generate signals for every market currently available
        in a fixture.
        """

        signals: list[Signal] = []

        for market in fixture.markets.values():
            signals.extend(
                self.generate(
                    fixture_id=fixture_id,
                    market=market,
                )
            )

        return signals