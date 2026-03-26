const { Admin } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateAdminRegister, validateAdminLogin } = require("../validation/adminValidation");

const JWT_SECRET = process.env.JWT_SECRET; // .env da saqlash tavsiya etiladi

// ✅ Admin register
exports.registerAdmin = async (req, res) => {
  // 1️⃣ Validatsiya
  const { error } = validateAdminRegister(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // 2️⃣ Parolni hash qilish
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // 3️⃣ Admin yaratish
    const admin = await Admin.create({
      fullname: req.body.fullname,
      username: req.body.username,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        fullname: admin.fullname,
        username: admin.username,
      },
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// ✅ Admin login
exports.loginAdmin = async (req, res) => {
  // 1️⃣ Validatsiya
  const { error } = validateAdminLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // 2️⃣ Admin topish
    const admin = await Admin.findOne({ where: { username: req.body.username } });
    if (!admin) return res.status(400).send("Username yoki password xato");

    // 3️⃣ Parolni tekshirish
    const validPassword = await bcrypt.compare(req.body.password, admin.password);
    if (!validPassword) return res.status(400).send("Username yoki password xato");

    // 4️⃣ JWT token yaratish
    const token = jwt.sign(
      { id: admin.id, fullname: admin.fullname, username: admin.username },
      JWT_SECRET,
      { expiresIn: "1d" } // token 1 kun davomida yaroqli
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        fullname: admin.fullname,
        username: admin.username,
      },
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// ✅ Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({ attributes: ["id", "fullname", "username"] });
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).send(err.message);
  }
};