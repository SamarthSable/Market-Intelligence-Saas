import "dotenv/config";
import { getAvailableSyncModes, runDataPipeline } from "./services/dataSync.service.js";

// Manual syncs keep the mode as a simple CLI argument: full, live, history, prices, indicators, or signals.
const mode = process.argv[2] || "live";

try {
  await runDataPipeline(mode);
  process.exit(0);
} catch (error) {
  console.error(error.message);
  console.error(`Available modes: ${getAvailableSyncModes().join(", ")}`);
  process.exit(1);
}
