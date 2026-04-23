import express from "express";
import {
  getStats,
  getUsers,
  getRecentActivity,
  updateUserRole,
} from "../controllers/admin.controller.js";
import {
  getAllReports,
  approveReport,
  rejectReport,
} from "../controllers/report.controller.js";

import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/stats", requireAuth, requireAdmin, getStats);
router.get("/users", requireAuth, requireAdmin, getUsers);
router.get("/activity", requireAuth, requireAdmin, getRecentActivity);
router.put("/users/:id", requireAuth, requireAdmin, updateUserRole);

router.get("/reports", requireAuth, requireAdmin, getAllReports);
router.put("/reports/:id/approve", requireAuth, requireAdmin, approveReport);
router.put("/reports/:id/reject", requireAuth, requireAdmin, rejectReport);

export default router;
