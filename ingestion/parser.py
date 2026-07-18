from __future__ import annotations

from datetime import datetime

from domain.events import OddsUpdate


def parse_odds_update(payload: dict) -> OddsUpdate | None:
    """
    Convert a raw TxLINE payload into an OddsUpdate.

    Returns None if the payload is malformed.
    """

    timestamp = datetime.fromtimestamp(payload["Ts"] / 1000)

    outcome_names = payload["PriceNames"]

    odds = [price / 1000 for price in payload["Prices"]]

    # Ignore malformed odds updates.
    if len(odds) != len(outcome_names):
        return None

    pct = payload.get("Pct")

    implied_probabilities = (
        [float(x) for x in pct]
        if pct and all(x != "NA" for x in pct)
        else None
    )

    # Ignore malformed probability arrays.
    if (
        implied_probabilities is not None
        and len(implied_probabilities) != len(outcome_names)
    ):
        implied_probabilities = None

    return OddsUpdate(
        fixture_id=payload["FixtureId"],
        timestamp=timestamp,
        market=payload["SuperOddsType"],
        market_parameter=payload.get("MarketParameters"),
        market_period=payload.get("MarketPeriod"),
        outcome_names=outcome_names,
        odds=odds,
        implied_probabilities=implied_probabilities,
        in_running=payload.get("InRunning", False),
    )