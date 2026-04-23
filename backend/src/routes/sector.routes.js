import express from "express";
import {
  getAllSectors,
  sectorRanking,
} from "../controllers/sector.controller.js";

const router = express.Router();

/* For dropdowns */
router.get("/", getAllSectors);

/* For dashboard charts */
router.get("/ranking", sectorRanking);

export default router;
