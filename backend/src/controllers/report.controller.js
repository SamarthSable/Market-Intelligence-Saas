import { prisma } from "../prisma.js";
import { recordActivity } from "../services/activity.service.js";

// Forms send select values as strings, so we normalize them once here and reuse it everywhere.
function parseSectorId(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

// This keeps the API error clearer than letting Prisma fail with a generic relation error later on.
async function ensureSectorExists(sectorId) {
  const sector = await prisma.sectors.findUnique({
    where: { id: sectorId },
    select: { id: true },
  });

  return Boolean(sector);
}

export async function getAllReports(req, res) {
  try {
    const reports = await prisma.reports.findMany({
      include: {
        users: true,
        sectors: true,
      },
      orderBy: {
        published_at: "desc",
      },
    });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function approveReport(req, res) {
  try {
    const id = Number(req.params.id);

    const report = await prisma.reports.update({
      where: { id },
      data: { status: "approved" },
      include: {
        users: true,
        sectors: true,
      },
    });

    await recordActivity({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      subjectUserId: report.analyst_id,
      action: "report.approve",
      entityType: "report",
      entityId: report.id,
      message: `Approved report "${report.title || "Untitled report"}".`,
      metadata: {
        analystId: report.analyst_id,
        analystName: report.users?.name || null,
        sector: report.sectors?.name || null,
        status: report.status,
      },
    });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function rejectReport(req, res) {
  try {
    const id = Number(req.params.id);

    const report = await prisma.reports.update({
      where: { id },
      data: { status: "rejected" },
      include: {
        users: true,
        sectors: true,
      },
    });

    await recordActivity({
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      subjectUserId: report.analyst_id,
      action: "report.reject",
      entityType: "report",
      entityId: report.id,
      message: `Rejected report "${report.title || "Untitled report"}".`,
      metadata: {
        analystId: report.analyst_id,
        analystName: report.users?.name || null,
        sector: report.sectors?.name || null,
        status: report.status,
      },
    });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function createReport(req, res) {
  try {
    const title = String(req.body.title || "").trim();
    const summary = String(req.body.summary || "").trim();
    const sectorId = parseSectorId(req.body.sector_id);

    // Frontend popups help the user early, but the backend still owns the final guardrails.
    if (!title || !summary || !sectorId) {
      return res.status(400).json({ error: "Title, summary, and sector are required." });
    }

    if (title.length < 5) {
      return res.status(400).json({ error: "Report title must be at least 5 characters long." });
    }

    if (summary.length < 30) {
      return res.status(400).json({ error: "Report summary must be at least 30 characters long." });
    }

    const sectorExists = await ensureSectorExists(sectorId);
    if (!sectorExists) {
      return res.status(404).json({ error: "Selected sector was not found." });
    }

    const report = await prisma.reports.create({
      data: {
        title,
        summary,
        sector_id: sectorId,
        analyst_id: req.user.id,
        status: "pending",
      },
      include: {
        sectors: true,
      },
    });

    await recordActivity({
      actorUserId: req.user.id,
      actorRole: req.user.role,
      subjectUserId: req.user.id,
      action: "report.create",
      entityType: "report",
      entityId: report.id,
      message: `Created report "${report.title}".`,
      metadata: {
        sector: report.sectors?.name || null,
        status: report.status,
      },
    });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function getMyReports(req, res) {
  try {
    const reports = await prisma.reports.findMany({
      where: {
        analyst_id: req.user.id,
      },
      include: {
        sectors: true,
      },
      orderBy: {
        published_at: "desc",
      },
    });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function getApprovedReports(req, res) {
  try {
    const reports = await prisma.reports.findMany({
      where: { status: "approved" },
      include: {
        users: true,
        sectors: true,
      },
      orderBy: { published_at: "desc" },
    });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateReport(req, res) {
  try {
    const id = Number(req.params.id);
    const titleProvided = typeof req.body.title === "string";
    const summaryProvided = typeof req.body.summary === "string";
    const title = titleProvided ? req.body.title.trim() : undefined;
    const summary = summaryProvided ? req.body.summary.trim() : undefined;
    const sectorId = parseSectorId(req.body.sector_id);

    const existingReport = await prisma.reports.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (existingReport.analyst_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You do not own this report" });
    }

    if (existingReport.status === "approved") {
      return res
        .status(400)
        .json({ error: "Cannot edit an already approved report" });
    }

    // Analysts can patch one field at a time, so we only validate what actually came in.
    if (!titleProvided && !summaryProvided && sectorId === undefined) {
      return res.status(400).json({ error: "Please provide at least one field to update." });
    }

    if (titleProvided && !title) {
      return res.status(400).json({ error: "Report title cannot be empty." });
    }

    if (summaryProvided && !summary) {
      return res.status(400).json({ error: "Report summary cannot be empty." });
    }

    if (title && title.length < 5) {
      return res.status(400).json({ error: "Report title must be at least 5 characters long." });
    }

    if (summary && summary.length < 30) {
      return res.status(400).json({ error: "Report summary must be at least 30 characters long." });
    }

    if (req.body.sector_id !== undefined && sectorId === null) {
      return res.status(400).json({ error: "Please select a valid sector." });
    }

    if (sectorId !== undefined) {
      const sectorExists = await ensureSectorExists(sectorId);
      if (!sectorExists) {
        return res.status(404).json({ error: "Selected sector was not found." });
      }
    }

    const updatedReport = await prisma.reports.update({
      where: { id },
      data: {
        ...(titleProvided ? { title } : {}),
        ...(summaryProvided ? { summary } : {}),
        ...(sectorId !== undefined ? { sector_id: sectorId } : {}),
      },
      include: {
        sectors: true,
      },
    });

    await recordActivity({
      actorUserId: req.user.id,
      actorRole: req.user.role,
      subjectUserId: req.user.id,
      action: "report.update",
      entityType: "report",
      entityId: updatedReport.id,
      message: `Updated report "${updatedReport.title}".`,
      metadata: {
        sector: updatedReport.sectors?.name || null,
        status: updatedReport.status,
      },
    });

    res.json(updatedReport);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function deleteReport(req, res) {
  try {
    const id = Number(req.params.id);
    const existingReport = await prisma.reports.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (existingReport.analyst_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You do not own this report" });
    }

    if (existingReport.status === "approved") {
      return res.status(400).json({ error: "Approved reports cannot be deleted" });
    }

    // We only remove drafts or rejected items so client-facing research stays auditable.
    await prisma.reports.delete({
      where: { id },
    });

    await recordActivity({
      actorUserId: req.user.id,
      actorRole: req.user.role,
      subjectUserId: req.user.id,
      action: "report.delete",
      entityType: "report",
      entityId: existingReport.id,
      message: `Deleted report "${existingReport.title || "Untitled report"}".`,
      metadata: {
        status: existingReport.status,
      },
    });

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete report" });
  }
}
