import { backfillPriceHistory } from "./history.service.js";
import { fetchAndStorePrices } from "./priceFetcher.js";
import { calculateIndicators } from "./indicator.service.js";
import { generateSignals } from "./signal.service.js";

// Each mode is just a named set of steps so we can reuse the same pipeline for manual runs and scheduling.
const PIPELINES = {
  full: [
    { name: "Backfill price history", run: backfillPriceHistory },
    { name: "Fetch latest prices", run: fetchAndStorePrices },
    { name: "Calculate indicators", run: calculateIndicators },
    { name: "Generate signals", run: generateSignals },
  ],
  live: [
    { name: "Fetch latest prices", run: fetchAndStorePrices },
    { name: "Calculate indicators", run: calculateIndicators },
    { name: "Generate signals", run: generateSignals },
  ],
  history: [{ name: "Backfill price history", run: backfillPriceHistory }],
  prices: [{ name: "Fetch latest prices", run: fetchAndStorePrices }],
  indicators: [{ name: "Calculate indicators", run: calculateIndicators }],
  signals: [{ name: "Generate signals", run: generateSignals }],
};

export function getAvailableSyncModes() {
  return Object.keys(PIPELINES);
}

export async function runDataPipeline(mode = "live") {
  const normalizedMode = String(mode || "live").toLowerCase();
  const steps = PIPELINES[normalizedMode];

  if (!steps) {
    throw new Error(
      `Unknown sync mode "${mode}". Available modes: ${getAvailableSyncModes().join(", ")}`
    );
  }

  console.log(`Starting data sync in "${normalizedMode}" mode...`);

  for (const step of steps) {
    const startedAt = Date.now();
    console.log(`\n[SYNC] ${step.name}`);
    await step.run();
    console.log(`[DONE] ${step.name} in ${Date.now() - startedAt}ms`);
  }

  console.log(`\nData sync completed for "${normalizedMode}" mode.`);
}
