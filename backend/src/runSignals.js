import "dotenv/config";
import { generateSignals } from "./services/signal.service.js";

await generateSignals();
process.exit();
