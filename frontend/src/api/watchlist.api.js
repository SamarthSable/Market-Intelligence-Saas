import api from "./api";

export function getWatchlist() {
  return api.get("/watchlist");
}

export function addToWatchlist({ companyId, symbol }) {
  return api.post("/watchlist/add", { companyId, symbol });
}

export function removeFromWatchlist(companyId) {
  return api.delete(`/watchlist/remove/${companyId}`);
}
