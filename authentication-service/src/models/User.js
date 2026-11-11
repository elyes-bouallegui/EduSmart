const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("admin", "etudiant", "enseignant"),
      allowNull: false,
      defaultValue: "etudiant",
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

module.exports = User;
