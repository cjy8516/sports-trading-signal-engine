function normalizeFixtureId(value) {
  return String(value);
}

function marketLabel(market, marketParameter) {
  if (market === "1X2_PARTICIPANT_RESULT") {
    return "1X2";
  }
  if (market === "ASIANHANDICAP_PARTICIPANT_GOALS") {
    return marketParameter ? `Asian Handicap ${marketParameter.replace("line=", "")}` : "Asian Handicap";
  }
  if (market === "OVERUNDER_PARTICIPANT_GOALS") {
    return marketParameter ? `Over/Under ${marketParameter.replace("line=", "")}` : "Over/Under";
  }
  return market;
}

function outcomeLabel(outcome, fixture) {
  if (outcome === "part1") {
    return fixture?.part1 ?? "part1";
  }
  if (outcome === "part2") {
    return fixture?.part2 ?? "part2";
  }
  if (outcome === "draw") {
    return fixture?.draw ?? "Draw";
  }
  return outcome;
}

function outcomeSeriesLabel(outcome, fixture) {
  return outcomeLabel(outcome, fixture);
}

function cloneMarketMap(map) {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, { ...value, outcomes: value.outcomes.map((item) => ({ ...item })) }]),
  );
}

function toMarketHistoryEntry(row, fixture) {
  return {
    timestamp: row.timestamp,
    market: row.market,
    marketParameter: row.market_parameter,
    marketPeriod: row.market_period,
    outcomes: row.outcome_names.map((name, index) => ({
      outcome: name,
      label: outcomeSeriesLabel(name, fixture),
      probability: row.implied_probabilities?.[index] ?? null,
    })),
  };
}

function scoreImportantSignals(signals) {
  const prioritized = signals.filter((signal) => signal.score >= 65);
  return (prioritized.length > 0 ? prioritized : signals).sort((left, right) => {
    if (right.timestamp !== left.timestamp) {
      return right.timestamp.localeCompare(left.timestamp);
    }
    return right.score - left.score;
  });
}

function getFixtureOutcomeLabels(fixture) {
  return [fixture?.part1 ?? "part1", fixture?.draw ?? "Draw", fixture?.part2 ?? "part2"];
}

function getTimelineWindow(timestamp) {
  const date = new Date(timestamp);
  date.setMilliseconds(0);
  date.setSeconds(Math.floor(date.getSeconds() / 10) * 10);
  return date.toISOString();
}

function timelineEventLabel(signal) {
  if (signal.signalType === "STRONG_SHORTENING") {
    return "Strong Shortening";
  }
  if (signal.signalType === "STRONG_DRIFT") {
    return "Strong Drift";
  }
  if (signal.signalType === "SHORTENING") {
    return "Shortening Pressure";
  }
  if (signal.signalType === "DRIFT") {
    return "Drift Pressure";
  }
  return signal.score >= 85 ? "Market Momentum Shift" : "Notable Market Movement";
}

