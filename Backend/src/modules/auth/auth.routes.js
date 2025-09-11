// Backend/routes/auth.routes.js
import express from "express";
const AuthRouter = express.Router();

import auth from "../../middleware/auth.js";
import {
  register,
  login,
  getMe,
  logout,
  registerCustomer,
} from "./auth.controller.js";

/**
 * Authentication & User Management Routes
 */

// ---- PUBLIC ROUTES ----

// ✅ Customer self-registration (no auth required)
AuthRouter.post("/register/customer", registerCustomer);

// ✅ Login (no auth required)
AuthRouter.post("/login", login);

// ---- PROTECTED ROUTES ----

// ✅ Employee registration (only admin/superadmin can create employees)
AuthRouter.post(
  "/register",
  auth,
  auth.authorize("admin", "superadmin"),
  register
);

// ✅ Get current user info
AuthRouter.get("/me", auth, getMe);

// ✅ Logout
AuthRouter.get("/logout", auth, logout);

export default AuthRouter;
