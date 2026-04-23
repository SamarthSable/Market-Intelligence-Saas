import api from "./api";

export function getOpportunities() {
  return api.get("/opportunities");
}
