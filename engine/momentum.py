from __future__ import annotations

from domain.snapshot import MarketSnapshot


class Momentum:
    """
    Mathematical metrics computed from market history.

    No signals.
    No thresholds.
    No business logic.
    """

    @staticmethod
    def velocity(
        history: list[MarketSnapshot],
        outcome_index: int,
    ) -> float:
        """
        Probability change over the latest two snapshots.

        Positive = shortening.
        Negative = drifting.
        """

        if len(history) < 2:
            return 0.0

        previous = history[-2]
        current = history[-1]

        if (
            previous.probabilities is None
            or current.probabilities is None
        ):
            return 0.0

        return (
            current.probabilities[outcome_index]
            - previous.probabilities[outcome_index]
        )