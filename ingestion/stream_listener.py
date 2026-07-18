from __future__ import annotations
from storage.archive import MarketArchive
import json
import httpx
from httpx_sse import connect_sse
from config.settings import settings
from engine.signal_engine import SignalEngine
from ingestion.parser import parse_odds_update
from storage.repository import Repository
from datetime import datetime
from storage.signal_archive import SignalArchive


class StreamListener:
    def __init__(self, repository: Repository) -> None:
        self._repository = repository
        self._signal_engine = SignalEngine()

        today = datetime.now().strftime("%Y%m%d")

        self._archive = MarketArchive(
    f"data/{today}.jsonl")

        self._signal_archive = SignalArchive(
    f"data/{today}_signals.jsonl"
)
      

    def run(self) -> None:
        headers = {
            "Authorization": f"Bearer {settings.txline_jwt}",
            "X-Api-Token": settings.txline_api_token,
            "Accept-Encoding": "deflate",
        }

        with httpx.Client(
            base_url=settings.txline_base_url,
            timeout=None,
        ) as client:

            with connect_sse(
                client,
                method="GET",
                url="/odds/stream",
                headers=headers,
            ) as event_source:

                print("Connected to TxLINE odds stream.")

                for event in event_source.iter_sse():

                    payload = json.loads(event.data)

                    # Heartbeat
                    if "Prices" not in payload:
                        print("Heartbeat:", payload)
                        continue

                    try:
                        update = parse_odds_update(payload)
                    except ValueError:
                        continue

                    self._archive.record(update)

                    market = self._repository.update(update)

                    signals = self._signal_engine.generate(
                        fixture_id=update.fixture_id,
                        market=market,
)
                    print(update)

                    for signal in signals:
                        print(signal)
                        self._signal_archive.record(signal)