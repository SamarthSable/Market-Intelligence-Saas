import api from "./api";

export function getAdminStats() {
  return api.get("/admin/stats");
}

export function getAdminUsers() {
  return api.get("/admin/users");
}

export function getAdminActivity() {
  return api.get("/admin/activity");
}

export function updateAdminUserRole(id, role) {
  return api.put(`/admin/users/${id}`, { role });
}

export function getAdminReports() {
  return api.get("/admin/reports");
}

export function approveAdminReport(id) {
  return api.put(`/admin/reports/${id}/approve`, {});
}

export function rejectAdminReport(id) {
  return api.put(`/admin/reports/${id}/reject`, {});
}
