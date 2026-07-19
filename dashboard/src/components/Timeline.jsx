import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { formatClockTime, formatSignalType } from "../lib/formatters";

export function Timeline({ groups }) {
  const [openGroup, setOpenGroup] = useState(null);

  return (
    <section className="panel timeline-panel">
      <div className="panel-header">
        <p className="eyebrow">Key Market Events</p>
        <h2>Timeline of Notable Market Behaviour</h2>
      </div>

      <div className="timeline-list">
        {groups.map((group) => {
          const isOpen = openGroup === group.timestamp;
          return (
            <div className="timeline-item" key={group.timestamp}>
              <span className={`timeline-node ${group.primary.score >= 80 ? "hot" : ""}`} />
              <button type="button" className="timeline-main" onClick={() => setOpenGroup(isOpen ? null : group.timestamp)}>
                <div className="timeline-time">{formatClockTime(group.timestamp)}</div>
                <div className="timeline-content">
                  <strong>{group.eventLabel ?? formatSignalType(group.primary.signalType)}</strong>
                  <span>
                    {group.primary.marketLabel} / {group.primary.outcomeLabel}
                  </span>
                  {group.relatedCount > 0 ? (
                    <em>+{group.relatedCount} signals</em>
                  ) : null}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    className="timeline-related"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {group.related.map((signal) => (
                      <div key={signal.key} className="timeline-related-card">
                        <strong>{formatSignalType(signal.signalType)}</strong>
                        <span>{signal.marketLabel}</span>
                        <span>{signal.outcomeLabel}</span>
                        <span>Score {signal.score}</span>
                      </div>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
