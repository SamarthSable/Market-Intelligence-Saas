import { runDataPipeline } from "./dataSync.service.js";

// This tiny parser keeps the env flags readable without forcing exact true/false casing.
function readBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

export function startDataScheduler({
  mode = "live",
  intervalMinutes = Number(process.env.SYNC_INTERVAL_MINUTES || 60),
  runImmediately = true,
} = {}) {
  const safeIntervalMinutes = Math.max(Number(intervalMinutes) || 60, 1);
  const intervalMs = safeIntervalMinutes * 60 * 1000;
  let isRunning = false;

  async function tick() {
    if (isRunning) {
      // Overlapping syncs would compete for the same rows, so we simply skip this cycle.
      console.log("Previous sync is still running. Skipping this cycle.");
      return;
    }

    isRunning = true;

    try {
      await runDataPipeline(mode);
    } catch (error) {
      console.error("Scheduled sync failed:", error.message);
    } finally {
      isRunning = false;
    }
  }

  console.log(
    `Starting scheduled "${mode}" sync every ${safeIntervalMinutes} minute(s).`
  );

  if (readBoolean(runImmediately, true)) {
    void tick();
  }

  const timer = setInterval(() => {
    void tick();
  }, intervalMs);

  return () => clearInterval(timer);
}
