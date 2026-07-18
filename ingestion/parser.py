from __future__ import annotations

from datetime import datetime

from domain.events import OddsUpdate


def parse_odds_update(payload: dict) -> OddsUpdate:
    """
    Convert a raw TxLINE payload into an OddsUpdate.
    """

    timestamp = datetime.fromtimestamp(payload["Ts"] / 1000)

    odds = [price / 1000 for price in payload["Prices"]]

    pct = payload.get("Pct")

    implied_probabilities = (
        [float(x) for x in pct]
        if pct and all(x != "NA" for x in pct)
        else None
    )

    return OddsUpdate(
        fixture_id=payload["FixtureId"],
        timestamp=timestamp,
        market=payload["SuperOddsType"],
        market_parameter=payload.get("MarketParameters"),
        market_period=payload.get("MarketPeriod"),
        outcome_names=payload["PriceNames"],
        odds=odds,
        implied_probabilities=implied_probabilities,
        in_running=payload.get("InRunning", False),
    )