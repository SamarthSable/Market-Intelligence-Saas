import api from "./api";

export function getApprovedReports() {
  return api.get("/reports");
}
