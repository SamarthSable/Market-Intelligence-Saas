import express from "express";
import {
  getClientSignals,
  getCompanyHistory,
} from "../controllers/market.controller.js";

const router = express.Router();

router.get("/signals", getClientSignals);
router.get("/history/:symbol", getCompanyHistory);

export default router;
