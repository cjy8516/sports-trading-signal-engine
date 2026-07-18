from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from domain.events import OddsUpdate


class MarketArchive:
    """
    Persist every OddsUpdate as JSON Lines.

    One update = one line.
    """

    def __init__(self, path: str | Path) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)

        self._file = self._path.open(
            "a",
            encoding="utf-8",
        )

    def record(self, update: OddsUpdate) -> None:
        data = asdict(update)

        data["timestamp"] = update.timestamp.isoformat()

        json.dump(
            data,
            self._file,
            separators=(",", ":"),
        )

        self._file.write("\n")

        self._file.flush()

    def close(self) -> None:
        self._file.close()