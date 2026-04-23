// This middleware is used to protect routes based on user role
// Example: only "admin" or only "analyst" should access some APIs

export function requireRole(role) {
  return (req, res, next) => {
    // If somehow user is not attached by JWT middleware
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if logged in user has required role
    if (req.user.role !== role) {
      return res.status(403).json({
        error: "You do not have permission to access this resource",
      });
    }

    // If everything is fine, allow request to go forward
    next();
  };
}
