from __future__ import annotations

from domain.snapshot import MarketSnapshot


class Momentum:
    """
    Mathematical momentum calculations.

    No thresholds.
    No trading logic.
    """

    @staticmethod
    def velocity(
        history: list[MarketSnapshot],
        outcome_index: int,
    ) -> float:

        if len(history) < 2:
            return 0.0

        window = min(5, len(history) - 1)

        previous = history[-1 - window]
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

    @staticmethod
    def acceleration(
        history: list[MarketSnapshot],
        outcome_index: int,
    ) -> float:

        if len(history) < 3:
            return 0.0

        p1 = history[-3]
        p2 = history[-2]
        p3 = history[-1]

        if (
            p1.probabilities is None
            or p2.probabilities is None
            or p3.probabilities is None
        ):
            return 0.0

        v1 = (
            p2.probabilities[outcome_index]
            - p1.probabilities[outcome_index]
        )

        v2 = (
            p3.probabilities[outcome_index]
            - p2.probabilities[outcome_index]
        )

        return v2 - v1

    @staticmethod
    def persistence(
        history: list[MarketSnapshot],
        outcome_index: int,
    ) -> int:
        """
        Number of consecutive probability moves
        in the current direction.

        Example:

            50.0
            50.2
            50.4
            50.5

        persistence = 3
        """

        if len(history) < 2:
            return 0

        previous = history[-2]
        current = history[-1]

        if (
            previous.probabilities is None
            or current.probabilities is None
        ):
            return 0

        latest_delta = (
            current.probabilities[outcome_index]
            - previous.probabilities[outcome_index]
        )

        if latest_delta == 0:
            return 0

        direction = 1 if latest_delta > 0 else -1
        count = 1

        for i in range(len(history) - 2, 0, -1):

            current = history[i]
            previous = history[i - 1]

            if (
                current.probabilities is None
                or previous.probabilities is None
            ):
                break

            delta = (
                current.probabilities[outcome_index]
                - previous.probabilities[outcome_index]
            )

            if delta == 0:
                break

            if (delta > 0) != (direction > 0):
                break

            count += 1

        return count

    @staticmethod
    def score(
        velocity: float,
        acceleration: float,
        persistence: int,
    ) -> int:
        """
        Calculate a momentum score between 0 and 100.

        Weights:
            Velocity:      40
            Acceleration:  30
            Persistence:   30
        """

        MAX_VELOCITY = 0.10
        MAX_ACCELERATION = 0.08
        MAX_PERSISTENCE = 5

        VELOCITY_WEIGHT = 50
        ACCELERATION_WEIGHT = 15
        PERSISTENCE_WEIGHT = 35

        velocity_score = min(
            abs(velocity) / MAX_VELOCITY,
            1.0,
        ) * VELOCITY_WEIGHT

        acceleration_score = min(
            abs(acceleration) / MAX_ACCELERATION,
            1.0,
        ) * ACCELERATION_WEIGHT

        persistence_score = min(
            persistence / MAX_PERSISTENCE,
            1.0,
        ) * PERSISTENCE_WEIGHT

        return round(
            velocity_score
            + acceleration_score
            + persistence_score
        )