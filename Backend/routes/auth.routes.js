// Backend\routes\auth.routes.js
import express from "express";
const AuthRouter = express.Router();
import auth from "../middleware/auth.js";

import AuthController from "../controllers/auth.controller.js";

// ✅ Public self-registration (customers)
AuthRouter.post("/register/customer", AuthController.registerCustomer);

// ✅ Employee registration (admin/superadmin only)
AuthRouter.post(
  "/register",
  auth,
  auth.authorize("admin", "superadmin"),
  AuthController.register
);
AuthRouter.get("/me", auth, AuthController.getMe);

// Login / Me / Logout
AuthRouter.post("/login", AuthController.login);
AuthRouter.get("/me", auth, AuthController.getMe);
AuthRouter.get("/logout", auth, AuthController.logout);
export default AuthRouter;
