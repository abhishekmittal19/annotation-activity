const { Router } = require("express");

const {
  verifyOtp,
  register,
  login,
} = require("../controllers/auth.controller");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);

module.exports = router;
