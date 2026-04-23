import { getOHLC } from "./ohlc.service.js";
import { prisma } from "../prisma.js";

export async function fetchAndStorePrices() {
  const companies = await prisma.companies.findMany();
  const today = new Date();

  // We normalize the timestamp once so the daily upsert always targets the same trading-date row.
  today.setHours(0, 0, 0, 0);

  for (const company of companies) {
    try {
      // The fallback keeps live sync usable even if older seeded rows are missing api_symbol.
      const marketSymbol = company.api_symbol || `${company.symbol}:NSE`;
      const ohlc = await getOHLC(marketSymbol);

      await prisma.price_data.upsert({
        where: {
          company_id_trade_date: {
            company_id: company.id,
            trade_date: today,
          },
        },
        update: {
          open_price: ohlc.open,
          high_price: ohlc.high,
          low_price: ohlc.low,
          close_price: ohlc.close,
          volume: ohlc.volume,
        },
        create: {
          company_id: company.id,
          trade_date: today,
          open_price: ohlc.open,
          high_price: ohlc.high,
          low_price: ohlc.low,
          close_price: ohlc.close,
          volume: ohlc.volume,
        },
      });

      console.log(`Saved ${company.symbol}`);
    } catch (error) {
      // We keep the sync moving and log the symbol so it is obvious which fetch needs a retry later.
      console.error(`Latest price sync failed for ${company.symbol}: ${error.message}`);
    }
  }
}
