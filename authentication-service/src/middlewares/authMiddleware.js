const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. Verify that the token is valid
const verifyToken = (token) => {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Authentication token is required.");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("Authentication configuration error.");
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET);

  if (typeof payload.sub !== "string") {
    throw new Error("Invalid token payload.");
  }

  return {
    userId: payload.sub,
  };
};

// 2. Get the user's CURRENT role from the database
const authenticateCurrentUser = async (token) => {
  const tokenUser = verifyToken(token);

  const user = await User.findByPk(tokenUser.userId);

  if (!user) {
    throw new Error("User no longer exists.");
  }

  return {
    userId: String(user.id),
    role: user.role,
  };
};

// 3. Check whether the user has permission
const requireRole = (user, allowedRoles) => {
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Access denied.");
  }

  return user;
};

// 4. Only an admin can perform admin operations
const verifyAdminToken = async (token) => {
  const user = await authenticateCurrentUser(token);

  requireRole(user, ["admin"]);

  return user;
};

module.exports = {
  verifyToken,
  authenticateCurrentUser,
  requireRole,
  verifyAdminToken,
};
