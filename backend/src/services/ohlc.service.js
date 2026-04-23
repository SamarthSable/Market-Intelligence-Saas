import { fetchYahooChart } from "./yahooChart.service.js";

export async function getOHLC(symbol) {
  // The live sync only needs a short recent window, so 5 days is enough to grab the latest candle cleanly.
  const data = await fetchYahooChart(symbol, {
    interval: "1d",
    range: "5d",
  });

  const quote = data.indicators.quote[0];
  const idx = quote.close.length - 1;

  return {
    open: quote.open[idx],
    high: quote.high[idx],
    low: quote.low[idx],
    close: quote.close[idx],
    volume: quote.volume[idx],
  };
}
