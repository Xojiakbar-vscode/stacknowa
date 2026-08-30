const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { sequelize } = require("./models");
const setupSwagger = require("./swagger/swagger");
const initDefaultAdmin = require("./utils/initAdmin");
const initTelegramBot = require("./bot");
const { initGrantBot } = require("./bot/grantBot");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Whitelisted origins for production & development
const ALLOWED_ORIGINS = [
  "https://www.stacknowa.uz",
  "https://stacknowa.uz",
  "https://stacknowa-admin.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

// 1. Universal Dynamic CORS Middleware (Explicitly supporting stacknowa.uz and Vercel Admin)
app.use((req, res, next) => {
  const reqOrigin = req.headers.origin;

  if (reqOrigin) {
    if (ALLOWED_ORIGINS.includes(reqOrigin) || reqOrigin.endsWith(".vercel.app") || reqOrigin.endsWith("stacknowa.uz")) {
      res.setHeader("Access-Control-Allow-Origin", reqOrigin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", reqOrigin);
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/courses", require("./routes/course.routes"));
app.use("/api/v1/events", require("./routes/event.routes"));
app.use("/api/v1/mentors", require("./routes/mentor.routes"));
app.use("/api/v1/leads", require("./routes/lead.routes"));
app.use("/api/v1/upload", require("./routes/upload.routes"));
app.use("/api/v1/reviews", require("./routes/review.routes"));
app.use("/api/v1/results", require("./routes/result.routes"));
app.use("/api/v1/gallery", require("./routes/gallery.routes"));
app.use("/api/v1/analytics", require("./routes/analytics.routes"));
app.use("/api/v1/stats", require("./routes/stat.routes"));
app.use("/api/v1/faqs", require("./routes/faq.routes"));
app.use("/api/v1/captcha", require("./routes/captcha.routes"));
app.use("/api/v1/grant", require("./routes/grant.routes"));

// Root Healthcheck
app.get("/", (req, res) => {
  res.json({
    message: "Stacknowa Educational Center API is running! 🚀",
    swagger: `http://localhost:${PORT}/api-docs`,
  });
});

// Setup Swagger Docs
setupSwagger(app);

// Global Error Handler Middleware ensuring CORS headers are always sent
app.use((err, req, res, next) => {
  console.error("API Xatosi:", err);
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(err.status || 500).json({
    message: err.message || "Serverda ichki xatolik yuz berdi",
  });
});

// Sync Database (alter table columns if updated), Init Default Admin & Start Server
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("PostgreSQL bazasi bilan aloqa o'rnatildi ✅");
    
    // Auto-create Admin from .env and seed initial data
    await initDefaultAdmin();

    // Start Telegram Bots (@stacknowa_academy_bot & @stacknowa_academy_grand_bot)
    initTelegramBot();
    initGrantBot();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`=================================`);
      console.log(`🚀 Server muvaffaqiyatli ishga tushdi!`);
      console.log(`Local:   http://localhost:${PORT}`);
      console.log(`Swagger: http://localhost:${PORT}/api-docs`);
      console.log(`=================================`);
    });
  })
  .catch((err) => {
    console.error("PostgreSQL bazasiga ulanishda xatolik ❌:", err.message);
  });
