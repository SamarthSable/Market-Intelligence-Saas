import "dotenv/config";
import { fetchAndStorePrices } from "./services/priceFetcher.js";

await fetchAndStorePrices();
process.exit();
