import "dotenv/config";
import { startDataScheduler } from "./services/dataScheduler.service.js";

const mode = process.argv[2] || "live";

// The CLI scheduler still works exactly like before, but the scheduling logic now lives in one shared place.
startDataScheduler({ mode, runImmediately: true });
