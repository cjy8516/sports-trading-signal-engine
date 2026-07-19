import { formatClockTime } from "../lib/formatters";
import { MarketChart } from "./MarketChart";

const FOCUSED_COLORS = {
  over: "var(--accent-cyan)",
  under: "var(--accent-amber)",
};

export function FocusedMarket({
  frame,
  marketType = "OVERUNDER_PARTICIPANT_GOALS",
  marketLine = "line=5",
  marketId = null,
}) {
  const focusedMarket = frame.focusedMarket;
  const displayLine = focusedMarket?.marketLine ?? marketLine;

  return (
    <section className="panel focused-market-panel">
      <div className="panel-header inline-header">
        <div>
          <p className="eyebrow">Focused Market</p>
          <h2>{focusedMarket?.label ?? "Over/Under Market"} Movement</h2>
        </div>
        <div className="chart-legend">
          {(focusedMarket?.chartSeries ?? []).map((series) => (
            <div key={series.label} className="legend-item">
              <span className="legend-dot" style={{ background: FOCUSED_COLORS[series.label] }} />
              {series.label.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div className="chart-meta">
        <span>
          Over/Under implied probability for {displayLine?.replace("line=", "line ") ?? "selected line"}
        </span>
        <span>{formatClockTime(frame.currentTimestamp, true)}</span>
      </div>

      <MarketChart
        series={focusedMarket?.chartSeries ?? []}
        colorMap={FOCUSED_COLORS}
        height={220}
        ariaLabel="Focused Over Under implied probability chart"
      />
    </section>
  );
}
