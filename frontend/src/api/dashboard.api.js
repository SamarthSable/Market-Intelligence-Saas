import api from "./api";

export function getPortfolio() {
  return api.get("/dashboard");
}

export function getSectorRanking() {
  return api.get("/sectors/ranking");
}
