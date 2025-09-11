// Backend/routes/user.routes.js
import express from "express";
const UserRouter = express.Router();
import auth from "../middleware/auth.js";

import checkCompany from "../middleware/checkCompany.js";

import userController from "../controllers/user.controller.js";

// @route   GET /api/users
// @desc    Get all users (superadmin only)
// @access  Private (superadmin)
UserRouter.get("/", auth, checkCompany, userController.getStylists);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
UserRouter.get("/me", auth, userController.getCurrentUser);

// @route   GET /api/users/company
// @desc    Get current company users (admin only)
// @access  Private (admin)
UserRouter.get("/company", auth, userController.getCompanyUsers);
// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (admin or self)
UserRouter.put("/:id", auth, userController.updateUser);

// @route   GET /api/users/company/:companyId/stylists
// @desc    Get stylists for a specific company (superadmin only)
// @access  Private (superadmin)
UserRouter.get(
  "/company/:companyId/stylists",
  auth,
  userController.getCompanyStylists
);

// @route   POST /api/users/employee
// @desc    Add employee to company (admin only)
// @access  Private (admin)
UserRouter.post("/employee", auth, userController.addEmployee);

// @route   GET /api/users/stylist/:id
// @desc    Get a stylist with services populated
// @access  Private (admin or superadmin)
UserRouter.get("/stylist/:id", auth, userController.getStylistWithServices);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (admin or superadmin)
UserRouter.delete("/:id", auth, userController.deleteUser);

export default UserRouter;
