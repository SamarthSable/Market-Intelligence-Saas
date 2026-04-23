import { prisma } from "../prisma.js";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "../services/watchlist.service.js";
import { recordActivity } from "../services/activity.service.js";

async function hydrateWatchlist(watchlist) {
  const companyIds = watchlist?.companies || [];

  if (companyIds.length === 0) {
    return [];
  }

  const companies = await prisma.companies.findMany({
    where: {
      id: { in: companyIds.map(Number) },
    },
    select: {
      id: true,
      name: true,
      symbol: true,
    },
  });

  const companyMap = new Map(companies.map((company) => [company.id, company]));

  return companyIds
    .map((companyId) => companyMap.get(Number(companyId)))
    .filter(Boolean);
}

export async function add(req, res) {
  try {
    const rawCompanyId = Number(req.body.companyId);
    const symbol = String(req.body.symbol || "").trim().toUpperCase();
    let normalizedCompanyId = Number.isFinite(rawCompanyId) ? rawCompanyId : 0;

    if (!normalizedCompanyId && symbol) {
      const company = await prisma.companies.findUnique({
        where: { symbol },
        select: { id: true },
      });

      normalizedCompanyId = company?.id || 0;
    }

    if (!normalizedCompanyId) {
      return res
        .status(400)
        .json({ error: "companyId or symbol is required" });
    }

    const company = await prisma.companies.findUnique({
      where: { id: normalizedCompanyId },
      select: { id: true, symbol: true, name: true },
    });

    const watchlist = await addToWatchlist(req.user.id, normalizedCompanyId);
    await recordActivity({
      actorUserId: req.user.id,
      actorRole: req.user.role,
      subjectUserId: req.user.id,
      action: "watchlist.add",
      entityType: "watchlist",
      entityId: normalizedCompanyId,
      message: `Added ${company?.symbol || "a company"} to the watchlist.`,
      metadata: {
        companyId: normalizedCompanyId,
        symbol: company?.symbol || null,
        companyName: company?.name || null,
      },
    });
    res.json(await hydrateWatchlist(watchlist));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function list(req, res) {
  try {
    const watchlist = await getWatchlist(req.user.id);
    res.json(await hydrateWatchlist(watchlist));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const companyId = Number(req.params.companyId);
    const company = await prisma.companies.findUnique({
      where: { id: companyId },
      select: { id: true, symbol: true, name: true },
    });
    const watchlist = await removeFromWatchlist(req.user.id, companyId);
    await recordActivity({
      actorUserId: req.user.id,
      actorRole: req.user.role,
      subjectUserId: req.user.id,
      action: "watchlist.remove",
      entityType: "watchlist",
      entityId: companyId,
      message: `Removed ${company?.symbol || "a company"} from the watchlist.`,
      metadata: {
        companyId,
        symbol: company?.symbol || null,
        companyName: company?.name || null,
      },
    });
    res.json(await hydrateWatchlist(watchlist));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
