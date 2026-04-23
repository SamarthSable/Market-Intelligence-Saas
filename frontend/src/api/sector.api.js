import api from "./api";

export function getSectors() {
  return api.get("/sectors");
}

export function getSectorRanking() {
  return api.get("/sectors/ranking");
}
