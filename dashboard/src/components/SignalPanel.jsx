import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatClockTime, formatMetric, formatSignalType } from "../lib/formatters";
import { explainSignal } from "../lib/presentation";

const SIGNAL_RENDER_INTERVAL_MS = 500;
const MAX_VISIBLE_SIGNALS = 6;
const NEW_BADGE_MS = 800;

function eventKey(signal) {
  return [signal.signalType, signal.market, signal.outcome].join("|");
}

function aggregateSignals(signals) {
  const events = new Map();

  signals.forEach((signal) => {
    const key = eventKey(signal);
    const current = events.get(key);

    if (!current) {
      events.set(key, {
        ...signal,
        eventKey: key,
        relatedCount: 0,
        latestTimestamp: signal.timestamp,
      });
      return;
    }

    const bestSignal = signal.score > current.score ? signal : current;
    events.set(key, {
      ...bestSignal,
      eventKey: key,
      relatedCount: current.relatedCount + 1,
      latestTimestamp: signal.timestamp > current.latestTimestamp ? signal.timestamp : current.latestTimestamp,
    });
  });

  return Array.from(events.values())
    .sort((left, right) => {
      if (right.latestTimestamp !== left.latestTimestamp) {
        return right.latestTimestamp.localeCompare(left.latestTimestamp);
      }
      return right.score - left.score;
    })
    .slice(0, MAX_VISIBLE_SIGNALS);
}

function eventSignature(events) {
  return events
    .map((event) => `${event.eventKey}:${event.score}:${event.relatedCount}:${event.latestTimestamp}`)
    .join("|");
}

export function SignalPanel({ signals }) {
  const initialEvents = aggregateSignals(signals);
  const [expandedKey, setExpandedKey] = useState(null);
  const [visibleEvents, setVisibleEvents] = useState(() => initialEvents);
  const [newEventKeys, setNewEventKeys] = useState(() => new Set());
  const pendingEventsRef = useRef(initialEvents);
  const visibleSignatureRef = useRef(eventSignature(initialEvents));
  const visibleEventKeysRef = useRef(new Set(initialEvents.map((event) => event.eventKey)));

  useEffect(() => {
    pendingEventsRef.current = aggregateSignals(signals);
  }, [signals]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextEvents = pendingEventsRef.current;
      const nextSignature = eventSignature(nextEvents);

      if (nextSignature !== visibleSignatureRef.current) {
        const previousKeys = visibleEventKeysRef.current;
        const freshKeys = nextEvents
          .map((event) => event.eventKey)
          .filter((key) => !previousKeys.has(key));

        visibleSignatureRef.current = nextSignature;
        visibleEventKeysRef.current = new Set(nextEvents.map((event) => event.eventKey));
        setVisibleEvents(nextEvents);

        if (freshKeys.length > 0) {
          setNewEventKeys(new Set(freshKeys));
          window.setTimeout(() => {
            setNewEventKeys((current) => {
              const next = new Set(current);
              freshKeys.forEach((key) => next.delete(key));
              return next;
            });
          }, NEW_BADGE_MS);
        }
      }
    }, SIGNAL_RENDER_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <aside className="panel signal-panel">
      <div className="panel-header">
        <p className="eyebrow">Market Signals</p>
        <h2>Important Betting Market Movements</h2>
      </div>

      <div className="signal-list">
        <AnimatePresence initial={false}>
          {visibleEvents.map((event) => {
            const isExpanded = expandedKey === event.eventKey;
            const intensity = event.score >= 85 ? "high" : event.score >= 70 ? "mid" : "low";
            const isNew = newEventKeys.has(event.eventKey);
            return (
              <motion.button
                layout="position"
                type="button"
                key={event.eventKey}
                className={`signal-card signal-${intensity} ${isExpanded ? "expanded" : ""}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                onClick={() => setExpandedKey(isExpanded ? null : event.eventKey)}
              >
                <div className="signal-topline">
                  <span className={`signal-badge ${event.score >= 80 ? "hot" : "warm"}`}>
                    {formatSignalType(event.signalType)}
                  </span>
                  <div className="signal-score-group">
                    {isNew ? <span className="signal-new-badge">NEW</span> : null}
                    <strong>Score {event.score}</strong>
                  </div>
                </div>
                <div className="signal-core">
                  <span>{event.marketLabel}</span>
                  <span>{event.outcomeLabel}</span>
                  <span>{formatClockTime(event.latestTimestamp, true)}</span>
                </div>
                <p className="signal-explanation">{explainSignal(event.signalType)}</p>
                {event.relatedCount > 0 ? (
                  <p className="signal-related">+{event.relatedCount} related movements</p>
                ) : null}

                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      className="signal-details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      <div className="detail-grid">
                        <span>Velocity</span>
                        <strong>{formatMetric(event.velocity)}</strong>
                        <span>Acceleration</span>
                        <strong>{formatMetric(event.acceleration)}</strong>
                        <span>Persistence</span>
                        <strong>{event.persistence}</strong>
                      </div>
                      <p>{event.message}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </aside>
  );
}
