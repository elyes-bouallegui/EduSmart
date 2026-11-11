const sequelize = require("./config/config");

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connection successful!");
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

testConnection();
