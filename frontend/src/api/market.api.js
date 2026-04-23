import api from "./api";

export function getClientSignals() {
  return api.get("/market/signals");
}

export function getCompanyHistory(symbol) {
  return api.get(`/market/history/${symbol}`);
}
