const express = require("express");
const router = express.Router();
const captchaController = require("../controller/captcha.controller");

router.get("/", captchaController.getCaptcha);

module.exports = router;
