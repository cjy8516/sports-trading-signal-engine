import { motion } from "framer-motion";
import { formatPercent } from "../lib/formatters";

const FALLBACK_COLORS = ["var(--accent-cyan)", "var(--accent-amber)", "var(--accent-rose)", "var(--success)"];

function buildPath(points, width, height, minValue, maxValue) {
  if (points.length === 0) {
    return "";
  }

  const spread = maxValue - minValue || 1;
  return points
    .map((point, index) => {
      const x = (point.index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point.value - minValue) / spread) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function MarketChart({ series, colorMap = {}, height = 320, ariaLabel }) {
  const width = 820;
  const values = series.flatMap((item) => item.points.map((point) => point.value));
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 100;

  return (
    <div className="chart-frame">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = (1 - ratio) * height;
          const value = minValue + (maxValue - minValue) * ratio;
          return (
            <g key={ratio}>
              <line x1="0" x2={width} y1={y} y2={y} className="chart-grid-line" />
              <text x="10" y={Math.max(12, y - 8)} className="chart-grid-label">
                {formatPercent(value)}
              </text>
            </g>
          );
        })}

        {series.map((item, index) => {
          if (item.points.length === 0) {
            return null;
          }

          const color = colorMap[item.label] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
          const path = buildPath(item.points, width, height, minValue, maxValue);
          const latestPoint = item.points[item.points.length - 1];
          const latestX = (latestPoint.index / Math.max(item.points.length - 1, 1)) * width;
          const latestY = height - ((latestPoint.value - minValue) / (maxValue - minValue || 1)) * height;

          return (
            <g key={item.label}>
              <path d={path} fill="none" stroke={color} strokeWidth="3" className="chart-line" />
              <motion.circle
                cx={latestX}
                cy={latestY}
                r="5"
                fill={color}
                initial={{ opacity: 0.55 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
