import { prisma } from "../prisma.js";

export async function getDashboard() {
  const companies = await prisma.companies.findMany({
    include: { sectors: true },
  });

  const portfolio = [];

  for (const company of companies) {
    // Latest price
    const prices = await prisma.price_data.findMany({
      where: { company_id: company.id },
      orderBy: { trade_date: "desc" },
      take: 2,
    });

    if (prices.length === 0) continue;

    const latest = prices[0];
    const prev = prices[1];

    const change =
      prev && prev.close_price
        ? ((latest.close_price - prev.close_price) / prev.close_price) * 100
        : 0;

    // Latest RSI
    const rsi = await prisma.technical_indicators.findFirst({
      where: { company_id: company.id, indicator_id: 1 },
      orderBy: { trade_date: "desc" },
    });

    // Latest Signal
    const signal = await prisma.signals.findFirst({
      where: { company_id: company.id },
      orderBy: { trade_date: "desc" },
    });

    portfolio.push({
      id: company.id,
      symbol: company.symbol,
      name: company.name,
      sector: company.sectors?.name || "Unknown",
      price: Number(latest.close_price),
      volume: Number(latest.volume || 0),
      change: Number(change.toFixed(2)),
      rsi: rsi ? Number(rsi.value) : null,
      signal: signal?.signal_type || "HOLD",
      confidence: signal?.confidence || 0,
    });
  }

  return {
    portfolio,
  };
}
