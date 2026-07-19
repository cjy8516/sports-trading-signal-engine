import { useEffect, useState } from "react";
import { buildFixtureDatasets } from "../lib/dashboard";
import { parseJsonl } from "../lib/jsonl";
import { DEMO_FIXTURES } from "../lib/presentation";

async function fetchJsonl(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return parseJsonl(await response.text());
}

export function useDashboardData() {
  const [state, setState] = useState({
    fixtures: {},
    fixtureOptions: [],
    replayData: {},
    liveMockData: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [oddsRows, signalRows] = await Promise.all([
          fetchJsonl("/api/replay"),
          fetchJsonl("/api/signals"),
        ]);

        if (cancelled) {
          return;
        }

        const fixtures = DEMO_FIXTURES;
        const { fixtureOptions, replayData, liveMockData } = buildFixtureDatasets({
          fixtures,
          oddsRows,
          signalRows,
        });

        setState({
          fixtures,
          fixtureOptions,
          replayData,
          liveMockData,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            loading: false,
            error: error.message,
          }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
