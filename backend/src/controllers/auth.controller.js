import { registerUser, loginUser } from "../services/auth.service.js";
import { recordActivity } from "../services/activity.service.js";

export async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    await recordActivity({
      actorUserId: user.id,
      actorRole: user.role,
      subjectUserId: user.id,
      action: "auth.register",
      entityType: "user",
      entityId: user.id,
      message: `${user.name} created an account.`,
      metadata: {
        email: user.email,
        role: user.role,
      },
    });
    res.json({ success: true, user });
  } catch (e) {
    res.status(e.statusCode || 400).json({ error: e.message });
  }
}

export async function login(req, res) {
  try {
    const data = await loginUser(req.body);
    await recordActivity({
      actorUserId: data.user.id,
      actorRole: data.user.role,
      subjectUserId: data.user.id,
      action: "auth.login",
      entityType: "user",
      entityId: data.user.id,
      message: `${data.user.name} logged in.`,
      metadata: {
        email: data.user.email,
        role: data.user.role,
      },
    });
    res.json(data);
  } catch (e) {
    res.status(e.statusCode || 401).json({ error: e.message });
  }
}
