import { formatClockTime, formatDecimalOdds, formatPercent } from "../lib/formatters";
import { formatWinOutcome, getCompetitionName, getMatchTitle } from "../lib/presentation";

function SummaryRow({ label, value, tone = "neutral" }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong className={`tone-${tone}`}>{value}</strong>
    </div>
  );
}

export function MatchSummary({ frame, fixture, mode }) {
  const oneXTwo = frame.currentMarket;

  return (
    <aside className="panel summary-panel">
      <div className="panel-header">
        <p className="eyebrow">Market Context</p>
        <h2>{getMatchTitle(fixture)}</h2>
      </div>

      <div className="summary-block">
        <SummaryRow label="Match" value={getMatchTitle(fixture)} />
        <SummaryRow label="Competition" value={getCompetitionName(fixture)} />
        <SummaryRow label="Mode" value={mode === "replay" ? "Historical Market Replay" : "Live Market Monitor"} />
        <SummaryRow label="Current Time" value={formatClockTime(frame.currentTimestamp, true)} />
      </div>

      <div className="summary-block">
        <p className="section-label">Current 1X2 Market</p>
        {oneXTwo?.outcomes.map((outcome) => (
          <div className="market-tile" key={outcome.label}>
            <div>
              <p>{formatWinOutcome(outcome.label)}</p>
              <span>{formatPercent(outcome.probability)}</span>
            </div>
            <strong>{formatDecimalOdds(outcome.odds)}</strong>
          </div>
        ))}
      </div>

      <div className="summary-block">
        <p className="section-label">Feed Status</p>
        <div className="status-stack">
          <SummaryRow label="Market Feed" value={frame.isInRunning ? "In-play betting market" : "Pre-match betting market"} tone="amber" />
          <SummaryRow label="Signals" value={`${frame.signalPanelSignals.length} notable movements`} />
          <SummaryRow label="Key Events" value={`${frame.timelineGroups.length} grouped moments`} />
        </div>
      </div>
    </aside>
  );
}
