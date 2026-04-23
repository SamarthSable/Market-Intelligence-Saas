import { prisma } from "../prisma.js";
import { serialize } from "../utils/serialize.js";
import { getSectorPerformance } from "./sector.service.js";

function calculateChange(prices = []) {
  if (prices.length < 2) {
    return 0;
  }

  const latest = Number(prices[0]?.close_price || 0);
  const previous = Number(prices[1]?.close_price || 0);

  if (!previous) {
    return 0;
  }

  return Number((((latest - previous) / previous) * 100).toFixed(2));
}

export async function getAnalystInsightsData(userId) {
  const [recentReports, sectorLeaders, signals, counts] = await Promise.all([
    prisma.reports.findMany({
      where: { analyst_id: userId },
      include: {
        sectors: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { published_at: "desc" },
      take: 5,
    }),
    getSectorPerformance(),
    prisma.signals.findMany({
      orderBy: [{ trade_date: "desc" }, { confidence: "desc" }],
      take: 8,
    }),
    prisma.reports.groupBy({
      by: ["status"],
      where: { analyst_id: userId },
      _count: {
        status: true,
      },
    }),
  ]);

  const companyIds = [...new Set(signals.map((signal) => signal.company_id).filter(Boolean))];

  const [companies, priceSnapshots] = await Promise.all([
    companyIds.length
      ? prisma.companies.findMany({
          where: { id: { in: companyIds } },
          include: {
            sectors: {
              select: {
                name: true,
              },
            },
          },
        })
      : [],
    Promise.all(
      companyIds.map(async (companyId) => {
        const prices = await prisma.price_data.findMany({
          where: { company_id: companyId },
          orderBy: { trade_date: "desc" },
          take: 2,
          select: {
            close_price: true,
            trade_date: true,
          },
        });

        return [companyId, prices];
      })
    ),
  ]);

  const companyMap = new Map(companies.map((company) => [company.id, company]));
  const priceMap = new Map(priceSnapshots);

  const signalBoard = signals.map((signal) => {
    const company = companyMap.get(signal.company_id);
    const prices = priceMap.get(signal.company_id) || [];

    return {
      id: signal.id,
      symbol: company?.symbol || "N/A",
      name: company?.name || "Unknown Company",
      sector: company?.sectors?.name || "Unknown Sector",
      signal: signal.signal_type || "HOLD",
      confidence: Number(signal.confidence || 0),
      trade_date: signal.trade_date,
      close: Number(prices[0]?.close_price || 0),
      change: calculateChange(prices),
    };
  });

  const countMap = counts.reduce((acc, entry) => {
    acc[entry.status] = entry._count.status;
    return acc;
  }, {});

  const totalReports = counts.reduce((sum, entry) => sum + entry._count.status, 0);

  const marketSummary = {
    latestTradeDate: signalBoard[0]?.trade_date || null,
    buySignals: signalBoard.filter((signal) => signal.signal === "BUY").length,
    sellSignals: signalBoard.filter((signal) => signal.signal === "SELL").length,
    holdSignals: signalBoard.filter((signal) => signal.signal === "HOLD").length,
    averageConfidence: signalBoard.length
      ? Math.round(
          signalBoard.reduce((sum, signal) => sum + Number(signal.confidence || 0), 0) /
            signalBoard.length
        )
      : 0,
    topSector: sectorLeaders[0] || null,
  };

  const draftPrompts = [
    ...sectorLeaders.slice(0, 2).map((sector) => ({
      id: `sector-${sector.sector}`,
      label: `${sector.sector} momentum`,
      snippet: `${sector.sector} is currently one of the strongest sectors in the tracked universe, posting a ${sector.return_5d}% move over the last five sessions. This note should assess whether leadership is broad-based, earnings-driven, or a short-term rotation trade.`,
    })),
    ...signalBoard
      .filter((signal) => signal.signal === "BUY")
      .slice(0, 2)
      .map((signal) => ({
        id: `signal-${signal.symbol}`,
        label: `${signal.symbol} conviction`,
        snippet: `${signal.symbol} is printing a ${signal.signal} signal with ${signal.confidence}% model confidence. The report should explain the setup, near-term technical triggers, and what would invalidate the bullish thesis.`,
      })),
  ].slice(0, 4);

  return serialize({
    stats: {
      reports: totalReports,
      approved: countMap.approved || 0,
      pending: countMap.pending || 0,
      rejected: countMap.rejected || 0,
      approvalRate: totalReports
        ? Math.round(((countMap.approved || 0) / totalReports) * 100)
        : 0,
    },
    marketSummary,
    sectorLeaders: sectorLeaders.slice(0, 4),
    signalBoard: signalBoard.slice(0, 6),
    recentReports,
    draftPrompts,
  });
}
