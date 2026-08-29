const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Ruxsat berilmagan! Token kiritilmadi." });
  }

  jwt.verify(token, process.env.JWT_SECRET || "stacknowa_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Yaroqsiz token!" });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
};
