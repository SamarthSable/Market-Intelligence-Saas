import "dotenv/config";
import app from "./src/app.js";
import { connectMongo } from "./src/config/mongodb.js";
import { runDataPipeline } from "./src/services/dataSync.service.js";
import { startDataScheduler } from "./src/services/dataScheduler.service.js";

function readBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

async function bootstrap() {
  // Keeping the main server entry at the backend root makes the startup path easier to spot.
  const PORT = Number(process.env.PORT || 5000);
  const shouldAutoSyncOnStart = readBoolean(process.env.AUTO_SYNC_ON_START, true);
  const shouldStartScheduler = readBoolean(
    process.env.AUTO_SYNC_SCHEDULE_ON_START,
    false
  );
  const schedulerMode = process.env.SYNC_STARTUP_MODE || "live";

  await connectMongo();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    if (shouldAutoSyncOnStart) {
      // We run this in the background so the API can start serving immediately.
      void runDataPipeline("live").catch((error) => {
        console.error("Startup live sync failed:", error.message);
      });
    }

    if (shouldStartScheduler) {
      // The scheduler starts after boot, but without an immediate tick when startup sync already ran.
      startDataScheduler({
        mode: schedulerMode,
        runImmediately: !shouldAutoSyncOnStart,
      });
    }
  });
}

try {
  await bootstrap();
} catch (error) {
  console.error("Fatal startup error:", error);
  process.exit(1);
}
