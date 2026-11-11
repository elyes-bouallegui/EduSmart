"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      role: {
        type: Sequelize.ENUM("admin", "enseignant", "etudiant"),
        allowNull: false,
        defaultValue: "etudiant",
      },

      profilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
