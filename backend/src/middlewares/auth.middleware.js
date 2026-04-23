import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}
