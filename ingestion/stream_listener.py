from __future__ import annotations

import json

import httpx
from httpx_sse import connect_sse

from config.settings import settings
from ingestion.parser import parse_odds_update
from storage.repository import Repository


class StreamListener:
    def __init__(self, repository: Repository) -> None:
        self._repository = repository

    def run(self) -> None:
        headers = {
            "Authorization": f"Bearer {settings.txline_jwt}",
            "X-Api-Token": settings.txline_api_token,
            "Accept-Encoding": "deflate",
        }

        with httpx.Client(base_url=settings.txline_base_url, timeout=None) as client:
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

                    update = parse_odds_update(payload)

                    self._repository.update(update)

                    print(update)

                    # ===== 调试 Repository =====
                    # fixture = self._repository.get_fixture(update.fixture_id)
                    # market_key = self._repository._market_key(update)
                    # market = fixture.markets[market_key]

                    # print("Previous:", market.previous_odds)
                    # print("Current :", market.odds)
                    # print("-" * 50)

                    