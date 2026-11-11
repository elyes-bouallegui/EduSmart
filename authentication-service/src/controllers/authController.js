const User = require("../models/User");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  parseImage,
  saveImage,
  deleteImage,
} = require("../utils/profilePictureStorage");

// ========================
// REGISTER
// ========================
const createUser = async (args) => {
  try {
    const { username, email, password, phone, imageData, mimeType } = args;

    // 1. Validate required fields
    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return {
        success: false,
        message: "Username, email, and password are required.",
      };
    }

    // 2. Normalize input
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone =
      typeof phone === "string" && phone.trim() ? phone.trim() : null;

    // 2b. Validate the optional profile picture before anything is saved
    let image = null;

    if (typeof imageData === "string" && imageData.trim()) {
      image = parseImage(imageData, mimeType);

      if (!image.ok) {
        return { success: false, message: image.message };
      }
    }

    // 3. Check duplicate email
    const existingEmail = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      return {
        success: false,
        message: "Email already exists.",
      };
    }

    // 4. Check duplicate phone if provided
    if (normalizedPhone) {
      const existingPhone = await User.findOne({
        where: { phone: normalizedPhone },
      });

      if (existingPhone) {
        return {
          success: false,
          message: "Phone number already exists.",
        };
      }
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Store the profile picture (if any), then create the user
    const profilePicture = image
      ? await saveImage(image.buffer, image.extension)
      : null;

    let user;

    try {
      user = await User.create({
        username: normalizedUsername,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: "etudiant",
        profilePicture,
      });
    } catch (error) {
      // Do not leave an orphan file if the user could not be created
      await deleteImage(profilePicture);
      throw error;
    }

    return {
      success: true,
      message: "User successfully created!",
      userId: user.id,
      profilePicture: user.profilePicture || "",
    };
  } catch (error) {
    console.error("Register error:", error);

    return {
      success: false,
      message: "Failed to create user.",
    };
  }
};

// ========================
// LOGIN
// ========================
const login = async (args) => {
  try {
    const { identifier, password } = args;

    // 1. Validate input
    if (
      typeof identifier !== "string" ||
      !identifier.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return {
        success: false,
        message: "Identifier and password are required.",
        token: "",
      };
    }

    // 2. JWT secret must be configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from .env");

      return {
        success: false,
        message: "Authentication service configuration error.",
        token: "",
      };
    }

    // 3. Normalize identifier
    const value = identifier.trim();

    // 4. Find user by email OR phone
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: value.toLowerCase() }, { phone: value }],
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid credentials.",
        token: "",
      };
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return {
        success: false,
        message: "Invalid credentials.",
        token: "",
      };
    }

    // 6. Generate JWT
    const token = jwt.sign(
      {
        sub: String(user.id),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      },
    );

    // 7. Return successful login response
    return {
      success: true,
      message: "Login successful.",
      token,
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      message: "Login failed.",
      token: "",
    };
  }
};

module.exports = {
  register: createUser,
  login,
};
