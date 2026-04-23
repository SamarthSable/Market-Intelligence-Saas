import { prisma } from "../prisma.js";
import { serialize } from "../utils/serialize.js";
import { getRecentActivities, recordActivity } from "../services/activity.service.js";

export async function getUsers(req, res) {
  // Report counts make the admin user table more useful without forcing extra client-side requests.
  const users = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
      _count: {
        select: {
          reports: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  res.json(serialize(users));
}

export async function updateUserRole(req, res) {
  const { id } = req.params;
  let { role } = req.body;

  role = role.trim().toLowerCase();

  if (!["admin", "analyst", "client"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const existingUser = await prisma.users.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // We read the old role first so the activity feed can tell a meaningful before/after story.
  const updated = await prisma.users.update({
    where: { id: Number(id) },
    data: { role },
  });

  await recordActivity({
    actorUserId: req.user.id,
    actorRole: req.user.role,
    subjectUserId: updated.id,
    action: "admin.user.role.update",
    entityType: "user",
    entityId: updated.id,
    message: `Changed ${updated.name}'s role from ${existingUser.role} to ${updated.role}.`,
    metadata: {
      previousRole: existingUser.role,
      nextRole: updated.role,
      email: updated.email,
    },
  });

  res.json(updated);
}

export async function getRecentActivity(req, res) {
  try {
    const activity = await getRecentActivities({ limit: 12 });
    // Activity lives in Mongo, so we enrich it with MySQL user details before sending it to the UI.
    const userIds = [
      ...new Set(
        activity
          .flatMap((entry) => [entry.actorUserId, entry.subjectUserId])
          .filter(Boolean)
          .map(Number)
      ),
    ];

    const users = userIds.length
      ? await prisma.users.findMany({
          where: {
            id: { in: userIds },
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        })
      : [];

    const userMap = new Map(users.map((user) => [user.id, user]));

    res.json(
      serialize(
        activity.map((entry) => ({
          id: entry._id,
          action: entry.action,
          message: entry.message,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadata: entry.metadata || {},
          createdAt: entry.createdAt,
          actor: entry.actorUserId
            ? userMap.get(Number(entry.actorUserId)) || {
                id: entry.actorUserId,
                role: entry.actorRole || null,
              }
            : null,
          subject: entry.subjectUserId
            ? userMap.get(Number(entry.subjectUserId)) || { id: entry.subjectUserId }
            : null,
        }))
      )
    );
  } catch (err) {
    console.error("Admin activity error:", err);
    res.status(500).json({ error: "Failed to load recent activity" });
  }
}

export async function getStats(req, res) {
  try {
    // This endpoint powers the top-line admin cards and recent tables in one round trip.
    const [
      users,
      analysts,
      clients,
      admins,
      reports,
      approvedReports,
      pendingReports,
      rejectedReports,
      recentUsers,
      recentReports,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { role: "analyst" } }),
      prisma.users.count({ where: { role: "client" } }),
      prisma.users.count({ where: { role: "admin" } }),
      prisma.reports.count(),
      prisma.reports.count({ where: { status: "approved" } }),
      prisma.reports.count({ where: { status: "pending" } }),
      prisma.reports.count({ where: { status: "rejected" } }),
      prisma.users.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
        },
      }),
      prisma.reports.findMany({
        take: 5,
        orderBy: { published_at: "desc" },
        include: {
          users: {
            select: {
              name: true,
              email: true,
            },
          },
          sectors: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const revenue = clients * 499;
    const approvalRate = reports ? Math.round((approvedReports / reports) * 100) : 0;

    res.json(
      serialize({
        users,
        admins,
        analysts,
        clients,
        reports,
        approvedReports,
        pendingReports,
        rejectedReports,
        approvalRate,
        revenue,
        recentUsers,
        recentReports,
      })
    );
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to load admin stats" });
  }
}
