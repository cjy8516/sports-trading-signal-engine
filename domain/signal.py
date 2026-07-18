from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class SignalType(str, Enum):
    SHORTENING = "SHORTENING"
    DRIFT = "DRIFT"


@dataclass(slots=True)
class Signal:
    fixture_id: int
    market: str
    outcome: str
    signal_type: SignalType
    message: str
    timestamp: datetime

    def __str__(self) -> str:
        return (
            f"[{self.signal_type}] "
            f"{self.market} | "
            f"{self.outcome} | "
            f"{self.message}"
        )