// Backend/routes/user.routes.js
import express from "express";
const UserRouter = express.Router();

import auth from "../../middleware/auth.js";
import checkCompany from "../../middleware/checkCompany.js";

import {
  getCurrentUser,
  updateUser,
  getStylists,
  getCompanyUsers,
  addEmployee,
  deleteUser,
  getStylistWithServices,
  getCompanyStylists,
} from "./user.controller.js";

/**
 * User Routes
 */

// ---- USER / SELF ROUTES ----

// ✅ Get current authenticated user profile
UserRouter.get("/me", auth, getCurrentUser);

// ✅ Update user (admin or self)
UserRouter.put("/:id", auth, updateUser);

// ---- COMPANY / ADMIN ROUTES ----

// ✅ Get all users in current company (admin only)
UserRouter.get("/company", auth, getCompanyUsers);

// ✅ Add employee to company (admin only)
UserRouter.post("/employee", auth, addEmployee);

// ✅ Get a stylist with services populated (admin or superadmin)
UserRouter.get("/stylist/:id", auth, getStylistWithServices);

// ---- SUPERADMIN ROUTES ----

// ✅ Get all stylists (superadmin only)
UserRouter.get("/", auth, checkCompany, getStylists);

// ✅ Get stylists for a specific company (superadmin only)
UserRouter.get("/company/:companyId/stylists", auth, getCompanyStylists);

// ---- DELETE ----

// ✅ Delete user (admin or superadmin)
UserRouter.delete("/:id", auth, deleteUser);

export default UserRouter;
