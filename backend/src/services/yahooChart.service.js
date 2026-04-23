import axios from "axios";

// Yahoo tends to reject plain script traffic sometimes, so we send headers that look closer to a browser.
const yahooChartClient = axios.create({
  baseURL: "https://query1.finance.yahoo.com/v8/finance/chart",
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://finance.yahoo.com/",
    Origin: "https://finance.yahoo.com",
  },
});

function normalizeYahooSymbol(symbol) {
  return String(symbol || "").replace(":NSE", ".NS");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry only for temporary provider issues so we do not hide real data bugs.
function shouldRetry(status) {
  return [429, 500, 502, 503, 504].includes(Number(status));
}

export async function fetchYahooChart(symbol, { interval = "1d", range = "5d" } = {}) {
  const yahooSymbol = normalizeYahooSymbol(symbol);
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const res = await yahooChartClient.get(`/${yahooSymbol}`, {
        params: { interval, range },
      });

      const result = res.data?.chart?.result?.[0];

      if (!result) {
        throw new Error(`Yahoo returned no chart data for ${yahooSymbol}.`);
      }

      return result;
    } catch (error) {
      const status = error.response?.status;
      const isLastAttempt = attempt === maxAttempts;

      if (!isLastAttempt && shouldRetry(status)) {
        await sleep(attempt * 1200);
        continue;
      }

      throw new Error(
        `Yahoo chart request failed for ${yahooSymbol}${status ? ` with status ${status}` : ""}.`
      );
    }
  }

  throw new Error(`Yahoo chart request failed for ${yahooSymbol}.`);
}
