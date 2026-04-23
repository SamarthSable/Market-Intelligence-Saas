import Watchlist from "../mongo-models/watchlist.model.js";

export async function addToWatchlist(userId, companyId) {
  let wl = await Watchlist.findOne({ userId });

  if (!wl) {
    wl = await Watchlist.create({
      userId,
      companies: [companyId],
    });
  } else {
    if (!wl.companies.includes(companyId)) {
      wl.companies.push(companyId);
      await wl.save();
    }
  }

  return wl;
}

export async function getWatchlist(userId) {
  return Watchlist.findOne({ userId });
}

export async function removeFromWatchlist(userId, companyId) {
  const wl = await Watchlist.findOne({ userId });
  if (!wl) return null;

  wl.companies = wl.companies.filter((id) => Number(id) !== Number(companyId));

  await wl.save();
  return wl;
}
