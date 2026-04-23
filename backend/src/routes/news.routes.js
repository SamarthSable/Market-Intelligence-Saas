import express from "express";
import { news, marketNews } from "../controllers/news.controller.js";

const router = express.Router();

router.get("/", news); // /api/news?symbol=TCS
router.get("/market", marketNews); // /api/news/market

export default router;
