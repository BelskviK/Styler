// Backend\routes\auth.routes.js
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

// ✅ Public self-registration (customers)
AuthRouter.post("/register/customer", registerCustomer);

// ✅ Employee registration (admin/superadmin only)
AuthRouter.post(
  "/register",
  auth,
  auth.authorize("admin", "superadmin"),
  register
);

// Login / Me / Logout
AuthRouter.post("/login", login);
AuthRouter.get("/me", auth, getMe);
AuthRouter.get("/logout", auth, logout);
export default AuthRouter;
