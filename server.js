const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const { sequelize } = require("./models");
const { homeBanner } = require("./routes/homeBanner.routes");
const setupSwagger = require("./swagger/swagger");
const { product } = require("./routes/product.routes");
const { service } = require("./routes/service.routes");
const { testimonial } = require("./routes/testimonial.routes");
const Admin = require("./routes/adminRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://stacknowa.uz',
  'https://admin.stacknowa.uz'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use("/homeBanner", homeBanner);
app.use("/product", product);
app.use("/service", service);
app.use("/testimonial", testimonial);
app.use("/admin", Admin);


setupSwagger(app);

sequelize
    .sync()
    .then(() => {
        console.log("Bazaga ulandi ✅");
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server ishlayapti 🚀`);
            console.log(`Local:   http://localhost:${PORT}`);
            console.log(`Network: http://10.55.151.98:${PORT}`);
        });
    })

    .catch((err) => console.error("Baza xatosi:", err));