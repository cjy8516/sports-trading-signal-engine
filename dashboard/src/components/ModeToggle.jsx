export function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="mode-toggle">
      <button
        type="button"
        className={mode === "replay" ? "active" : ""}
        onClick={() => onModeChange("replay")}
      >
        Replay
      </button>
      <button
        type="button"
        className="disabled"
        title="Real-time TxLINE streaming coming soon."
        disabled
      >
        Live (Coming Soon)
      </button>
    </div>
  );
}
