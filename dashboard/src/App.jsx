import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { MatchSummary } from "./components/MatchSummary";
import { OddsChart } from "./components/OddsChart";
import { FocusedMarket } from "./components/FocusedMarket";
import { SignalPanel } from "./components/SignalPanel";
import { Timeline } from "./components/Timeline";
import { ReplayControls } from "./components/ReplayControls";
import { useDashboardData } from "./hooks/useDashboardData";
import {
  buildReplayFrame,
  formatStatusLabel,
  getModeBadgeTone,
} from "./lib/dashboard";
import { getCompetitionName, getMatchTitle } from "./lib/presentation";

const REPLAY_SPEEDS = [1, 2, 5];
const REPLAY_RENDER_INTERVAL_MS = 250;

export default function App() {
  const { fixtures, fixtureOptions, replayData, liveMockData, loading, error } =
    useDashboardData();
  const [mode, setMode] = useState("replay");
  const [fixtureId, setFixtureId] = useState(null);
  const [tickIndex, setTickIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!fixtureId && fixtureOptions.length > 0) {
      setFixtureId(fixtureOptions[0].fixtureId);
    }
  }, [fixtureId, fixtureOptions]);

  const activeDataset = mode === "replay" ? replayData : liveMockData;
  const fixtureData = fixtureId ? activeDataset[fixtureId] : null;

  useEffect(() => {
    setTickIndex(0);
  }, [fixtureId, mode]);

  useEffect(() => {
    if (!fixtureData || !isPlaying) {
      return undefined;
    }

    const intervalMs = mode === "replay" ? REPLAY_RENDER_INTERVAL_MS : 1500;
    const interval = window.setInterval(() => {
      setTickIndex((current) => {
        if (!fixtureData.timeline.length) {
          return 0;
        }
        if (mode === "live") {
          return (current + 1) % fixtureData.timeline.length;
        }
        const nextTick = current + speed;
        return nextTick >= fixtureData.timeline.length - 1 ? fixtureData.timeline.length - 1 : nextTick;
      });
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [fixtureData, isPlaying, mode, speed]);

  const frame = useMemo(() => {
    if (!fixtureData) {
      return null;
    }
    return buildReplayFrame(fixtureData, tickIndex, mode);
  }, [fixtureData, tickIndex, mode]);

  const currentFixture = fixtureId ? fixtures[fixtureId] : null;
  const currentStatus = formatStatusLabel(mode, frame, currentFixture);
  const replayStartTimestamp = fixtureData?.timeline[0] ?? null;
  const replayEndTimestamp = fixtureData?.timeline[fixtureData.timeline.length - 1] ?? null;

  return (
    <div className="app-shell">
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-left" />
      <div className="bg-glow bg-glow-right" />
      <AnimatePresence mode="wait">
        <motion.div
          key={mode + (fixtureId ?? "none")}
          className="dashboard"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <DashboardHeader
            fixtureOptions={fixtureOptions}
            fixtureId={fixtureId}
            onFixtureChange={setFixtureId}
            matchTitle={getMatchTitle(currentFixture)}
            competition={getCompetitionName(currentFixture)}
            mode={mode}
            onModeChange={setMode}
            statusLabel={currentStatus}
            statusTone={getModeBadgeTone(mode)}
            replayTimestamp={frame?.currentTimestamp}
          />

          {loading ? (
            <div className="panel hero-panel">
              <p className="eyebrow">Loading Dataset</p>
              <h2>Preparing market replay and signal archives...</h2>
            </div>
          ) : error ? (
            <div className="panel hero-panel error-panel">
              <p className="eyebrow">Data Load Error</p>
              <h2>{error}</h2>
              <p>
                Replay data now comes from FastAPI. If team names are required, the API
                needs fixture metadata or a dedicated fixture endpoint.
              </p>
            </div>
          ) : frame ? (
            <>
              <main className="content-grid">
                <MatchSummary frame={frame} fixture={currentFixture} mode={mode} />
                <div className="chart-stack">
                  <OddsChart frame={frame} fixture={currentFixture} />
                  <FocusedMarket
                    frame={frame}
                    marketType="OVERUNDER_PARTICIPANT_GOALS"
                    marketLine="line=5"
                    marketId={frame.focusedMarket?.marketId}
                  />
                </div>
                <SignalPanel signals={frame.signalPanelSignals} />
              </main>

              <section className="footer-grid">
                <ReplayControls
                  mode={mode}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying((current) => !current)}
                  onRestart={() => {
                    setTickIndex(0);
                    setIsPlaying(true);
                  }}
                  speed={speed}
                  speeds={REPLAY_SPEEDS}
                  onSpeedChange={setSpeed}
                  currentIndex={tickIndex}
                  onSeek={setTickIndex}
                  currentTick={tickIndex + 1}
                  totalTicks={fixtureData.timeline.length}
                  replayTimestamp={frame.currentTimestamp}
                  replayStartTimestamp={replayStartTimestamp}
                  replayEndTimestamp={replayEndTimestamp}
                />
                <Timeline groups={frame.timelineGroups} />
              </section>
            </>
          ) : (
            <div className="panel hero-panel">
              <p className="eyebrow">Market Intelligence Console</p>
              <h2>Preparing the betting market replay.</h2>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
