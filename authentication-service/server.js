const http = require("http");
const express = require("express");
const { sequelize, connectDB } = require("./src/config/config");
const attachSoapServer = require("./src/soap/soapServer");

require("./src/models/User");

const app = express();

async function startServer() {
  try {
    await connectDB();
    await sequelize.sync();

    const server = http.createServer(app);

    attachSoapServer(server);

    const PORT = process.env.PORT || 3002;

    server.listen(PORT, () => {
      console.log(`Authentication Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Authentication Service:", error);
    process.exitCode = 1;
  }
}

startServer();
