from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class SignalType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    WATCH = "WATCH"


@dataclass(slots=True)
class Signal:
    fixture_id: int

    signal: SignalType

    confidence: float

    edge: float

    reason: str