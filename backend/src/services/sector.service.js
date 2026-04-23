import { prisma } from "../prisma.js";

export async function getSectorPerformance() {
  const sectors = await prisma.sectors.findMany({
    include: {
      companies: true,
    },
  });

  const result = [];

  for (const sector of sectors) {
    let returns = [];

    for (const company of sector.companies) {
      const prices = await prisma.price_data.findMany({
        where: { company_id: company.id },
        orderBy: { trade_date: "desc" },
        take: 5,
      });

      if (prices.length < 5) continue;

      const latest = prices[0].close_price;
      const old = prices[4].close_price;

      const ret = ((latest - old) / old) * 100;
      returns.push(ret);
    }

    if (returns.length > 0) {
      const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
      result.push({
        sector: sector.name,
        return_5d: Number(avg.toFixed(2)),
      });
    }
  }

  return result.sort((a, b) => b.return_5d - a.return_5d);
}
