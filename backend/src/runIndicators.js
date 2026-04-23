import "dotenv/config";
import { calculateIndicators } from "./services/indicator.service.js";

await calculateIndicators();
process.exit();
