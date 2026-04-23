import { prisma } from "../prisma.js";
import { ensureRsiIndicator } from "./indicator.service.js";

export async function generateSignals() {
  const rsiIndicator = await ensureRsiIndicator();
  const companies = await prisma.companies.findMany();

  for (const company of companies) {
    const price = await prisma.price_data.findFirst({
      where: { company_id: company.id },
      orderBy: { trade_date: "desc" },
    });

    const rsi = await prisma.technical_indicators.findFirst({
      where: { company_id: company.id, indicator_id: rsiIndicator.id },
      orderBy: { trade_date: "desc" },
    });

    if (!price || !rsi) continue;

    let signal = "HOLD";
    let confidence = 50;

    if (rsi.value < 30) {
      signal = "BUY";
      confidence = 80;
    } else if (rsi.value > 70) {
      signal = "SELL";
      confidence = 80;
    }

    await prisma.signals.upsert({
      where: {
        company_id_trade_date: {
          company_id: company.id,
          trade_date: price.trade_date,
        },
      },
      update: {
        signal_type: signal,
        confidence,
      },
      create: {
        company_id: company.id,
        trade_date: price.trade_date,
        signal_type: signal,
        confidence,
      },
    });

    console.log(`${company.symbol} -> ${signal}`);
  }
}
