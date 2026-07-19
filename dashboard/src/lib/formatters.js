export function formatClockTime(timestamp, withSeconds = false) {
  if (!timestamp) {
    return "--:--";
  }
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: false,
  }).format(date);
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }
  return `${value.toFixed(2)}%`;
}

export function formatDecimalOdds(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }
  return value.toFixed(3);
}

export function formatMetric(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }
  return `${value >= 0 ? "+" : ""}${value.toFixed(3)}`;
}

export function formatSignalType(signalType) {
  return (signalType ?? "UNKNOWN_SIGNAL").replaceAll("_", " ");
}

export function formatDurationFromTimestamps(startTimestamp, endTimestamp) {
  if (!startTimestamp || !endTimestamp) {
    return "--:--";
  }

  const durationSeconds = Math.max(0, Math.round((new Date(endTimestamp) - new Date(startTimestamp)) / 1000));
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
