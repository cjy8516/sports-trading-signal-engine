import { motion } from "framer-motion";
import { formatClockTime } from "../lib/formatters";
import { ModeToggle } from "./ModeToggle";

export function DashboardHeader({
  fixtureOptions,
  fixtureId,
  onFixtureChange,
  matchTitle,
  competition,
  mode,
  onModeChange,
  statusLabel,
  statusTone,
  replayTimestamp,
}) {
  return (
    <header className="panel header-panel">
      <div className="header-copy">
        <p className="eyebrow">Sports Betting Market Intelligence</p>
        <h1>{matchTitle}</h1>
        <p className="header-subtitle">{competition}</p>
        <p className="header-description">
          Detecting significant betting market movements in real time. Market behaviour, not match prediction.
        </p>
        <div className="header-meta-strip">
          <span>{mode === "replay" ? "Replay Mode" : "Live Mode"}</span>
          <span>Market Microstructure Analysis</span>
          <span>{formatClockTime(replayTimestamp, true)}</span>
        </div>
      </div>

      <div className="header-actions">
        {fixtureOptions.length > 1 ? (
          <label className="fixture-select">
          <span>Match</span>
          <select value={fixtureId ?? ""} onChange={(event) => onFixtureChange(event.target.value)}>
            {fixtureOptions.map((fixture) => (
              <option key={fixture.fixtureId} value={fixture.fixtureId}>
                {fixture.label}
              </option>
            ))}
          </select>
          </label>
        ) : null}

        <ModeToggle mode={mode} onModeChange={onModeChange} />

        <motion.div
          className={`status-chip ${statusTone}`}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
        >
          <span className="status-dot" />
          {statusLabel}
        </motion.div>
      </div>
    </header>
  );
}
