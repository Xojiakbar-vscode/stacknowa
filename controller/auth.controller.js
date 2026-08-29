const { User } = require("../models");
const { validateUser, validateLogin } = require("../validation/userValidation");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const existing = await User.findOne({ where: { email: req.body.email } });
    if (existing) {
      return res.status(400).json({ message: "Email allaqachon mavjud!" });
    }

    const user = await User.create(req.body);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "stacknowa_secret",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Admin muvaffaqiyatli ro'yxatdan o'tdi",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(404).json({ message: "Email yoki parol noto'g'ri!" });

    const isValid = await user.validPassword(req.body.password);
    if (!isValid) return res.status(400).json({ message: "Email yoki parol noto'g'ri!" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "stacknowa_secret",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Tizimga muvaffaqiyatli kirildi",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
