import { prisma } from "../prisma.js";

function serialize(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

export async function getCompanyHistory(req, res) {
  try {
    const symbol = req.params.symbol;

    const company = await prisma.companies.findUnique({
      where: { symbol },
      select: {
        id: true,
        name: true,
        symbol: true,
        sectors: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const candles = await prisma.price_data.findMany({
      where: { company_id: company.id },
      orderBy: { trade_date: "desc" },
      take: 30,
      select: {
        trade_date: true,
        open_price: true,
        high_price: true,
        low_price: true,
        close_price: true,
        volume: true,
      },
    });

    res.json(
      serialize({
        company: {
          ...company,
          sector: company.sectors?.name || "Unknown",
        },
        candles: candles.reverse().map((candle) => ({
          date: candle.trade_date,
          open: Number(candle.open_price || 0),
          high: Number(candle.high_price || 0),
          low: Number(candle.low_price || 0),
          close: Number(candle.close_price || 0),
          volume: Number(candle.volume || 0),
        })),
      })
    );
  } catch (err) {
    console.error("Company history error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getClientSignals(req, res) {
  try {
    const signals = await prisma.signals.findMany({
      orderBy: { trade_date: "desc" },
      take: 50,
    });

    const result = [];

    for (const signal of signals) {
      const company = await prisma.companies.findUnique({
        where: { id: signal.company_id },
        select: { id: true, name: true, symbol: true },
      });

      result.push({
        ...signal,
        companies: company,
      });
    }

    res.json(serialize(result));
  } catch (err) {
    console.error("Signals error:", err);
    res.status(500).json({ error: err.message });
  }
}
