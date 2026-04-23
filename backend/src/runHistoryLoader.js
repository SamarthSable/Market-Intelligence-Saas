import "dotenv/config";
import { backfillPriceHistory } from "./services/history.service.js";

await backfillPriceHistory();
process.exit();
