import express from "express";
import { opportunities } from "../controllers/opportunity.controller.js";

const router = express.Router();
router.get("/", opportunities);
export default router;
