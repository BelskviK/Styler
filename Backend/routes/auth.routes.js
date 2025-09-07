// Backend\routes\auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

// ✅ Public self-registration (customers)
router.post("/register/customer", authController.registerCustomer);

// ✅ Employee registration (admin/superadmin only)
router.post(
  "/register",
  auth,
  auth.authorize("admin", "superadmin"),
  authController.register
);

// Login / Me / Logout
router.post("/login", authController.login);
router.get("/me", auth, authController.getMe);
router.get("/logout", auth, authController.logout);

module.exports = router;
