import ActivityLog from "../mongo-models/activityLog.model.js";

export async function recordActivity({
  actorUserId,
  actorRole,
  subjectUserId,
  action,
  entityType,
  entityId,
  message,
  metadata = {},
}) {
  if (!action || !message) {
    return null;
  }

  try {
    return await ActivityLog.create({
      actorUserId,
      actorRole,
      subjectUserId,
      action,
      entityType,
      entityId: entityId === undefined || entityId === null ? undefined : String(entityId),
      message,
      metadata,
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
    return null;
  }
}

export async function getRecentActivities({ limit = 12 } = {}) {
  return ActivityLog.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
