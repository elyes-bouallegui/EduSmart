const fs = require("fs");
const path = require("path");
const soap = require("soap");

const authController = require("../controllers/authController");
const profileController = require("../controllers/profileController");
const userRoleController = require("../controllers/userController");

// ========================
// LOAD WSDL
// ========================
// The WSDL must sit next to this file. It is read once at startup, so the
// server has to be fully restarted after any change to the .wsdl file.
const wsdlPath = path.join(__dirname, "authentication.wsdl");

if (!fs.existsSync(wsdlPath)) {
  throw new Error(`WSDL file not found: ${wsdlPath}`);
}

// Strip a BOM and any blank lines before the <?xml ...?> declaration.
const cleanWsdlXml = fs
  .readFileSync(wsdlPath, "utf8")
  .replace(/^[\uFEFF\s]+/, "");

// Operations that MUST exist in the WSDL (one handler per operation below).
const REQUIRED_OPERATIONS = [
  "Register",
  "Login",
  "ChangeUserRole",
  "UpdateProfilePicture",
  "GetProfilePicture",
];

// ========================
// HELPERS
// ========================

// Wraps a controller call so every operation behaves the same way:
// success -> result, failure -> logged + a SOAP-friendly failure payload.
const handle = (label, controllerFn, failurePayload) => (args, callback) => {
  // Never log args here: they can contain tokens and Base64 image data.
  Promise.resolve()
    .then(() => controllerFn(args))
    .then((result) => callback(null, result))
    .catch((error) => {
      console.error(`SOAP ${label} error:`, error);
      callback(null, failurePayload);
    });
};

// ========================
// SERVICE IMPLEMENTATION
// (names must mirror <service>, <port> and <operation> in the WSDL)
// ========================
const services = {
  AuthenticationService: {
    AuthenticationPort: {
      Register: handle("Register", (args) => authController.register(args), {
        success: false,
        message: "Failed to create user.",
      }),

      Login: handle("Login", (args) => authController.login(args), {
        success: false,
        message: "Login failed.",
        token: "",
      }),

      ChangeUserRole: handle(
        "ChangeUserRole",
        (args) => userRoleController.changeUserRole(args),
        { success: false, message: "Failed to update user role." },
      ),

      UpdateProfilePicture: handle(
        "UpdateProfilePicture",
        (args) => profileController.updateProfilePicture(args),
        { success: false, message: "Failed to update profile picture." },
      ),

      GetProfilePicture: handle(
        "GetProfilePicture",
        (args) => profileController.getProfilePicture(args),
        {
          success: false,
          message: "Failed to retrieve profile picture.",
          mimeType: "",
          imageData: "",
        },
      ),
    },
  },
};

// ========================
// ATTACH TO HTTP SERVER
// ========================
function attachSoapServer(server) {
  // The WSDL is parsed asynchronously: the last argument runs once it is ready.
  const soapServer = soap.listen(
    server,
    "/soap/auth",
    services,
    cleanWsdlXml,
    (err) => {
      if (err) {
        console.error("Failed to parse WSDL:", err);
        throw err;
      }

      const messages = Object.keys(soapServer.wsdl.definitions.messages);
      const missing = REQUIRED_OPERATIONS.filter(
        (op) => !messages.includes(`${op}Input`),
      );

      if (missing.length > 0) {
        throw new Error(
          `WSDL at ${wsdlPath} is missing operation(s): ${missing.join(", ")}. ` +
            "Update the file next to soapServer.js and restart the server.",
        );
      }
    },
  );

  // Log which operation each incoming request resolved to (no bodies logged).
  soapServer.on("request", (_request, methodName) => {
    console.log(`SOAP request: ${methodName}`);
  });
}

module.exports = attachSoapServer;