export function buildFixtureDatasets({ fixtures, oddsRows, signalRows }) {
  const byFixture = {};

  oddsRows.forEach((row) => {
    const fixtureId = normalizeFixtureId(row.fixture_id);
    byFixture[fixtureId] ??= { odds: [], signals: [], fixture: fixtures[fixtureId] ?? null };
    byFixture[fixtureId].odds.push(row);
  });

  signalRows.forEach((row, index) => {
    const fixtureId = normalizeFixtureId(row.fixture_id);
    byFixture[fixtureId] ??= { odds: [], signals: [], fixture: fixtures[fixtureId] ?? null };
    byFixture[fixtureId].signals.push({
      ...row,
      signalType: row.signal_type ?? row.signalType,
      key: `${row.timestamp}-${row.market}-${row.outcome}-${index}`,
    });
  });

  const fixtureOptions = Object.entries(byFixture).map(([fixtureId, value]) => ({
    fixtureId,
    label: value.fixture ? `${value.fixture.part1} vs ${value.fixture.part2}` : `Market ${fixtureId}`,
  }));

  const replayData = {};
  const liveMockData = {};

  for (const [fixtureId, fixtureBundle] of Object.entries(byFixture)) {
    const sortedOdds = fixtureBundle.odds.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
    const sortedSignals = fixtureBundle.signals.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
    const timestamps = Array.from(new Set(sortedOdds.map((row) => row.timestamp).concat(sortedSignals.map((row) => row.timestamp)))).sort();
    const marketSnapshots = [];
    const signalSnapshots = [];
    const chartHistory = [];
    const focusedMarketHistory = [];
    let oddsCursor = 0;
    let signalCursor = 0;
    const currentMarketMap = {};
    const activeSignals = [];
    const fixture = fixtures[fixtureId] ?? null;

    timestamps.forEach((timestamp) => {
      while (oddsCursor < sortedOdds.length && sortedOdds[oddsCursor].timestamp <= timestamp) {
        const row = sortedOdds[oddsCursor];
        const key = [row.market, row.market_parameter ?? "", row.market_period ?? ""].join("|");
        currentMarketMap[key] = {
          market: row.market,
          marketParameter: row.market_parameter,
          marketPeriod: row.market_period,
          timestamp: row.timestamp,
          isInRunning: row.in_running,
          outcomes: row.outcome_names.map((name, index) => ({
            outcome: name,
            label: outcomeLabel(name, fixture),
            seriesLabel: outcomeSeriesLabel(name, fixture),
            odds: row.odds?.[index] ?? null,
            probability: row.implied_probabilities?.[index] ?? null,
          })),
        };

        if (row.market === "1X2_PARTICIPANT_RESULT") {
          chartHistory.push(toMarketHistoryEntry(row, fixture));
        }

        if (row.market === "OVERUNDER_PARTICIPANT_GOALS") {
          focusedMarketHistory.push(toMarketHistoryEntry(row, fixture));
        }

        oddsCursor += 1;
      }

      while (signalCursor < sortedSignals.length && sortedSignals[signalCursor].timestamp <= timestamp) {
        const row = sortedSignals[signalCursor];
        activeSignals.push({
          ...row,
          marketLabel: marketLabel(row.market, row.market_parameter),
          outcomeLabel: outcomeLabel(row.outcome, fixture),
        });
        signalCursor += 1;
      }

      marketSnapshots.push({
        timestamp,
        markets: cloneMarketMap(currentMarketMap),
      });
      signalSnapshots.push({
        timestamp,
        signals: activeSignals.slice(),
      });
    });

    replayData[fixtureId] = {
      fixture,
      timeline: timestamps,
      marketSnapshots,
      signalSnapshots,
      chartHistory,
      focusedMarketHistory,
    };

    liveMockData[fixtureId] = {
      fixture,
      timeline: timestamps.slice(Math.max(0, timestamps.length - 40)),
      marketSnapshots: marketSnapshots.slice(Math.max(0, marketSnapshots.length - 40)),
      signalSnapshots: signalSnapshots.slice(Math.max(0, signalSnapshots.length - 40)),
      chartHistory: chartHistory.slice(Math.max(0, chartHistory.length - 40)),
      focusedMarketHistory: focusedMarketHistory.slice(Math.max(0, focusedMarketHistory.length - 40)),
    };
  }

  return { fixtureOptions, replayData, liveMockData };
}

