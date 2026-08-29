const { User } = require("../models");
require("dotenv").config();

/**
 * Automatically creates or updates default admin user from .env or default credentials.
 * Target Email: isomiddinxakimjanov@gmail.com
 * Target Password: xakimdjanov._.7
 */
const initDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "isomiddinxakimjanov@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "xakimdjanov._.7";
    const adminName = process.env.ADMIN_NAME || "Admin Stacknowa";

    // Check if admin user exists with target email
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "superadmin",
      });
      console.log(`Baza uchun yangi admin yaratildi 🔑: ${adminEmail}`);
    } else {
      // Ensure password matches target password if changed
      const isMatch = await existingAdmin.validPassword(adminPassword);
      if (!isMatch) {
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
        console.log(`Admin paroli yangilandi 🔑: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error("Admin yaratishda xatolik:", err.message);
  }
};

module.exports = initDefaultAdmin;
