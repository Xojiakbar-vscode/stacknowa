const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

/**
 * HTTP Basic Authentication middleware for /api-docs route
 * Username: xakimdjanov
 * Password: 1920
 */
const swaggerBasicAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Stacknowa Protected API Docs"');
    return res.status(401).send("API Hujjatlariga kirish uchun login va parol talab etiladi!");
  }

  const auth = Buffer.from(authHeader.split(" ")[1] || "", "base64").toString().split(":");
  const username = auth[0];
  const password = auth[1];

  if (username === "xakimdjanov" && password === "1920") {
    return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Stacknowa Protected API Docs"');
  return res.status(401).send("Noto'g'ri login yoki parol!");
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stacknowa Educational Center API",
      version: "1.0.0",
      description: "Sales Landing Page & Courses Subdomain Backend REST API",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./app.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerBasicAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger UI (Protected) available at http://localhost:5000/api-docs 📖");
};

module.exports = setupSwagger;
