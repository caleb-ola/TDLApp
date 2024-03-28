const { Router } = require("express");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  verifyEmail,
  resendVerifyEmail,
  testEmail,
} = require("../controllers/authController");

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verification-email", verifyEmail);
router.post("/resend-verification-email", resendVerifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/update-password", protect, updatePassword);
router.post("/test-email", testEmail);

module.exports = router;
