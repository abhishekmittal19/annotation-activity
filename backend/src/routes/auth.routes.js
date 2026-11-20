const { Router } = require("express");
const { authenticate } = require("../middleware/auth.middleware");

const {
  verifyOtp,
  register,
  login,
  issueSocketToken,
} = require("../controllers/auth.controller");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/socket-token", authenticate, issueSocketToken);

module.exports = router;
