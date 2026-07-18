from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class SignalType(str, Enum):
    STRONG_SHORTENING = "STRONG_SHORTENING"
    SHORTENING = "SHORTENING"
    DRIFT = "DRIFT"
    STRONG_DRIFT = "STRONG_DRIFT"


@dataclass(slots=True)
class Signal:
    fixture_id: int

    # Market information
    market: str
    market_parameter: str | None
    market_period: str | None

    # Signal target
    outcome: str

    signal_type: SignalType

    # Momentum metrics
    score: int
    velocity: float
    acceleration: float
    persistence: int

    # Human-readable explanation
    message: str

    timestamp: datetime

    def __str__(self) -> str:
        market_description = self.market

        if self.market_parameter:
            market_description += f" ({self.market_parameter})"

        if self.market_period:
            market_description += f" [{self.market_period}]"

        return (
            f"[{self.signal_type}] "
            f"{market_description} | "
            f"{self.outcome} | "
            f"score={self.score} | "
            f"v={self.velocity:+.2f}% | "
            f"a={self.acceleration:+.2f}% | "
            f"p={self.persistence} | "
            f"{self.message}"
        )