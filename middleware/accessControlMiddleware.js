const AppError = require("../utils/appError");

function accessControlMiddleware(route) {
  return (req, res, next) => {
    try {
      const user = req.user;
      const userId = req.params.userID;

      // Get role-based access control configuration
      const roleConfig = route.rolesAllowed[user.role];

      if (!roleConfig) {
        throw new AppError("Access Forbidden: Role not allowed", 403);
      }

      // Check the specific access rule for the role
      if (roleConfig.access === "self" && userId !== user.id) {
        throw new AppError(
          "Access Forbidden: You can only access your own data.",
          403
        );
      }

      // Allow access for other cases (e.g., 'access': 'all')
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { accessControlMiddleware };
