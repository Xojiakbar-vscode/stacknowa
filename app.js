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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

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
