const { User } = require("../models");
require("dotenv").config();

/**
 * Automatically creates default admin user from .env if missing.
 * No mock courses or mentors are created automatically.
 */
const initDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "xakimdjanov@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "123";
    const adminName = process.env.ADMIN_NAME || "Admin Stacknowa";

    // Check if admin user exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "superadmin",
      });
      console.log(`Baza uchun yangi admin yaratildi 🔑: ${adminEmail}`);
    }
  } catch (err) {
    console.error("Admin yaratishda xatolik:", err.message);
  }
};

module.exports = initDefaultAdmin;
