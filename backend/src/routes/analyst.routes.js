import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

import {
  getAnalystStats,
  getAnalystInsights,
} from "../controllers/dashboard.controller.js";
import {
  getMyReports,
  createReport,
  updateReport,
  deleteReport,
} from "../controllers/report.controller.js";

const router = express.Router();

/* Analyst dashboard stats */
router.get("/stats", requireAuth, requireRole("analyst"), getAnalystStats);
router.get("/insights", requireAuth, requireRole("analyst"), getAnalystInsights);

/* Reports */
router.get("/reports", requireAuth, requireRole("analyst"), getMyReports);
router.post("/reports", requireAuth, requireRole("analyst"), createReport);
router.put("/reports/:id", requireAuth, requireRole("analyst"), updateReport);
router.delete("/reports/:id", requireAuth, requireRole("analyst"), deleteReport);

export default router;
