from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from domain.signal import Signal


class SignalArchive:
    """
    Persist every Signal as JSON Lines.

    One signal = one line.
    """

    def __init__(self, path: str | Path) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)

        self._file = self._path.open(
            "a",
            encoding="utf-8",
        )

    def record(self, signal: Signal) -> None:
        data = asdict(signal)

        data["timestamp"] = signal.timestamp.isoformat()

        json.dump(
            data,
            self._file,
            separators=(",", ":"),
        )

        self._file.write("\n")

        self._file.flush()

    def close(self) -> None:
        self._file.close()