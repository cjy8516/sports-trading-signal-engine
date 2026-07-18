from ingestion.parser import parse_odds_update
from storage.repository import Repository


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

repo = Repository()

update = parse_odds_update(payload)

repo.update(update)

fixture = repo.get_fixture(18257865)

print(fixture)