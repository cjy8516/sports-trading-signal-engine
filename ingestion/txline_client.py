from __future__ import annotations

import httpx

from config.settings import settings


class TxLineClient:
    """Thin wrapper around the TxLINE REST API."""

    def __init__(self) -> None:
        self._client = httpx.Client(
            base_url=settings.txline_base_url,
            headers={
                "Authorization": f"Bearer {settings.txline_jwt}",
                "X-Api-Token": settings.txline_api_token,
            },
            timeout=30.0,
        )

    def get(self, path: str, **kwargs):
        response = self._client.get(path, **kwargs)
        response.raise_for_status()
        return response.json()

    def close(self) -> None:
        self._client.close()