import { formatClockTime, formatDurationFromTimestamps } from "../lib/formatters";

export function ReplayControls({
  mode,
  isPlaying,
  onTogglePlay,
  onRestart,
  speed,
  speeds,
  onSpeedChange,
  currentIndex,
  onSeek,
  currentTick,
  totalTicks,
  replayTimestamp,
  replayStartTimestamp,
  replayEndTimestamp,
}) {
  const progress = totalTicks > 1 ? (currentIndex / (totalTicks - 1)) * 100 : 0;
  const progressLabel = `${Math.round(progress)}%`;

  return (
    <section className="panel controls-panel">
      <div className="panel-header inline-header">
        <div>
          <p className="eyebrow">{mode === "replay" ? "Market Replay" : "Live Market Feed"}</p>
          <h2>{mode === "replay" ? "Historical Betting Market Playback" : "Live Market Monitoring"}</h2>
        </div>
        <span className="replay-clock">{formatClockTime(replayTimestamp, true)}</span>
      </div>

      <div className="controls-row">
        <button type="button" className="primary-button" onClick={onTogglePlay}>
          {isPlaying ? "Pause" : "Play"}
        </button>

        {mode === "replay" ? (
          <button type="button" className="ghost-button" onClick={onRestart}>
            Restart
          </button>
        ) : null}

        {mode === "replay" ? (
          <div className="speed-buttons">
            {speeds.map((option) => (
              <button
                key={option}
                type="button"
                className={speed === option ? "active" : ""}
                onClick={() => onSpeedChange(option)}
              >
                x{option}
              </button>
            ))}
          </div>
        ) : (
          <p className="helper-copy">Live mode is reserved for future real-time market data.</p>
        )}
      </div>

      {mode === "replay" ? (
        <div className="replay-progress">
          <input
            type="range"
            min="0"
            max={Math.max(totalTicks - 1, 0)}
            value={currentIndex}
            onChange={(event) => onSeek(Number(event.target.value))}
            style={{ "--progress": `${progress}%` }}
            aria-label="Replay progress"
          />
          <div className="progress-ticks">
            <span>{formatClockTime(replayStartTimestamp, true)}</span>
            <span>{formatDurationFromTimestamps(replayStartTimestamp, replayEndTimestamp)}</span>
            <span>{formatClockTime(replayEndTimestamp, true)}</span>
          </div>
        </div>
      ) : null}

      <div className="progress-meta">
        <span className="progress-primary">
          Replay Progress {progressLabel}
        </span>
        <span>
          {currentTick} / {totalTicks} updates
        </span>
        <span>{mode === "replay" ? "Replaying historical odds updates, not match video" : "Monitoring live betting market behaviour"}</span>
      </div>
    </section>
  );
}
