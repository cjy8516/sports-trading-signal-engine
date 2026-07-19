import { formatClockTime } from "../lib/formatters";
import { formatWinOutcome, getDisplayFixture } from "../lib/presentation";
import { MarketChart } from "./MarketChart";

function relabelSeries(series) {
  return series.map((item) => ({ ...item, label: formatWinOutcome(item.label) }));
}

function relabelColorMap(series) {
  const colors = ["var(--accent-cyan)", "var(--accent-amber)", "var(--accent-rose)"];
  return Object.fromEntries(series.map((item, index) => [item.label, colors[index] ?? colors[0]]));
}

export function OddsChart({ frame, fixture }) {
  const displayFixture = getDisplayFixture(fixture);
  const displaySeries = relabelSeries(frame.chartSeries);
  const colorMap = relabelColorMap(displaySeries);

  return (
    <section className="panel chart-panel">
      <div className="panel-header inline-header">
        <div>
          <p className="eyebrow">Implied Win Probability</p>
          <h2>1X2 Market Movement</h2>
        </div>
        <div className="chart-legend">
          {displaySeries.map((series) => (
            <div key={series.label} className="legend-item">
              <span className="legend-dot" style={{ background: colorMap[series.label] }} />
              {series.label}
            </div>
          ))}
        </div>
      </div>

      <div className="chart-meta">
        <span>
          {formatWinOutcome(displayFixture.part1)} / {displayFixture.draw} / {formatWinOutcome(displayFixture.part2)}. Odds converted into implied market probability.
        </span>
        <span>{formatClockTime(frame.currentTimestamp, true)}</span>
      </div>

      <MarketChart
        series={displaySeries}
        colorMap={colorMap}
        ariaLabel="1X2 implied probability chart"
      />
    </section>
  );
}
