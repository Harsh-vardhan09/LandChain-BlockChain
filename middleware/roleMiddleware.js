/**
 * Role-based access control middleware
 * Checks if the user has the required role(s)
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${rolesArray.join(", ")}. Your role: ${
          req.user.role
        }`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole("admin");

/**
 * Middleware to check if operations are on user's own data
 * or if user is admin
 */
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const userAddress = req.body.owner || req.params.owner || req.query.owner;
  const isOwner =
    userAddress && userAddress.toLowerCase() === req.user.walletAddress.toLowerCase();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error:
        "Access denied. You can only modify your own records or you must be an admin",
    });
  }

  next();
};

module.exports = {
  requireRole,
  requireAdmin,
  requireOwnerOrAdmin,
};
