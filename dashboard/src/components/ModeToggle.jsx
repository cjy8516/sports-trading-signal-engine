export function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="mode-toggle">
      {["replay", "live"].map((option) => (
        <button
          key={option}
          type="button"
          className={mode === option ? "active" : ""}
          onClick={() => onModeChange(option)}
        >
          {option === "replay" ? "Replay" : "Live"}
        </button>
      ))}
    </div>
  );
}
