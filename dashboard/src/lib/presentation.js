export const DEMO_FIXTURES = {
  "18257865": {
    part1: "France",
    draw: "Draw",
    part2: "England",
    competition: "FIFA World Cup 2026",
    status: "Replay",
  },
  "18257739": {
    part1: "Spain",
    draw: "Draw",
    part2: "Argentina",
    competition: "FIFA World Cup 2026",
    status: "Live",
  },
};

export const DEMO_FIXTURE = DEMO_FIXTURES["18257865"];

export function getDisplayFixture(fixture) {
  return fixture ?? DEMO_FIXTURE;
}

export function getMatchTitle(fixture) {
  const displayFixture = getDisplayFixture(fixture);
  return `${displayFixture.part1} vs ${displayFixture.part2}`;
}

export function getCompetitionName(fixture) {
  return getDisplayFixture(fixture).competition;
}

export function explainSignal(signalType) {
  if (signalType?.includes("STRONG_SHORTENING")) {
    return "Market confidence increased rapidly.";
  }
  if (signalType?.includes("STRONG_DRIFT")) {
    return "Market confidence weakened rapidly.";
  }
  if (signalType?.includes("SHORTENING")) {
    return "Steady buying pressure detected.";
  }
  if (signalType?.includes("DRIFT")) {
    return "Selling pressure increased.";
  }
  return "Notable market behaviour detected.";
}

export function formatWinOutcome(label) {
  return label === "Draw" ? label : `${label} Win`;
}
