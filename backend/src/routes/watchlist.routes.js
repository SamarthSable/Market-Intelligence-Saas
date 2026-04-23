import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { add, list, remove } from "../controllers/watchlist.controller.js";

const router = express.Router();

router.post("/add", requireAuth, add);
router.get("/", requireAuth, list); // ✅ no userId in URL
router.delete("/remove/:companyId", requireAuth, remove);

export default router;
