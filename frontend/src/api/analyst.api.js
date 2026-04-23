import api from "./api";

export function getAnalystStats() {
  return api.get("/analyst/stats");
}

export function getAnalystInsights() {
  return api.get("/analyst/insights");
}

export function getAnalystReports() {
  return api.get("/analyst/reports");
}

export function createAnalystReport(data) {
  return api.post("/analyst/reports", data);
}

export function updateAnalystReport(id, data) {
  return api.put(`/analyst/reports/${id}`, data);
}

export function deleteAnalystReport(id) {
  return api.delete(`/analyst/reports/${id}`);
}
