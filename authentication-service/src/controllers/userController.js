const User = require("../models/User");
const { verifyAdminToken } = require("../middlewares/authMiddleware");

// ========================
// CHANGE USER ROLE
// ========================
const changeUserRole = async (args) => {
  try {
    const { token, userId, newRole } = args || {};

    // 1. Validate input
    if (
      (typeof userId !== "string" && typeof userId !== "number") ||
      !String(userId).trim() ||
      !["etudiant", "enseignant"].includes(newRole)
    ) {
      return {
        success: false,
        message: "Invalid user ID or role.",
      };
    }

    // 2. Verify that the requester is an admin
    await verifyAdminToken(token);

    // 3. Find the target user
    const user = await User.findByPk(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // 4. Never modify an admin account's role
    if (user.role === "admin") {
      return {
        success: false,
        message: "Admin roles cannot be changed.",
      };
    }

    // 5. Avoid unnecessary updates
    if (user.role === newRole) {
      return {
        success: true,
        message: "User already has this role.",
      };
    }

    // 6. Update the role
    user.role = newRole;
    await user.save();

    return {
      success: true,
      message: "User role updated successfully.",
    };
  } catch (error) {
    console.error("Change user role error:", error);

    return {
      success: false,
      message:
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError" ||
        error.message === "Access denied." ||
        error.message === "Authentication token is required."
          ? "Unauthorized: admin access required."
          : "Failed to update user role.",
    };
  }
};

module.exports = {
  changeUserRole,
};
