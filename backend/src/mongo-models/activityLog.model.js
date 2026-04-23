import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  actorUserId: {
    type: Number,
    index: true,
  },
  actorRole: {
    type: String,
    trim: true,
  },
  subjectUserId: {
    type: Number,
    index: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  entityType: {
    type: String,
    trim: true,
  },
  entityId: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ actorUserId: 1, createdAt: -1 });
activityLogSchema.index({ subjectUserId: 1, createdAt: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", activityLogSchema);
