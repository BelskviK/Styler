const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Private (admin/superadmin only)
router.post(
  "/register",
  auth, // This is your main auth middleware
  auth.authorize("admin", "superadmin"), // This is the role check
  authController.register
);

// Other routes remain the same
router.post("/login", authController.login);
router.get("/me", auth, authController.getMe);
router.get("/logout", auth, authController.logout);

module.exports = router;
