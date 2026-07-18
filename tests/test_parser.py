from ingestion.parser import parse_odds_update


payload = {
    "FixtureId": 18257865,
    "Ts": 1784384890738,
    "SuperOddsType": "1X2_PARTICIPANT_RESULT",
    "MarketParameters": None,
    "MarketPeriod": None,
    "PriceNames": ["part1", "draw", "part2"],
    "Prices": [1935, 4262, 4022],
    "Pct": ["51.680", "23.463", "24.863"],
    "InRunning": False,
}

update = parse_odds_update(payload)

print(update)