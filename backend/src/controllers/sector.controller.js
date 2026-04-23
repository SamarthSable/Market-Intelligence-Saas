import { prisma } from "../prisma.js";
import { getSectorPerformance } from "../services/sector.service.js";

/*  For dropdown (Create Report etc) */
export async function getAllSectors(req, res) {
  try {
    const sectors = await prisma.sectors.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    res.json(sectors);
  } catch (err) {
    console.error("Sector fetch failed:", err);
    res.status(500).json({ error: "Failed to load sectors" });
  }
}

/*  For charts & analytics */
export async function sectorRanking(req, res) {
  const data = await getSectorPerformance();
  res.json(data);
}
