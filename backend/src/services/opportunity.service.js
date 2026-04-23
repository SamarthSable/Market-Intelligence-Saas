import { prisma } from "../prisma.js";

export async function getOpportunities() {
  const signals = await prisma.signals.findMany({
    orderBy: {
      trade_date: "desc",
    },
    take: 50,
  });

  const result = [];

  for (const s of signals) {
    const company = await prisma.companies.findUnique({
      where: { id: s.company_id },
      include: { sectors: true },
    });

    const price = await prisma.price_data.findFirst({
      where: { company_id: s.company_id },
      orderBy: { trade_date: "desc" },
    });

    const rsi = await prisma.technical_indicators.findFirst({
      where: {
        company_id: s.company_id,
        indicator_id: 1,
      },
      orderBy: { trade_date: "desc" },
    });

    if (!price || !rsi) continue;

    // Filter out weak setups
    // if (rsi.value > 35) continue;
    // if (price.volume < 100000) continue; // low liquidity → skip

    // Scoring system (secret sauce)
    const score =
      s.confidence * 0.5 +
      (35 - Number(rsi.value)) * 2 +
      Math.log10(Number(price.volume)) * 5 +
      Math.log10(Number(company.market_cap || 1)) * 3;

    result.push({
      id: company.id,
      symbol: company.symbol,
      name: company.name,
      sector: company.sectors?.name || "Unknown",
      price: Number(price.close_price),
      volume: Number(price.volume),
      marketCap: Number(company.market_cap || 0),
      rsi: Number(rsi.value),
      confidence: s.confidence,
      score: Number(score.toFixed(2)),
    });
  }

  // Rank by score
  result.sort((a, b) => b.score - a.score);

  // Top 5 only
  return result.slice(0, 5);
}
