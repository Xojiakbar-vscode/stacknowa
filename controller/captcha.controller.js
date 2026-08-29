const jwt = require("jsonwebtoken");

/**
 * Generates a dynamic math captcha question and a signed JWT token containing the correct answer.
 */
exports.getCaptcha = (req, res) => {
  try {
    const num1 = Math.floor(Math.random() * 9) + 1; // 1 - 9
    const num2 = Math.floor(Math.random() * 9) + 1; // 1 - 9
    const answer = num1 + num2;
    const question = `${num1} + ${num2} =`;

    // Sign a short-lived token (expires in 10 minutes) containing the correct math answer
    const captchaToken = jwt.sign(
      { answer },
      process.env.JWT_SECRET || "stacknowa_secret",
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      question,
      captchaToken,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Helper to verify captcha answer against token.
 */
exports.verifyCaptchaToken = (captchaToken, userAnswer) => {
  if (!captchaToken || userAnswer === undefined || userAnswer === null || userAnswer === "") {
    return false;
  }

  try {
    const decoded = jwt.verify(captchaToken, process.env.JWT_SECRET || "stacknowa_secret");
    return parseInt(userAnswer, 10) === parseInt(decoded.answer, 10);
  } catch (err) {
    return false;
  }
};
