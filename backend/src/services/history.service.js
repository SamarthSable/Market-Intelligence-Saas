import { prisma } from "../prisma.js";
import { fetchYahooChart } from "./yahooChart.service.js";

export async function getHistory(symbol) {
  // The backfill path asks Yahoo for a full year so we can seed enough history for indicators.
  const result = await fetchYahooChart(symbol, {
    interval: "1d",
    range: "1y",
  });

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0];

  if (!quote) {
    throw new Error(`Yahoo returned incomplete history data for ${symbol}.`);
  }

  return timestamps.map((timestamp, index) => ({
    date: new Date(timestamp * 1000),
    open: quote.open[index],
    high: quote.high[index],
    low: quote.low[index],
    close: quote.close[index],
    volume: quote.volume[index],
  }));
}

export async function backfillPriceHistory() {
  const companies = await prisma.companies.findMany({
    select: {
      id: true,
      symbol: true,
      api_symbol: true,
    },
  });

  for (const company of companies) {
    // If api_symbol is missing we fall back to the app symbol in NSE format so the sample seed still works.
    const marketSymbol = company.api_symbol || `${company.symbol}:NSE`;

    try {
      console.log(`Loading ${company.symbol}`);
      const candles = await getHistory(marketSymbol);

      for (const candle of candles) {
        const tradeDate = new Date(candle.date);
        tradeDate.setHours(0, 0, 0, 0);

        await prisma.price_data.upsert({
          where: {
            company_id_trade_date: {
              company_id: company.id,
              trade_date: tradeDate,
            },
          },
          update: {
            open_price: candle.open,
            high_price: candle.high,
            low_price: candle.low,
            close_price: candle.close,
            volume: candle.volume,
          },
          create: {
            company_id: company.id,
            trade_date: tradeDate,
            open_price: candle.open,
            high_price: candle.high,
            low_price: candle.low,
            close_price: candle.close,
            volume: candle.volume,
          },
        });
      }

      console.log(`Done ${company.symbol}`);
    } catch (error) {
      // A single bad provider response should not stop the whole history job.
      console.error(`History sync failed for ${company.symbol}: ${error.message}`);
    }
  }
}