export function buildReplayFrame(fixtureData, tickIndex, mode) {
  const safeIndex = Math.min(tickIndex, Math.max(0, fixtureData.timeline.length - 1));
  const currentTimestamp = fixtureData.timeline[safeIndex];
  const marketSnapshot = fixtureData.marketSnapshots[safeIndex];
  const signalSnapshot = fixtureData.signalSnapshots[safeIndex];
  const currentMarket =
    Object.values(marketSnapshot.markets).find((market) => market.market === "1X2_PARTICIPANT_RESULT" && market.marketPeriod === null) ??
    Object.values(marketSnapshot.markets).find((market) => market.market === "1X2_PARTICIPANT_RESULT") ??
    null;

  const chartSeries = buildChartSeries({
    history: fixtureData.chartHistory,
    labels: getFixtureOutcomeLabels(fixtureData.fixture),
    currentTimestamp,
    marketPeriod: currentMarket?.marketPeriod,
  });

  const focusedMarket = buildFocusedMarketFrame({
    history: fixtureData.focusedMarketHistory,
    currentTimestamp,
    markets: marketSnapshot.markets,
    marketLine: "line=5",
  });

  const visibleSignals = scoreImportantSignals(signalSnapshot.signals).slice(0, 6);

  const groupedSignals = signalSnapshot.signals.reduce((groups, signal) => {
    const windowKey = getTimelineWindow(signal.timestamp);
    const list = groups.get(windowKey) ?? [];
    list.push(signal);
    groups.set(windowKey, list);
    return groups;
  }, new Map());

  const timelineGroups = Array.from(groupedSignals.entries())
    .sort((left, right) => right[0].localeCompare(left[0]))
    .slice(0, 10)
    .map(([timestamp, signals]) => {
      const sorted = [...signals].sort((left, right) => right.score - left.score);
      return {
        timestamp: sorted[0].timestamp,
        windowTimestamp: timestamp,
        eventLabel: timelineEventLabel(sorted[0]),
        primary: sorted[0],
        relatedCount: Math.max(0, sorted.length - 1),
        related: sorted.slice(1),
      };
    });

  return {
    mode,
    currentTimestamp,
    currentMarket,
    focusedMarket,
    chartSeries,
    signalPanelSignals: visibleSignals,
    timelineGroups,
    isInRunning: currentMarket?.isInRunning ?? false,
  };
}

function buildChartSeries({ history, labels, currentTimestamp, marketPeriod, marketParameter }) {
  return labels.map((label) => ({
    label,
    points: history
      .filter((entry) => {
        const isInTime = entry.timestamp <= currentTimestamp;
        const matchesPeriod = marketPeriod === undefined || entry.marketPeriod === marketPeriod;
        const matchesParameter = marketParameter === undefined || entry.marketParameter === marketParameter;
        return isInTime && matchesPeriod && matchesParameter;
      })
      .map((entry, index) => ({
        index,
        value: entry.outcomes.find((outcome) => outcome.label === label)?.probability ?? 0,
      }))
      .filter((point) => point.value > 0),
  }));
}

function buildFocusedMarketFrame({ history, currentTimestamp, markets, marketLine }) {
  const availableCurrentMarkets = Object.values(markets).filter(
    (market) => market.market === "OVERUNDER_PARTICIPANT_GOALS" && market.marketParameter === marketLine,
  );
  const currentFocusedMarket =
    availableCurrentMarkets.find((market) => market.marketPeriod === null) ??
    availableCurrentMarkets[0] ??
    Object.values(markets).find((market) => market.market === "OVERUNDER_PARTICIPANT_GOALS") ??
    null;

  const selectedLine = currentFocusedMarket?.marketParameter ?? marketLine;
  const selectedPeriod = currentFocusedMarket?.marketPeriod;

  return {
    marketType: "OVERUNDER_PARTICIPANT_GOALS",
    marketLine: selectedLine,
    marketId: currentFocusedMarket ? [currentFocusedMarket.market, selectedLine ?? "", selectedPeriod ?? ""].join("|") : null,
    label: selectedLine ? `Over/Under ${selectedLine.replace("line=", "")}` : "Over/Under",
    currentMarket: currentFocusedMarket,
    chartSeries: buildChartSeries({
      history,
      labels: ["over", "under"],
      currentTimestamp,
      marketPeriod: selectedPeriod,
      marketParameter: selectedLine,
    }),
  };
}

export function formatStatusLabel(mode, frame, fixture) {
  if (!frame) {
    return "Awaiting data";
  }
  if (mode === "live") {
    return `LIVE MOCK | ${fixture?.status ?? "Feed Reserved"}`;
  }
  return `REPLAY | ${frame.currentTimestamp ? new Date(frame.currentTimestamp).toLocaleTimeString("en-GB", { hour12: false }) : "Ready"}`;
}

export function formatCompetitionLabel(fixture) {
  if (!fixture) {
    return "Market Intelligence Console";
  }
  return `${fixture.competition} | ${fixture.status ?? "Replay"}`;
}

export function getModeBadgeTone(mode) {
  return mode === "replay" ? "tone-cyan" : "tone-amber";
}
