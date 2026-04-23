import express from "express";
import { getApprovedReports } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/", getApprovedReports); // public

export default router;
