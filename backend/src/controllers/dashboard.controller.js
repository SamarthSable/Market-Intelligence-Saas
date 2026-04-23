import { getDashboard } from "../services/dashboard.service.js";
import { getAnalystInsightsData } from "../services/analyst.service.js";
import { prisma } from "../prisma.js";
import { serialize } from "../utils/serialize.js";

export async function dashboard(req, res) {
  // Prisma can hand back bigint values, so we serialize before sending JSON to the browser.
  const data = await getDashboard();
  res.json(serialize(data));
}

export async function getAnalystStats(req, res) {
  const userId = req.user.id;

  // These counts are independent, so we fetch them together to keep the dashboard snappy.
  const [total, approved, pending, rejected] = await Promise.all([
    prisma.reports.count({
      where: { analyst_id: userId },
    }),
    prisma.reports.count({
      where: { analyst_id: userId, status: "approved" },
    }),
    prisma.reports.count({
      where: { analyst_id: userId, status: "pending" },
    }),
    prisma.reports.count({
      where: { analyst_id: userId, status: "rejected" },
    }),
  ]);

  res.json({
    reports: total,
    approved,
    pending,
    rejected,
    approvalRate: total ? Math.round((approved / total) * 100) : 0,
  });
}

export async function getAnalystInsights(req, res) {
  // The heavier cross-table assembly lives in the service so the controller stays easy to scan.
  const data = await getAnalystInsightsData(req.user.id);
  res.json(data);
}
